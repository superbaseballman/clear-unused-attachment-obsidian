import { Plugin, Notice } from 'obsidian';
import { OzanClearImagesSettingsTab } from './settings';
import { OzanClearImagesSettings, DEFAULT_SETTINGS } from './settings';
import { SelectiveDeleteModal } from './modals';
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
            excludedFolders: isRecord(data) && typeof data.excludedFolders === 'string'
                ? data.excludedFolders
                : DEFAULT_SETTINGS.excludedFolders,
            ribbonIcon: isRecord(data) && typeof data.ribbonIcon === 'boolean'
                ? data.ribbonIcon
                : DEFAULT_SETTINGS.ribbonIcon,
            excludeSubfolders: isRecord(data) && typeof data.excludeSubfolders === 'boolean'
                ? data.excludeSubfolders
                : DEFAULT_SETTINGS.excludeSubfolders,
            excludedFiles: isRecord(data) && Array.isArray(data.excludedFiles) &&
                data.excludedFiles.every((file): file is string => typeof file === 'string')
                ? data.excludedFiles
                : [],
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

    // Compare Used Images with all images and return unused ones
    clearUnusedAttachments = async (type: 'all' | 'image'): Promise<void> => {
        try {
            const unusedAttachments = await Util.getUnusedAttachments(this.app, type);
            const filteredUnusedAttachments = unusedAttachments.filter(
                (file) =>
                    !Util.fileIsInExcludedFolder(file, this) &&
                    !this.settings.excludedFiles.includes(file.path)
            );

            if (filteredUnusedAttachments.length > 0) {
                new SelectiveDeleteModal(filteredUnusedAttachments, this).open();
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
