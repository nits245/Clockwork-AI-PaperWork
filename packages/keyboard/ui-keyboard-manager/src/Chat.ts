/**
 * Chat Shortcuts
 * Implements send, history navigation, collapse, and search shortcuts for chat interfaces
 */

import { ShortcutRegistry, ShortcutDefinition } from './ShortcutRegistry';

export interface ChatHooks {
  onSend?: () => void;
  onHistoryUp?: () => void;
  onHistoryDown?: () => void;
  onCollapse?: () => void;
  onSearch?: () => void;
  onClear?: () => void;
}

export class Chat {
  private registry: ShortcutRegistry;
  private hooks: ChatHooks;
  private searchModal?: HTMLElement;

  constructor(registry: ShortcutRegistry, hooks: ChatHooks = {}) {
    this.registry = registry;
    this.hooks = hooks;
    this.registerShortcuts();
  }

  private registerShortcuts(): void {
    const shortcuts: ShortcutDefinition[] = [
      {
        id: 'chat.send',
        keys: ['Ctrl+Enter', 'Cmd+Enter'],
        context: 'chat',
        category: 'Chat',
        description: 'Send message',
        action: this.sendMessage.bind(this)
      },
      {
        id: 'chat.history.up',
        keys: ['Ctrl+ArrowUp', 'Cmd+ArrowUp'],
        context: 'chat',
        category: 'Chat',
        description: 'Previous message in history',
        action: this.navigateHistoryUp.bind(this)
      },
      {
        id: 'chat.history.down',
        keys: ['Ctrl+ArrowDown', 'Cmd+ArrowDown'],
        context: 'chat',
        category: 'Chat',
        description: 'Next message in history',
        action: this.navigateHistoryDown.bind(this)
      },
      {
        id: 'chat.collapse',
        keys: 'Escape',
        context: 'chat',
        category: 'Chat',
        description: 'Collapse/minimize chat',
        action: this.collapseChat.bind(this)
      },
      {
        id: 'chat.search',
        keys: ['Ctrl+F', 'Cmd+F'],
        context: 'chat',
        category: 'Chat',
        description: 'Search in chat',
        action: this.showSearchModal.bind(this)
      },
      {
        id: 'chat.clear',
        keys: ['Ctrl+L', 'Cmd+L'],
        context: 'chat',
        category: 'Chat',
        description: 'Clear chat history',
        action: this.clearChat.bind(this)
      },
      {
        id: 'chat.new-line',
        keys: 'Shift+Enter',
        context: 'chat',
        category: 'Chat',
        description: 'New line (without sending)',
        action: this.insertNewLine.bind(this)
      },
      {
        id: 'chat.autocomplete.accept',
        keys: 'Tab',
        context: 'chat',
        category: 'Chat',
        description: 'Accept autocomplete suggestion',
        action: this.acceptAutocomplete.bind(this),
        condition: () => this.hasAutocompleteSuggestion()
      },
      {
        id: 'chat.autocomplete.next',
        keys: 'ArrowDown',
        context: 'chat',
        category: 'Chat',
        description: 'Next autocomplete suggestion',
        action: this.nextAutocompleteSuggestion.bind(this),
        condition: () => this.hasAutocompleteSuggestion()
      },
      {
        id: 'chat.autocomplete.prev',
        keys: 'ArrowUp',
        context: 'chat',
        category: 'Chat',
        description: 'Previous autocomplete suggestion',
        action: this.prevAutocompleteSuggestion.bind(this),
        condition: () => this.hasAutocompleteSuggestion()
      }
    ];

    shortcuts.forEach(shortcut => this.registry.register(shortcut));
  }

  // Core chat actions
  private sendMessage(): void {
    const chatInput = this.getChatInput();
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Call hook if provided
    if (this.hooks.onSend) {
      this.hooks.onSend();
    } else {
      // Default behavior: trigger form submission or dispatch custom event
      this.triggerSend(chatInput, message);
    }

    // Clear input after sending
    chatInput.value = '';
    this.resizeInput(chatInput);
  }

  private navigateHistoryUp(): void {
    if (this.hooks.onHistoryUp) {
      this.hooks.onHistoryUp();
    } else {
      this.defaultHistoryNavigation('up');
    }
  }

  private navigateHistoryDown(): void {
    if (this.hooks.onHistoryDown) {
      this.hooks.onHistoryDown();
    } else {
      this.defaultHistoryNavigation('down');
    }
  }

  private collapseChat(): void {
    if (this.hooks.onCollapse) {
      this.hooks.onCollapse();
    } else {
      this.defaultCollapseChat();
    }
  }

  private clearChat(): void {
    if (this.hooks.onClear) {
      this.hooks.onClear();
    } else {
      this.defaultClearChat();
    }
  }

  private showSearchModal(): void {
    if (this.hooks.onSearch) {
      this.hooks.onSearch();
    } else {
      this.createSearchModal();
    }
  }

  private insertNewLine(): void {
    const chatInput = this.getChatInput();
    if (!chatInput) return;

    const start = chatInput.selectionStart || 0;
    const end = chatInput.selectionEnd || 0;
    const value = chatInput.value;

    chatInput.value = value.substring(0, start) + '\n' + value.substring(end);
    chatInput.selectionStart = chatInput.selectionEnd = start + 1;
    
    this.resizeInput(chatInput);
  }

  // Autocomplete actions
  private acceptAutocomplete(): void {
    const suggestion = this.getActiveSuggestion();
    if (!suggestion) return;

    const chatInput = this.getChatInput();
    if (!chatInput) return;

    // Replace current word with suggestion
    const cursorPos = chatInput.selectionStart || 0;
    const value = chatInput.value;
    const wordStart = this.findWordStart(value, cursorPos);
    const wordEnd = this.findWordEnd(value, cursorPos);

    chatInput.value = value.substring(0, wordStart) + suggestion + value.substring(wordEnd);
    chatInput.selectionStart = chatInput.selectionEnd = wordStart + suggestion.length;

    this.hideAutocompleteSuggestions();
  }

  private nextAutocompleteSuggestion(): void {
    const suggestions = this.getAutocompleteSuggestions();
    if (!suggestions.length) return;

    let activeIndex = this.getActiveSuggestionIndex();
    activeIndex = (activeIndex + 1) % suggestions.length;
    this.setActiveSuggestion(activeIndex);
  }

  private prevAutocompleteSuggestion(): void {
    const suggestions = this.getAutocompleteSuggestions();
    if (!suggestions.length) return;

    let activeIndex = this.getActiveSuggestionIndex();
    activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
    this.setActiveSuggestion(activeIndex);
  }

  // Helper methods
  private getChatInput(): HTMLTextAreaElement | HTMLInputElement | null {
    // Try multiple selectors for chat inputs
    const selectors = [
      '.chat-input textarea',
      '.chat-input input',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="chat" i]',
      'input[placeholder*="message" i]',
      'input[placeholder*="chat" i]',
      '.message-input',
      '#chat-input',
      '[data-testid="chat-input"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement;
      if (element && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT')) {
        return element;
      }
    }

    // Fallback to active element if it's a text input
    const activeElement = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      return activeElement;
    }

    return null;
  }

  private triggerSend(input: HTMLTextAreaElement | HTMLInputElement, message: string): void {
    // Try to find and click send button
    const sendButton = this.findSendButton(input);
    if (sendButton) {
      sendButton.click();
      return;
    }

    // Dispatch custom event
    input.dispatchEvent(new CustomEvent('chat:send', {
      detail: { message },
      bubbles: true
    }));

    // Trigger form submission if input is in a form
    const form = input.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  }

  private findSendButton(input: HTMLElement): HTMLButtonElement | null {
    const container = input.closest('.chat-container, .chat-input, .message-input') || input.parentElement;
    if (!container) return null;

    // Common send button selectors
    const selectors = [
      'button[type="submit"]',
      '.send-button',
      '.chat-send',
      'button[title*="send" i]',
      'button[aria-label*="send" i]',
      '[data-testid="send-button"]'
    ];

    for (const selector of selectors) {
      const button = container.querySelector(selector) as HTMLButtonElement;
      if (button) return button;
    }

    return null;
  }

  private defaultHistoryNavigation(direction: 'up' | 'down'): void {
    // This would typically interact with a history state
    // For now, we'll dispatch events that the chat component can listen to
    const chatInput = this.getChatInput();
    if (!chatInput) return;

    chatInput.dispatchEvent(new CustomEvent(`chat:history:${direction}`, {
      bubbles: true
    }));
  }

  private defaultCollapseChat(): void {
    // Find chat container and toggle collapsed state
    const chatContainer = document.querySelector('.chat-container, .chat-widget, .chat-panel');
    if (chatContainer) {
      chatContainer.classList.toggle('collapsed');
      
      // Dispatch event
      chatContainer.dispatchEvent(new CustomEvent('chat:collapse', {
        bubbles: true
      }));
    }
  }

  private defaultClearChat(): void {
    const chatMessages = document.querySelector('.chat-messages, .message-list, .chat-history');
    if (chatMessages) {
      if (confirm('Clear all chat messages?')) {
        chatMessages.innerHTML = '';
        
        // Dispatch event
        chatMessages.dispatchEvent(new CustomEvent('chat:clear', {
          bubbles: true
        }));
      }
    }
  }

  private resizeInput(input: HTMLTextAreaElement | HTMLInputElement): void {
    if (input.tagName === 'TEXTAREA') {
      const textarea = input as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }

  // Autocomplete helper methods
  private hasAutocompleteSuggestion(): boolean {
    return this.getAutocompleteSuggestions().length > 0;
  }

  private getAutocompleteSuggestions(): HTMLElement[] {
    const suggestionContainer = document.querySelector('.autocomplete-suggestions, .chat-suggestions, .mentions-list');
    if (!suggestionContainer) return [];

    return Array.from(suggestionContainer.querySelectorAll('.suggestion, .mention, .autocomplete-item'));
  }

  private getActiveSuggestion(): string | null {
    const suggestions = this.getAutocompleteSuggestions();
    const activeIndex = this.getActiveSuggestionIndex();
    const activeSuggestion = suggestions[activeIndex];
    
    return activeSuggestion ? activeSuggestion.textContent?.trim() || null : null;
  }

  private getActiveSuggestionIndex(): number {
    const suggestions = this.getAutocompleteSuggestions();
    for (let i = 0; i < suggestions.length; i++) {
      if (suggestions[i].classList.contains('active') || 
          suggestions[i].classList.contains('selected') || 
          suggestions[i].classList.contains('highlighted')) {
        return i;
      }
    }
    return 0;
  }

  private setActiveSuggestion(index: number): void {
    const suggestions = this.getAutocompleteSuggestions();
    suggestions.forEach((suggestion, i) => {
      suggestion.classList.toggle('active', i === index);
      suggestion.classList.toggle('selected', i === index);
      suggestion.classList.toggle('highlighted', i === index);
    });
  }

  private hideAutocompleteSuggestions(): void {
    const suggestionContainer = document.querySelector('.autocomplete-suggestions, .chat-suggestions, .mentions-list');
    if (suggestionContainer) {
      (suggestionContainer as HTMLElement).style.display = 'none';
    }
  }

  private findWordStart(text: string, position: number): number {
    let start = position;
    while (start > 0 && /\w/.test(text[start - 1])) {
      start--;
    }
    return start;
  }

  private findWordEnd(text: string, position: number): number {
    let end = position;
    while (end < text.length && /\w/.test(text[end])) {
      end++;
    }
    return end;
  }

  // Search modal
  private createSearchModal(): void {
    if (this.searchModal) {
      this.searchModal.style.display = 'block';
      const searchInput = this.searchModal.querySelector('input') as HTMLInputElement;
      if (searchInput) searchInput.focus();
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'chat-search-modal';
    modal.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 300px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Search Chat';
    title.style.cssText = 'margin: 0 0 12px 0; font-size: 16px; color: #333;';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search messages...';
    searchInput.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 12px;
    `;

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end;';

    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Search';
    searchBtn.style.cssText = `
      background: #007acc;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    // Event handlers
    const performSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        this.searchInChat(query);
      }
    };

    const closeModal = () => {
      modal.style.display = 'none';
    };

    searchBtn.onclick = performSearch;
    cancelBtn.onclick = closeModal;
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!modal.contains(e.target as Node)) {
        closeModal();
      }
    });

    controls.appendChild(searchBtn);
    controls.appendChild(cancelBtn);
    modal.appendChild(title);
    modal.appendChild(searchInput);
    modal.appendChild(controls);

    document.body.appendChild(modal);
    this.searchModal = modal;
    searchInput.focus();
  }

  private searchInChat(query: string): void {
    // Remove previous highlights
    this.clearSearchHighlights();

    const chatMessages = document.querySelector('.chat-messages, .message-list, .chat-history');
    if (!chatMessages) return;

    const messages = chatMessages.querySelectorAll('.message, .chat-message');
    let matchCount = 0;

    messages.forEach(message => {
      const textContent = message.textContent || '';
      if (textContent.toLowerCase().includes(query.toLowerCase())) {
        message.classList.add('search-match');
        matchCount++;
        
        // Highlight the text
        this.highlightText(message, query);
        
        // Scroll first match into view
        if (matchCount === 1) {
          message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    // Show result count
    if (this.searchModal) {
      let resultInfo = this.searchModal.querySelector('.search-results') as HTMLElement;
      if (!resultInfo) {
        resultInfo = document.createElement('div');
        resultInfo.className = 'search-results';
        resultInfo.style.cssText = 'font-size: 12px; color: #666; margin-top: 8px;';
        this.searchModal.appendChild(resultInfo);
      }
      resultInfo.textContent = `${matchCount} matches found`;
    }
  }

  private highlightText(element: Element, query: string): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const regex = new RegExp(`(${query})`, 'gi');
      
      if (regex.test(text)) {
        const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        const span = document.createElement('span');
        span.innerHTML = highlighted;
        textNode.parentNode?.replaceChild(span, textNode);
      }
    });
  }

  private clearSearchHighlights(): void {
    // Remove search match classes
    document.querySelectorAll('.search-match').forEach(el => {
      el.classList.remove('search-match');
    });

    // Remove highlight marks
    document.querySelectorAll('.search-highlight').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
  }

  public updateHooks(hooks: ChatHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  public destroy(): void {
    if (this.searchModal) {
      this.searchModal.remove();
      this.searchModal = undefined;
    }

    this.clearSearchHighlights();

    // Unregister all shortcuts
    const shortcutIds = [
      'chat.send', 'chat.history.up', 'chat.history.down', 'chat.collapse',
      'chat.search', 'chat.clear', 'chat.new-line',
      'chat.autocomplete.accept', 'chat.autocomplete.next', 'chat.autocomplete.prev'
    ];

    shortcutIds.forEach(id => this.registry.unregister(id));
  }
}