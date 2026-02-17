import React, { useState, useEffect, useRef } from 'react';
import { savePDF } from '@progress/kendo-react-pdf';
import './FormWizard.scss';
import '../../styles/cursor-fixes.css';
import { allBlocks } from '../../data/blocks';
import { useMasterVariables, mergeMasterVariablesWithDefaults, getFieldMetadata } from '../../hooks/useMasterVariables';
import MasterVariablesList from '../TextEditor/MasterVariablesList';
import { useDocumentInstance } from '../../hooks/useDocumentInstance';
import { convertMarkdownToHtml } from '../../utils/markdownToHtml';

interface Template {
  id: string;
  title: string;
  uses: string[];
  defaults: { [key: string]: any };
}

interface Block {
  id: string;
  title?: string;
  body?: string;
  content?: string;
  jurisdiction?: string;
  tags?: string[];
}

interface FormWizardProps {
  template: Template;
  onClose: () => void;
}

const FormWizard: React.FC<FormWizardProps> = ({ template, onClose }) => {
  const [activeTab, setActiveTab] = useState('questionnaire');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [addedSuggestions, setAddedSuggestions] = useState<string[]>([]);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [savedDocumentId, setSavedDocumentId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [dynamicVariables, setDynamicVariables] = useState<Set<string>>(new Set());
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromInput = useRef(false);
  const isEditingDocument = useRef(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  // Fetch master variables
  const { variables: masterVariables, loading: masterVarsLoading } = useMasterVariables();
  
  // Document instance hook
  const { saveDocument, updateDocument, loading: savingDocument } = useDocumentInstance();

  // Mock suggestions data
  const suggestions = [
    {
      id: 'suggestion.confidentiality',
      category: 'security',
      clause: 'CONFIDENTIALITY AND NON-DISCLOSURE',
      explanation: 'Protects company confidential information and trade secrets.'
    },
    {
      id: 'suggestion.noncompete', 
      category: 'legal',
      clause: 'NON-COMPETE CLAUSE',
      explanation: 'Prevents working for competitors during employment and for specified period after.'
    },
    {
      id: 'suggestion.intellectual',
      category: 'legal', 
      clause: 'INTELLECTUAL PROPERTY',
      explanation: 'Ensures all work-related IP belongs to the company.'
    }
  ];

  useEffect(() => {
    // Merge template defaults with master variables
    const mergedDefaults = mergeMasterVariablesWithDefaults(masterVariables, template.defaults);
    
    // Initialize form data with merged defaults
    // Use default values from master variables or template, but allow empty override
    const initialData: { [key: string]: string } = {};
    Object.keys(mergedDefaults).forEach(key => {
      initialData[key] = mergedDefaults[key] || '';
    });
    
    setFormData(initialData);
  }, [template, masterVariables]);

  // Initialize document content once when component mounts or template changes
  useEffect(() => {
    const initialContent = generateDocumentWithHighlight();
    setDocumentContent(initialContent);
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = initialContent;
    }
  }, [template.id]);
  
  // Show keyboard hint briefly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKeyboardHint(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInTextInput = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.isContentEditable;
      
      // F1 - Help overlay
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }
      
      // Ctrl+/ - Help (alternative)
      if (e.ctrlKey && e.key === '/' && !isInTextInput) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }
      
      // Ctrl+S - Save document
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (isFormValid()) {
          handleSaveDocument();
        }
        return;
      }
      
      // Esc - Close help or wizard
      if (e.key === 'Escape') {
        if (showHelp) {
          e.preventDefault();
          setShowHelp(false);
        } else if (showCloseConfirm) {
          e.preventDefault();
          setShowCloseConfirm(false);
        } else {
          e.preventDefault();
          setShowCloseConfirm(true);
        }
        return;
      }
      
      // F6 - Cycle sections
      if (e.key === 'F6') {
        e.preventDefault();
        const tabs = ['questionnaire', 'suggestions', 'draft'];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
        return;
      }
      
      // Alt+1, Alt+2, Alt+3 - Quick tab navigation
      if (e.altKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const tabMap: { [key: string]: string } = {
          '1': 'questionnaire',
          '2': 'suggestions',
          '3': 'draft'
        };
        setActiveTab(tabMap[e.key]);
        return;
      }
      
      // Text formatting shortcuts (only in contentEditable)
      if (isInTextInput && target.isContentEditable) {
        // Ctrl+B - Bold
        if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
          e.preventDefault();
          document.execCommand('bold');
          return;
        }
        
        // Ctrl+I - Italic
        if (e.ctrlKey && !e.shiftKey && e.key === 'i') {
          e.preventDefault();
          document.execCommand('italic');
          return;
        }
        
        // Ctrl+U - Underline
        if (e.ctrlKey && !e.shiftKey && e.key === 'u') {
          e.preventDefault();
          document.execCommand('underline');
          return;
        }
        
        // Ctrl+Shift+S - Strikethrough
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          document.execCommand('strikeThrough');
          return;
        }
        
        // Ctrl+` - Monospace toggle (code)
        if (e.ctrlKey && e.key === '`') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const code = document.createElement('code');
            code.style.fontFamily = 'monospace';
            code.style.background = '#f5f5f5';
            code.style.padding = '2px 6px';
            code.style.borderRadius = '3px';
            try {
              range.surroundContents(code);
            } catch (e) {
              // If surroundContents fails, just insert code formatting
              document.execCommand('insertHTML', false, `<code style="font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${range.toString()}</code>`);
            }
          }
          return;
        }
        
        // Ctrl+K - Inline code
        if (e.ctrlKey && !e.shiftKey && e.key === 'k') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection && selection.toString()) {
            document.execCommand('insertHTML', false, `<code style="font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${selection.toString()}</code>`);
          }
          return;
        }
        
        // Ctrl+Shift+K - Code block
        if (e.ctrlKey && e.shiftKey && e.key === 'K') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection) {
            const text = selection.toString() || 'Code block';
            document.execCommand('insertHTML', false, `<pre style="background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: monospace;"><code>${text}</code></pre>`);
          }
          return;
        }
        
        // Ctrl+Shift+L - Bulleted list
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
          e.preventDefault();
          document.execCommand('insertUnorderedList');
          return;
        }
        
        // Ctrl+Shift+N - Numbered list
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
          e.preventDefault();
          document.execCommand('insertOrderedList');
          return;
        }
        
        // Tab - Increase indent
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          document.execCommand('indent');
          return;
        }
        
        // Shift+Tab - Decrease indent
        if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          document.execCommand('outdent');
          return;
        }
        
        // Ctrl+Shift+Q - Blockquote
        if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
          e.preventDefault();
          document.execCommand('formatBlock', false, 'blockquote');
          return;
        }
        
        // Ctrl+Shift+H - Headers (cycle through h1, h2, h3, p)
        if (e.ctrlKey && e.shiftKey && e.key === 'H') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
            let parent = selection.anchorNode.parentElement;
            let currentTag = parent?.tagName.toLowerCase();
            
            let nextTag = 'h1';
            if (currentTag === 'h1') nextTag = 'h2';
            else if (currentTag === 'h2') nextTag = 'h3';
            else if (currentTag === 'h3') nextTag = 'p';
            
            document.execCommand('formatBlock', false, nextTag);
          }
          return;
        }
        
        // Ctrl+L - Select current line
        if (e.ctrlKey && !e.shiftKey && e.key === 'l') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
            const range = document.createRange();
            let node = selection.anchorNode;
            
            // Find the block element
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
              if (!node.parentNode) break;
              node = node.parentNode as Node;
            }
            
            if (node) {
              range.selectNodeContents(node as Node);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
          return;
        }
        
        // Ctrl+D - Select word
        if (e.ctrlKey && !e.shiftKey && e.key === 'd') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection) {
            selection.modify('move', 'backward', 'word');
            selection.modify('extend', 'forward', 'word');
          }
          return;
        }
        
        // Ctrl+Shift+D - Duplicate line
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
            let node = selection.anchorNode;
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
              if (!node.parentNode) break;
              node = node.parentNode as Node;
            }
            
            if (node) {
              const clone = (node as Element).cloneNode(true);
              (node as Element).parentNode?.insertBefore(clone, (node as Element).nextSibling);
            }
          }
          return;
        }
      }
      
      // Navigation shortcuts (when not typing)
      if (!isInTextInput) {
        // J/K - Next/Previous step (VI-style navigation)
        if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          const steps = getSteps();
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          return;
        }
        
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          }
          return;
        }
        
        // PageUp/PageDown - Navigate questionnaire steps
        if (e.key === 'PageUp') {
          e.preventDefault();
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          }
          return;
        }
        
        if (e.key === 'PageDown') {
          e.preventDefault();
          const steps = getSteps();
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          return;
        }
        
        // Ctrl+PageUp/PageDown - Navigate between tabs
        if (e.ctrlKey && e.key === 'PageUp') {
          e.preventDefault();
          const tabs = ['questionnaire', 'suggestions', 'draft', 'insights'];
          const currentIndex = tabs.indexOf(activeTab);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          setActiveTab(tabs[prevIndex]);
          return;
        }
        
        if (e.ctrlKey && e.key === 'PageDown') {
          e.preventDefault();
          const tabs = ['questionnaire', 'suggestions', 'draft', 'insights'];
          const currentIndex = tabs.indexOf(activeTab);
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTab(tabs[nextIndex]);
          return;
        }
        
        // Ctrl+Home - First step
        if (e.ctrlKey && e.key === 'Home') {
          e.preventDefault();
          setCurrentStep(0);
          return;
        }
        
        // Ctrl+End - Last step
        if (e.ctrlKey && e.key === 'End') {
          e.preventDefault();
          const steps = getSteps();
          setCurrentStep(steps.length - 1);
          return;
        }
        
        // Number keys 1-9 for quick step navigation
        if (!e.ctrlKey && !e.altKey && /^[1-9]$/.test(e.key)) {
          e.preventDefault();
          const steps = getSteps();
          const stepIndex = parseInt(e.key) - 1;
          if (stepIndex < steps.length) {
            setCurrentStep(stepIndex);
          }
          return;
        }
      }
      
      // Ctrl+F - Search (focus search if exists)
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        // Focus on any search input in the current view
        const searchInput = document.querySelector('.mvl-search') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, currentStep, showHelp, formData, savedDocumentId]);

  // Update document content when form data changes (from questionnaire)
  useEffect(() => {
    // Only update if user is not actively editing the document directly
    if (!isUpdatingFromInput.current && !isEditingDocument.current && contentEditableRef.current) {
      // Update only the variable spans instead of regenerating entire document
      const currentContent = contentEditableRef.current.innerHTML;
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentContent, 'text/html');
      const variableSpans = doc.querySelectorAll('[data-variable]');
      
      let updated = false;
      variableSpans.forEach(span => {
        let varName = span.getAttribute('data-variable');
        if (varName) {
          // Decode HTML entities in variable name (&#95; -> _)
          const textarea = document.createElement('textarea');
          textarea.innerHTML = varName;
          varName = textarea.value;
          
          // Handle computed field parties.city_state_postcode
          if (varName === 'parties.city_state_postcode') {
            const city = formData['parties.city'] || '';
            const state = formData['parties.state'] || '';
            const postcode = formData['parties.postcode'] || '';
            
            let displayValue = '';
            if (city || state || postcode) {
              displayValue = [city, state, postcode].filter(Boolean).join(' ');
            } else {
              displayValue = '[PARTIES CITY STATE POSTCODE]';
            }
            
            const hasValue = city || state || postcode;
            const highlightClass = hasValue ? 'user-highlight' : 'empty-highlight';
            
            if (span.textContent !== displayValue || span.className !== highlightClass) {
              span.className = highlightClass;
              span.textContent = displayValue;
              updated = true;
            }
          } else {
            // Handle regular variables
            const masterVar = masterVariables.find(v => v.var_name === varName);
            const defaultValue = masterVar?.default_value || '';
            const currentValue = formData[varName];
            
            const hasValue = currentValue && currentValue.toString().trim() !== '';
            const displayValue = hasValue 
              ? currentValue.toString() 
              : defaultValue || `[${varName.replace(/\./g, ' ').replace(/_/g, ' ').toUpperCase()}]`;
            
            const highlightClass = hasValue ? 'user-highlight' : 
              defaultValue ? 'default-highlight' : 'empty-highlight';
            
            // Check if we need to update
            if (span.textContent !== displayValue || span.className !== highlightClass) {
              span.className = highlightClass;
              span.textContent = displayValue;
              updated = true;
            }
          }
        }
      });
      
      // Only update DOM if something changed
      if (updated) {
        const scrollTop = contentEditableRef.current.parentElement?.scrollTop || 0;
        contentEditableRef.current.innerHTML = doc.body.innerHTML;
        setDocumentContent(doc.body.innerHTML);
        
        // Restore scroll position
        requestAnimationFrame(() => {
          if (contentEditableRef.current?.parentElement) {
            contentEditableRef.current.parentElement.scrollTop = scrollTop;
          }
        });
      }
    }
  }, [formData, addedSuggestions, masterVariables]);

  const getBlockById = (id: string): Block | undefined => {
    return allBlocks.find((block: any) => block.id === id) as Block | undefined;
  };
  
  // Handle close with confirmation
  const handleCloseWizard = () => {
    setShowCloseConfirm(true);
  };
  
  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };
  
  const cancelClose = () => {
    setShowCloseConfirm(false);
  };

  // Step configuration - divide form fields into 4 steps
  const getSteps = () => {
    const allFields = getFormFields();
    const stepSize = Math.ceil(allFields.length / 4);
    const steps = [];
    
    for (let i = 0; i < allFields.length; i += stepSize) {
      steps.push({
        title: `Step ${steps.length + 1}`,
        fields: allFields.slice(i, i + stepSize)
      });
    }
    return steps;
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Don't auto-scroll if user is actively typing to avoid focus issues
    // Only scroll if document preview is not being edited
    if (!isEditingDocument.current) {
      setTimeout(() => {
        // Preserve focus on the input field that triggered the change
        const activeElement = document.activeElement as HTMLElement;
        const isFormInput = activeElement?.closest('.form-field');
        
        scrollToDocumentSection(fieldId);
        
        // Restore focus to the input if it was a form field
        if (isFormInput && activeElement) {
          activeElement.focus();
        }
      }, 100);
    }
  };

  const scrollToDocumentSection = (fieldId: string) => {
    const documentPreview = document.querySelector('.document-preview');
    if (documentPreview) {
      // Find elements containing the field variable
      const elements = documentPreview.querySelectorAll('*');
      for (let element of elements) {
        if (element.textContent?.includes(`{{${fieldId}}}`) || element.textContent?.includes(formData[fieldId])) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }
  };

  const nextStep = () => {
    const steps = getSteps();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSuggestion = (suggestionId: string) => {
    setAddedSuggestions(prev => [...prev, suggestionId]);
  };

  const removeSuggestion = (suggestionId: string) => {
    setAddedSuggestions(prev => prev.filter(id => id !== suggestionId));
  };

  // Generate plain text version for fallback export
  const generatePlainTextDocument = () => {
    const div = document.createElement('div');
    div.innerHTML = documentContent;
    return div.textContent || div.innerText || '';
  };

  // Update variable spans in existing HTML content
  const updateVariableSpans = (htmlContent: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const variableSpans = doc.querySelectorAll('[data-variable]');
    
    variableSpans.forEach(span => {
      const varName = span.getAttribute('data-variable');
      if (varName) {
        const masterVar = masterVariables.find(v => v.var_name === varName);
        const defaultValue = masterVar?.default_value || '';
        const currentValue = formData[varName];
        
        const hasValue = currentValue && currentValue.toString().trim() !== '';
        // Use textContent instead of innerHTML to avoid HTML entity issues
        const displayValue = hasValue 
          ? currentValue.toString() 
          : defaultValue || `[${varName.replace(/\./g, ' ').replace(/_/g, '_').toUpperCase()}]`;
        
        const highlightClass = hasValue ? 'user-highlight' : 
          defaultValue ? 'default-highlight' : 'empty-highlight';
        
        span.className = highlightClass;
        span.textContent = displayValue;
      }
    });
    
    return doc.body.innerHTML;
  };

  // Replace all variables in a clause body with highlighted spans
  const replaceVariablesInClause = (clauseBody: string): string => {
    // Extract all variables from the clause body (both {{var}} and {var} formats)
    // Match {{variable}} with double braces OR {variable} with single braces
    const doubleBraceMatches = clauseBody.matchAll(/\{\{([a-zA-Z0-9._]+)\}\}/g);
    const singleBraceMatches = clauseBody.matchAll(/\{([a-zA-Z0-9._]+)\}/g);
    
    const foundVariables = new Set([
      ...Array.from(doubleBraceMatches, m => m[1]),
      ...Array.from(singleBraceMatches, m => m[1])
    ]);
    
    // Replace all found variables
    foundVariables.forEach(varName => {
      // Skip computed fields (they're handled separately)
      if (varName === 'parties.city_state_postcode') return;
      
      const value = formData[varName];
      const hasValue = value && value.toString().trim() !== '';
      // Replace underscores with spaces in placeholder for better readability and to avoid markdown issues
      const actualValue = hasValue 
        ? value.toString() 
        : `[${varName.replace(/\./g, ' ').replace(/_/g, ' ').toUpperCase()}]`;
      
      const highlightClass = hasValue ? 'user-highlight' : 'empty-highlight';
      // Use HTML entity &#95; for underscores in attribute to prevent markdown conversion
      const safeVarName = varName.replace(/_/g, '&#95;');
      const highlightedValue = `<span class="${highlightClass}" data-variable="${safeVarName}">${actualValue}</span>`;
      
      // Replace double-brace syntax {{variable}}
      const patternDouble = new RegExp(`\\{\\{${varName.replace(/\./g, '\\.')}\\}\\}`, 'g');
      clauseBody = clauseBody.replace(patternDouble, highlightedValue);
      
      // Replace single-brace syntax {variable}
      const patternSingle = new RegExp(`\\{${varName.replace(/\./g, '\\.')}\\}`, 'g');
      clauseBody = clauseBody.replace(patternSingle, highlightedValue);
    });
    
    return clauseBody;
  };

  const generateDocumentWithHighlight = () => {
    const currentDate = new Date().toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let content = `<div class="legal-header">${template.title.toUpperCase()}</div>`;
    content += `<div class="legal-subheader">EMPLOYMENT AGREEMENT</div>`;
    content += `<div class="document-meta">Date: ${currentDate}<br/>Agreement Number: EA-${Date.now().toString().slice(-6)}</div>`;

    // Add main clauses from template
    template.uses.forEach((clauseId, index) => {
      const block = getBlockById(clauseId);
      if (block) {
        // Check if this is a footer block (skip title and numbering)
        const isFooter = block.tags?.includes('footer');
        const isHeader = block.tags?.includes('header');
        
        if (isFooter) {
          // Footer: render without title, at bottom
          let clauseBody = block.body || block.content || '';
          
          // Handle computed/combined fields BEFORE markdown conversion
          // (markdown conversion treats underscores as italic markers)
          if (clauseBody.includes('parties.city_state_postcode')) {
            const city = formData['parties.city'] || '';
            const state = formData['parties.state'] || '';
            const postcode = formData['parties.postcode'] || '';
            
            let combinedValue = '';
            if (city || state || postcode) {
              combinedValue = [city, state, postcode].filter(Boolean).join(' ');
            } else {
              // Use spaces instead of underscores to avoid markdown conversion issues
              combinedValue = '[PARTIES CITY STATE POSTCODE]';
            }
            
            const hasValue = city || state || postcode;
            const highlightClass = hasValue ? 'user-highlight' : 'empty-highlight';
            // Use HTML entity &#95; for underscores in attribute to prevent markdown conversion
            const highlightedValue = `<span class="${highlightClass}" data-variable="parties.city&#95;state&#95;postcode">${combinedValue}</span>`;
            
            // Use split/join instead of regex to avoid escaping issues
            clauseBody = clauseBody.split('{{parties.city_state_postcode}}').join(highlightedValue);
            clauseBody = clauseBody.split('{parties.city_state_postcode}').join(highlightedValue);
          }
          
          // Replace all variables found in the clause body
          clauseBody = replaceVariablesInClause(clauseBody);
          
          // Convert markdown to HTML AFTER variable replacement (to avoid breaking underscores in variable names)
          clauseBody = convertMarkdownToHtml(clauseBody);
          
          // Convert \n to <br> for HTML rendering
          clauseBody = clauseBody.replace(/\n/g, '<br>');
          
          // Convert [CHECKBOX] markers to actual checkboxes
          clauseBody = clauseBody.replace(/\[CHECKBOX\]/g, '<input type="checkbox" class="document-checkbox">');
          
          content += `<div class="document-footer">${clauseBody}</div>`;
        } else if (isHeader) {
          // Header: render without numbering
          let clauseBody = block.body || block.content || '';
          
          // Handle computed/combined fields BEFORE markdown conversion
          // (markdown conversion treats underscores as italic markers)
          if (clauseBody.includes('parties.city_state_postcode')) {
            const city = formData['parties.city'] || '';
            const state = formData['parties.state'] || '';
            const postcode = formData['parties.postcode'] || '';
            
            let combinedValue = '';
            if (city || state || postcode) {
              combinedValue = [city, state, postcode].filter(Boolean).join(' ');
            } else {
              // Use spaces instead of underscores to avoid markdown conversion issues
              combinedValue = '[PARTIES CITY STATE POSTCODE]';
            }
            
            const hasValue = city || state || postcode;
            const highlightClass = hasValue ? 'user-highlight' : 'empty-highlight';
            // Use HTML entity &#95; for underscores in attribute to prevent markdown conversion
            const highlightedValue = `<span class="${highlightClass}" data-variable="parties.city&#95;state&#95;postcode">${combinedValue}</span>`;
            
            // Use split/join to replace
            clauseBody = clauseBody.split('{{parties.city_state_postcode}}').join(highlightedValue);
            clauseBody = clauseBody.split('{parties.city_state_postcode}').join(highlightedValue);
          }
          
          // Replace all variables found in the clause body
          clauseBody = replaceVariablesInClause(clauseBody);
          
          // Convert markdown to HTML AFTER variable replacement (to avoid breaking underscores in variable names)
          clauseBody = convertMarkdownToHtml(clauseBody);
          
          // Convert \n to <br> for HTML rendering
          clauseBody = clauseBody.replace(/\n/g, '<br>');
          
          // Convert [CHECKBOX] markers to actual checkboxes
          clauseBody = clauseBody.replace(/\[CHECKBOX\]/g, '<input type="checkbox" class="document-checkbox">');
          
          content += `<div class="clause-body">${clauseBody}</div>`;
        } else {
          // Check if this is a checkbox item (no title, just body with checkbox)
          const isCheckbox = block.tags?.includes('checkbox');
          
          // Regular clause: render with title (no numbering) unless it's a checkbox
          if (!isCheckbox && block.title) {
            content += `<div class="clause-number">${block.title}</div>`;
          }
          let clauseBody = block.body || block.content || '';
          
          // Handle computed/combined fields BEFORE markdown conversion
          // (markdown conversion treats underscores as italic markers)
          if (clauseBody.includes('parties.city_state_postcode')) {
            const city = formData['parties.city'] || '';
            const state = formData['parties.state'] || '';
            const postcode = formData['parties.postcode'] || '';
            
            let combinedValue = '';
            if (city || state || postcode) {
              combinedValue = [city, state, postcode].filter(Boolean).join(' ');
            } else {
              // Use spaces instead of underscores to avoid markdown conversion issues
              combinedValue = '[PARTIES CITY STATE POSTCODE]';
            }
            
            const hasValue = city || state || postcode;
            const highlightClass = hasValue ? 'user-highlight' : 'empty-highlight';
            // Use HTML entity &#95; for underscores in attribute to prevent markdown conversion
            const highlightedValue = `<span class="${highlightClass}" data-variable="parties.city&#95;state&#95;postcode">${combinedValue}</span>`;
            
            // Use split/join instead of regex to avoid escaping issues
            clauseBody = clauseBody.split('{{parties.city_state_postcode}}').join(highlightedValue);
            clauseBody = clauseBody.split('{parties.city_state_postcode}').join(highlightedValue);
          }
          
          // Replace all variables found in the clause body
          clauseBody = replaceVariablesInClause(clauseBody);
          
          // Convert markdown to HTML AFTER variable replacement (to avoid breaking underscores in variable names)
          clauseBody = convertMarkdownToHtml(clauseBody);
          
          // Convert \n to <br> for HTML rendering
          clauseBody = clauseBody.replace(/\n/g, '<br>');
          
          // Convert [CHECKBOX] markers to actual checkboxes
          clauseBody = clauseBody.replace(/\[CHECKBOX\]/g, '<input type="checkbox" class="document-checkbox">');
          
          content += `<div class="clause-body">${clauseBody}</div>`;
        }
      }
    });
    
    // Add suggestions if any
    if (addedSuggestions.length > 0) {
      content += `<div class="additional-section">ADDITIONAL CLAUSES</div>`;
      addedSuggestions.forEach((suggestionId, index) => {
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
          content += `<div class="clause-number suggestion-highlight">${suggestion.clause}</div>`;
          content += `<div class="clause-body">${suggestion.explanation}</div>`;
        }
      });
    }
    
    // Add signature section only for employment templates (not for Swinburne or other custom templates)
    const isEmploymentTemplate = template.id.includes('employment') || template.id.includes('fulltime') || 
                                   template.id.includes('parttime') || template.id.includes('casual') || 
                                   template.id.includes('contractor');
    
    if (isEmploymentTemplate) {
      content += `<div class="signature-section">`;
      content += `<div class="signature-title">SIGNATURES</div>`;
      content += `<div class="signature-line">Employee: ___________________________ Date: ___________</div>`;
      content += `<div class="signature-name">Name: <span class="${formData['employee.name'] ? 'user-highlight' : 'empty-highlight'}">${formData['employee.name'] || '[EMPLOYEE NAME]'}</span></div>`;
      content += `<div class="signature-line">Employer: ___________________________ Date: ___________</div>`;
      content += `<div class="signature-name">Name: <span class="${formData['employer.name'] ? 'user-highlight' : 'empty-highlight'}">${formData['employer.name'] || '[EMPLOYER NAME]'}</span></div>`;
      content += `<div class="signature-name">Title: <span class="${formData['manager'] ? 'user-highlight' : 'empty-highlight'}">${formData['manager'] || '[MANAGER TITLE]'}</span></div>`;
      content += `<div class="signature-line">Witness: ___________________________ Date: ___________</div>`;
      content += `<div class="signature-name">Name: ___________________________</div>`;
      content += `</div>`;
    }
    
    return content;
  };

  const downloadDocument = () => {
    const element = document.querySelector('.document-content');
    if (element) {
      try {
        // Temporarily store the original HTML
        const originalHTML = element.innerHTML;

        // Capture all input values from live DOM first
        const liveInputs = element.querySelectorAll('input[type="text"], input[type="date"]');
        const inputValues: string[] = [];
        liveInputs.forEach((input) => {
          const inputEl = input as HTMLInputElement;
          inputValues.push(inputEl.value || '___________________________________________________');
        });

        // Capture all checkbox states from live DOM (including document-checkbox class)
        const liveCheckboxes = element.querySelectorAll('input[type="checkbox"], input.document-checkbox');
        const checkboxStates: boolean[] = [];
        liveCheckboxes.forEach((checkbox) => {
          const checkboxEl = checkbox as HTMLInputElement;
          checkboxStates.push(checkboxEl.checked);
        });
        
        // Remove all highlighting by replacing spans with their text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        
        const highlightedElements = tempDiv.querySelectorAll('.user-highlight, .empty-highlight, .default-highlight');
        highlightedElements.forEach((el) => {
          const span = el as HTMLElement;
          const textNode = document.createTextNode(span.textContent || '');
          span.parentNode?.replaceChild(textNode, span);
        });

        // Replace input fields with their captured values for PDF
        const inputElements = tempDiv.querySelectorAll('input[type="text"], input[type="date"]');
        inputElements.forEach((input, index) => {
          const value = inputValues[index];
          const textNode = document.createTextNode(value);
          input.parentNode?.replaceChild(textNode, input);
        });

        // Replace checkboxes with checked/unchecked symbols (including document-checkbox class)
        const checkboxElements = tempDiv.querySelectorAll('input[type="checkbox"], input.document-checkbox');
        checkboxElements.forEach((checkbox, index) => {
          const symbol = checkboxStates[index] ? '[X]' : '[ ]';
          const span = document.createElement('span');
          span.style.fontFamily = 'monospace';
          span.style.fontWeight = 'bold';
          span.textContent = symbol;
          checkbox.parentNode?.replaceChild(span, checkbox);
        });
        
        // Temporarily replace the element's content
        element.innerHTML = tempDiv.innerHTML;
        
        // Export to PDF
        savePDF(element as HTMLElement, {
          paperSize: 'A4',
          fileName: `${template.title.replace(/\s+/g, '_')}.pdf`
        });
        
        // Restore the original HTML with highlighting after a delay
        setTimeout(() => {
          element.innerHTML = originalHTML;
        }, 500);
      } catch (error) {
        console.error('PDF export failed:', error);
        const content = generatePlainTextDocument();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleSaveDocument = async () => {
    setSaveStatus('saving');
    
    try {
      // Get current user identity_id (you'll need to get this from your auth context)
      // Use ID001 as default for test data (matches database test data)
      const identity_id = localStorage.getItem('user_id') || 'ID001';
      
      // Prepare variables list as JSON string
      const var_list = JSON.stringify({
        formData,
        addedSuggestions,
        completedAt: new Date().toISOString()
      });

      if (savedDocumentId) {
        // Update existing document
        await updateDocument(savedDocumentId, { var_list });
        setSaveStatus('saved');
        alert('Document updated successfully!');
      } else {
        // Save new document
        const result = await saveDocument({
          document_template_id: template.id,
          identity_id,
          var_list,
          tenant_id: 'default_tenant'
        });
        
        setSavedDocumentId(result.document_container_id);
        setSaveStatus('saved');
        alert(`Document saved successfully! ID: ${result.document_container_id}`);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      setSaveStatus('error');
      alert('Failed to save document. Please try again.');
    }
  };

  const getFormFields = () => {
    const templateFields = template.defaults && typeof template.defaults === 'object' 
      ? Object.keys(template.defaults) 
      : [];
    
    // Combine template defaults with dynamically added master variables
    const allFieldKeys = [...new Set([...templateFields, ...Array.from(dynamicVariables)])];
    
    return allFieldKeys.map(key => {
      const metadata = getFieldMetadata(key, masterVariables);
      
      return {
        id: key,
        label: key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || key,
        type: metadata.type || (key.includes('date') ? 'date' : key.includes('email') ? 'email' : 'text'),
        required: true,
        value: formData[key] || '',
        description: metadata.description,
        options: metadata.options
      };
    });
  };

  const getCompletionPercentage = () => {
    const templateFields = template.defaults ? Object.keys(template.defaults) : [];
    const allFields = [...new Set([...templateFields, ...Array.from(dynamicVariables)])];
    const totalFields = allFields.length;
    
    if (totalFields === 0) return 100;
    
    const completedFields = allFields.filter(key => {
      const value = formData[key];
      return value !== '' && value !== null && value !== undefined;
    });
    return Math.round((completedFields.length / totalFields) * 100);
  };

  const isFormValid = () => {
    return getCompletionPercentage() >= 80;
  };

  // Handle drag and drop on document preview
  const handleDocumentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  };
  
  const handleDocumentDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  };

  const handleDocumentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove drag-over class
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
    
    // Try to get data from multiple sources
    let droppedText = e.dataTransfer.getData('text/plain');
    const variableData = e.dataTransfer.getData('application/x-variable');
    
    console.log('Drop event triggered', { droppedText, variableData });
    
    // Use variable data if available, otherwise use dropped text
    if (variableData) {
      droppedText = `{{${variableData}}}`;
    }
    
    if (droppedText) {
      // Extract variable name from {{variableName}} format
      const variableMatch = droppedText.match(/\{\{(.+?)\}\}/);
      const variableName = variableMatch ? variableMatch[1] : droppedText;
      
      // Find the master variable to get its default value
      const masterVar = masterVariables.find(v => v.var_name === variableName);
      const defaultValue = masterVar?.default_value || '';
      
      // Add to dynamicVariables set to show in questionnaire
      setDynamicVariables(prev => new Set([...prev, variableName]));
      
      // Add to formData if not already present
      if (!(variableName in formData)) {
        setFormData(prev => ({
          ...prev,
          [variableName]: defaultValue
        }));
      }
      
      // Get the current value (either from formData or default)
      const currentValue = formData[variableName] || defaultValue;
      const displayValue = currentValue || `[${variableName}]`;
      
      // Determine highlight class based on whether it has a user value or default
      const highlightClass = formData[variableName] && formData[variableName] !== defaultValue
        ? 'user-highlight'
        : currentValue 
          ? 'default-highlight' 
          : 'empty-highlight';
      
      // Get the current content element
      const contentElement = document.querySelector('.document-content') as HTMLElement;
      if (contentElement && contentElement.isContentEditable) {
        // Insert at cursor position or at the end
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Create highlighted span with the value
          const span = document.createElement('span');
          span.className = highlightClass;
          span.textContent = displayValue;
          span.setAttribute('data-variable', variableName);
          
          range.insertNode(span);
          range.setStartAfter(span);
          range.setEndAfter(span);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // Append at the end
          const span = document.createElement('span');
          span.className = highlightClass;
          span.textContent = displayValue;
          span.setAttribute('data-variable', variableName);
          contentElement.appendChild(span);
        }
        
        // Trigger content update
        handleDocumentContentChange(contentElement.innerHTML);
      }
    }
  };

  // Utility: Save and restore cursor position in contentEditable
  const saveCursorPosition = (element: HTMLElement): number | null => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  };

  const restoreCursorPosition = (element: HTMLElement, offset: number): void => {
    const selection = window.getSelection();
    if (!selection) return;
    
    let charCount = 0;
    const nodeStack: Node[] = [element];
    let node: Node | undefined;
    
    while ((node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const nextCharCount = charCount + (textNode.textContent?.length || 0);
        
        if (offset <= nextCharCount) {
          const range = document.createRange();
          range.setStart(textNode, offset - charCount);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        charCount = nextCharCount;
      } else {
        nodeStack.push(...Array.from(node.childNodes).reverse());
      }
    }
  };

  // Scan document and update dynamic variables list
  const handleDocumentContentChange = (htmlContent: string): void => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const variableSpans = doc.querySelectorAll('[data-variable]');
    
    // Extract unique variable names from document
    const currentVariables = new Set<string>(
      Array.from(variableSpans)
        .map(span => span.getAttribute('data-variable'))
        .filter((varName): varName is string => !!varName)
    );
    
    // Filter out template defaults to get only dynamic variables
    const templateDefaults = template.defaults ? Object.keys(template.defaults) : [];
    const dynamicOnly = new Set(
      Array.from(currentVariables).filter(varName => !templateDefaults.includes(varName))
    );
    
    setDynamicVariables(dynamicOnly);
    setDocumentContent(htmlContent);
  };

  // Handle user typing in document preview
  const handleDocumentInput = (e: React.FormEvent<HTMLDivElement>): void => {
    const element = e.currentTarget;
    const newContent = element.innerHTML;
    
    if (newContent === documentContent) return;
    
    isUpdatingFromInput.current = true;
    const cursorPosition = saveCursorPosition(element);
    const scrollTop = element.parentElement?.scrollTop || 0;
    
    handleDocumentContentChange(newContent);
    
    // Restore cursor and scroll after state update
    requestAnimationFrame(() => {
      if (cursorPosition !== null) {
        restoreCursorPosition(element, cursorPosition);
      }
      if (element.parentElement) {
        element.parentElement.scrollTop = scrollTop;
      }
      isUpdatingFromInput.current = false;
    });
  };

  const handleDocumentFocus = (): void => {
    isEditingDocument.current = true;
  };

  const handleDocumentBlur = (e: React.FocusEvent): void => {
    // Don't blur if focus is moving to another element within the form wizard
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.form-wizard')) {
      return;
    }
    
    isEditingDocument.current = false;
    isUpdatingFromInput.current = false;
    
    // Sync edited variable values back to formData
    if (!contentEditableRef.current) return;
    
    const variableSpans = contentEditableRef.current.querySelectorAll('[data-variable]');
    const updates: Record<string, string> = {};
    
    variableSpans.forEach(span => {
      const varName = span.getAttribute('data-variable');
      const textContent = (span.textContent || '').trim();
      
      if (varName && textContent && !textContent.startsWith('[')) {
        updates[varName] = textContent;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  };

  const handleDocumentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    // Allow Enter key to create new lines - stop propagation to prevent global handler interference
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.stopPropagation();
      // Don't prevent default - let the browser handle it naturally
      return;
    }
    
    // Also allow Tab key for normal indentation in contentEditable
    if (e.key === 'Tab') {
      // Let it bubble to the global handler which handles Tab for indent/outdent
      return;
    }
  };

  return (
    <div className="form-wizard-overlay">
      <div className="form-wizard">
        <div className="wizard-header">
          <div className="header-content">
            <h2>{template.title}</h2>
            {!masterVarsLoading && masterVariables.length > 0 && (
              <span className="master-vars-badge" title={`${masterVariables.length} master variables available`}>
                Master Variables: {masterVariables.length}
              </span>
            )}
          </div>
          <div className="header-actions">
            <button 
              className="help-btn" 
              onClick={() => setShowHelp(true)}
              title="Keyboard shortcuts (F1)"
            >
              ⌨️ Shortcuts
            </button>
            <button className="close-btn" onClick={handleCloseWizard}>×</button>
          </div>
        </div>

        <div className="wizard-tabs">
          <button 
            className={activeTab === 'questionnaire' ? 'active' : ''}
            onClick={() => setActiveTab('questionnaire')}
          >
            Fill in Details ({getCompletionPercentage()}%)
          </button>
          <button 
            className={activeTab === 'suggestions' ? 'active' : ''}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions ({addedSuggestions.length})
          </button>
          <button 
            className={activeTab === 'draft' ? 'active' : ''}
            onClick={() => setActiveTab('draft')}
          >
            Draft
          </button>
          <button 
            className={activeTab === 'insights' ? 'active' : ''}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>

        <div className="wizard-content">
          <div className="left-panel">
            <div className="tab-content">
              {activeTab === 'questionnaire' && (() => {
                const steps = getSteps();
                const currentStepData = steps[currentStep];
                
                if (!currentStepData) {
                  return <div className="no-fields-message">No form fields available for this template.</div>;
                }
                
                return (
                  <>
                    <div className="section-header">
                      <h3>{currentStepData.title}</h3>
                      <p>Complete the form below. Changes will be reflected in the document preview on the right.</p>
                      <div className="step-indicator">
                        <span>Step {currentStep + 1} of {steps.length}</span>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-grid">
                      {currentStepData.fields.map((field: any) => (
                        <div key={field.id} className="form-field">
                          <label htmlFor={field.id}>
                            {field.label}
                            <span className="required">*</span>
                          </label>
                          {field.description && (
                            <p className="field-description">{field.description}</p>
                          )}
                          {field.type === 'select' && field.options ? (
                            <select
                              id={field.id}
                              value={field.value}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="form-input"
                            >
                              <option value="">Select {field.label.toLowerCase()}</option>
                              {field.options.map((option: string) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === 'boolean' ? (
                            <select
                              id={field.id}
                              value={field.value}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="form-input"
                            >
                              <option value="">Select...</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              id={field.id}
                              value={field.value}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="form-input"
                              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="step-navigation">
                      <button 
                        className="btn-prev" 
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </button>
                      <button 
                        className="btn-next" 
                        onClick={nextStep}
                        disabled={currentStep === steps.length - 1}
                      >
                        Next
                      </button>
                    </div>
                  </>
                );
              })()}

              {activeTab === 'suggestions' && (
                <>
                  <div className="section-header">
                    <h3>Suggestions & Variables</h3>
                    <p>Drag master variables into the document or add additional clauses.</p>
                  </div>
                  
                  {/* Master Variables Section */}
                  <div className="suggestions-section">
                    <h4 className="subsection-title">Master Variables</h4>
                    <p className="subsection-description">
                      Drag these variables into the document preview to insert dynamic placeholders.
                    </p>
                    <MasterVariablesList />
                  </div>

                  {/* Additional Clauses Section */}
                  <div className="suggestions-section" style={{ marginTop: '2rem' }}>
                    <h4 className="subsection-title">Additional Clauses</h4>
                    <p className="subsection-description">
                      Select additional clauses to strengthen your employment agreement.
                    </p>
                    <div className="suggestions-list">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="suggestion-item">
                          <div className="suggestion-content">
                            <div className="suggestion-header">
                              <span className={`category-badge ${suggestion.category}`}>
                                {suggestion.category}
                              </span>
                              <h4>{suggestion.clause}</h4>
                            </div>
                            <p className="suggestion-explanation">
                              {suggestion.explanation}
                            </p>
                          </div>
                          <div className="suggestion-actions">
                            {addedSuggestions.includes(suggestion.id) ? (
                              <button 
                                className="btn-remove"
                                onClick={() => removeSuggestion(suggestion.id)}
                              >
                                Added
                              </button>
                            ) : (
                              <button 
                                className="btn-add"
                                onClick={() => addSuggestion(suggestion.id)}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'draft' && (
                <>
                  <div className="section-header">
                    <h3>Document Draft</h3>
                    <p>Review your document and download when ready.</p>
                  </div>
                  <div className="draft-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      className="btn-save"
                      onClick={handleSaveDocument}
                      disabled={!isFormValid() || savingDocument}
                      style={{
                        background: saveStatus === 'saved' ? '#2196f3' : (isFormValid() ? '#2196f3' : '#ccc'),
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '6px',
                        fontSize: '1.1rem',
                        cursor: (isFormValid() && !savingDocument) ? 'pointer' : 'not-allowed',
                        opacity: savingDocument ? 0.7 : 1
                      }}
                    >
                      {savingDocument ? 'Saving...' : (saveStatus === 'saved' ? (savedDocumentId ? 'Update' : 'Saved!') : 'Save Document')}
                    </button>
                    <button 
                      className="btn-download"
                      onClick={downloadDocument}
                      disabled={!isFormValid()}
                      style={{
                        background: isFormValid() ? '#4caf50' : '#ccc',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '6px',
                        fontSize: '1.1rem',
                        cursor: isFormValid() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {isFormValid() ? 'Download PDF' : `Complete Form (${getCompletionPercentage()}%)`}
                    </button>
                    {saveStatus === 'saved' && savedDocumentId && (
                      <span style={{ color: '#4caf50', fontSize: '0.9rem' }}>
                        Document saved (ID: {savedDocumentId})
                      </span>
                    )}
                  </div>
                  <div className="document-stats" style={{ 
                    marginTop: '2rem', 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    borderRadius: '6px' 
                  }}>
                    <h4>Document Statistics</h4>
                    <p><strong>Completion:</strong> {getCompletionPercentage()}%</p>
                    <p><strong>Base Clauses:</strong> {template.uses.length}</p>
                    <p><strong>Additional Clauses:</strong> {addedSuggestions.length}</p>
                    <p><strong>Total Sections:</strong> {template.uses.length + addedSuggestions.length}</p>
                  </div>
                </>
              )}

              {activeTab === 'insights' && (
                <>
                  <div className="section-header">
                    <h3>Template Information</h3>
                    <p>Detailed information about this template and your progress.</p>
                  </div>
                  <div className="insights-grid" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem' 
                  }}>
                    <div className="insight-card" style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e0e0e0' 
                    }}>
                      <h4>Template Details</h4>
                      <p><strong>ID:</strong> {template.id}</p>
                      <p><strong>Title:</strong> {template.title}</p>
                      <p><strong>Base Clauses:</strong> {template.uses.length}</p>
                    </div>
                    <div className="insight-card" style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e0e0e0' 
                    }}>
                      <h4>Included Clauses</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {template.uses.map(clauseId => {
                          const block = getBlockById(clauseId);
                          return (
                            <li key={clauseId} style={{ margin: '0.5rem 0' }}>
                              {block ? block.title : clauseId}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="right-panel">
            <div className="document-header">
              <h3>Document Preview</h3>
              <div className="header-actions">
                <span className="edit-hint">Click to edit | Drag variables here</span>
                <button 
                  className={`btn-export ${saveStatus === 'saved' ? 'btn-saved' : ''}`}
                  onClick={handleSaveDocument}
                  disabled={!isFormValid() || savingDocument}
                >
                  {savingDocument ? 'Saving...' : (saveStatus === 'saved' ? 'Saved' : 'Save')}
                </button>
                <button 
                  className="btn-export"
                  onClick={downloadDocument}
                  disabled={!isFormValid()}
                >
                  Export PDF
                </button>
              </div>
            </div>
            
            <div className="document-preview">
              <div 
                ref={contentEditableRef}
                className="document-content"
                contentEditable={true}
                suppressContentEditableWarning={true}
                onKeyDown={handleDocumentKeyDown}
                onDragOver={handleDocumentDragOver}
                onDragLeave={handleDocumentDragLeave}
                onDrop={handleDocumentDrop}
                onFocus={handleDocumentFocus}
                onBlur={handleDocumentBlur}
                onInput={handleDocumentInput}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Help Overlay */}
      {showHelp && (
        <div className="keyboard-shortcuts-overlay" onClick={() => setShowHelp(false)}>
          <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h2>Keyboard Shortcuts</h2>
              <button className="close-help" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div className="shortcuts-content">
              <div className="shortcuts-section">
                <h3>Help System</h3>
                <div className="shortcut-item">
                  <kbd>F1</kbd>
                  <span>Toggle help overlay</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>/</kbd>
                  <span>Toggle help (when not typing)</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Tab Navigation</h3>
                <div className="shortcut-item">
                  <kbd>Alt</kbd> + <kbd>1</kbd>
                  <span>Questionnaire tab</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt</kbd> + <kbd>2</kbd>
                  <span>Suggestions tab</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt</kbd> + <kbd>3</kbd>
                  <span>Draft tab</span>
                </div>
                <div className="shortcut-item">
                  <kbd>F6</kbd>
                  <span>Cycle through tabs</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>PageUp</kbd> / <kbd>PageDown</kbd>
                  <span>Switch between tabs</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Step Navigation (when not typing)</h3>
                <div className="shortcut-item">
                  <kbd>J</kbd> / <kbd>K</kbd>
                  <span>Next / Previous step</span>
                </div>
                <div className="shortcut-item">
                  <kbd>PageUp</kbd> / <kbd>PageDown</kbd>
                  <span>Previous / Next step</span>
                </div>
                <div className="shortcut-item">
                  <kbd>1</kbd>-<kbd>9</kbd>
                  <span>Jump to step 1-9</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Home</kbd>
                  <span>First step</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>End</kbd>
                  <span>Last step</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Document Actions</h3>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>S</kbd>
                  <span>Save document</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>F</kbd>
                  <span>Search variables</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Close wizard</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Text Formatting</h3>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>B</kbd>
                  <span>Bold</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>I</kbd>
                  <span>Italic</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>U</kbd>
                  <span>Underline</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>
                  <span>Strikethrough</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>`</kbd>
                  <span>Monospace</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>K</kbd>
                  <span>Inline code</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd>
                  <span>Code block</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Lists & Structure</h3>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>
                  <span>Bulleted list</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd>
                  <span>Numbered list</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Tab</kbd>
                  <span>Increase indent</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Shift</kbd> + <kbd>Tab</kbd>
                  <span>Decrease indent</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Q</kbd>
                  <span>Blockquote</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd>
                  <span>Cycle headers</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Text Selection</h3>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>A</kbd>
                  <span>Select all</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>L</kbd>
                  <span>Select line</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>D</kbd>
                  <span>Select word</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
                  <span>Duplicate line</span>
                </div>
              </div>
              
              <div className="shortcuts-section">
                <h3>Standard Operations</h3>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>V</kbd> / <kbd>X</kbd>
                  <span>Copy / Paste / Cut</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Y</kbd>
                  <span>Undo / Redo</span>
                </div>
              </div>
            </div>
            <div className="shortcuts-footer">
              <p>Press <kbd>Esc</kbd> or click outside to close</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Keyboard shortcuts hint */}
      {showKeyboardHint && (
        <div className="keyboard-nav-hint">
          Press <kbd>F1</kbd> to view keyboard shortcuts
        </div>
      )}
      
      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="confirmation-overlay" onClick={cancelClose}>
          <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Close Document Wizard?</h3>
            <p>Unsaved changes will be lost. Are you sure you want to close?</p>
            <div className="confirmation-actions">
              <button className="btn-cancel" onClick={cancelClose}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmClose}>
                Close Wizard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormWizard;