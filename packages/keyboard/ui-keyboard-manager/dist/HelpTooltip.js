"use strict";
/**
 * HelpTooltip - Compact help panel showing keyboard shortcuts
 * Appears at bottom-right corner when Ctrl+H is pressed
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpTooltip = void 0;
class HelpTooltip {
    constructor(shortcutRegistry, contextDetector, config = {}) {
        this.shortcutRegistry = shortcutRegistry;
        this.contextDetector = contextDetector;
        this.element = null;
        this.isVisible = false;
        this.hideTimeout = null;
        this.config = {
            timeout: 5000,
            maxShortcuts: 8,
            position: 'bottom-right',
            ...config
        };
        this.createTooltipElement();
        this.registerShortcut();
    }
    createTooltipElement() {
        this.element = document.createElement('div');
        this.element.id = 'keyboard-help-tooltip';
        this.element.style.cssText = `
      position: fixed;
      ${this.getPositionStyles()}
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s ease-in-out;
      pointer-events: none;
      display: none;
    `;
        document.body.appendChild(this.element);
    }
    getPositionStyles() {
        switch (this.config.position) {
            case 'bottom-right':
                return 'bottom: 20px; right: 20px;';
            case 'bottom-left':
                return 'bottom: 20px; left: 20px;';
            case 'top-right':
                return 'top: 20px; right: 20px;';
            case 'top-left':
                return 'top: 20px; left: 20px;';
            default:
                return 'bottom: 20px; right: 20px;';
        }
    }
    registerShortcut() {
        this.shortcutRegistry.register({
            id: 'help-tooltip-toggle',
            keys: 'Ctrl+H',
            description: 'Show/hide keyboard shortcuts help',
            context: 'global',
            action: () => this.toggle()
        });
        // ESC to hide
        this.shortcutRegistry.register({
            id: 'help-tooltip-hide',
            keys: 'Escape',
            description: 'Hide help tooltip',
            context: 'global',
            action: () => {
                if (this.isVisible) {
                    this.hide();
                }
            }
        });
    }
    show() {
        if (!this.element || this.isVisible)
            return;
        this.updateContent();
        this.isVisible = true;
        this.element.style.display = 'block';
        // Force reflow
        this.element.offsetHeight;
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateY(0)';
        this.scheduleAutoHide();
    }
    hide() {
        if (!this.element || !this.isVisible)
            return;
        this.isVisible = false;
        this.clearAutoHide();
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(10px)';
        setTimeout(() => {
            if (this.element) {
                this.element.style.display = 'none';
            }
        }, 200);
    }
    toggle() {
        if (this.isVisible) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    refresh() {
        if (this.isVisible) {
            this.updateContent();
            this.scheduleAutoHide();
        }
    }
    updateContent() {
        if (!this.element)
            return;
        const currentContext = this.contextDetector.getCurrentContext();
        const shortcuts = this.getRelevantShortcuts(currentContext);
        const title = this.getContextTitle(currentContext);
        const shortcutsHtml = shortcuts
            .slice(0, this.config.maxShortcuts)
            .map((shortcut) => {
            const keys = this.formatShortcutKeys(shortcut);
            return `
          <div style="display: flex; justify-content: space-between; margin: 4px 0; align-items: center;">
            <span style="color: #ccc; flex: 1; margin-right: 12px;">${shortcut.description}</span>
            <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 11px; font-family: monospace;">${keys}</kbd>
          </div>
        `;
        })
            .join('');
        this.element.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: #fff; font-size: 13px;">
        ${title} Shortcuts
      </div>
      ${shortcutsHtml}
      ${shortcuts.length > this.config.maxShortcuts ?
            `<div style="color: #888; font-size: 11px; margin-top: 6px; text-align: center;">
          +${shortcuts.length - this.config.maxShortcuts} more shortcuts available
        </div>` : ''}
      <div style="color: #666; font-size: 10px; margin-top: 8px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
        Press Ctrl+H to toggle • ESC to close
      </div>
    `;
    }
    getRelevantShortcuts(context) {
        const allShortcuts = this.shortcutRegistry.getAllShortcuts();
        // Get shortcuts for current context and global shortcuts
        return allShortcuts.filter((shortcut) => shortcut.context === context || shortcut.context === 'global').sort((a, b) => {
            // Prioritize context-specific shortcuts
            if (a.context !== 'global' && b.context === 'global')
                return -1;
            if (a.context === 'global' && b.context !== 'global')
                return 1;
            return 0;
        });
    }
    getContextTitle(context) {
        switch (context) {
            case 'document-editor':
                return 'Document Editor';
            case 'chat':
                return 'Chat';
            case 'form':
                return 'Form';
            case 'navigation':
                return 'Navigation';
            default:
                return 'Global';
        }
    }
    formatShortcutKeys(shortcut) {
        // Handle both string and array keys
        const keyStr = Array.isArray(shortcut.keys) ? shortcut.keys[0] : shortcut.keys;
        // Format special keys for display
        return keyStr
            .replace('ArrowUp', '↑')
            .replace('ArrowDown', '↓')
            .replace('ArrowLeft', '←')
            .replace('ArrowRight', '→')
            .replace('Escape', 'Esc')
            .replace(' ', 'Space')
            .replace('Cmd', '⌘')
            .replace('Meta', '⌘');
    }
    scheduleAutoHide() {
        this.clearAutoHide();
        this.hideTimeout = window.setTimeout(() => {
            this.hide();
        }, this.config.timeout);
    }
    clearAutoHide() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }
    destroy() {
        this.hide();
        this.clearAutoHide();
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}
exports.HelpTooltip = HelpTooltip;
