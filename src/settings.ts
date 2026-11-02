import OzanClearImages from './main';
import { PluginSettingTab, App, Notice, SettingDefinitionItem } from 'obsidian';
import { i18n } from './i18n';
import { getErrorMessage } from './util';

export interface OzanClearImagesSettings {
    logsModal: boolean;
    excludedFolders: string;
    ribbonIcon: boolean;
    excludeSubfolders: boolean;
    excludedFiles: string[];
}

export const DEFAULT_SETTINGS: OzanClearImagesSettings = {
    logsModal: true,
    excludedFolders: '',
    ribbonIcon: false,
    excludeSubfolders: false,
    excludedFiles: [],
};

export class OzanClearImagesSettingsTab extends PluginSettingTab {
    plugin: OzanClearImages;

    constructor(app: App, plugin: OzanClearImages) {
        super(app, plugin);
        this.plugin = plugin;
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                type: 'group',
                heading: i18n.t('settings.title'),
                items: [
                    {
                        name: i18n.t('settings.ribbonIcon.name'),
                        desc: i18n.t('settings.ribbonIcon.desc'),
                        control: { type: 'toggle', key: 'ribbonIcon', defaultValue: false },
                    },
                    {
                        name: i18n.t('settings.logsModal.name'),
                        desc: i18n.t('settings.logsModal.desc'),
                        control: { type: 'toggle', key: 'logsModal', defaultValue: true },
                    },
                    {
                        name: i18n.t('settings.excludedFolders.name'),
                        desc: i18n.t('settings.excludedFolders.desc'),
                        control: {
                            type: 'textarea',
                            key: 'excludedFolders',
                            defaultValue: '',
                        },
                    },
                    {
                        name: i18n.t('settings.excludedFiles.name'),
                        desc: i18n.t('settings.excludedFiles.desc'),
                        render: (setting) => {
                            setting
                                .setName(i18n.t('settings.excludedFiles.name'))
                                .setDesc(i18n.t('settings.excludedFiles.desc'))
                                .addTextArea((text) =>
                                    text.setValue(this.plugin.settings.excludedFiles.join(',')).onChange((value) => {
                                        this.plugin.settings.excludedFiles = value.split(',');
                                        this.persistSettings();
                                    })
                                );
                        },
                    },
                    {
                        name: i18n.t('settings.excludeSubfolders.name'),
                        desc: i18n.t('settings.excludeSubfolders.desc'),
                        control: {
                            type: 'toggle',
                            key: 'excludeSubfolders',
                            defaultValue: false,
                        },
                    },
                    {
                        name: 'Ko-fi',
                        searchable: false,
                        render: (setting) => {
                            const coffeeDiv = setting.settingEl.createDiv('coffee oz-coffee-div');
                            const coffeeLink = coffeeDiv.createEl('a', { href: 'https://ko-fi.com/L3L356V6Q' });
                            const coffeeImg = coffeeLink.createEl('img', {
                                attr: {
                                    src: 'https://cdn.ko-fi.com/cdn/kofi2.png?v=3',
                                },
                            });
                            coffeeImg.height = 45;
                        },
                    },
                ],
            },
        ];
    }

    async setControlValue(key: string, value: unknown): Promise<void> {
        await super.setControlValue(key, value);
        if (key === 'ribbonIcon') {
            this.plugin.refreshIconRibbon();
        }
    }

    private persistSettings(): void {
        void this.plugin.saveSettings().catch((error: unknown) => {
            new Notice(`Failed to save settings: ${getErrorMessage(error)}`);
        });
    }
}
