/**
 * Document Editor Shortcuts
 * Implements formatting, alignment, paragraph, and list shortcuts for document editing
 */
import { ShortcutRegistry } from './ShortcutRegistry';
export declare class DocumentEditor {
    private registry;
    private helpModal?;
    constructor(registry: ShortcutRegistry);
    private registerShortcuts;
    private registerFormattingShortcuts;
    private registerAlignmentShortcuts;
    private registerParagraphShortcuts;
    private registerListShortcuts;
    private registerHelpShortcut;
    private toggleBold;
    private toggleItalic;
    private toggleUnderline;
    private clearAllFormatting;
    private clearCharacterFormatting;
    private setAlignment;
    private setLineSpacing;
    private increaseIndent;
    private decreaseIndent;
    private setHeading;
    private toggleBulletList;
    private toggleNumberedList;
    private indentListItem;
    private outdentListItem;
    private isContentEditable;
    private getActiveElement;
    private getSelection;
    private replaceSelection;
    private wrapSelection;
    private wrapLine;
    private addIndentation;
    private removeIndentation;
    private toggleMarkdownList;
    private isInList;
    private showHelpModal;
    private createHelpModal;
    destroy(): void;
}
