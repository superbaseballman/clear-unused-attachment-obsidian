import { App, TFile, Notice } from 'obsidian';
import type OzanClearImages from './main';
import type { FilterRule } from './settings';
import { getAllLinkMatchesInFile } from './linkDetector';
import { i18n } from './i18n';

/* ------------------ Image Handlers  ------------------ */

const imageRegex = /.*(jpe?g|png|gif|svg|bmp)/i;
const imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp', 'webp']);

export const globRuleMatches = (rule: FilterRule, value: string): boolean => {
    if (!rule.enabled || !rule.value.trim()) return false;
    return globToRegExp(rule.value, rule.caseSensitive).test(value);
};

export const globToRegExp = (glob: string, caseSensitive = true): RegExp => {
    let source = '^';
    for (let index = 0; index < glob.length; index++) {
        const character = glob[index];
        if (character === '\\') {
            if (index + 1 < glob.length) {
                source += escapeRegexCharacter(glob[++index]);
            } else {
                source += '\\\\';
            }
        } else if (character === '*') {
            if (glob[index + 1] === '*') {
                index++;
                if (glob[index + 1] === '/') {
                    source += '(?:.*/)?';
                    index++;
                } else {
                    source += '.*';
                }
            } else {
                source += '[^/]*';
            }
        } else if (character === '?') {
            source += '[^/]';
        } else {
            source += escapeRegexCharacter(character);
        }
    }

    return new RegExp(`${source}$`, caseSensitive ? '' : 'i');
};

export const escapeGlobLiteral = (value: string): string =>
    value.replace(/[\\*?]/g, '\\$&');

const escapeRegexCharacter = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Scan for unused attachments and unresolved inline links
export const getUnusedAttachments = async (
    app: App,
    type: 'image' | 'all',
    attachmentExtensions = '',
    checkMissingInlineLinks = true
): Promise<{ unusedAttachments: TFile[]; missingInlineLinks: MissingInlineLink[] }> => {
    const allFiles = app.vault.getFiles();
    const allAttachmentsInVault = getAttachmentsInVault(allFiles, type, attachmentExtensions);
    const unusedAttachments: TFile[] = [];
    const { usedAttachmentsSet, missingInlineLinks } = await getAttachmentPathSetForVault(
        app,
        allFiles,
        checkMissingInlineLinks
    );

    // Compare All Attachments vs Used Attachments
    allAttachmentsInVault.forEach((attachment) => {
        if (!usedAttachmentsSet.has(attachment.path)) unusedAttachments.push(attachment);
    });

    return { unusedAttachments, missingInlineLinks };
};

export interface MissingInlineLink {
    sourceFilePath: string;
    linkText: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

// Get all eligible attachments saved in the vault
const getAttachmentsInVault = (
    allFiles: TFile[],
    type: 'image' | 'all',
    attachmentExtensions: string
): TFile[] => {
    const attachments: TFile[] = [];
    const selectedExtensions = attachmentExtensions
        .split(',')
        .map((extension) => extension.trim().replace(/^\./, '').toLowerCase())
        .filter(Boolean);
    for (const file of allFiles) {
        if (!['md', 'canvas'].includes(file.extension)) {
            const extension = file.extension.toLowerCase();
            if (
                (type === 'image' && imageExtensions.has(extension)) ||
                (type === 'all' && (
                    selectedExtensions.length === 0 || selectedExtensions.includes(extension)
                ))
            ) {
                attachments.push(file);
            }
        }
    }
    return attachments;
};

// New Method for Getting All Used Attachments
const getAttachmentPathSetForVault = async (
    app: App,
    allFiles: TFile[],
    checkMissingInlineLinks: boolean
): Promise<{ usedAttachmentsSet: Set<string>; missingInlineLinks: MissingInlineLink[] }> => {
    const attachmentsSet = new Set<string>();
    const missingInlineLinks = new Map<string, MissingInlineLink>();
    const resolvedLinks = app.metadataCache.resolvedLinks;

    // 步骤 1：使用官方 API 获取所有已解析的链接（核心场景）
    if (resolvedLinks) {
        for (const linkMap of Object.values(resolvedLinks)) {
            for (const targetPath of Object.keys(linkMap)) {
                if (!targetPath.endsWith('.md')) {
                    addToSet(attachmentsSet, targetPath);
                }
            }
        }
    }

    // 步骤 2：补充解析 Frontmatter 和 Canvas（官方 API 覆盖不到的场景）
    for (const file of allFiles) {
        // 2.1 处理 Markdown 文件的 Frontmatter
        if (file.extension === 'md') {
            const fileCache = app.metadataCache.getFileCache(file);
            const unresolvedLinks = app.metadataCache.unresolvedLinks[file.path] ?? {};
            const inlineReferences = [...(fileCache?.links ?? []), ...(fileCache?.embeds ?? [])];
            for (const reference of inlineReferences) {
                if (
                    checkMissingInlineLinks &&
                    reference.original.includes('](') &&
                    isLocalLinkPath(reference.link) &&
                    unresolvedLinks[reference.link] !== undefined
                ) {
                    const key = `${file.path}\0${reference.link}`;
                    missingInlineLinks.set(key, {
                        sourceFilePath: file.path,
                        linkText: reference.link,
                        line: reference.position.start.line,
                        column: reference.position.start.col,
                        endLine: reference.position.end.line,
                        endColumn: reference.position.end.col,
                    });
                }
            }

            if (fileCache?.frontmatter) {
                for (const value of Object.values(fileCache.frontmatter)) {
                    if (typeof value === 'string' && pathIsAnImage(value)) {
                        const resolvedFile = app.metadataCache.getFirstLinkpathDest(value, file.path);
                        if (resolvedFile instanceof TFile) {
                            addToSet(attachmentsSet, resolvedFile.path);
                        } else {
                            addToSet(attachmentsSet, value);
                        }
                    }
                }
            }
        }

        // 2.2 处理 Canvas 文件（无任何未定义变量）
        else if (file.extension === 'canvas') {
            try {
                const canvasContent = await app.vault.cachedRead(file);
                const canvasData: unknown = JSON.parse(canvasContent) as unknown;
                
                if (isRecord(canvasData) && Array.isArray(canvasData.nodes)) {
                    for (const node of canvasData.nodes) {
                        if (!isRecord(node)) continue;
                        // 处理 Canvas 中的文件节点
                        if (node.type === 'file' && typeof node.file === 'string') {
                            addToSet(attachmentsSet, node.file);
                        }
                        // 处理 Canvas 文本节点中的链接（无 tempLinkMap 相关代码）
                        else if (node.type === 'text' && typeof node.text === 'string') {
                            // 复用链接检测函数解析文本中的链接
                            const linkMatches = await getAllLinkMatchesInFile(file, app, node.text);
                            for (const linkMatch of linkMatches) {
                                if (!linkMatch.linkText.endsWith('.md')) {
                                    addToSet(attachmentsSet, linkMatch.linkText);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                new Notice(`Could not scan canvas file ${file.path}: ${getErrorMessage(error)}`);
            }
        }
    }

    return {
        usedAttachmentsSet: attachmentsSet,
        missingInlineLinks: [...missingInlineLinks.values()],
    };
};

const pathIsAnImage = (path: string) => {
    return path.match(imageRegex);
};

const isLocalLinkPath = (linkPath: string): boolean =>
    !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(linkPath.trim());

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/* ------------------ Deleting Handlers ------------------ */

// Clear Images From the Provided List
export const deleteFilesInTheList = async (
    fileList: TFile[],
    plugin: OzanClearImages,
    app: App
): Promise<{ deletedImages: number; textToView: string }> => {
    let deletedImages = 0;
    let textToView = '';
    const isExcludedPath = createExcludedPathMatcher(plugin);
    for (const file of fileList) {
        if (isExcludedPath(file)) {
            continue;
        } else {
            // FileManager honours the user's configured deletion destination
            // (Obsidian trash, system trash or permanent deletion).
            await app.fileManager.trashFile(file);
            textToView += `[+] ${i18n.t('logs.moved.trash')}: ${file.path}\n`;
            deletedImages++;
        }
    }
    return { deletedImages, textToView };
};

export const createExcludedPathMatcher = (plugin: OzanClearImages): ((file: TFile) => boolean) => {
    const excludedPathMatchers = plugin.settings.excludedPaths
        .filter(
            (rule) => rule.enabled && rule.value.trim()
        )
        .map((rule) => globToRegExp(rule.value, rule.caseSensitive));
    if (excludedPathMatchers.length === 0) {
        return () => false;
    }

    return (file) => excludedPathMatchers.some((regex) => regex.test(file.path));
};

/* ------------------ Helpers  ------------------ */

export const getFormattedDate = () => {
    let dt = new Date();
    return dt.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const addToSet = (setObj: Set<string>, value: string) => {
    setObj.add(value);
};

// Errors and rejected values are `unknown`, so they must be narrowed before being shown to the user.
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'number' || typeof error === 'boolean' || typeof error === 'bigint') {
        return String(error);
    }
    if (error !== null && typeof error === 'object') {
        try {
            const serialized = JSON.stringify(error);
            if (typeof serialized === 'string') {
                return serialized;
            }
        } catch {
            // Non-serializable values fall back to the generic message below.
        }
    }
    return 'Unknown error';
};
