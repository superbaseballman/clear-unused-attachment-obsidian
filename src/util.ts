import { App, TFile, Notice } from 'obsidian';
import type OzanClearImages from './main';
import { getAllLinkMatchesInFile } from './linkDetector';
import { i18n } from './i18n';

/* ------------------ Image Handlers  ------------------ */

const imageRegex = /.*(jpe?g|png|gif|svg|bmp)/i;
const imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp', 'webp']);

// Create the List of Unused Images
export const getUnusedAttachments = async (app: App, type: 'image' | 'all') => {
    const allFiles = app.vault.getFiles();
    const allAttachmentsInVault = getAttachmentsInVault(allFiles, type);
    const unusedAttachments: TFile[] = [];
    const usedAttachmentsSet = await getAttachmentPathSetForVault(app, allFiles);

    // Compare All Attachments vs Used Attachments
    allAttachmentsInVault.forEach((attachment) => {
        if (!usedAttachmentsSet.has(attachment.path)) unusedAttachments.push(attachment);
    });

    return unusedAttachments;
};

// Getting all available images saved in vault
const getAttachmentsInVault = (allFiles: TFile[], type: 'image' | 'all'): TFile[] => {
    const attachments: TFile[] = [];
    for (const file of allFiles) {
        if (!['md', 'canvas'].includes(file.extension)) {
            // Only images
            if (imageExtensions.has(file.extension.toLowerCase())) {
                attachments.push(file);
            }
            // All Files
            else if (type === 'all') {
                attachments.push(file);
            }
        }
    }
    return attachments;
};

// New Method for Getting All Used Attachments
const getAttachmentPathSetForVault = async (app: App, allFiles: TFile[]): Promise<Set<string>> => {
    const attachmentsSet = new Set<string>();
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

    return attachmentsSet;
};

const pathIsAnImage = (path: string) => {
    return path.match(imageRegex);
};

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
    const isInExcludedFolder = createExcludedFolderMatcher(plugin);
    for (const file of fileList) {
        if (isInExcludedFolder(file)) {
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

// Check if File is Under Excluded Folders
export const fileIsInExcludedFolder = (file: TFile, plugin: OzanClearImages): boolean => {
    return createExcludedFolderMatcher(plugin)(file);
};

export const createExcludedFolderMatcher = (plugin: OzanClearImages): ((file: TFile) => boolean) => {
    const excludedFoldersSettings = plugin.settings.excludedFolders;
    const excludeSubfolders = plugin.settings.excludeSubfolders;
    if (excludedFoldersSettings === '') {
        return () => false;
    }

    const excludedFolderPaths = excludedFoldersSettings.split(',').map((folderPath) => folderPath.trim());
    if (excludeSubfolders) {
        const excludedFolderPrefixes = excludedFolderPaths.map((folderPath) =>
            folderPath.endsWith('/') ? folderPath : `${folderPath}/`
        );
        return (file) => {
            if (!file.parent) return false;
            const parentPath = file.parent.path.endsWith('/') ? file.parent.path : `${file.parent.path}/`;
            return excludedFolderPrefixes.some((prefix) => parentPath.startsWith(prefix));
        };
    }

    const excludedFolderPathSet = new Set(excludedFolderPaths);
    return (file) => !!file.parent && excludedFolderPathSet.has(file.parent.path);
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
