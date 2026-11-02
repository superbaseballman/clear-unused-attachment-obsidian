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
    'settings.excludedFolders.name': string;
    'settings.excludedFolders.desc': string;
    'settings.excludedFiles.name': string;
    'settings.excludedFiles.desc': string;
    'settings.excludeSubfolders.name': string;
    'settings.excludeSubfolders.desc': string;
    
    // 模态框
    'modal.select.files.to.delete': string;
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
    'settings.excludedFolders.name': 'Excluded Folders Full Paths',
    'settings.excludedFolders.desc': `Provide full paths of folders to exclude (case-sensitive), separated by commas.
					Example: To exclude images under Personal/Files/Zodiac -> Use Personal/Files/Zodiac`,
    'settings.excludedFiles.name': 'Excluded Files Full Paths',
    'settings.excludedFiles.desc': 'Provide full paths of files to exclude (case-sensitive), separated by commas.',
    'settings.excludeSubfolders.name': 'Exclude Subfolders',
    'settings.excludeSubfolders.desc': 'When enabled, all subfolders of the above folder paths will also be excluded.',
    
    'modal.select.files.to.delete': 'Select files to delete',
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
    'settings.excludedFolders.name': '排除的文件夹完整路径',
    'settings.excludedFolders.desc': `提供要排除的文件夹的完整路径（区分大小写），用逗号（,）分隔。
					例如：如果要排除 Personal/Files/Zodiac 下的图片 -> 应使用 Personal/Files/Zodiac 进行排除`,
    'settings.excludedFiles.name': '排除的文件完整路径',
    'settings.excludedFiles.desc': '提供要排除的文件的完整路径（区分大小写），用逗号（,）分隔。',
    'settings.excludeSubfolders.name': '排除子文件夹',
    'settings.excludeSubfolders.desc': '开启此选项后，将同时排除上述文件夹路径的所有子文件夹。',
    
    'modal.select.files.to.delete': '选择要删除的文件',
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
    'settings.excludedFolders.name': '排除的資料夾完整路徑',
    'settings.excludedFolders.desc': `提供要排除的資料夾的完整路徑（區分大小寫），用逗號（,）分隔。
					例如：如果要排除 Personal/Files/Zodiac 下的圖片 -> 應使用 Personal/Files/Zodiac 進行排除`,
    'settings.excludedFiles.name': '排除的檔案完整路徑',
    'settings.excludedFiles.desc': '提供要排除的檔案的完整路徑（區分大小寫），用逗號（,）分隔。',
    'settings.excludeSubfolders.name': '排除子資料夾',
    'settings.excludeSubfolders.desc': '開啟此選項後，將同時排除上述資料夾路徑的所有子資料夾。',
    
    'modal.select.files.to.delete': '選擇要刪除的檔案',
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
