/**
 * HelpTooltip - Compact tooltip showing current context shortcuts
 * Appears at bottom-right corner when Ctrl+H is pressed
 */

export interface ShortcutInfo {
  key: string;
  description: string;
  context?: string;
}

export class HelpTooltip {
  private tooltipElement: HTMLDivElement | null = null;
  private isVisible: boolean = false;
  private hideTimeout: NodeJS.Timeout | null = null;
  private readonly HIDE_DELAY = 5000; // 5 seconds auto-hide

  constructor() {
    this.createTooltip();
    this.setupKeyboardListener();
  }

  private createTooltip(): void {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'kb-help-tooltip';
    this.tooltipElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 350px;
      background: rgba(30, 30, 30, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px 16px;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s ease-out;
      pointer-events: none;
    `;

    document.body.appendChild(this.tooltipElement);
  }

  private setupKeyboardListener(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl+H to toggle tooltip
      if (event.ctrlKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        this.toggle();
      }
      // Escape to hide
      else if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  private getCurrentShortcuts(): ShortcutInfo[] {
    const context = this.detectCurrentContext();
    const shortcuts: ShortcutInfo[] = [];

    // Always available shortcuts
    shortcuts.push(
      { key: 'Ctrl+H', description: 'Show/hide this help tooltip' },
      { key: 'Esc', description: 'Hide tooltip' }
    );

    // Context-specific shortcuts
    if (context === 'document') {
      shortcuts.push(
        { key: 'Ctrl+B', description: 'Bold text', context: 'Document' },
        { key: 'Ctrl+I', description: 'Italic text', context: 'Document' },
        { key: 'Ctrl+U', description: 'Underline text', context: 'Document' },
        { key: 'Ctrl+L', description: 'Align left', context: 'Document' },
        { key: 'Ctrl+E', description: 'Align center', context: 'Document' },
        { key: 'Ctrl+R', description: 'Align right', context: 'Document' },
        { key: 'Ctrl+J', description: 'Justify text', context: 'Document' },
        { key: 'Ctrl+1', description: 'Heading 1', context: 'Document' },
        { key: 'Ctrl+2', description: 'Heading 2', context: 'Document' },
        { key: 'Ctrl+5', description: 'Normal paragraph', context: 'Document' },
        { key: 'Ctrl+Shift+L', description: 'Bulleted list', context: 'Document' },
        { key: 'Ctrl+Shift+N', description: 'Numbered list', context: 'Document' },
        { key: 'F1', description: 'Detailed help', context: 'Document' }
      );
    } else if (context === 'chat') {
      shortcuts.push(
        { key: 'Ctrl+Enter', description: 'Send message', context: 'Chat' },
        { key: 'Ctrl+↑', description: 'Previous message', context: 'Chat' },
        { key: 'Ctrl+↓', description: 'Next message', context: 'Chat' },
        { key: 'Ctrl+F', description: 'Search messages', context: 'Chat' },
        { key: 'Esc', description: 'Collapse chat', context: 'Chat' }
      );
    } else {
      // General navigation shortcuts
      shortcuts.push(
        { key: 'Ctrl+S', description: 'Save document' },
        { key: 'Ctrl+Z', description: 'Undo' },
        { key: 'Ctrl+Y', description: 'Redo' },
        { key: 'Ctrl+F', description: 'Find in page' }
      );
    }

    return shortcuts;
  }

  private detectCurrentContext(): string {
    const activeElement = document.activeElement as HTMLElement;
    
    // Check for document editor context
    if (activeElement?.contentEditable === 'true' || 
        activeElement?.tagName === 'TEXTAREA' ||
        (activeElement?.tagName === 'INPUT' && (activeElement as HTMLInputElement).type === 'text')) {
      
      // Further check if it's a chat input
      if (activeElement.classList.contains('chat-input') ||
          activeElement.closest('.chat-container') ||
          activeElement.id?.includes('chat')) {
        return 'chat';
      }
      
      return 'document';
    }

    // Check for chat context by DOM structure
    if (activeElement?.closest('.chat-container') ||
        document.querySelector('.chat-container:hover')) {
      return 'chat';
    }

    return 'general';
  }

  private renderTooltip(shortcuts: ShortcutInfo[]): void {
    if (!this.tooltipElement) return;

    const context = this.detectCurrentContext();
    const contextTitle = context === 'document' ? 'Document Editor' :
                        context === 'chat' ? 'Chat Interface' : 'General';

    const shortcutRows = shortcuts.map(shortcut => {
      const contextBadge = shortcut.context ? 
        `<span style="background: rgba(0, 123, 255, 0.2); color: #007bff; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px;">${shortcut.context}</span>` : '';
      
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
          <span style="font-family: 'Courier New', monospace; background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 11px;">
            ${shortcut.key}
          </span>
          <span style="flex: 1; margin-left: 12px; color: rgba(255, 255, 255, 0.8);">
            ${shortcut.description}${contextBadge}
          </span>
        </div>
      `;
    }).join('');

    this.tooltipElement.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <span style="font-weight: 600; color: #ffffff;">⌨️ ${contextTitle} Shortcuts</span>
        <span style="margin-left: auto; color: rgba(255, 255, 255, 0.5); font-size: 11px;">Ctrl+H</span>
      </div>
      <div style="max-height: 300px; overflow-y: auto;">
        ${shortcutRows}
      </div>
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 11px; color: rgba(255, 255, 255, 0.5); text-align: center;">
        Auto-hide in ${this.HIDE_DELAY / 1000}s • Press Esc to close
      </div>
    `;
  }

  private show(): void {
    if (!this.tooltipElement || this.isVisible) return;

    const shortcuts = this.getCurrentShortcuts();
    this.renderTooltip(shortcuts);

    this.isVisible = true;
    this.tooltipElement.style.opacity = '1';
    this.tooltipElement.style.transform = 'translateY(0)';

    // Clear any existing timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Set auto-hide timeout
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, this.HIDE_DELAY);
  }

  private hide(): void {
    if (!this.tooltipElement || !this.isVisible) return;

    this.isVisible = false;
    this.tooltipElement.style.opacity = '0';
    this.tooltipElement.style.transform = 'translateY(10px)';

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update shortcuts for current context (called when context changes)
   */
  public refresh(): void {
    if (this.isVisible) {
      const shortcuts = this.getCurrentShortcuts();
      this.renderTooltip(shortcuts);
    }
  }

  /**
   * Programmatically show tooltip
   */
  public showTooltip(): void {
    this.show();
  }

  /**
   * Programmatically hide tooltip
   */
  public hideTooltip(): void {
    this.hide();
  }

  /**
   * Check if tooltip is currently visible
   */
  public isTooltipVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Cleanup tooltip and event listeners
   */
  public destroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }
}