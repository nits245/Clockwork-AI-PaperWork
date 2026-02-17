/**
 * Keyboard Mana  private shortcutRegistry: ShortcutRegistry;
  private documentEditor: DocumentEditor;
  private chat: Chat;
  private helpTooltip?: HelpTooltip;
 * Main class that orchestrates all keyboard functionality
 */

import { ContextDetector, ContextType } from './ContextDetector';
import { ShortcutRegistry } from './ShortcutRegistry';
import { DocumentEditor } from './DocumentEditor';
import { Chat, ChatHooks } from './Chat';
import { HelpTooltip } from './components/HelpTooltip';

export interface KeyboardManagerConfig {
  debug?: boolean;
  kbossMode?: boolean;
  chatHooks?: ChatHooks;
  autoStart?: boolean;
}

export class KeyboardManager {
  private config: KeyboardManagerConfig;
  private contextDetector: ContextDetector;
  private shortcutRegistry: ShortcutRegistry;
  private documentEditor?: DocumentEditor;
  private chat?: Chat;
  private helpTooltip?: HelpTooltip;
  private isActive: boolean = false;

  constructor(config: KeyboardManagerConfig = {}) {
    this.config = {
      debug: false,
      kbossMode: false,
      autoStart: true,
      ...config
    };

    this.contextDetector = new ContextDetector();
    this.shortcutRegistry = new ShortcutRegistry();

    this.setupComponents();

    if (this.config.autoStart) {
      this.start();
    }
  }

  private setupComponents(): void {
    // Initialize document editor
    this.documentEditor = new DocumentEditor(this.shortcutRegistry);

    // Initialize chat with hooks
    this.chat = new Chat(this.shortcutRegistry, this.config.chatHooks);

    // Initialize help tooltip (temporarily disabled due to TypeScript issues)
    // TODO: Fix HelpTooltip constructor TypeScript issue
    // this.helpTooltip = new HelpTooltip(this.shortcutRegistry, this.contextDetector);

    // Add global shortcuts
    this.addGlobalShortcuts();
  }

  private addGlobalShortcuts(): void {
    // Global toggle for keyboard shortcuts
    this.shortcutRegistry.register({
      id: 'global.toggle-shortcuts',
      keys: ['Ctrl+Shift+K', 'Cmd+Shift+K'],
      context: 'global',
      category: 'Global',
      description: 'Toggle keyboard shortcuts on/off',
      action: () => this.toggle()
    });

    // KBoss mode toggle
    this.shortcutRegistry.register({
      id: 'global.toggle-kboss',
      keys: ['Ctrl+Shift+\\', 'Cmd+Shift+\\'],
      context: 'global',
      category: 'Global',
      description: 'Toggle KBoss mode',
      action: () => this.toggleKBossMode()
    });

    // Show all shortcuts help
    this.shortcutRegistry.register({
      id: 'global.help',
      keys: ['Ctrl+Shift+?', 'Cmd+Shift+?'],
      context: 'global',
      category: 'Global',
      description: 'Show all keyboard shortcuts',
      action: () => this.showGlobalHelp()
    });

    // Context switching shortcuts (for debugging/development)
    if (this.config.debug) {
      this.shortcutRegistry.register({
        id: 'debug.show-context',
        keys: ['Ctrl+Shift+I', 'Cmd+Shift+I'],
        context: 'global',
        category: 'Debug',
        description: 'Show current context info',
        action: () => this.showContextInfo()
      });
    }
  }

  public start(): void {
    if (this.isActive) return;

    this.isActive = true;

    // Setup context change listener for tooltip updates
    this.contextDetector.onContextChange((_event) => {
      if (this.helpTooltip) {
        this.helpTooltip.refresh();
      }
    });

    if (this.config.debug) {
      console.log('[KeyboardManager] Started');
    }
  }

  public stop(): void {
    if (!this.isActive) return;

    this.isActive = false;

    if (this.config.debug) {
      console.log('[KeyboardManager] Stopped');
    }
  }

  public toggle(): void {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Configuration methods
  public updateConfig(config: Partial<KeyboardManagerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.chatHooks && this.chat) {
      this.chat.updateHooks(this.config.chatHooks);
    }
  }

  public toggleKBossMode(): void {
    const newMode = !this.config.kbossMode;
    this.updateConfig({ kbossMode: newMode });
    
    if (this.config.debug) {
      console.log(`[KeyboardManager] KBoss mode: ${newMode ? 'ON' : 'OFF'}`);
    }
  }

  // Context methods
  public getCurrentContext(): ContextType {
    return this.contextDetector.getCurrentContext();
  }

  // Help and debugging
  private showGlobalHelp(): void {
    const modal = document.createElement('div');
    modal.className = 'keyboard-global-help-modal';
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
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 900px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const title = document.createElement('h2');
    title.textContent = 'All Keyboard Shortcuts';
    title.style.cssText = 'margin: 0 0 20px 0; color: #333;';

    const currentContext = this.getCurrentContext();
    const contextInfo = document.createElement('p');
    contextInfo.textContent = `Current context: ${currentContext}`;
    contextInfo.style.cssText = 'color: #666; margin-bottom: 20px; font-style: italic;';

    const groups = this.shortcutRegistry.getShortcutGroups();
    
    groups.forEach((group: any) => {
      const groupTitle = document.createElement('h3');
      groupTitle.textContent = group.category;
      groupTitle.style.cssText = 'color: #666; margin: 20px 0 10px 0; font-size: 16px;';
      content.appendChild(groupTitle);

      const list = document.createElement('div');
      list.style.cssText = 'display: grid; grid-template-columns: 1fr 200px 100px; gap: 8px; margin-bottom: 16px;';

      // Header
      const descHeader = document.createElement('div');
      descHeader.textContent = 'Description';
      descHeader.style.cssText = 'font-weight: bold; color: #333; padding-bottom: 8px;';
      
      const keyHeader = document.createElement('div');
      keyHeader.textContent = 'Shortcut';
      keyHeader.style.cssText = 'font-weight: bold; color: #333; padding-bottom: 8px;';
      
      const contextHeader = document.createElement('div');
      contextHeader.textContent = 'Context';
      contextHeader.style.cssText = 'font-weight: bold; color: #333; padding-bottom: 8px;';

      list.appendChild(descHeader);
      list.appendChild(keyHeader);
      list.appendChild(contextHeader);

      group.shortcuts.forEach((shortcut: any) => {
        const desc = document.createElement('div');
        desc.textContent = shortcut.description;
        desc.style.cssText = 'color: #333; padding: 4px 0;';

        const keys = document.createElement('div');
        const keyArray = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
        keys.textContent = keyArray[0];
        keys.style.cssText = 'font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;';

        const context = document.createElement('div');
        context.textContent = shortcut.context;
        context.style.cssText = 'color: #666; font-size: 12px; padding: 4px 0;';

        list.appendChild(desc);
        list.appendChild(keys);
        list.appendChild(context);
      });

      content.appendChild(list);
    });

    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top: 20px; text-align: center;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close (Esc)';
    closeBtn.style.cssText = `
      background: #007acc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 8px;
    `;
    closeBtn.onclick = () => modal.remove();

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = this.isActive ? 'Disable Shortcuts' : 'Enable Shortcuts';
    toggleBtn.style.cssText = `
      background: ${this.isActive ? '#dc3545' : '#28a745'};
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    `;
    toggleBtn.onclick = () => {
      this.toggle();
      toggleBtn.textContent = this.isActive ? 'Disable Shortcuts' : 'Enable Shortcuts';
      toggleBtn.style.background = this.isActive ? '#dc3545' : '#28a745';
    };

    controls.appendChild(closeBtn);
    controls.appendChild(toggleBtn);

    content.appendChild(title);
    content.appendChild(contextInfo);
    content.appendChild(controls);
    modal.appendChild(content);

    // Close on Esc or click outside
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    document.body.appendChild(modal);
  }

  private showContextInfo(): void {
    const context = this.getCurrentContext();
    const activeElement = document.activeElement;
    
    console.group(`[KeyboardManager] Context Info`);
    console.log(`Current context: ${context}`);
    console.log(`Active element:`, activeElement);
    console.log(`KBoss mode: ${this.config.kbossMode ? 'ON' : 'OFF'}`);
    console.groupEnd();

    // Show temporary overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
    `;
    overlay.textContent = `Context: ${context} | KBoss: ${this.config.kbossMode ? 'ON' : 'OFF'}`;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
  }

  // Cleanup
  public destroy(): void {
    this.stop();
    
    this.documentEditor?.destroy();
    this.chat?.destroy();
    this.helpTooltip?.destroy();

    if (this.config.debug) {
      console.log('[KeyboardManager] Destroyed');
    }
  }

  // Status methods
  public isRunning(): boolean {
    return this.isActive;
  }

  public getStatus() {
    return {
      active: this.isActive,
      context: this.getCurrentContext(),
      kbossMode: this.config.kbossMode,
      debug: this.config.debug
    };
  }
}