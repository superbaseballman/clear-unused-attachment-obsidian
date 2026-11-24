import { Plugin, Notice } from 'obsidian';
import { OzanClearImagesSettingsTab } from './settings';
import { OzanClearImagesSettings, DEFAULT_SETTINGS } from './settings';
import type { FilterRule } from './settings';
import { MissingInlineLinksModal, SelectiveDeleteModal } from './modals';
import * as Util from './util';
import { i18n } from './i18n';

export default class OzanClearImages extends Plugin {
    settings: OzanClearImagesSettings = DEFAULT_SETTINGS;
    ribbonIconEl: HTMLElement | undefined = undefined;

    onload(): void {
        i18n.initialize(this.app);
        this.addSettingTab(new OzanClearImagesSettingsTab(this.app, this));
        void this.initialize().catch((error: unknown) => {
            new Notice(`Could not initialize plugin: ${Util.getErrorMessage(error)}`);
        });
    }

    onunload(): void {
        this.ribbonIconEl?.remove();
    }

    private async initialize(): Promise<void> {
        await this.loadSettings();
        this.addCommand({
            id: 'clear-images-obsidian',
            name: i18n.t('command.clear.images'),
            callback: () => {
                void this.clearUnusedAttachments('image');
            },
        });
        this.addCommand({
            id: 'clear-attachments',
            name: i18n.t('command.clear.attachments'),
            callback: () => {
                void this.clearUnusedAttachments('all');
            },
        });
        this.refreshIconRibbon();
    }

    async loadSettings(): Promise<void> {
        const data: unknown = await this.loadData();
        this.settings = {
            logsModal: isRecord(data) && typeof data.logsModal === 'boolean'
                ? data.logsModal
                : DEFAULT_SETTINGS.logsModal,
            excludedPaths: isRecord(data)
                ? loadExcludedPaths(data)
                : DEFAULT_SETTINGS.excludedPaths,
            ribbonIcon: isRecord(data) && typeof data.ribbonIcon === 'boolean'
                ? data.ribbonIcon
                : DEFAULT_SETTINGS.ribbonIcon,
            attachmentExtensions: isRecord(data)
                ? loadAttachmentExtensions(data.attachmentExtensions)
                : DEFAULT_SETTINGS.attachmentExtensions,
            checkMissingInlineLinks: isRecord(data) && typeof data.checkMissingInlineLinks === 'boolean'
                ? data.checkMissingInlineLinks
                : DEFAULT_SETTINGS.checkMissingInlineLinks,
        };
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    refreshIconRibbon = () => {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon('image-file', i18n.t('command.clear.images'), (): void => {
                void this.clearUnusedAttachments('image');
            });
        }
    };

    // Compare eligible attachments with used files and return unused ones
    clearUnusedAttachments = async (type: 'all' | 'image'): Promise<void> => {
        try {
            const { unusedAttachments, missingInlineLinks } = await Util.getUnusedAttachments(
                this.app,
                type,
                type === 'all' ? this.settings.attachmentExtensions : '',
                this.settings.checkMissingInlineLinks
            );

            const isExcludedPath = Util.createExcludedPathMatcher(this);
            const filteredUnusedAttachments = unusedAttachments.filter(
                (file) => !isExcludedPath(file)
            );

            if (filteredUnusedAttachments.length > 0) {
                new SelectiveDeleteModal(filteredUnusedAttachments, this, missingInlineLinks).open();
            } else if (missingInlineLinks.length > 0) {
                new MissingInlineLinksModal(this.app, missingInlineLinks).open();
            } else {
                new Notice(i18n.t(type === 'image' ? 'notice.all.images.used' : 'notice.all.attachments.used'));
            }
        } catch (error) {
            new Notice(`Could not scan attachments: ${Util.getErrorMessage(error)}`);
        }
    };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const loadFilterRules = (value: unknown, defaultCaseSensitive: boolean): FilterRule[] => {
    const values = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(',')
            : [];
    const rules: FilterRule[] = [];
    for (const entry of values) {
        if (typeof entry === 'string') {
            if (!entry.trim()) continue;
            rules.push({
                value: entry.trim(),
                enabled: true,
                caseSensitive: defaultCaseSensitive,
            });
            continue;
        }
        if (
            isRecord(entry) &&
            typeof entry.value === 'string' &&
            typeof entry.enabled === 'boolean' &&
            typeof entry.caseSensitive === 'boolean'
        ) {
            if (!entry.value.trim()) continue;
            rules.push({
                value: entry.value,
                enabled: entry.enabled,
                caseSensitive: entry.caseSensitive,
            });
        }
    }
    return rules;
};

const loadExcludedPaths = (data: Record<string, unknown>): FilterRule[] => {
    if (Array.isArray(data.excludedPaths)) {
        return loadFilterRules(data.excludedPaths, true);
    }

    const excludeSubfolders = data.excludeSubfolders === true;
    const folders = loadFilterRules(data.excludedFolders, true).map((rule) => ({
        ...rule,
        value: `${Util.escapeGlobLiteral(rule.value.trim().replace(/\/+$/, ''))}${excludeSubfolders ? '/**' : '/*'}`,
    }));
    const files = loadFilterRules(data.excludedFiles, true).map((rule) => ({
        ...rule,
        value: Util.escapeGlobLiteral(rule.value),
    }));
    return [...folders, ...files];
};

const loadAttachmentExtensions = (value: unknown): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (!Array.isArray(value)) {
        return DEFAULT_SETTINGS.attachmentExtensions;
    }

    const extensions: string[] = [];
    value.forEach((entry: unknown) => {
        if (typeof entry === 'string') {
            if (entry.trim()) extensions.push(entry.trim());
            return;
        }
        if (
            isRecord(entry) &&
            typeof entry.value === 'string' &&
            entry.enabled === true
        ) {
            if (entry.value.trim()) extensions.push(entry.value.trim());
        }
    });
    return extensions.join(', ');
};
