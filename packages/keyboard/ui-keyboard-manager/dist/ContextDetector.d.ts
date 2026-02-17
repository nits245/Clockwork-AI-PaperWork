/**
 * Context Detector for Keyboard Manager
 * Det  private setupMutationObserver(): void {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    
    this.observer = new MutationObserver((_mutations) => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - this.lastCheck < 50) return; // Throttle to max 20 checks per second
      
      this.lastCheck = now;
      this.detectContext();
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'contenteditable', 'role', 'data-context']
    });
  }r context for context-aware keyboard shortcuts
 * Performance targets: detect <1ms; switch event <5ms
 */
export type ContextType = 'chat' | 'document' | 'media' | 'navigation';
export interface ContextChangeEvent {
    from: ContextType;
    to: ContextType;
    timestamp: number;
    element?: Element;
}
export declare class ContextDetector {
    private currentContext;
    private kBossMode;
    private customSelectors;
    private listeners;
    private observer?;
    private activeElement?;
    private lastCheck;
    private checkInterval;
    constructor();
    private init;
    private setupMutationObserver;
    private handleFocusIn;
    private handleFocusOut;
    private handleClick;
    private handleKeyDown;
    /**
     * Detect current context based on DOM and active element
     * Performance target: <1ms
     */
    private detectContext;
    private getContextFromElement;
    private isChatContext;
    private isDocumentContext;
    private isMediaContext;
    private getContextTypeFromSelector;
    private notifyContextChange;
    getCurrentContext(): ContextType;
    isInKBossMode(): boolean;
    addKBossContext(selector: string): void;
    removeKBossContext(selector: string): void;
    onContextChange(callback: (event: ContextChangeEvent) => void): () => void;
    destroy(): void;
    getDebugInfo(): {
        currentContext: ContextType;
        kBossMode: boolean;
        activeElement: string | undefined;
        customSelectors: string[];
        listenerCount: number;
    };
}
export declare const contextDetector: ContextDetector;
