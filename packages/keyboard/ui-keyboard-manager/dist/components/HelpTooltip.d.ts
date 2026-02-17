/**
 * HelpTooltip - Compact tooltip showing current context shortcuts
 * Appears at bottom-right corner when Ctrl+H is pressed
 */
export interface ShortcutInfo {
    key: string;
    description: string;
    context?: string;
}
export declare class HelpTooltip {
    private tooltipElement;
    private isVisible;
    private hideTimeout;
    private readonly HIDE_DELAY;
    constructor();
    private createTooltip;
    private setupKeyboardListener;
    private getCurrentShortcuts;
    private detectCurrentContext;
    private renderTooltip;
    private show;
    private hide;
    private toggle;
    /**
     * Update shortcuts for current context (called when context changes)
     */
    refresh(): void;
    /**
     * Programmatically show tooltip
     */
    showTooltip(): void;
    /**
     * Programmatically hide tooltip
     */
    hideTooltip(): void;
    /**
     * Check if tooltip is currently visible
     */
    isTooltipVisible(): boolean;
    /**
     * Cleanup tooltip and event listeners
     */
    destroy(): void;
}
