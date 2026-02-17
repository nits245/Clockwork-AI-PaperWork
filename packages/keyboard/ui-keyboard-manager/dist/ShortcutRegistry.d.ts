/**
 * Shortcut Registry for Keyboard Manager
 * Manages keyboard shortcut registration, validation, and execution
 */
import { ContextType } from './ContextDetector';
export interface ShortcutDefinition {
    id: string;
    keys: string | string[];
    context?: ContextType | ContextType[] | 'global';
    description: string;
    category?: string;
    action: (event: KeyboardEvent, context: ContextType) => void | Promise<void>;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    condition?: () => boolean;
}
export interface ShortcutGroup {
    category: string;
    shortcuts: ShortcutDefinition[];
}
export declare class ShortcutRegistry {
    private shortcuts;
    private keyMap;
    private isEnabled;
    constructor();
    private init;
    private handleKeyDown;
    private shouldExecuteShortcut;
    private isActivelyTyping;
    private normalizeKeyCombo;
    private normalizeContexts;
    private getCurrentContext;
    register(shortcut: ShortcutDefinition): void;
    unregister(shortcutId: string): void;
    getShortcut(shortcutId: string): ShortcutDefinition | undefined;
    getShortcutsByContext(context: ContextType | 'global'): ShortcutDefinition[];
    getShortcutsByCategory(category: string): ShortcutDefinition[];
    getAllShortcuts(): ShortcutDefinition[];
    getShortcutGroups(): ShortcutGroup[];
    enable(): void;
    disable(): void;
    isRegistryEnabled(): boolean;
    private validateShortcut;
    private normalizeKeyString;
    destroy(): void;
}
