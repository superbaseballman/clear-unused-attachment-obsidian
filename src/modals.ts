import { Modal, App, TFile, Notice } from 'obsidian';
import { i18n } from './i18n';
import type OzanClearImages from './main';
import { createExcludedFolderMatcher, getErrorMessage } from './util';

export class LogsModal extends Modal {
    constructor(textToView: string, app: App) {
        super(app);
        this.textToView = textToView;
    }

    textToView: string;

    onOpen(): void {
        const logs = this.contentEl.createDiv({ cls: 'unused-images-logs unused-images-log-content' });
        logs.setText(this.textToView);

        const buttonWrapper = this.contentEl.createDiv({ cls: 'unused-images-center-wrapper' });
        const closeButton = buttonWrapper.createEl('button', { text: i18n.t('close'), cls: 'unused-images-button' });
        closeButton.addEventListener('click', () => this.close());
    }
}

export class SelectiveDeleteModal extends Modal {
    private readonly unusedFilesByPath: Map<string, TFile>;

    constructor(
        private readonly unusedFiles: TFile[],
        private readonly plugin: OzanClearImages
    ) {
        super(plugin.app);
        this.unusedFilesByPath = new Map(unusedFiles.map((file) => [file.path, file]));
    }

    onOpen(): void {
        const fileListContainer = this.contentEl.createDiv({
            cls: 'unused-images-file-list unused-images-logs',
        });

        this.unusedFiles.forEach((file) => {
            const fileItem = fileListContainer.createDiv({ cls: 'unused-file-item' });
            const checkbox = fileItem.createEl('input', { type: 'checkbox', value: file.path });
            checkbox.addClass('file-checkbox');
            checkbox.checked = true;

            const fileName = fileItem.createSpan({ text: file.path, cls: 'clickable-file-path' });
            fileName.addEventListener('click', () => {
                void this.plugin.app.workspace.getLeaf().openFile(file).catch((error: unknown) => {
                    new Notice(`Failed to open file: ${getErrorMessage(error)}`);
                });
            });

            const ignoreButton = fileItem.createEl('button', {
                text: i18n.t('modal.ignore.file'),
                cls: 'ignore-button',
            });
            ignoreButton.addEventListener('click', () => {
                void this.ignoreFile(file);
            });
        });

        const buttonWrapper = this.contentEl.createDiv({
            cls: 'unused-images-center-wrapper modal-buttons',
        });

        const deleteButton = buttonWrapper.createEl('button', {
            text: i18n.t('modal.delete.selected'),
            cls: 'unused-images-button delete-button',
        });
        deleteButton.addEventListener('click', () => {
            void this.handleDeleteSelected(fileListContainer);
        });

        const selectAllButton = buttonWrapper.createEl('button', {
            text: i18n.t('modal.select.all'),
            cls: 'unused-images-button select-button',
        });
        let isSelectingAll = true;
        selectAllButton.addEventListener('click', () => {
            fileListContainer.querySelectorAll<HTMLInputElement>('.file-checkbox').forEach((checkbox) => {
                checkbox.checked = isSelectingAll;
            });
            selectAllButton.textContent = isSelectingAll
                ? i18n.t('modal.deselect.all')
                : i18n.t('modal.select.all');
            isSelectingAll = !isSelectingAll;
        });

        const cancelButton = buttonWrapper.createEl('button', {
            text: i18n.t('cancel'),
            cls: 'unused-images-button cancel-button',
        });
        cancelButton.addEventListener('click', () => this.close());
    }

    private async ignoreFile(file: TFile): Promise<void> {
        if (this.plugin.settings.excludedFiles.includes(file.path)) {
            new Notice(i18n.t('notice.file.already.ignored'));
            return;
        }

        try {
            this.plugin.settings.excludedFiles.push(file.path);
            await this.plugin.saveSettings();
            new Notice(i18n.t('notice.file.ignored', { file: file.path }));

            this.close();
            const updatedFiles = this.unusedFiles.filter((unusedFile) => unusedFile.path !== file.path);
            if (updatedFiles.length > 0) {
                new SelectiveDeleteModal(updatedFiles, this.plugin).open();
            } else {
                new Notice(i18n.t('notice.all.images.used'));
            }
        } catch (error) {
            new Notice(i18n.t('notice.error.ignoring.file', { error: getErrorMessage(error) }));
        }
    }

    private async handleDeleteSelected(fileListContainer: HTMLElement): Promise<void> {
        const checkboxes = fileListContainer.querySelectorAll<HTMLInputElement>('.file-checkbox');
        const filesToDelete = Array.from(checkboxes)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => this.unusedFilesByPath.get(checkbox.value))
            .filter((file): file is TFile => file !== undefined);

        if (filesToDelete.length === 0) {
            new Notice(i18n.t('notice.no.files.selected'));
            return;
        }

        try {
            await this.deleteSelectedFiles(filesToDelete);
        } catch (error) {
            new Notice(i18n.t('notice.error.ignoring.file', { error: getErrorMessage(error) }));
        } finally {
            this.close();
        }
    }

    private async deleteSelectedFiles(filesToDelete: TFile[]): Promise<void> {
        let deletedCount = 0;
        const isInExcludedFolder = createExcludedFolderMatcher(this.plugin);

        for (const file of filesToDelete) {
            if (isInExcludedFolder(file)) {
                continue;
            }

            // FileManager honours the user's configured deletion destination
            // (Obsidian trash, system trash or permanent deletion).
            await this.plugin.app.fileManager.trashFile(file);
            deletedCount++;
        }

        new Notice(i18n.t('notice.deleted.success', { count: deletedCount.toString() }));
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
