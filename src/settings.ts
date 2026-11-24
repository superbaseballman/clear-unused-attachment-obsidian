import OzanClearImages from './main';
import { PluginSettingTab, App, Modal, Notice, SettingDefinitionItem, SettingDefinitionRender } from 'obsidian';
import { i18n } from './i18n';
import { getErrorMessage } from './util';

export interface FilterRule {
    value: string;
    enabled: boolean;
    caseSensitive: boolean;
}

export interface OzanClearImagesSettings {
    logsModal: boolean;
    excludedPaths: FilterRule[];
    ribbonIcon: boolean;
    attachmentExtensions: string;
    checkMissingInlineLinks: boolean;
}

export const DEFAULT_SETTINGS: OzanClearImagesSettings = {
    logsModal: true,
    excludedPaths: [],
    ribbonIcon: false,
    attachmentExtensions: '',
    checkMissingInlineLinks: false,
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
                    this.getExcludedPathsSetting(),
                    {
                        name: i18n.t('settings.attachmentExtensions.name'),
                        desc: i18n.t('settings.attachmentExtensions.desc'),
                        render: (setting) => {
                            setting
                                .setName(i18n.t('settings.attachmentExtensions.name'))
                                .setDesc(i18n.t('settings.attachmentExtensions.desc'))
                                .addTextArea((text) =>
                                    text.setValue(this.plugin.settings.attachmentExtensions).onChange((value) => {
                                        this.plugin.settings.attachmentExtensions = value;
                                        void this.plugin.saveSettings().catch((error: unknown) => {
                                            new Notice(`Failed to save settings: ${getErrorMessage(error)}`);
                                        });
                                    })
                                );
                        },
                    },
                    {
                        name: i18n.t('settings.checkMissingInlineLinks.name'),
                        desc: i18n.t('settings.checkMissingInlineLinks.desc'),
                        control: {
                            type: 'toggle',
                            key: 'checkMissingInlineLinks',
                            defaultValue: DEFAULT_SETTINGS.checkMissingInlineLinks,
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

    private getExcludedPathsSetting(): SettingDefinitionRender {
        const name = i18n.t('settings.excludedPaths.name');
        const desc = i18n.t('settings.excludedPaths.desc');
        return {
            name,
            desc,
            render: (setting) => {
                setting.setName(name).setDesc(desc).addButton((button) =>
                    button
                        .setButtonText(i18n.t('settings.filterRules.edit'))
                        .onClick(() => {
                            new FilterRulesModal(
                                this.app,
                                name,
                                [
                                    {
                                        heading: i18n.t('settings.excludedPaths.group'),
                                        rules: this.plugin.settings.excludedPaths,
                                        defaultCaseSensitive: true,
                                    },
                                ],
                                async ([rules]) => {
                                    this.plugin.settings.excludedPaths = rules;
                                    await this.plugin.saveSettings();
                                }
                            ).open();
                        })
                );
            },
        };
    }

}

class FilterRulesModal extends Modal {
    private readonly groups: {
        heading: string;
        rules: FilterRule[];
        defaultCaseSensitive: boolean;
    }[];
    private rulesContainer!: HTMLDivElement;

    constructor(
        app: App,
        private readonly heading: string,
        groups: {
            heading: string;
            rules: FilterRule[];
            defaultCaseSensitive: boolean;
        }[],
        private readonly onSave: (groups: FilterRule[][]) => Promise<void>
    ) {
        super(app);
        this.groups = groups.map((group) => ({
            ...group,
            rules: group.rules.map((rule) => ({ ...rule })),
        }));
    }

    onOpen(): void {
        this.titleEl.setText(this.heading);
        this.contentEl.createEl('h3', { text: i18n.t('settings.filterRules.title') });
        this.contentEl.createEl('p', { text: i18n.t('settings.filterRules.description') });
        this.rulesContainer = this.contentEl.createDiv({ cls: 'filter-rules-list' });
        this.renderRules();

        const footer = this.contentEl.createDiv({ cls: 'filter-rules-footer' });
        footer.createEl('button', {
            text: i18n.t('settings.filterRules.save'),
            cls: 'mod-cta',
        }).addEventListener('click', () => {
            void this.saveRules();
        });
        footer.createEl('button', {
            text: i18n.t('cancel'),
        }).addEventListener('click', () => this.close());
    }

    onClose(): void {
        this.contentEl.empty();
    }

    private renderRules(): void {
        this.rulesContainer.empty();
        this.groups.forEach((group) => {
            const section = this.rulesContainer.createDiv({ cls: 'filter-rule-group' });
            section.createEl('h4', { text: group.heading });
            group.rules.forEach((rule) => {
                const row = section.createDiv({ cls: 'filter-rule-row' });
                const enabled = row.createEl('input', { type: 'checkbox' });
                enabled.checked = rule.enabled;
                enabled.setAttribute('aria-label', i18n.t('settings.filterRules.enabled'));
                enabled.addEventListener('change', () => {
                    rule.enabled = enabled.checked;
                });

                const valueInput = row.createEl('input', {
                    type: 'text',
                    value: rule.value,
                    cls: 'filter-rule-value',
                });
                valueInput.addEventListener('input', () => {
                    rule.value = valueInput.value;
                });

                const caseButton = row.createEl('button', {
                    text: 'Aa',
                    cls: rule.caseSensitive ? 'filter-rule-case-sensitive' : '',
                    attr: {
                        'aria-label': i18n.t('settings.filterRules.caseSensitive'),
                        'aria-pressed': String(rule.caseSensitive),
                    },
                });
                caseButton.addEventListener('click', () => {
                    rule.caseSensitive = !rule.caseSensitive;
                    this.renderRules();
                });

                row.createEl('button', {
                    text: i18n.t('settings.filterRules.delete'),
                    cls: 'filter-rule-delete',
                }).addEventListener('click', () => {
                    const index = group.rules.indexOf(rule);
                    group.rules.splice(index, 1);
                    this.renderRules();
                });
            });

            section.createEl('button', {
                text: i18n.t('settings.filterRules.add'),
                cls: 'filter-rules-add-button',
            }).addEventListener('click', () => {
                group.rules.push({
                    value: '',
                    enabled: true,
                    caseSensitive: group.defaultCaseSensitive,
                });
                this.renderRules();
            });
        });
    }

    private async saveRules(): Promise<void> {
        try {
            await this.onSave(this.groups.map((group) =>
                group.rules.filter((rule) => rule.value.trim().length > 0)
            ));
            this.close();
        } catch (error) {
            new Notice(`Failed to save settings: ${getErrorMessage(error)}`);
        }
    }
}
