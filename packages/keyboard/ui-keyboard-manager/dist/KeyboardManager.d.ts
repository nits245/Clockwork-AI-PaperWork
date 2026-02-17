/**
 * Keyboard Mana  private shortcutRegistry: ShortcutRegistry;
  private documentEditor: DocumentEditor;
  private chat: Chat;
  private helpTooltip?: HelpTooltip;
 * Main class that orchestrates all keyboard functionality
 */
import { ContextType } from './ContextDetector';
import { ChatHooks } from './Chat';
export interface KeyboardManagerConfig {
    debug?: boolean;
    kbossMode?: boolean;
    chatHooks?: ChatHooks;
    autoStart?: boolean;
}
export declare class KeyboardManager {
    private config;
    private contextDetector;
    private shortcutRegistry;
    private documentEditor?;
    private chat?;
    private helpTooltip?;
    private isActive;
    constructor(config?: KeyboardManagerConfig);
    private setupComponents;
    private addGlobalShortcuts;
    start(): void;
    stop(): void;
    toggle(): void;
    updateConfig(config: Partial<KeyboardManagerConfig>): void;
    toggleKBossMode(): void;
    getCurrentContext(): ContextType;
    private showGlobalHelp;
    private showContextInfo;
    destroy(): void;
    isRunning(): boolean;
    getStatus(): {
        active: boolean;
        context: ContextType;
        kbossMode: boolean | undefined;
        debug: boolean | undefined;
    };
}
