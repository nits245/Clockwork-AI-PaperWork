"use strict";
/**
 * Shortcut Registry for Keyboard Manager
 * Manages keyboard shortcut registration, validation, and execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortcutRegistry = void 0;
class ShortcutRegistry {
    constructor() {
        this.shortcuts = new Map();
        this.keyMap = new Map(); // normalized key -> shortcut IDs
        this.isEnabled = true;
        this.init();
    }
    init() {
        // Listen for keydown events
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    }
    handleKeyDown(event) {
        if (!this.isEnabled)
            return;
        const normalizedKey = this.normalizeKeyCombo(event);
        const shortcutIds = this.keyMap.get(normalizedKey) || [];
        for (const shortcutId of shortcutIds) {
            const shortcut = this.shortcuts.get(shortcutId);
            if (!shortcut)
                continue;
            // Check if shortcut should execute in current context
            if (!this.shouldExecuteShortcut(shortcut, event))
                continue;
            // Execute shortcut
            try {
                if (shortcut.preventDefault !== false) {
                    event.preventDefault();
                }
                if (shortcut.stopPropagation) {
                    event.stopPropagation();
                }
                const result = shortcut.action(event, this.getCurrentContext());
                if (result instanceof Promise) {
                    result.catch(error => {
                        console.error(`ShortcutRegistry: Error executing async shortcut ${shortcutId}`, error);
                    });
                }
            }
            catch (error) {
                console.error(`ShortcutRegistry: Error executing shortcut ${shortcutId}`, error);
            }
            // Stop after first matching shortcut
            break;
        }
    }
    shouldExecuteShortcut(shortcut, event) {
        // Check additional condition
        if (shortcut.condition && !shortcut.condition()) {
            return false;
        }
        // Check context
        const currentContext = this.getCurrentContext();
        const allowedContexts = this.normalizeContexts(shortcut.context);
        if (!allowedContexts.includes('global') && !allowedContexts.includes(currentContext)) {
            return false;
        }
        // For document context, don't execute if user is actively typing
        if (currentContext === 'document' && this.isActivelyTyping(event)) {
            // Only allow non-text-modifying shortcuts when typing
            const nonTextShortcuts = ['F1', 'Ctrl+S', 'Ctrl+Z', 'Ctrl+Y', 'Esc'];
            const keyCombo = this.normalizeKeyCombo(event);
            return nonTextShortcuts.some(allowed => keyCombo.includes(allowed));
        }
        return true;
    }
    isActivelyTyping(event) {
        const target = event.target;
        if (!target)
            return false;
        // Check if we're in a text input context
        const isTextInput = target.matches('input[type="text"], input[type="email"], input[type="password"], textarea') ||
            target.getAttribute('contenteditable') === 'true';
        if (!isTextInput)
            return false;
        // Check if this is a text-modifying key
        const modifiers = event.ctrlKey || event.metaKey || event.altKey;
        const isTextKey = event.key.length === 1 || ['Backspace', 'Delete', 'Enter', 'Tab', 'Space'].includes(event.key);
        return isTextKey && !modifiers;
    }
    normalizeKeyCombo(event) {
        const parts = [];
        if (event.ctrlKey)
            parts.push('Ctrl');
        if (event.altKey)
            parts.push('Alt');
        if (event.shiftKey)
            parts.push('Shift');
        if (event.metaKey)
            parts.push('Cmd');
        // Normalize key name
        let key = event.key;
        if (key === ' ')
            key = 'Space';
        if (key === 'ArrowUp')
            key = '↑';
        if (key === 'ArrowDown')
            key = '↓';
        if (key === 'ArrowLeft')
            key = '←';
        if (key === 'ArrowRight')
            key = '→';
        parts.push(key);
        return parts.join('+');
    }
    normalizeContexts(context) {
        if (!context)
            return ['global'];
        if (typeof context === 'string')
            return [context];
        return context;
    }
    getCurrentContext() {
        // This will be injected by KeyboardManager
        return window.__keyboardContext || 'navigation';
    }
    // Public API
    register(shortcut) {
        // Validate shortcut
        this.validateShortcut(shortcut);
        // Store shortcut
        this.shortcuts.set(shortcut.id, shortcut);
        // Register key mappings
        const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
        keys.forEach(keyCombo => {
            const normalized = this.normalizeKeyString(keyCombo);
            if (!this.keyMap.has(normalized)) {
                this.keyMap.set(normalized, []);
            }
            this.keyMap.get(normalized).push(shortcut.id);
        });
    }
    unregister(shortcutId) {
        const shortcut = this.shortcuts.get(shortcutId);
        if (!shortcut)
            return;
        // Remove from shortcuts map
        this.shortcuts.delete(shortcutId);
        // Remove from key mappings
        const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
        keys.forEach(keyCombo => {
            const normalized = this.normalizeKeyString(keyCombo);
            const shortcutIds = this.keyMap.get(normalized) || [];
            const filtered = shortcutIds.filter(id => id !== shortcutId);
            if (filtered.length === 0) {
                this.keyMap.delete(normalized);
            }
            else {
                this.keyMap.set(normalized, filtered);
            }
        });
    }
    getShortcut(shortcutId) {
        return this.shortcuts.get(shortcutId);
    }
    getShortcutsByContext(context) {
        return Array.from(this.shortcuts.values()).filter(shortcut => {
            const allowedContexts = this.normalizeContexts(shortcut.context);
            return allowedContexts.includes(context) || allowedContexts.includes('global');
        });
    }
    getShortcutsByCategory(category) {
        return Array.from(this.shortcuts.values()).filter(shortcut => shortcut.category === category);
    }
    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }
    getShortcutGroups() {
        const groups = new Map();
        this.shortcuts.forEach(shortcut => {
            const category = shortcut.category || 'General';
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            groups.get(category).push(shortcut);
        });
        return Array.from(groups.entries()).map(([category, shortcuts]) => ({
            category,
            shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
        }));
    }
    enable() {
        this.isEnabled = true;
    }
    disable() {
        this.isEnabled = false;
    }
    isRegistryEnabled() {
        return this.isEnabled;
    }
    validateShortcut(shortcut) {
        if (!shortcut.id) {
            throw new Error('Shortcut ID is required');
        }
        if (!shortcut.keys) {
            throw new Error('Shortcut keys are required');
        }
        if (!shortcut.description) {
            throw new Error('Shortcut description is required');
        }
        if (!shortcut.action) {
            throw new Error('Shortcut action is required');
        }
        if (this.shortcuts.has(shortcut.id)) {
            throw new Error(`Shortcut with ID '${shortcut.id}' already exists`);
        }
    }
    normalizeKeyString(keyCombo) {
        // Normalize key combination string to match event format
        return keyCombo
            .split('+')
            .map(part => part.trim())
            .map(part => {
            // Normalize modifier names
            if (part.toLowerCase() === 'cmd' || part.toLowerCase() === 'meta')
                return 'Cmd';
            if (part.toLowerCase() === 'ctrl' || part.toLowerCase() === 'control')
                return 'Ctrl';
            if (part.toLowerCase() === 'alt' || part.toLowerCase() === 'option')
                return 'Alt';
            if (part.toLowerCase() === 'shift')
                return 'Shift';
            // Normalize special keys
            if (part === 'Space')
                return 'Space';
            if (part === 'Up' || part === 'ArrowUp')
                return '↑';
            if (part === 'Down' || part === 'ArrowDown')
                return '↓';
            if (part === 'Left' || part === 'ArrowLeft')
                return '←';
            if (part === 'Right' || part === 'ArrowRight')
                return '→';
            return part;
        })
            .join('+');
    }
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
        this.shortcuts.clear();
        this.keyMap.clear();
    }
}
exports.ShortcutRegistry = ShortcutRegistry;
