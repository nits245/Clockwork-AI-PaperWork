/**
 * HelpTooltip - Compact help panel showing keyboard shortcuts
 * Appears at bottom-right corner when Ctrl+H is pressed
 */
import { ShortcutRegistry } from './ShortcutRegistry';
import { ContextDetector } from './ContextDetector';
export interface HelpTooltipConfig {
    timeout?: number;
    maxShortcuts?: number;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
export declare class HelpTooltip {
    private shortcutRegistry;
    private contextDetector;
    private element;
    private isVisible;
    private hideTimeout;
    private config;
    constructor(shortcutRegistry: ShortcutRegistry, contextDetector: ContextDetector, config?: HelpTooltipConfig);
    private createTooltipElement;
    private getPositionStyles;
    private registerShortcut;
    show(): void;
    hide(): void;
    toggle(): void;
    refresh(): void;
    private updateContent;
    private getRelevantShortcuts;
    private getContextTitle;
    private formatShortcutKeys;
    private scheduleAutoHide;
    private clearAutoHide;
    destroy(): void;
}
