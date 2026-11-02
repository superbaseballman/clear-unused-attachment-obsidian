import { TFile, App } from 'obsidian';

type LinkType = 'markdown' | 'wiki' | 'wikiTransclusion' | 'mdTransclusion';

export interface LinkMatch {
    type: LinkType;
    match: string;
    linkText: string;
    sourceFilePath: string;
}

export const getAllLinkMatchesInFile = async (
    mdFile: TFile,
    app: App,
    fileText?: string
): Promise<LinkMatch[]> => {
    const text = fileText ?? await app.vault.read(mdFile);
    const linkMatches: LinkMatch[] = [];

    for (const wikiMatch of text.match(/\[\[.*?\]\]/g) ?? []) {
        const transclusion = wikiTransclusionRegex.exec(wikiMatch);
        if (transclusion) {
            addLinkMatch(linkMatches, 'wikiTransclusion', wikiMatch, transclusion[1], mdFile, app);
            continue;
        }

        const fileName = wikiMatch.match(/^\[\[([^|\]]+)/)?.[1];
        if (fileName && !fileName.startsWith('http')) {
            addLinkMatch(linkMatches, 'wiki', wikiMatch, fileName, mdFile, app);
        }
    }

    for (const markdownMatch of text.match(/\[(^$|.*?)\]\((.*?)\)/g) ?? []) {
        const transclusion = mdTransclusionRegex.exec(markdownMatch);
        if (transclusion) {
            addLinkMatch(linkMatches, 'mdTransclusion', markdownMatch, transclusion[1], mdFile, app);
            continue;
        }

        const fileName = markdownMatch.match(/\]\((.*?)\)/)?.[1];
        if (fileName && !fileName.startsWith('http')) {
            addLinkMatch(linkMatches, 'markdown', markdownMatch, fileName, mdFile, app);
        }
    }

    return linkMatches;
};

const wikiTransclusionRegex = /\[\[([^#]*?)#.*?\]\]/;
const mdTransclusionRegex = /\[.*?]\(([^#]*?)#.*?\)/;

const addLinkMatch = (
    linkMatches: LinkMatch[],
    type: LinkType,
    match: string,
    fileName: string,
    sourceFile: TFile,
    app: App
): void => {
    if (!fileName) return;

    const file = app.metadataCache.getFirstLinkpathDest(fileName, sourceFile.path);
    linkMatches.push({
        type,
        match,
        linkText: file ? file.path : fileName,
        sourceFilePath: sourceFile.path,
    });
};
