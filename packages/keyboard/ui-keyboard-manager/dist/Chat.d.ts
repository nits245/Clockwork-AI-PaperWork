/**
 * Chat Shortcuts
 * Implements send, history navigation, collapse, and search shortcuts for chat interfaces
 */
import { ShortcutRegistry } from './ShortcutRegistry';
export interface ChatHooks {
    onSend?: () => void;
    onHistoryUp?: () => void;
    onHistoryDown?: () => void;
    onCollapse?: () => void;
    onSearch?: () => void;
    onClear?: () => void;
}
export declare class Chat {
    private registry;
    private hooks;
    private searchModal?;
    constructor(registry: ShortcutRegistry, hooks?: ChatHooks);
    private registerShortcuts;
    private sendMessage;
    private navigateHistoryUp;
    private navigateHistoryDown;
    private collapseChat;
    private clearChat;
    private showSearchModal;
    private insertNewLine;
    private acceptAutocomplete;
    private nextAutocompleteSuggestion;
    private prevAutocompleteSuggestion;
    private getChatInput;
    private triggerSend;
    private findSendButton;
    private defaultHistoryNavigation;
    private defaultCollapseChat;
    private defaultClearChat;
    private resizeInput;
    private hasAutocompleteSuggestion;
    private getAutocompleteSuggestions;
    private getActiveSuggestion;
    private getActiveSuggestionIndex;
    private setActiveSuggestion;
    private hideAutocompleteSuggestions;
    private findWordStart;
    private findWordEnd;
    private createSearchModal;
    private searchInChat;
    private highlightText;
    private clearSearchHighlights;
    updateHooks(hooks: ChatHooks): void;
    destroy(): void;
}
