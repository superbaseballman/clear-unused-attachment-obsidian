/**
 * i18n 翻译模板文件
 * 
 * 如果你想为插件添加新的语言翻译，请复制此文件，
 * 将所有翻译值替换为你的语言，然后按照以下步骤操作：
 * 
 * 1. 将你的翻译对象添加到 src/i18n.ts 中
 * 2. 更新 translationsMap 添加你的语言映射
 * 3. 更新 Language 类型包含你的语言代码
 * 4. 在 detectLanguage() 方法中添加你的语言检测逻辑
 * 
 * 示例：添加西班牙语翻译
 */

// 定义翻译类型（用于 TypeScript 类型检查）
interface TemplateI18nTranslations {
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

// 以下是完整的翻译键列表 - 请为每个键提供你的语言翻译

const yourLanguageTranslations: Partial<TemplateI18nTranslations> = {
    // ==================== 通用 ====================
    'close': '',           // 例如：English = "Close"
    'cancel': '',          // 例如：English = "Cancel"
    'delete': '',          // 例如：English = "Delete"
    'ignore': '',          // 例如：English = "Ignore"
    'confirm': '',         // 例如：English = "Confirm"
    
    // ==================== 命令名称 ====================
    'command.clear.images': '',        // 清除未使用的图片
    'command.clear.attachments': '',   // 清除未使用的附件
    
    // ==================== 通知消息 ====================
    'notice.all.images.used': '',                    // 所有图片都被使用或在排除文件夹中
    'notice.all.attachments.used': '',               // 所有附件都被使用或在排除文件夹中
    'notice.file.ignored': `File ignored: ${'{file}'}`,  // 已忽略文件：{file}
    'notice.file.already.ignored': '',               // 该文件已在忽略列表中
    'notice.plugin.not.found': '',                   // 无法找到插件实例
    'notice.error.ignoring.file': `Error ignoring file: ${'{error}'}`,  // 忽略文件时出错：{error}
    'notice.deleted.success': `Successfully deleted ${'{count}'} file(s).`,  // 成功删除 {count} 个文件
    'notice.no.files.selected': '',                  // 没有选择要删除的文件
    'notice.plugin.reload.required': '',             // 无法找到插件实例，请尝试重新加载插件
    
    // ==================== 设置界面 ====================
    'settings.title': '',                          // 清除图片设置
    'settings.ribbonIcon.name': '',                // 功能区图标
    'settings.ribbonIcon.desc': '',                // 开启后将在功能区显示清除图片的图标
    'settings.logsModal.name': '',                 // 删除日志
    'settings.logsModal.desc': '',                 // 关闭后将不会在删除完成后弹出查看删除日志的模态框
    'settings.excludedPaths.name': '',             // 排除文件夹和文件路径
    'settings.excludedPaths.desc': '',             // 排除路径 Glob 描述
    'settings.excludedPaths.group': '',             // Glob 分组标题
    'settings.attachmentExtensions.name': '',      // 要识别的附件类型
    'settings.attachmentExtensions.desc': '',       // 管理附件扩展名筛选规则
    'settings.checkMissingInlineLinks.name': '',   // 检查失效的行内链接
    'settings.checkMissingInlineLinks.desc': '',   // 开启后提醒不存在的本地行内链接
    'settings.filterRules.edit': '',              // 编辑规则
    'settings.filterRules.title': '',              // 过滤规则
    'settings.filterRules.description': '',       // 规则编辑说明
    'settings.filterRules.enabled': '',            // 启用规则
    'settings.filterRules.add': '',                // 添加规则
    'settings.filterRules.caseSensitive': '',       // 切换是否区分大小写
    'settings.filterRules.delete': '',             // 删除
    'settings.filterRules.save': '',               // 保存
    
    // ==================== 模态框 ====================
    'modal.select.files.to.delete': '',    // 选择要删除的文件
    'modal.missing.inline.links.heading': '', // 失效的本地行内链接
    'modal.unused.attachments.title': '',   // 未引用的附件
    'modal.delete.selected': '',           // 删除所选文件
    'modal.select.all': '',                // 选择所有文件
    'modal.deselect.all': '',              // 取消选择
    'modal.ignore.file': '',               // 忽略此文件
    'modal.file.path.click.hint': '',      // 点击打开文件
    
    // ==================== 删除日志 ====================
    'logs.moved.trash': '',                // 移动到回收站
};

/*
 * 完整示例：日语翻译
 * 
 * const jaTranslations: Partial<TemplateI18nTranslations> = {
 *     'close': '閉じる',
 *     'cancel': 'キャンセル',
 *     'delete': '削除',
 *     'ignore': '無視する',
 *     'confirm': '確認',
 *     
 *     'command.clear.images': '未使用の画像をクリア',
 *     'command.clear.attachments': '未使用の添付ファイルをクリア',
 *     
 *     'notice.all.images.used': 'すべての画像が使用中または除外フォルダーにあります。',
 *     'notice.all.attachments.used': 'すべての添付ファイルが使用中または除外フォルダーにあります。',
 *     'notice.file.ignored': `ファイルを無視しました：${'{file}'}`,
 *     'notice.file.already.ignored': 'このファイルはすでに無視リストにあります',
 *     'notice.plugin.not.found': 'プラグインインスタンスが見つかりません',
 *     'notice.error.ignoring.file': `ファイルの無視中にエラーが発生しました：${'{error}'}`,
 *     'notice.deleted.success': `${'{count}'}個のファイルを正常に削除しました。`,
 *     'notice.no.files.selected': '削除するファイルが選択されていません。',
 *     'notice.plugin.reload.required': 'プラグインインスタンスが見つかりません。プラグインを再読み込みしてください。',
 *     
 *     'settings.title': '画像クリア設定',
 *     'settings.ribbonIcon.name': 'リボンアイコン',
 *     'settings.ribbonIcon.desc': 'リボンに画像クリアのアイコンを表示します。',
 *     'settings.logsModal.name': '削除ログ',
 *     'settings.logsModal.desc': '削除完了後にログモーダルを表示します。',
 *     'settings.excludedPaths.name': '除外するフォルダーとファイルのパス',
 *     'settings.excludedPaths.desc': 'Vault 相対パスに一致する Glob パターンを指定します。',
 *     'settings.excludedPaths.group': 'Glob パターン',
 *     'settings.attachmentExtensions.name': '添付ファイルの種類',
 *     'settings.attachmentExtensions.desc': 'スキャンする拡張子をカンマ区切りで指定します。空欄の場合はすべての種類をスキャンします。',
 *     
 *     'modal.select.files.to.delete': '削除するファイルを選択',
 *     'modal.delete.selected': '選択したファイルを削除',
 *     'modal.select.all': 'すべて選択',
 *     'modal.deselect.all': '選択解除',
 *     'modal.ignore.file': 'このファイルを無視',
 *     'modal.file.path.click.hint': 'クリックしてファイルを開く',
 *     
 *     'logs.moved.trash': 'ゴミ箱に移動',
 * };
 */

export default yourLanguageTranslations;
