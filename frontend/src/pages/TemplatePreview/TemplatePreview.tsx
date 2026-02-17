import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { savePDF } from '@progress/kendo-react-pdf';
import BreadCrumbs from '../../components/BreadCrumbs/BreadCrumbs';
import allBlocks from '../../data/blocks';
import allTemplates from '../../data/templates';
import { convertMarkdownToHtml } from '../../utils/markdownToHtml';
import './TemplatePreview.scss';

interface Template {
  id: string;
  title: string;
  category?: string;
  uses: string[];
  defaults?: { [key: string]: any };
}

interface Block {
  id: string;
  title?: string;
  body?: string;
  content?: string;
  jurisdiction?: string;
  tags?: string[];
}

const TemplatePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = () => {
    if (!id) return;
    
    setLoading(true);
    const foundTemplate = (allTemplates as Template[]).find(
      (t) => t.id === id
    );
    
    if (foundTemplate) {
      setTemplate(foundTemplate);
    }
    setLoading(false);
  };

  const generateTemplateHTML = () => {
    if (!template) return '';

    const variables = template.defaults || {};
    let documentHTML = '';

    template.uses.forEach((clauseId: string) => {
      const block = allBlocks.find((b: any) => b.id === clauseId) as Block;
      
      if (!block) return;

      let clauseBody = (block.body || block.content || '') as string;
      
      // Convert markdown to HTML first
      clauseBody = convertMarkdownToHtml(clauseBody);
      
      // Handle computed/combined fields first
      if (clauseBody.includes('parties.city_state_postcode')) {
        // Check if there's a default value for the combined field first
        let combinedValue = variables['parties.city_state_postcode'] || '';
        
        // If no default exists, compute it from individual fields
        if (!combinedValue) {
          const city = variables['parties.city'] || '';
          const state = variables['parties.state'] || '';
          const postcode = variables['parties.postcode'] || '';
          combinedValue = [city, state, postcode].filter(Boolean).join(', ') || '';
        }
        
        clauseBody = clauseBody.split('{{parties.city_state_postcode}}').join(combinedValue);
        clauseBody = clauseBody.split('{parties.city_state_postcode}').join(combinedValue);
      }
      
      // Replace variables in the clause body (support both {{variable}} and {variable} syntax)
      Object.entries(variables).forEach(([key, value]) => {
        if (key === 'parties.city_state_postcode') return;
        
        // Wrap filled values with filled-field class, empty ones with variable-placeholder
        let replacement: string;
        if (value && value !== '') {
          replacement = `<span class="filled-field">${value as string}</span>`;
        } else {
          replacement = `<span class="variable-placeholder">[${key}]</span>`;
        }
        
        // Replace double-brace syntax {{variable}}
        const placeholderDouble = `{{${key}}}`;
        clauseBody = clauseBody.split(placeholderDouble).join(replacement);
        
        // Replace single-brace syntax {variable}
        const placeholderSingle = `{${key}}`;
        clauseBody = clauseBody.split(placeholderSingle).join(replacement);
      });

      // Handle special tags
      const hasFooter = block.tags?.includes('footer') || false;
      const hasHeader = block.tags?.includes('header') || false;

      // Convert [CHECKBOX] to checkbox symbols
      if (clauseBody.includes('[CHECKBOX]')) {
        clauseBody = clauseBody.replace(/\[CHECKBOX\]/g, '☐');
      }

      // Convert line breaks
      clauseBody = clauseBody.replace(/\n/g, '<br>');

      if (hasFooter) {
        documentHTML += `<div class="document-footer">${clauseBody}</div>`;
      } else if (hasHeader) {
        documentHTML += `<div class="document-header-content">${clauseBody}</div>`;
      } else {
        if (block.title) {
          documentHTML += `<div class="document-clause">
            <h3 class="clause-title">${block.title}</h3>
            <div class="clause-body">${clauseBody}</div>
          </div>`;
        } else {
          documentHTML += `<div class="document-clause">
            <div class="clause-body">${clauseBody}</div>
          </div>`;
        }
      }
    });

    return documentHTML;
  };

  const handleExportPDF = () => {
    const element = window.document.querySelector('.template-content');
    if (element && template) {
      savePDF(element as HTMLElement, {
        paperSize: 'A4',
        fileName: `${template.title}_preview.pdf`
      });
    }
  };

  const handleCreateDocument = () => {
    if (template) {
      navigate(`/CustomizeDoc/${template.id}/create`);
    }
  };

  if (loading) {
    return (
      <div className="template-preview">
        <BreadCrumbs />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading template preview...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="template-preview">
        <BreadCrumbs />
        <div className="error-state">
          <h2>Template Not Found</h2>
          <p>The requested template could not be found.</p>
          <button onClick={() => navigate('/viewDoc')} className="btn-back">
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="template-preview">
      <BreadCrumbs />
      
      <div className="template-header">
        <div className="header-info">
          <h1>{template.title}</h1>
          <div className="template-meta">
            <span className="meta-item">
              <strong>Template ID:</strong> {template.id}
            </span>
            <span className="meta-item">
              <strong>Category:</strong> {template.category || 'General'}
            </span>
            <span className="preview-badge">PREVIEW MODE</span>
          </div>
          <p className="preview-notice">
            This is a preview with default values. Create a document to customize the content.
          </p>
        </div>
        
        <div className="header-actions">
          <button onClick={handleCreateDocument} className="btn-primary">
            <i className="icon-create"></i>
            Create from Template
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            <i className="icon-download"></i>
            Export PDF
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Back
          </button>
        </div>
      </div>

      <div className="template-body">
        <div className="template-content" dangerouslySetInnerHTML={{ __html: generateTemplateHTML() }} />
      </div>
    </div>
  );
};

export default TemplatePreview;
