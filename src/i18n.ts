import { App, getLanguage } from 'obsidian';

// 定义支持的语言类型
export type Language = 'en' | 'zh-cn' | 'zh-tw';

// 定义翻译键值对的类型
export interface I18nTranslations {
    // 通用
    'close': string;
    'cancel': string;
    'delete': string;
    'ignore': string;
    'confirm': string;
    
    // 命令名称
    'command.clear.images': string;
    'command.clear.attachments': string;
    
    // 通知消息
    'notice.all.images.used': string;
    'notice.all.attachments.used': string;
    'notice.file.ignored': string;
    'notice.file.already.ignored': string;
    'notice.plugin.not.found': string;
    'notice.error.ignoring.file': string;
    'notice.deleted.success': string;
    'notice.no.files.selected': string;
    'notice.plugin.reload.required': string;
    
    // 设置界面
    'settings.title': string;
    'settings.ribbonIcon.name': string;
    'settings.ribbonIcon.desc': string;
    'settings.logsModal.name': string;
    'settings.logsModal.desc': string;
    'settings.excludedPaths.name': string;
    'settings.excludedPaths.desc': string;
    'settings.excludedPaths.group': string;
    'settings.attachmentExtensions.name': string;
    'settings.attachmentExtensions.desc': string;
    'settings.checkMissingInlineLinks.name': string;
    'settings.checkMissingInlineLinks.desc': string;
    'settings.filterRules.edit': string;
    'settings.filterRules.title': string;
    'settings.filterRules.description': string;
    'settings.filterRules.enabled': string;
    'settings.filterRules.add': string;
    'settings.filterRules.caseSensitive': string;
    'settings.filterRules.delete': string;
    'settings.filterRules.save': string;
    
    // 模态框
    'modal.select.files.to.delete': string;
    'modal.missing.inline.links.heading': string;
    'modal.unused.attachments.title': string;
    'modal.delete.selected': string;
    'modal.select.all': string;
    'modal.deselect.all': string;
    'modal.ignore.file': string;
    'modal.file.path.click.hint': string;
    
    // 删除日志
    'logs.moved.trash': string;
}

// 默认英文翻译
const enTranslations: Partial<I18nTranslations> = {
    'close': 'Close',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'ignore': 'Ignore',
    'confirm': 'Confirm',
    
    'command.clear.images': 'Clear unused images',
    'command.clear.attachments': 'Clear unused attachments',
    
    'notice.all.images.used': 'All images are in use or in excluded folders. No files were deleted.',
    'notice.all.attachments.used': 'All attachments are in use or in excluded folders. No files were deleted.',
    'notice.file.ignored': `File ignored: ${'{file}'}`,
    'notice.file.already.ignored': 'This file is already in the ignore list',
    'notice.plugin.not.found': 'Cannot find plugin instance',
    'notice.error.ignoring.file': `Error ignoring file: ${'{error}'}`,
    'notice.deleted.success': `Successfully deleted ${'{count}'} file(s).`,
    'notice.no.files.selected': 'No files selected for deletion.',
    'notice.plugin.reload.required': 'Plugin instance not found, please try reloading the plugin',
    
    'settings.title': 'Clear Images Settings',
    'settings.ribbonIcon.name': 'Ribbon Icon',
    'settings.ribbonIcon.desc': 'Show icon in ribbon for quick access to clear images.',
    'settings.logsModal.name': 'Deletion Logs',
    'settings.logsModal.desc': 'Show logs modal after deletion completes.',
    'settings.excludedPaths.name': 'Excluded folder and file paths (glob)',
    'settings.excludedPaths.desc': 'Use vault-relative glob patterns. * matches within one folder, ** spans folders, and ? matches one character. Examples: Images/** or Images/logo.png.',
    'settings.excludedPaths.group': 'Glob patterns',
    'settings.attachmentExtensions.name': 'Attachment file types',
    'settings.attachmentExtensions.desc': 'Enter comma-separated file extensions to scan (e.g. pdf, png). Leave empty to scan all file types. Applies to Clear unused attachments.',
    'settings.checkMissingInlineLinks.name': 'Check missing inline links',
    'settings.checkMissingInlineLinks.desc': 'When enabled, warn when a local inline Markdown link points to a file that does not exist.',
    'settings.filterRules.edit': 'Edit rules',
    'settings.filterRules.title': 'Glob patterns',
    'settings.filterRules.description': 'Use glob patterns: * matches within one folder, ** spans folders, and ? matches one character. Click Aa to toggle case sensitivity.',
    'settings.filterRules.enabled': 'Enable rule',
    'settings.filterRules.add': 'Add rule',
    'settings.filterRules.caseSensitive': 'Toggle case-sensitive matching',
    'settings.filterRules.delete': 'Delete',
    'settings.filterRules.save': 'Save',
    
    'modal.select.files.to.delete': 'Select files to delete',
    'modal.missing.inline.links.heading': 'Missing local inline links',
    'modal.unused.attachments.title': 'Unused attachments',
    'modal.delete.selected': 'Delete Selected',
    'modal.select.all': 'Select All',
    'modal.deselect.all': 'Deselect All',
    'modal.ignore.file': 'Ignore this file',
    'modal.file.path.click.hint': 'Click to open file',
    
    'logs.moved.trash': 'Moved to trash',
};

// 中文翻译
const zhCNTranslations: Partial<I18nTranslations> = {
    'close': '关闭',
    'cancel': '取消',
    'delete': '删除',
    'ignore': '忽略',
    'confirm': '确认',
    
    'command.clear.images': '清除未使用的图片',
    'command.clear.attachments': '清除未使用的附件',
    
    'notice.all.images.used': '所有图片都被使用或在排除文件夹中，没有文件被删除。',
    'notice.all.attachments.used': '所有附件都被使用或在排除文件夹中，没有文件被删除。',
    'notice.file.ignored': `已忽略文件：${'{file}'}`,
    'notice.file.already.ignored': '该文件已在忽略列表中',
    'notice.plugin.not.found': '无法找到插件实例',
    'notice.error.ignoring.file': `忽略文件时出错：${'{error}'}`,
    'notice.deleted.success': `成功删除 ${'{count}'} 个文件。`,
    'notice.no.files.selected': '没有选择要删除的文件。',
    'notice.plugin.reload.required': '无法找到插件实例，请尝试重新加载插件',
    
    'settings.title': '清除图片设置',
    'settings.ribbonIcon.name': '功能区图标',
    'settings.ribbonIcon.desc': '开启后将在功能区显示清除图片的图标。',
    'settings.logsModal.name': '删除日志',
    'settings.logsModal.desc': '关闭后将不会在删除完成后弹出查看删除日志的模态框。如果没有删除任何图片，则不会出现此弹窗。',
    'settings.excludedPaths.name': '排除文件夹和文件路径（Glob）',
    'settings.excludedPaths.desc': '使用相对于 vault 的 Glob 模式。* 匹配当前文件夹内的字符，** 可跨越文件夹，? 匹配单个字符。例如：Images/** 或 Images/logo.png。',
    'settings.excludedPaths.group': 'Glob 匹配模式',
    'settings.attachmentExtensions.name': '要识别的附件类型',
    'settings.attachmentExtensions.desc': '输入逗号分隔的扩展名（例如：pdf、png）。留空时扫描所有文件类型。此设置仅影响“清除未使用的附件”。',
    'settings.checkMissingInlineLinks.name': '检测失效的行内链接',
    'settings.checkMissingInlineLinks.desc': '开启后，清理时会提醒指向不存在本地文件的 Markdown 行内链接。',
    'settings.filterRules.edit': '编辑规则',
    'settings.filterRules.title': 'Glob 匹配模式',
    'settings.filterRules.description': '使用 Glob 模式：* 匹配当前文件夹内的字符，** 可跨越文件夹，? 匹配单个字符。点击 Aa 可切换是否区分大小写。',
    'settings.filterRules.enabled': '启用规则',
    'settings.filterRules.add': '添加规则',
    'settings.filterRules.caseSensitive': '切换是否区分大小写',
    'settings.filterRules.delete': '删除',
    'settings.filterRules.save': '保存',
    
    'modal.select.files.to.delete': '选择要删除的文件',
    'modal.missing.inline.links.heading': '失效的本地行内链接',
    'modal.unused.attachments.title': '未引用的附件',
    'modal.delete.selected': '删除所选文件',
    'modal.select.all': '选择所有文件',
    'modal.deselect.all': '取消选择',
    'modal.ignore.file': '忽略此文件',
    'modal.file.path.click.hint': '点击打开文件',
    
    'logs.moved.trash': '已移至回收站',
};

// 繁体中文翻译
const zhTWTranslations: Partial<I18nTranslations> = {
    'close': '關閉',
    'cancel': '取消',
    'delete': '刪除',
    'ignore': '忽略',
    'confirm': '確認',
    
    'command.clear.images': '清除未使用的圖片',
    'command.clear.attachments': '清除未使用的附件',
    
    'notice.all.images.used': '所有圖片都被使用或在排除資料夾中，沒有檔案被刪除。',
    'notice.all.attachments.used': '所有附件都被使用或在排除資料夾中，沒有檔案被刪除。',
    'notice.file.ignored': `已忽略檔案：${'{file}'}`,
    'notice.file.already.ignored': '該檔案已在忽略列表中',
    'notice.plugin.not.found': '無法找到插件實例',
    'notice.error.ignoring.file': `忽略檔案時出錯：${'{error}'}`,
    'notice.deleted.success': `成功刪除 ${'{count}'} 個檔案。`,
    'notice.no.files.selected': '沒有選擇要刪除的檔案。',
    'notice.plugin.reload.required': '無法找到插件實例，請嘗試重新加載插件',
    
    'settings.title': '清除圖片設定',
    'settings.ribbonIcon.name': '功能區圖標',
    'settings.ribbonIcon.desc': '開啟後將在功能區顯示清除圖片的圖標。',
    'settings.logsModal.name': '刪除日誌',
    'settings.logsModal.desc': '關閉後將不會在刪除完成後彈出查看刪除日誌的模態框。如果沒有刪除任何圖片，則不會出現此彈窗。',
    'settings.excludedPaths.name': '排除資料夾和檔案路徑（Glob）',
    'settings.excludedPaths.desc': '使用相對於 vault 的 Glob 模式。* 匹配目前資料夾內的字元，** 可跨越資料夾，? 匹配單一字元。例如：Images/** 或 Images/logo.png。',
    'settings.excludedPaths.group': 'Glob 匹配模式',
    'settings.attachmentExtensions.name': '要識別的附件類型',
    'settings.attachmentExtensions.desc': '輸入逗號分隔的副檔名（例如：pdf、png）。留空時掃描所有檔案類型。此設定僅影響「清除未使用的附件」。',
    'settings.checkMissingInlineLinks.name': '檢查失效的行內連結',
    'settings.checkMissingInlineLinks.desc': '開啟後，清理時會提醒指向不存在本機檔案的 Markdown 行內連結。',
    'settings.filterRules.edit': '編輯規則',
    'settings.filterRules.title': 'Glob 匹配模式',
    'settings.filterRules.description': '使用 Glob 模式：* 匹配目前資料夾內的字元，** 可跨越資料夾，? 匹配單一字元。點擊 Aa 可切換是否區分大小寫。',
    'settings.filterRules.enabled': '啟用規則',
    'settings.filterRules.add': '新增規則',
    'settings.filterRules.caseSensitive': '切換是否區分大小寫',
    'settings.filterRules.delete': '刪除',
    'settings.filterRules.save': '儲存',
    
    'modal.select.files.to.delete': '選擇要刪除的檔案',
    'modal.missing.inline.links.heading': '失效的本機行內連結',
    'modal.unused.attachments.title': '未引用的附件',
    'modal.delete.selected': '刪除所選檔案',
    'modal.select.all': '選擇所有檔案',
    'modal.deselect.all': '取消選擇',
    'modal.ignore.file': '忽略此檔案',
    'modal.file.path.click.hint': '點擊打開檔案',
    
    'logs.moved.trash': '已移至資源回收筒',
};

// 语言包映射
const translationsMap: Record<Language, Partial<I18nTranslations>> = {
    'en': enTranslations,
    'zh-cn': zhCNTranslations,
    'zh-tw': zhTWTranslations,
};

/**
 * I18n 管理器类
 */
export class I18nManager {
    private currentLanguage: Language = 'en';
    private translations: Partial<I18nTranslations> = enTranslations;
    private userSelectedLanguage: Language | null = null;
    private app: App | null = null;

    constructor() {
        this.detectLanguage();
    }

    initialize(app: App): void {
        this.app = app;
        const storedLanguage = app.loadLocalStorage('clear-unused-attachment-language') as unknown;
        if (typeof storedLanguage === 'string' && isLanguage(storedLanguage)) {
            this.userSelectedLanguage = storedLanguage;
        }
        this.detectLanguage();
    }

    /**
     * 检测并设置当前语言
     * 优先使用用户选择的语言，否则自动检测系统语言
     */
    private detectLanguage() {
        if (this.userSelectedLanguage) {
            this.currentLanguage = this.userSelectedLanguage;
            this.translations = translationsMap[this.userSelectedLanguage];
            return;
        }

        const language = getLanguage().toLowerCase().replace('_', '-');
        if (language.startsWith('zh-tw') || language.startsWith('zh-hk')) {
            this.currentLanguage = 'zh-tw';
            this.translations = zhTWTranslations;
        } else if (language.startsWith('zh')) {
            this.currentLanguage = 'zh-cn';
            this.translations = zhCNTranslations;
        } else {
            this.currentLanguage = 'en';
            this.translations = enTranslations;
        }
    }

    /**
     * 手动设置语言
     */
    setLanguage(lang: Language) {
        if (translationsMap[lang]) {
            this.userSelectedLanguage = lang;
            this.currentLanguage = lang;
            this.translations = translationsMap[lang];
            this.app?.saveLocalStorage('clear-unused-attachment-language', lang);
        }
    }

    /**
     * 获取当前语言
     */
    getLanguage(): Language {
        return this.currentLanguage;
    }

    /**
     * 重置为自动检测语言
     */
    resetToAuto() {
        this.userSelectedLanguage = null;
        this.app?.saveLocalStorage('clear-unused-attachment-language', null);
        this.detectLanguage();
    }

    /**
     * 获取翻译文本
     * @param key 翻译键
     * @param params 可选的参数替换对象
     */
    t(key: keyof I18nTranslations, params?: Record<string, string>): string {
        const fallbackText = this.translations[key] ?? enTranslations[key] ?? String(key);
        let text = fallbackText;

        // 如果有参数，进行替换
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
            });
        }

        return text;
    }
}

const isLanguage = (language: string): language is Language =>
    language === 'en' || language === 'zh-cn' || language === 'zh-tw';

// 导出单例
export const i18n = new I18nManager();
