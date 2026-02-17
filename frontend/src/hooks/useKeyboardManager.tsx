/**
 * React Hook for Keyboard Manager Integration
 * Provides keyboard shortcuts functionality in React components
 */

import React, { useEffect, useRef } from 'react';

// Import keyboard manager from local package
// Assuming the package is built and available
let KeyboardManager: any = null;

// Try to import the keyboard manager - using dynamic import to avoid build issues
try {
  // For now, we'll implement a basic keyboard manager mock
  // TODO: Implement proper import when keyboard package is published to npm
  KeyboardManager = class MockKeyboardManager {
    constructor(config: any) {
      console.log('[MockKeyboardManager] Initialized with config:', config);
      this.setupBasicShortcuts();
    }
    
    setupBasicShortcuts() {
      // Enhanced keyboard shortcuts with global and context-aware functionality
      document.addEventListener('keydown', (e) => {
        
        // === GLOBAL SHORTCUTS (work everywhere) ===
        
        // F1 for help - works globally
        if (e.key === 'F1') {
          e.preventDefault();
          console.log('[KeyboardShortcut] Show help (F1)');
          this.showHelp();
          return;
        }
        
        // Ctrl+H for help tooltip (alternative)
        if (e.ctrlKey && e.key === 'h') {
          e.preventDefault();
          console.log('[KeyboardShortcut] Toggle help tooltip (Ctrl+H)');
          this.showHelpTooltip();
          return;
        }
        
        // Ctrl+/ for shortcuts list
        if (e.ctrlKey && e.key === '/') {
          e.preventDefault();
          console.log('[KeyboardShortcut] Show shortcuts list (Ctrl+/)');
          this.showShortcutsList();
          return;
        }
        
        // ESC to close any open modals or tooltips
        if (e.key === 'Escape') {
          console.log('[KeyboardShortcut] Close modals/tooltips (ESC)');
          this.closeModals();
          return;
        }
        
        // === 🧭 NAVIGATION CONTEXT (Dashboard, Calendar, Rosters...) ===
        // Only when not in text input fields
        if (!this.isInTextInput(e.target)) {
          
          // Alt + 1-9 for main modules navigation
          if (e.altKey && /^[1-9]$/.test(e.key)) {
            e.preventDefault();
            const moduleIndex = parseInt(e.key);
            console.log(`[KeyboardShortcut] Navigate to module ${moduleIndex} (Alt+${e.key})`);
            this.navigateToModule(moduleIndex);
            return;
          }
          
          // F6 for focus cycling: Sidebar → Main → Chat → Details → Sidebar
          if (e.key === 'F6') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Cycle focus areas (F6)');
            this.cycleFocusAreas();
            return;
          }
          
          // Ctrl+/ for Command Palette
          if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Open Command Palette (Ctrl+/)');
            this.openCommandPalette();
            return;
          }
          
          // Ctrl+J for Create Task from selection
          if (e.ctrlKey && e.key === 'j') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Create Task from selection (Ctrl+J)');
            this.createTaskFromSelection();
            return;
          }
          
          // Ctrl+; for Schedule meeting from selection
          if (e.ctrlKey && e.key === ';') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Schedule meeting from selection (Ctrl+;)');
            this.scheduleMeetingFromSelection();
            return;
          }
        }
        
        // === PAGE-SPECIFIC SHORTCUTS (Context-Aware) ===
        const currentPage = this.getCurrentPageContext();
        if (!this.isInTextInput(e.target)) {
          this.handlePageSpecificShortcuts(e, currentPage);
        }
        
        // === WORKSPACE/DASHBOARD SHORTCUTS ===
        
        // Ctrl+N for new document (if not in text field)
        if (e.ctrlKey && e.key === 'n' && !this.isInTextInput(e.target)) {
          e.preventDefault();
          console.log('[KeyboardShortcut] New document (Ctrl+N)');
          this.navigateToCreateDoc();
          return;
        }
        
        // Ctrl+O for open document
        if (e.ctrlKey && e.key === 'o' && !this.isInTextInput(e.target)) {
          e.preventDefault();
          console.log('[KeyboardShortcut] Open document (Ctrl+O)');
          this.navigateToDocuments();
          return;
        }
        
        // Ctrl+Shift+S for settings
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          console.log('[KeyboardShortcut] Open settings (Ctrl+Shift+S)');
          this.navigateToSettings();
          return;
        }
        
        // === TEXT EDITING SHORTCUTS ===
        
        // Only apply text formatting shortcuts if we're in a text input
        if (this.isInTextInput(e.target)) {
          
          // Ctrl+B for bold
          if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Bold text (Ctrl+B)');
            this.execCommand('bold');
            return;
          }
          
          // Ctrl+I for italic
          if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Italic text (Ctrl+I)');
            this.execCommand('italic');
            return;
          }
          
          // Ctrl+U for underline
          if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Underline text (Ctrl+U)');
            this.execCommand('underline');
            return;
          }
          
          // Ctrl+K for link
          if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Insert link (Ctrl+K)');
            this.insertLink();
            return;
          }
          
          // Ctrl+Shift+L for bullet list
          if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Bullet list (Ctrl+Shift+L)');
            this.execCommand('insertUnorderedList');
            return;
          }
          
          // Ctrl+Shift+N for numbered list
          if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            console.log('[KeyboardShortcut] Numbered list (Ctrl+Shift+N)');
            this.execCommand('insertOrderedList');
            return;
          }
        }
      });
    }
    
    isInTextInput(target: any) {
      if (!target) return false;
      
      const tagName = target.tagName?.toLowerCase();
      const isContentEditable = target.contentEditable === 'true';
      const isTextInput = ['input', 'textarea'].includes(tagName);
      const isRichEditor = target.closest('.jodit-wysiwyg, .ql-editor, .tox-edit-area, [contenteditable]');
      
      return isTextInput || isContentEditable || isRichEditor;
    }
    
    execCommand(command: string) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        document.execCommand(command);
      }
    }
    
    showHelp() {
      this.showHelpModal();
    }
    
    showHelpModal() {
      const currentPage = this.getCurrentPageContext();
      const helpContent = this.getContextualHelp(currentPage);
      alert(helpContent);
    }
    
    getCurrentPageContext() {
      const pathname = window.location.pathname;
      
      if (pathname === '/' || pathname.includes('/home') || pathname.includes('/dashboard')) {
        return 'dashboard';
      } else if (pathname.includes('/create-doc')) {
        return 'create-doc';
      } else if (pathname.includes('/documents')) {
        return 'documents';
      } else if (pathname.includes('/formwizard')) {
        return 'formwizard';
      } else if (pathname.includes('/calendar')) {
        return 'calendar';
      } else if (pathname.includes('/profile')) {
        return 'profile';
      }
      
      return 'general';
    }
    
    getContextualHelp(pageContext: string) {
      const globalShortcuts = `
🌐 GLOBAL SHORTCUTS:
• F1 - Show this help
• Ctrl+H - Toggle help tooltip
• ESC - Close modal or focus out

🧭 NAVIGATION:
• Alt+1-9 - Navigate to modules
• F6 - Cycle focus areas
• Ctrl+/ - Command Palette`;

      const textEditingShortcuts = `
📝 TEXT EDITING:
• Ctrl+B - Bold text
• Ctrl+I - Italic text  
• Ctrl+U - Underline text
• Ctrl+K - Insert link
• Ctrl+Shift+L - Bullet list
• Ctrl+Shift+N - Numbered list`;

      switch (pageContext) {
        case 'dashboard':
          return `
� Dashboard Shortcuts

📊 DASHBOARD ACTIONS:
• Ctrl+N - Create new document
• Ctrl+R - Refresh dashboard data
• Ctrl+D - View all documents
• Ctrl+T - Add new note
• Ctrl+1 - Focus on Documents section
• Ctrl+2 - Focus on Calendar
• Ctrl+3 - Focus on Notes
• Ctrl+4 - Focus on Recent Documents

${globalShortcuts}

💡 Dashboard-specific shortcuts for quick navigation!`;

        case 'create-doc':
          return `
🎯 Create Document Shortcuts

� DOCUMENT CREATION:
• Ctrl+S - Save document
• Ctrl+P - Preview document
• Ctrl+Shift+P - Print document
• Ctrl+T - Select template
• F11 - Toggle fullscreen

${textEditingShortcuts}
${globalShortcuts}

💡 Focus on document creation and editing!`;

        case 'formwizard':
          return `
🎯 Form Wizard Shortcuts

📋 FORM NAVIGATION:
• Tab/Shift+Tab - Navigate fields
• Ctrl+Enter - Complete form
• Ctrl+S - Save progress
• Ctrl+P - Preview document
• F11 - Toggle fullscreen
• Esc - Exit wizard

${textEditingShortcuts}
${globalShortcuts}

💡 Efficient form completion shortcuts!`;

        case 'documents':
          return `
🎯 Documents Page Shortcuts

📁 DOCUMENT MANAGEMENT:
• Ctrl+N - Create new document
• Ctrl+F - Search documents
• Ctrl+R - Refresh list
• Delete - Delete selected document
• Enter - Open selected document
• Ctrl+A - Select all documents
• Ctrl+D - Duplicate document

${globalShortcuts}

💡 Manage your documents efficiently!`;

        case 'calendar':
          return `
🎯 Calendar Shortcuts

📅 CALENDAR NAVIGATION:
• Arrow keys - Navigate dates
• Ctrl+Today - Go to today
• Ctrl+N - New event
• Ctrl+E - Edit selected event
• Delete - Delete selected event
• Space - Toggle month/week view

${globalShortcuts}

💡 Navigate and manage your calendar!`;

        default:
          return `
🎯 PaperWork Keyboard Shortcuts

${globalShortcuts}
${textEditingShortcuts}

📁 WORKSPACE:
• Ctrl+N - New document
• Ctrl+O - Open documents
• Ctrl+Shift+S - Settings

💡 Shortcuts adapt to each page context!`;
      }
    }
    
    showHelpTooltip() {
      // Create floating help tooltip with optimized performance
      this.removeExistingTooltips();
      
      const tooltip = document.createElement('div');
      tooltip.id = 'keyboard-help-tooltip';
      
      // Use CSS classes instead of inline styles for better performance
      tooltip.className = 'keyboard-tooltip';
      
      const currentPage = this.getCurrentPageContext();
      const contextualShortcuts = this.getContextualTooltipShortcuts(currentPage);
      
      tooltip.innerHTML = `
        <div class="tooltip-content">
          <div class="tooltip-header">
            ⌨️ ${this.getPageDisplayName(currentPage)} Shortcuts
          </div>
          <div class="shortcuts-grid">
            ${contextualShortcuts}
          </div>
          <div class="tooltip-footer">
            Press ESC to close • More shortcuts with F1
          </div>
        </div>
      `;
      
      // Add CSS styles to head if not already present
      this.addTooltipStyles();
      
      // Use requestAnimationFrame for smooth animation
      document.body.appendChild(tooltip);
      
      // Force layout before animation
      void tooltip.offsetHeight;
      
      // Auto-hide after 5 seconds with smooth fade out
      setTimeout(() => {
        this.hideTooltipSmoothly(tooltip);
      }, 5000);
    }
    
    getPageDisplayName(pageContext: string) {
      const pageNames = {
        'dashboard': 'Dashboard',
        'create-doc': 'Create Document',
        'documents': 'Documents',
        'formwizard': 'Form Wizard',
        'calendar': 'Calendar',
        'profile': 'Profile',
        'general': 'Quick'
      };
      return pageNames[pageContext as keyof typeof pageNames] || 'Quick';
    }
    
    getContextualTooltipShortcuts(pageContext: string) {
      const commonShortcuts = `
        <div class="shortcut-row">
          <span>Show all shortcuts</span>
          <kbd>F1</kbd>
        </div>
        <div class="shortcut-row">
          <span>Command Palette</span>
          <kbd>Ctrl+/</kbd>
        </div>`;
      
      switch (pageContext) {
        case 'dashboard':
          return `
            <div class="shortcut-row">
              <span>New document</span>
              <kbd>Ctrl+N</kbd>
            </div>
            <div class="shortcut-row">
              <span>Refresh dashboard</span>
              <kbd>Ctrl+R</kbd>
            </div>
            <div class="shortcut-row">
              <span>Add new note</span>
              <kbd>Ctrl+T</kbd>
            </div>
            <div class="shortcut-row">
              <span>Focus Documents</span>
              <kbd>Ctrl+1</kbd>
            </div>
            ${commonShortcuts}`;
            
        case 'create-doc':
          return `
            <div class="shortcut-row">
              <span>Bold text</span>
              <kbd>Ctrl+B</kbd>
            </div>
            <div class="shortcut-row">
              <span>Italic text</span>
              <kbd>Ctrl+I</kbd>
            </div>
            <div class="shortcut-row">
              <span>Preview document</span>
              <kbd>Ctrl+P</kbd>
            </div>
            <div class="shortcut-row">
              <span>Fullscreen</span>
              <kbd>F11</kbd>
            </div>
            ${commonShortcuts}`;
            
        case 'documents':
          return `
            <div class="shortcut-row">
              <span>Search documents</span>
              <kbd>Ctrl+F</kbd>
            </div>
            <div class="shortcut-row">
              <span>New document</span>
              <kbd>Ctrl+N</kbd>
            </div>
            <div class="shortcut-row">
              <span>Refresh list</span>
              <kbd>Ctrl+R</kbd>
            </div>
            <div class="shortcut-row">
              <span>Open selected</span>
              <kbd>Enter</kbd>
            </div>
            ${commonShortcuts}`;
            
        case 'formwizard':
          return `
            <div class="shortcut-row">
              <span>Complete form</span>
              <kbd>Ctrl+Enter</kbd>
            </div>
            <div class="shortcut-row">
              <span>Save progress</span>
              <kbd>Ctrl+S</kbd>
            </div>
            <div class="shortcut-row">
              <span>Preview document</span>
              <kbd>Ctrl+P</kbd>
            </div>
            <div class="shortcut-row">
              <span>Exit wizard</span>
              <kbd>Esc</kbd>
            </div>
            ${commonShortcuts}`;
            
        case 'calendar':
          return `
            <div class="shortcut-row">
              <span>New event</span>
              <kbd>Ctrl+N</kbd>
            </div>
            <div class="shortcut-row">
              <span>Edit event</span>
              <kbd>Ctrl+E</kbd>
            </div>
            <div class="shortcut-row">
              <span>Navigate dates</span>
              <kbd>Arrow keys</kbd>
            </div>
            <div class="shortcut-row">
              <span>Go to today</span>
              <kbd>Ctrl+Today</kbd>
            </div>
            ${commonShortcuts}`;
            
        default:
          return `
            <div class="shortcut-row">
              <span>Bold text</span>
              <kbd>Ctrl+B</kbd>
            </div>
            <div class="shortcut-row">
              <span>Italic text</span>
              <kbd>Ctrl+I</kbd>
            </div>
            <div class="shortcut-row">
              <span>New document</span>
              <kbd>Ctrl+N</kbd>
            </div>
            ${commonShortcuts}`;
      }
    }
    
    addTooltipStyles() {
      if (document.getElementById('keyboard-tooltip-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'keyboard-tooltip-styles';
      style.textContent = `
        .keyboard-tooltip {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.92);
          color: white;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          z-index: 10000;
          max-width: 320px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
        }
        
        .tooltip-content {
          padding: 16px 20px;
        }
        
        .tooltip-header {
          font-weight: 600;
          margin-bottom: 12px;
          color: #fff;
          font-size: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 8px;
        }
        
        .shortcuts-grid {
          display: grid;
          gap: 8px;
        }
        
        .shortcut-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .shortcut-row kbd {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-family: ui-monospace, monospace;
          font-weight: 500;
          min-width: 24px;
          text-align: center;
        }
        
        .tooltip-footer {
          color: #999;
          font-size: 10px;
          margin-top: 12px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 8px;
        }
        
        /* Navigation Tooltip Styles */
        .navigation-tooltip {
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          color: white;
          border: none;
          animation: slideDown 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .navigation-tooltip .tooltip-message {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .navigation-tooltip .tooltip-shortcut {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          font-family: ui-monospace, monospace;
        }
        
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    hideTooltipSmoothly(tooltip: HTMLElement) {
      if (!tooltip) return;
      
      tooltip.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translate3d(0, 10px, 0) scale(0.98)';
      
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    }
    
    showShortcutsList() {
      this.showHelp(); // For now, show the same help modal
    }
    
    closeModals() {
      this.removeExistingTooltips();
      // Close any other modals that might be open
      const modals = document.querySelectorAll('.modal, [role="dialog"], .tooltip');
      modals.forEach(modal => {
        const htmlElement = modal as HTMLElement;
        if (htmlElement.style) {
          htmlElement.style.display = 'none';
        }
      });
    }
    
    removeExistingTooltips() {
      const existing = document.getElementById('keyboard-help-tooltip');
      if (existing) {
        existing.remove();
      }
    }
    
    navigateToCreateDoc() {
      // Navigate to create document page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/create-doc')) {
        window.location.href = '/create-doc';
      }
    }
    
    navigateToDocuments() {
      // Navigate to documents list
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/documents')) {
        window.location.href = '/documents';
      }
    }
    
    navigateToSettings() {
      // Navigate to settings (if exists)
      console.log('[Navigation] Settings page not implemented yet');
      alert('Settings page coming soon!');
    }
    
    insertLink() {
      const url = prompt('Enter URL:');
      if (url) {
        const text = prompt('Enter link text:', url);
        if (text) {
          document.execCommand('createLink', false, url);
          console.log('[TextEditor] Link inserted:', { url, text });
        }
      }
    }
    
    start() {
      console.log('[MockKeyboardManager] Started');
    }
    
    stop() {
      console.log('[MockKeyboardManager] Stopped');
    }
    
    toggle() {
      console.log('[MockKeyboardManager] Toggled');
    }
    
    updateConfig(config: any) {
      console.log('[MockKeyboardManager] Config updated:', config);
    }
    
    // === 🧭 Navigation Context Methods ===
    
    handlePageSpecificShortcuts(e: KeyboardEvent, pageContext: string) {
      switch (pageContext) {
        case 'dashboard':
          this.handleDashboardShortcuts(e);
          break;
        case 'create-doc':
          this.handleCreateDocShortcuts(e);
          break;
        case 'documents':
          this.handleDocumentsShortcuts(e);
          break;
        case 'formwizard':
          this.handleFormWizardShortcuts(e);
          break;
        case 'calendar':
          this.handleCalendarShortcuts(e);
          break;
      }
    }
    
    handleDashboardShortcuts(e: KeyboardEvent) {
      // Ctrl+R for refresh dashboard
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        console.log('[Dashboard] Refresh dashboard (Ctrl+R)');
        this.showNavigationTooltip('🔄 Refreshing Dashboard...', 'Ctrl+R');
        this.refreshDashboard();
        return;
      }
      
      // Ctrl+D for view all documents
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        console.log('[Dashboard] View all documents (Ctrl+D)');
        this.showNavigationTooltip('📁 Opening Documents...', 'Ctrl+D');
        this.navigateToDocuments();
        return;
      }
      
      // Ctrl+T for add new note
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        console.log('[Dashboard] Add new note (Ctrl+T)');
        this.showNavigationTooltip('📝 Adding New Note...', 'Ctrl+T');
        this.addNewNote();
        return;
      }
      
      // Ctrl+1-4 for focus sections
      if (e.ctrlKey && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const sectionIndex = parseInt(e.key);
        const sections = ['Documents', 'Calendar', 'Notes', 'Recent Documents'];
        console.log(`[Dashboard] Focus ${sections[sectionIndex - 1]} (Ctrl+${e.key})`);
        this.showNavigationTooltip(`🎯 Focus: ${sections[sectionIndex - 1]}`, `Ctrl+${e.key}`);
        this.focusDashboardSection(sectionIndex);
        return;
      }
    }
    
    handleCreateDocShortcuts(e: KeyboardEvent) {
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        console.log('[CreateDoc] Toggle fullscreen (F11)');
        this.showNavigationTooltip('🖥️ Fullscreen Mode', 'F11');
        this.toggleFullscreen();
        return;
      }
      
      // Ctrl+P for preview
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        console.log('[CreateDoc] Preview document (Ctrl+P)');
        this.showNavigationTooltip('👁️ Document Preview', 'Ctrl+P');
        this.previewDocument();
        return;
      }
    }
    
    handleDocumentsShortcuts(e: KeyboardEvent) {
      // Ctrl+F for search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        console.log('[Documents] Search documents (Ctrl+F)');
        this.showNavigationTooltip('🔍 Search Documents', 'Ctrl+F');
        this.focusDocumentSearch();
        return;
      }
    }
    
    handleFormWizardShortcuts(e: KeyboardEvent) {
      // Ctrl+Enter for complete form
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        console.log('[FormWizard] Complete form (Ctrl+Enter)');
        this.showNavigationTooltip('✅ Completing Form...', 'Ctrl+Enter');
        this.completeForm();
        return;
      }
    }
    
    handleCalendarShortcuts(e: KeyboardEvent) {
      // Ctrl+E for edit event
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        console.log('[Calendar] Edit event (Ctrl+E)');
        this.showNavigationTooltip('✏️ Edit Event', 'Ctrl+E');
        this.editCalendarEvent();
        return;
      }
    }
    
    // Dashboard-specific methods
    refreshDashboard() {
      // Trigger dashboard refresh
      window.location.reload();
    }
    
    addNewNote() {
      // Find and click add note button, or trigger add note modal
      const addButton = document.querySelector('[data-action="add-note"], .add-note-btn, button[onclick*="note"]') as HTMLElement;
      if (addButton) {
        addButton.click();
      } else {
        alert('Add Note functionality - implement in component');
      }
    }
    
    focusDashboardSection(sectionIndex: number) {
      const selectors = [
        '.documents-section, [data-section="documents"]',
        '.calendar-section, [data-section="calendar"]', 
        '.notes-section, [data-section="notes"]',
        '.recent-docs-section, [data-section="recent"]'
      ];
      
      const selector = selectors[sectionIndex - 1];
      if (selector) {
        const section = document.querySelector(selector) as HTMLElement;
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Try to focus first interactive element
          const focusable = section.querySelector('button, input, [tabindex]:not([tabindex="-1"])') as HTMLElement;
          if (focusable) {
            focusable.focus();
          }
        }
      }
    }
    
    // Other page-specific methods
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
    
    previewDocument() {
      // Implement document preview logic
      console.log('Document preview functionality');
    }
    
    focusDocumentSearch() {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    completeForm() {
      const submitButton = document.querySelector('button[type="submit"], .submit-btn, .complete-btn') as HTMLElement;
      if (submitButton) {
        submitButton.click();
      }
    }
    
    editCalendarEvent() {
      // Implement calendar event editing
      console.log('Edit calendar event functionality');
    }
    
    navigateToModule(moduleIndex: number) {
      const modules = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Profile', path: '/profile' },
        { name: 'Inbox', path: '/inbox' },
        { name: 'Calendar', path: '/calendar' },
        { name: 'Rosters', path: '/rosters' },
        { name: 'Shifts', path: '/shifts' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Milestones', path: '/milestones' },
        { name: 'Projects', path: '/projects' },
        { name: 'Teams/Settings', path: '/teams' }
      ];
      
      const module = modules[moduleIndex - 1];
      if (module) {
        console.log(`[Navigation] Navigating to ${module.name}`);
        this.showNavigationTooltip(`📍 Navigating to ${module.name}`, `Alt+${moduleIndex}`);
        // For now, just show tooltip. In real app, would navigate to module.path
        // window.location.href = module.path;
      }
    }
    
    cycleFocusAreas() {
      const focusAreas = ['sidebar', 'main', 'chat', 'details'];
      const currentFocus = this.getCurrentFocusArea();
      const currentIndex = focusAreas.indexOf(currentFocus);
      const nextIndex = (currentIndex + 1) % focusAreas.length;
      const nextArea = focusAreas[nextIndex];
      
      console.log(`[Navigation] Cycling focus: ${currentFocus} → ${nextArea}`);
      this.focusArea(nextArea);
      this.showNavigationTooltip(`🎯 Focus: ${nextArea.toUpperCase()}`, 'F6');
    }
    
    getCurrentFocusArea() {
      // Simple focus detection based on active element
      const activeElement = document.activeElement;
      if (activeElement) {
        if (activeElement.closest('.sidebar, nav')) return 'sidebar';
        if (activeElement.closest('.chat, .chat-popup')) return 'chat';
        if (activeElement.closest('.details, .panel')) return 'details';
      }
      return 'main'; // default
    }
    
    focusArea(area: string) {
      // Focus on specific area
      const selectors = {
        sidebar: '.sidebar, nav, [role="navigation"]',
        main: 'main, .main-content, [role="main"]',
        chat: '.chat, .chat-popup, [data-chat]',
        details: '.details, .panel, .info-panel'
      };
      
      const selector = selectors[area as keyof typeof selectors];
      if (selector) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          // Try to focus on first focusable element within the area
          const focusable = element.querySelector('button, input, [tabindex]:not([tabindex="-1"])') as HTMLElement;
          if (focusable) {
            focusable.focus();
          } else {
            element.focus();
          }
        }
      }
    }
    
    openCommandPalette() {
      console.log('[Navigation] Opening Command Palette');
      this.showNavigationTooltip('⌘ Command Palette', 'Ctrl+/');
      // In real app, would open command palette modal
      alert('Command Palette\n\nAvailable commands:\n• New Document\n• Search Documents\n• Settings\n• Help');
    }
    
    createTaskFromSelection() {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        console.log('[Navigation] Creating task from selection:', selection);
        this.showNavigationTooltip(`✅ Task created from: "${selection.substring(0, 30)}..."`, 'Ctrl+J');
      } else {
        console.log('[Navigation] Creating new task');
        this.showNavigationTooltip('✅ Create New Task', 'Ctrl+J');
      }
      // In real app, would open task creation modal
    }
    
    scheduleMeetingFromSelection() {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        console.log('[Navigation] Scheduling meeting from selection:', selection);
        this.showNavigationTooltip(`📅 Meeting scheduled for: "${selection.substring(0, 30)}..."`, 'Ctrl+;');
      } else {
        console.log('[Navigation] Scheduling new meeting');
        this.showNavigationTooltip('📅 Schedule New Meeting', 'Ctrl+;');
      }
      // In real app, would open meeting scheduler modal
    }
    
    showNavigationTooltip(message: string, shortcut: string) {
      // Create a simple navigation feedback tooltip
      this.removeExistingTooltips();
      
      const tooltip = document.createElement('div');
      tooltip.id = 'navigation-tooltip';
      tooltip.className = 'keyboard-tooltip navigation-tooltip';
      
      tooltip.innerHTML = `
        <div class="tooltip-content">
          <div class="tooltip-message">${message}</div>
          <div class="tooltip-shortcut">${shortcut}</div>
        </div>
      `;
      
      // Position at top center
      tooltip.style.position = 'fixed';
      tooltip.style.top = '20px';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.zIndex = '10000';
      
      document.body.appendChild(tooltip);
      
      // Force layout before animation
      void tooltip.offsetHeight;
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        this.hideTooltipSmoothly(tooltip);
      }, 2000);
    }
    
    destroy() {
      console.log('[MockKeyboardManager] Destroyed');
    }
  };
} catch (error) {
  console.warn('[useKeyboardManager] Could not load keyboard manager package:', error);
}

export interface UseKeyboardManagerOptions {
  debug?: boolean;
  kbossMode?: boolean;
  autoStart?: boolean;
  chatHooks?: {
    onSendMessage?: (message: string) => void;
    onMessageHistory?: (direction: 'up' | 'down') => void;
    onToggleChat?: () => void;
    onFocusSearch?: () => void;
  };
}

export function useKeyboardManager(options: UseKeyboardManagerOptions = {}) {
  const keyboardManagerRef = useRef<any>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current || !KeyboardManager) return;

    try {
      // Create keyboard manager instance
      keyboardManagerRef.current = new KeyboardManager({
        debug: options.debug || false,
        kbossMode: options.kbossMode || false,
        autoStart: options.autoStart !== false, // Default to true
        chatHooks: options.chatHooks
      });

      isInitialized.current = true;

      if (options.debug) {
        console.log('[useKeyboardManager] Keyboard manager initialized');
      }

      // Add CSS for help tooltip if not already added
      addHelpTooltipStyles();

    } catch (error) {
      console.error('[useKeyboardManager] Failed to initialize keyboard manager:', error);
    }

    // Cleanup on unmount
    return () => {
      if (keyboardManagerRef.current) {
        try {
          keyboardManagerRef.current.destroy();
          keyboardManagerRef.current = null;
          isInitialized.current = false;
          
          if (options.debug) {
            console.log('[useKeyboardManager] Keyboard manager destroyed');
          }
        } catch (error) {
          console.error('[useKeyboardManager] Error during cleanup:', error);
        }
      }
    };
  }, []); // Empty dependency array - only run once

  // Update configuration when options change
  useEffect(() => {
    if (keyboardManagerRef.current && isInitialized.current) {
      try {
        keyboardManagerRef.current.updateConfig({
          debug: options.debug || false,
          kbossMode: options.kbossMode || false,
          autoStart: options.autoStart !== false,
          chatHooks: options.chatHooks
        });
      } catch (error) {
        console.error('[useKeyboardManager] Error updating config:', error);
      }
    }
  }, [options.debug, options.kbossMode, options.autoStart, options.chatHooks]);

  // Return keyboard manager instance and utility functions
  return {
    keyboardManager: keyboardManagerRef.current,
    isInitialized: isInitialized.current,
    isAvailable: !!KeyboardManager,
    
    // Utility methods
    start: () => {
      if (keyboardManagerRef.current) {
        keyboardManagerRef.current.start();
      }
    },
    
    stop: () => {
      if (keyboardManagerRef.current) {
        keyboardManagerRef.current.stop();
      }
    },
    
    toggle: () => {
      if (keyboardManagerRef.current) {
        keyboardManagerRef.current.toggle();
      }
    },
    
    updateConfig: (config: UseKeyboardManagerOptions) => {
      if (keyboardManagerRef.current) {
        keyboardManagerRef.current.updateConfig(config);
      }
    }
  };
}

// Add styles for help tooltip
function addHelpTooltipStyles() {
  const styleId = 'keyboard-manager-styles';
  
  // Check if styles already added
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Keyboard Manager Help Tooltip Styles */
    #keyboard-help-tooltip {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      z-index: 9999;
    }
    
    #keyboard-help-tooltip kbd {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
      font-weight: 500;
      color: #fff;
      text-shadow: none;
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25);
    }
    
    /* Make sure tooltip appears above Material-UI and other common component libraries */
    #keyboard-help-tooltip {
      z-index: 10000 !important;
    }
    
    /* Animations */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(10px);
      }
    }
  `;
  
  document.head.appendChild(style);
}

// React component wrapper for easier integration
export interface KeyboardManagerProviderProps {
  children: React.ReactNode;
  options?: UseKeyboardManagerOptions;
}

export function KeyboardManagerProvider({ children, options = {} }: KeyboardManagerProviderProps) {
  const { isAvailable } = useKeyboardManager(options);
  
  // Optionally show warning if keyboard manager is not available
  useEffect(() => {
    if (!isAvailable && options.debug) {
      console.warn('[KeyboardManagerProvider] Keyboard manager package not available');
    }
  }, [isAvailable, options.debug]);
  
  return <>{children}</>;
}