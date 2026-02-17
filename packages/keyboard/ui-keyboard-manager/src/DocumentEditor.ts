/**
 * Document Editor Shortcuts
 * Implements formatting, alignment, paragraph, and list shortcuts for document editing
 */

import { ShortcutRegistry, ShortcutDefinition } from './ShortcutRegistry';

export class DocumentEditor {
  private registry: ShortcutRegistry;
  private helpModal?: HTMLElement;

  constructor(registry: ShortcutRegistry) {
    this.registry = registry;
    this.registerShortcuts();
  }

  private registerShortcuts(): void {
    // Formatting shortcuts
    this.registerFormattingShortcuts();
    
    // Alignment shortcuts
    this.registerAlignmentShortcuts();
    
    // Paragraph shortcuts
    this.registerParagraphShortcuts();
    
    // List shortcuts
    this.registerListShortcuts();
    
    // Help shortcut
    this.registerHelpShortcut();
  }

  private registerFormattingShortcuts(): void {
    const shortcuts: ShortcutDefinition[] = [
      {
        id: 'doc.format.bold',
        keys: ['Ctrl+B', 'Cmd+B'],
        context: 'document',
        category: 'Formatting',
        description: 'Bold text',
        action: this.toggleBold.bind(this)
      },
      {
        id: 'doc.format.italic',
        keys: ['Ctrl+I', 'Cmd+I'],
        context: 'document',
        category: 'Formatting',
        description: 'Italic text',
        action: this.toggleItalic.bind(this)
      },
      {
        id: 'doc.format.underline',
        keys: ['Ctrl+U', 'Cmd+U'],
        context: 'document',
        category: 'Formatting',
        description: 'Underline text',
        action: this.toggleUnderline.bind(this)
      },
      {
        id: 'doc.format.clear-all',
        keys: ['Ctrl+Shift+Space', 'Cmd+Shift+Space'],
        context: 'document',
        category: 'Formatting',
        description: 'Clear all formatting',
        action: this.clearAllFormatting.bind(this)
      },
      {
        id: 'doc.format.clear-char',
        keys: ['Ctrl+Space', 'Cmd+Space'],
        context: 'document',
        category: 'Formatting',
        description: 'Clear character formatting',
        action: this.clearCharacterFormatting.bind(this)
      }
    ];

    shortcuts.forEach(shortcut => this.registry.register(shortcut));
  }

  private registerAlignmentShortcuts(): void {
    const shortcuts: ShortcutDefinition[] = [
      {
        id: 'doc.align.left',
        keys: ['Ctrl+L', 'Cmd+L'],
        context: 'document',
        category: 'Alignment',
        description: 'Align left',
        action: () => this.setAlignment('left')
      },
      {
        id: 'doc.align.center',
        keys: ['Ctrl+E', 'Cmd+E'],
        context: 'document',
        category: 'Alignment',
        description: 'Align center',
        action: () => this.setAlignment('center')
      },
      {
        id: 'doc.align.right',
        keys: ['Ctrl+R', 'Cmd+R'],
        context: 'document',
        category: 'Alignment',
        description: 'Align right',
        action: () => this.setAlignment('right')
      },
      {
        id: 'doc.align.justify',
        keys: ['Ctrl+J', 'Cmd+J'],
        context: 'document',
        category: 'Alignment',
        description: 'Justify text',
        action: () => this.setAlignment('justify')
      }
    ];

    shortcuts.forEach(shortcut => this.registry.register(shortcut));
  }

  private registerParagraphShortcuts(): void {
    const shortcuts: ShortcutDefinition[] = [
      {
        id: 'doc.paragraph.single-space',
        keys: ['Ctrl+1', 'Cmd+1'],
        context: 'document',
        category: 'Paragraph',
        description: 'Single line spacing',
        action: () => this.setLineSpacing('1')
      },
      {
        id: 'doc.paragraph.double-space',
        keys: ['Ctrl+2', 'Cmd+2'],
        context: 'document',
        category: 'Paragraph',
        description: 'Double line spacing',
        action: () => this.setLineSpacing('2')
      },
      {
        id: 'doc.paragraph.1-5-space',
        keys: ['Ctrl+5', 'Cmd+5'],
        context: 'document',
        category: 'Paragraph',
        description: '1.5 line spacing',
        action: () => this.setLineSpacing('1.5')
      },
      {
        id: 'doc.paragraph.indent',
        keys: ['Ctrl+]', 'Cmd+]'],
        context: 'document',
        category: 'Paragraph',
        description: 'Increase indent',
        action: this.increaseIndent.bind(this)
      },
      {
        id: 'doc.paragraph.outdent',
        keys: ['Ctrl+[', 'Cmd+['],
        context: 'document',
        category: 'Paragraph',
        description: 'Decrease indent',
        action: this.decreaseIndent.bind(this)
      },
      {
        id: 'doc.paragraph.h1',
        keys: ['Ctrl+Alt+1', 'Cmd+Alt+1'],
        context: 'document',
        category: 'Paragraph',
        description: 'Heading 1',
        action: () => this.setHeading('h1')
      },
      {
        id: 'doc.paragraph.h2',
        keys: ['Ctrl+Alt+2', 'Cmd+Alt+2'],
        context: 'document',
        category: 'Paragraph',
        description: 'Heading 2',
        action: () => this.setHeading('h2')
      },
      {
        id: 'doc.paragraph.h3',
        keys: ['Ctrl+Alt+3', 'Cmd+Alt+3'],
        context: 'document',
        category: 'Paragraph',
        description: 'Heading 3',
        action: () => this.setHeading('h3')
      }
    ];

    shortcuts.forEach(shortcut => this.registry.register(shortcut));
  }

  private registerListShortcuts(): void {
    const shortcuts: ShortcutDefinition[] = [
      {
        id: 'doc.list.bullet',
        keys: ['Ctrl+Shift+L', 'Cmd+Shift+L'],
        context: 'document',
        category: 'Lists',
        description: 'Bullet list',
        action: this.toggleBulletList.bind(this)
      },
      {
        id: 'doc.list.numbered',
        keys: ['Ctrl+Shift+N', 'Cmd+Shift+N'],
        context: 'document',
        category: 'Lists',
        description: 'Numbered list',
        action: this.toggleNumberedList.bind(this)
      },
      {
        id: 'doc.list.indent',
        keys: 'Tab',
        context: 'document',
        category: 'Lists',
        description: 'Indent list item',
        action: this.indentListItem.bind(this),
        condition: () => this.isInList()
      },
      {
        id: 'doc.list.outdent',
        keys: 'Shift+Tab',
        context: 'document',
        category: 'Lists',
        description: 'Outdent list item',
        action: this.outdentListItem.bind(this),
        condition: () => this.isInList()
      }
    ];

    shortcuts.forEach(shortcut => this.registry.register(shortcut));
  }

  private registerHelpShortcut(): void {
    this.registry.register({
      id: 'doc.help',
      keys: 'F1',
      context: 'document',
      category: 'Help',
      description: 'Show keyboard shortcuts',
      action: this.showHelpModal.bind(this)
    });
  }

  // Formatting actions
  private toggleBold(): void {
    if (this.isContentEditable()) {
      document.execCommand('bold', false);
    } else {
      this.wrapSelection('**', '**');
    }
  }

  private toggleItalic(): void {
    if (this.isContentEditable()) {
      document.execCommand('italic', false);
    } else {
      this.wrapSelection('*', '*');
    }
  }

  private toggleUnderline(): void {
    if (this.isContentEditable()) {
      document.execCommand('underline', false);
    } else {
      this.wrapSelection('<u>', '</u>');
    }
  }

  private clearAllFormatting(): void {
    if (this.isContentEditable()) {
      document.execCommand('removeFormat', false);
    } else {
      // For plain text editors, just remove common markdown formatting
      const selection = this.getSelection();
      if (selection) {
        const cleaned = selection.replace(/(\*\*|__|\*|_|`|~~)/g, '');
        this.replaceSelection(cleaned);
      }
    }
  }

  private clearCharacterFormatting(): void {
    if (this.isContentEditable()) {
      document.execCommand('removeFormat', false);
    }
  }

  // Alignment actions
  private setAlignment(alignment: string): void {
    if (this.isContentEditable()) {
      document.execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`, false);
    } else {
      // For plain text, we can't really set alignment, but we can add CSS classes
      const element = this.getActiveElement() as HTMLElement;
      if (element && element.style) {
        element.style.textAlign = alignment;
      }
    }
  }

  // Paragraph actions
  private setLineSpacing(spacing: string): void {
    const element = this.getActiveElement() as HTMLElement;
    if (element && element.style) {
      element.style.lineHeight = spacing;
    }
  }

  private increaseIndent(): void {
    if (this.isContentEditable()) {
      document.execCommand('indent', false);
    } else {
      this.addIndentation('  ');
    }
  }

  private decreaseIndent(): void {
    if (this.isContentEditable()) {
      document.execCommand('outdent', false);
    } else {
      this.removeIndentation('  ');
    }
  }

  private setHeading(level: string): void {
    if (this.isContentEditable()) {
      document.execCommand('formatBlock', false, level);
    } else {
      const hashes = '#'.repeat(parseInt(level.charAt(1)));
      this.wrapLine(`${hashes} `, '');
    }
  }

  // List actions
  private toggleBulletList(): void {
    if (this.isContentEditable()) {
      document.execCommand('insertUnorderedList', false);
    } else {
      this.toggleMarkdownList('- ');
    }
  }

  private toggleNumberedList(): void {
    if (this.isContentEditable()) {
      document.execCommand('insertOrderedList', false);
    } else {
      this.toggleMarkdownList('1. ');
    }
  }

  private indentListItem(): void {
    if (this.isInList()) {
      this.addIndentation('  ');
    }
  }

  private outdentListItem(): void {
    if (this.isInList()) {
      this.removeIndentation('  ');
    }
  }

  // Helper methods
  private isContentEditable(): boolean {
    const element = this.getActiveElement();
    return element?.getAttribute('contenteditable') === 'true' || 
           element?.tagName === 'DIV' && element.classList.contains('doc-editor');
  }

  private getActiveElement(): Element | null {
    return document.activeElement;
  }

  private getSelection(): string | null {
    const element = this.getActiveElement() as HTMLTextAreaElement | HTMLInputElement;
    if (element && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT')) {
      return element.value.substring(element.selectionStart || 0, element.selectionEnd || 0);
    }
    
    const selection = window.getSelection();
    return selection ? selection.toString() : null;
  }

  private replaceSelection(text: string): void {
    const element = this.getActiveElement() as HTMLTextAreaElement | HTMLInputElement;
    if (element && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT')) {
      const start = element.selectionStart || 0;
      const end = element.selectionEnd || 0;
      element.value = element.value.substring(0, start) + text + element.value.substring(end);
      element.selectionStart = element.selectionEnd = start + text.length;
    }
  }

  private wrapSelection(before: string, after: string): void {
    const selection = this.getSelection() || '';
    this.replaceSelection(before + selection + after);
  }

  private wrapLine(before: string, after: string): void {
    const element = this.getActiveElement() as HTMLTextAreaElement;
    if (!element || element.tagName !== 'TEXTAREA') return;

    const start = element.selectionStart || 0;
    const value = element.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const line = value.substring(lineStart, actualLineEnd);
    const newLine = before + line + after;
    
    element.value = value.substring(0, lineStart) + newLine + value.substring(actualLineEnd);
    element.selectionStart = element.selectionEnd = lineStart + newLine.length;
  }

  private addIndentation(indent: string): void {
    this.wrapLine(indent, '');
  }

  private removeIndentation(indent: string): void {
    const element = this.getActiveElement() as HTMLTextAreaElement;
    if (!element || element.tagName !== 'TEXTAREA') return;

    const start = element.selectionStart || 0;
    const value = element.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const line = value.substring(lineStart, actualLineEnd);
    if (line.startsWith(indent)) {
      const newLine = line.substring(indent.length);
      element.value = value.substring(0, lineStart) + newLine + value.substring(actualLineEnd);
      element.selectionStart = element.selectionEnd = lineStart + newLine.length;
    }
  }

  private toggleMarkdownList(prefix: string): void {
    const element = this.getActiveElement() as HTMLTextAreaElement;
    if (!element || element.tagName !== 'TEXTAREA') return;

    const start = element.selectionStart || 0;
    const value = element.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const line = value.substring(lineStart, actualLineEnd);
    let newLine: string;
    
    if (line.trim().startsWith(prefix.trim())) {
      // Remove list formatting
      newLine = line.replace(new RegExp(`^\\s*${prefix.trim()}\\s*`), '');
    } else {
      // Add list formatting
      newLine = prefix + line.trim();
    }
    
    element.value = value.substring(0, lineStart) + newLine + value.substring(actualLineEnd);
    element.selectionStart = element.selectionEnd = lineStart + newLine.length;
  }

  private isInList(): boolean {
    const element = this.getActiveElement() as HTMLTextAreaElement;
    if (!element || element.tagName !== 'TEXTAREA') return false;

    const start = element.selectionStart || 0;
    const value = element.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const line = value.substring(lineStart, actualLineEnd).trim();
    return /^(\d+\.|[-*+])\s/.test(line);
  }

  private showHelpModal(): void {
    if (this.helpModal) {
      this.helpModal.style.display = 'block';
      return;
    }

    this.createHelpModal();
  }

  private createHelpModal(): void {
    const modal = document.createElement('div');
    modal.className = 'keyboard-help-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const title = document.createElement('h2');
    title.textContent = 'Keyboard Shortcuts';
    title.style.cssText = 'margin: 0 0 20px 0; color: #333;';

    const shortcuts = this.registry.getShortcutGroups().filter(group => 
      ['Formatting', 'Alignment', 'Paragraph', 'Lists', 'Help'].includes(group.category)
    );

    shortcuts.forEach(group => {
      const groupTitle = document.createElement('h3');
      groupTitle.textContent = group.category;
      groupTitle.style.cssText = 'color: #666; margin: 20px 0 10px 0; font-size: 16px;';
      content.appendChild(groupTitle);

      const list = document.createElement('div');
      list.style.cssText = 'display: grid; grid-template-columns: 1fr 200px; gap: 8px; margin-bottom: 16px;';

      group.shortcuts.forEach(shortcut => {
        const desc = document.createElement('div');
        desc.textContent = shortcut.description;
        desc.style.cssText = 'color: #333;';

        const keys = document.createElement('div');
        const keyArray = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
        keys.textContent = keyArray[0]; // Show first key combination
        keys.style.cssText = 'font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;';

        list.appendChild(desc);
        list.appendChild(keys);
      });

      content.appendChild(list);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close (Esc)';
    closeBtn.style.cssText = `
      background: #007acc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    `;
    closeBtn.onclick = () => modal.style.display = 'none';

    content.appendChild(title);
    content.appendChild(closeBtn);
    modal.appendChild(content);

    // Close on Esc or click outside
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });

    document.body.appendChild(modal);
    this.helpModal = modal;
  }

  public destroy(): void {
    if (this.helpModal) {
      this.helpModal.remove();
      this.helpModal = undefined;
    }

    // Unregister all shortcuts
    const shortcutIds = [
      'doc.format.bold', 'doc.format.italic', 'doc.format.underline',
      'doc.format.clear-all', 'doc.format.clear-char',
      'doc.align.left', 'doc.align.center', 'doc.align.right', 'doc.align.justify',
      'doc.paragraph.single-space', 'doc.paragraph.double-space', 'doc.paragraph.1-5-space',
      'doc.paragraph.indent', 'doc.paragraph.outdent',
      'doc.paragraph.h1', 'doc.paragraph.h2', 'doc.paragraph.h3',
      'doc.list.bullet', 'doc.list.numbered', 'doc.list.indent', 'doc.list.outdent',
      'doc.help'
    ];

    shortcutIds.forEach(id => this.registry.unregister(id));
  }
}