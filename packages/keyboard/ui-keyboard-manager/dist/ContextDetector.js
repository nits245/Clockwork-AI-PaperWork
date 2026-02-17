"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextDetector = exports.ContextDetector = void 0;
class ContextDetector {
    constructor() {
        this.currentContext = 'navigation';
        this.kBossMode = false;
        this.customSelectors = new Set();
        this.listeners = [];
        this.lastCheck = 0;
        this.checkInterval = 100; // Check every 100ms for performance
        // Only initialize if we're in a browser environment
        if (typeof document !== 'undefined') {
            this.init();
        }
    }
    init() {
        if (typeof document === 'undefined')
            return;
        // Initial context detection
        this.detectContext();
        // Listen for focus/blur events for immediate context changes
        document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
        document.addEventListener('focusout', this.handleFocusOut.bind(this), true);
        // Listen for clicks to detect context changes
        document.addEventListener('click', this.handleClick.bind(this), true);
        // Listen for key events to toggle KBoss mode
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        // Setup mutation observer for dynamic content
        this.setupMutationObserver();
        // Periodic context check (fallback)
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.detectContext(), this.checkInterval);
        }
    }
    setupMutationObserver() {
        this.observer = new MutationObserver((_mutations) => {
            const now = performance.now();
            if (now - this.lastCheck < 50)
                return; // Throttle to max 20 checks per second
            this.lastCheck = now;
            this.detectContext();
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'contenteditable', 'data-media-player']
        });
    }
    handleFocusIn(event) {
        this.activeElement = event.target;
        this.detectContext();
    }
    handleFocusOut() {
        this.activeElement = undefined;
        this.detectContext();
    }
    handleClick(event) {
        this.activeElement = event.target;
        setTimeout(() => this.detectContext(), 0); // Async to let focus events fire first
    }
    handleKeyDown(event) {
        // Toggle KBoss mode with Ctrl+Shift+K
        if (event.ctrlKey && event.shiftKey && event.key === 'K') {
            event.preventDefault();
            this.kBossMode = !this.kBossMode;
            this.notifyContextChange(this.currentContext, this.currentContext);
        }
    }
    /**
     * Detect current context based on DOM and active element
     * Performance target: <1ms
     */
    detectContext() {
        if (typeof document === 'undefined')
            return;
        const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const previousContext = this.currentContext;
        try {
            const newContext = this.getContextFromElement(this.activeElement || document.activeElement);
            if (newContext !== this.currentContext) {
                this.currentContext = newContext;
                this.notifyContextChange(previousContext, newContext);
            }
        }
        catch (error) {
            console.warn('ContextDetector: Error during context detection', error);
        }
        const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;
        if (duration > 1) {
            console.warn(`ContextDetector: Slow detection (${duration.toFixed(2)}ms)`);
        }
    }
    getContextFromElement(element) {
        if (!element)
            return 'navigation';
        // Check custom selectors first
        for (const selector of this.customSelectors) {
            if (element.matches(selector) || element.closest(selector)) {
                return this.getContextTypeFromSelector(selector);
            }
        }
        // Chat context detection
        if (this.isChatContext(element)) {
            return 'chat';
        }
        // Document context detection
        if (this.isDocumentContext(element)) {
            return 'document';
        }
        // Media context detection
        if (this.isMediaContext(element)) {
            return 'media';
        }
        return 'navigation';
    }
    isChatContext(element) {
        // Rule: .chat-input or textarea[rows<=5]
        if (element.matches('.chat-input, .chat-popup input, .chat-popup textarea')) {
            return true;
        }
        if (element.tagName === 'TEXTAREA') {
            const rows = parseInt(element.getAttribute('rows') || '0', 10);
            return rows <= 5 && rows > 0;
        }
        // Check if element is inside a chat container
        return !!(element.closest('.chat-container, .chat-popup, .message-input, [data-chat="true"]'));
    }
    isDocumentContext(element) {
        // Rule: .doc-editor, [contenteditable="true"], textarea[rows>5]
        if (element.matches('.doc-editor, .document-editor, .text-editor')) {
            return true;
        }
        if (element.getAttribute('contenteditable') === 'true') {
            return true;
        }
        if (element.tagName === 'TEXTAREA') {
            const rows = parseInt(element.getAttribute('rows') || '0', 10);
            return rows > 5;
        }
        // Check for document editing containers
        return !!(element.closest('.document-preview, .form-wizard, .edit-document, [data-editor="true"]'));
    }
    isMediaContext(element) {
        // Rule: video, audio, [data-media-player="true"]
        if (element.matches('video, audio')) {
            return true;
        }
        if (element.getAttribute('data-media-player') === 'true') {
            return true;
        }
        // Check for media containers
        return !!(element.closest('.media-player, .video-container, .audio-player, [data-media="true"]'));
    }
    getContextTypeFromSelector(selector) {
        // Simple heuristic based on selector content
        if (selector.includes('chat') || selector.includes('message'))
            return 'chat';
        if (selector.includes('doc') || selector.includes('edit') || selector.includes('content'))
            return 'document';
        if (selector.includes('media') || selector.includes('video') || selector.includes('audio'))
            return 'media';
        return 'navigation';
    }
    notifyContextChange(from, to) {
        const startTime = performance.now();
        const event = {
            from,
            to,
            timestamp: Date.now(),
            element: this.activeElement
        };
        this.listeners.forEach(listener => {
            try {
                listener(event);
            }
            catch (error) {
                console.error('ContextDetector: Error in context change listener', error);
            }
        });
        const duration = performance.now() - startTime;
        if (duration > 5) {
            console.warn(`ContextDetector: Slow context change notification (${duration.toFixed(2)}ms)`);
        }
    }
    // Public API
    getCurrentContext() {
        return this.currentContext;
    }
    isInKBossMode() {
        return this.kBossMode;
    }
    addKBossContext(selector) {
        this.customSelectors.add(selector);
    }
    removeKBossContext(selector) {
        this.customSelectors.delete(selector);
    }
    onContextChange(callback) {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    destroy() {
        document.removeEventListener('focusin', this.handleFocusIn.bind(this), true);
        document.removeEventListener('focusout', this.handleFocusOut.bind(this), true);
        document.removeEventListener('click', this.handleClick.bind(this), true);
        document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
        if (this.observer) {
            this.observer.disconnect();
        }
        this.listeners.length = 0;
        this.customSelectors.clear();
    }
    // Debug methods
    getDebugInfo() {
        return {
            currentContext: this.currentContext,
            kBossMode: this.kBossMode,
            activeElement: this.activeElement?.tagName,
            customSelectors: Array.from(this.customSelectors),
            listenerCount: this.listeners.length
        };
    }
}
exports.ContextDetector = ContextDetector;
// Singleton instance
exports.contextDetector = new ContextDetector();
