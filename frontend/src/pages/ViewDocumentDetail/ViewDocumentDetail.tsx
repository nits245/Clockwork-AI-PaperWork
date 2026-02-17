import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentInstance } from '../../hooks/useDocumentInstance';
import { savePDF } from '@progress/kendo-react-pdf';
import BreadCrumbs from '../../components/BreadCrumbs/BreadCrumbs';
import allBlocks from '../../data/blocks';
import allTemplates from '../../data/templates';
import { convertMarkdownToHtml } from '../../utils/markdownToHtml';
import './ViewDocumentDetail.scss';

interface DocumentDetail {
  document_container_id: number;
  document_template_id: string;
  template_title: string;
  template_type: string;
  issue_date: string;
  signed_date?: string;
  var_list: any;
  template_content: string;
  category_title: string;
}

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

const ViewDocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, deleteDocument } = useDocumentInstance();
  const [documentData, setDocumentData] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const doc = await getDocument(parseInt(id));
      setDocumentData(doc as any);
    } catch (err) {
      console.error('Failed to load document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentHTML = () => {
    if (!documentData || !documentData.var_list) return '';

    const variables = typeof documentData.var_list === 'string' 
      ? JSON.parse(documentData.var_list).formData || {}
      : documentData.var_list.formData || {};

    // Find the template
    const template = allTemplates.find(
      (t: Template) => t.id === documentData.document_template_id
    );

    if (!template) {
      // Fallback to simple variable display
      let html = '<div class="document-preview-simple">';
      Object.entries(variables).forEach(([key, value]) => {
        const displayKey = key.replace(/\./g, ' ').replace(/_/g, ' ');
        const capitalizedKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
        html += `<div class="variable-row">
          <strong>${capitalizedKey}:</strong> 
          <span>${value || 'N/A'}</span>
        </div>`;
      });
      html += '</div>';
      return html;
    }

    // Generate document from template blocks
    let documentHTML = '';

    template.uses.forEach((clauseId: string) => {
      const block = allBlocks.find((b: any) => b.id === clauseId) as Block;
      
      if (!block) return;

      let clauseBody = (block.body || block.content || '') as string;
      
      // Convert markdown to HTML first
      clauseBody = convertMarkdownToHtml(clauseBody);
      
      // Handle computed/combined fields first
      if (clauseBody.includes('parties.city_state_postcode')) {
        // Check if there's a value for the combined field first
        let combinedValue = variables['parties.city_state_postcode'] || '';
        
        // If no value exists, compute it from individual fields
        if (!combinedValue) {
          const city = variables['parties.city'] || '';
          const state = variables['parties.state'] || '';
          const postcode = variables['parties.postcode'] || '';
          combinedValue = [city, state, postcode].filter(Boolean).join(', ') || '';
        }
        
        // Use split/join instead of regex to avoid escaping issues
        clauseBody = clauseBody.split('{{parties.city_state_postcode}}').join(combinedValue);
        clauseBody = clauseBody.split('{parties.city_state_postcode}').join(combinedValue);
      }
      
      // Replace variables in the clause body (support both {{variable}} and {variable} syntax)
      Object.entries(variables).forEach(([key, value]) => {
        // Skip computed fields (they're handled separately above)
        if (key === 'parties.city_state_postcode') return;
        
        const replacement = value as string || '';
        
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
      const hasCheckbox = block.tags?.includes('checkbox') || false;

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
        // Regular clause with title
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
    const element = window.document.querySelector('.document-content');
    if (element && documentData) {
      savePDF(element as HTMLElement, {
        paperSize: 'A4',
        fileName: `${documentData.template_title}_${documentData.document_container_id}.pdf`
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await deleteDocument(parseInt(id));
        alert('Document deleted successfully');
        navigate('/viewDoc');
      } catch (err) {
        alert('Failed to delete document');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="view-document-detail">
        <BreadCrumbs />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="view-document-detail">
        <BreadCrumbs />
        <div className="error-state">
          <h2>Document Not Found</h2>
          <p>{error || 'The requested document could not be found.'}</p>
          <button onClick={() => navigate('/viewDoc')} className="btn-back">
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-document-detail">
      <BreadCrumbs />
      
      <div className="document-header">
        <div className="header-info">
          <h1>{documentData.template_title}</h1>
          <div className="document-meta">
            <span className="meta-item">
              <strong>Document ID:</strong> {documentData.document_container_id}
            </span>
            <span className="meta-item">
              <strong>Type:</strong> {documentData.template_type}
            </span>
            <span className="meta-item">
              <strong>Category:</strong> {documentData.category_title}
            </span>
            <span className="meta-item">
              <strong>Created:</strong> {formatDate(documentData.issue_date)}
            </span>
            {documentData.signed_date && (
              <span className="meta-item">
                <strong>Signed:</strong> {formatDate(documentData.signed_date)}
              </span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={handleExportPDF} className="btn-primary">
            <i className="icon-download"></i>
            Export PDF
          </button>
          <button onClick={() => navigate('/viewDoc')} className="btn-secondary">
            Back to List
          </button>
          <button onClick={handleDelete} className="btn-danger">
            <i className="icon-delete"></i>
            Delete
          </button>
        </div>
      </div>

      <div className="document-body">
        <div className="document-content" dangerouslySetInnerHTML={{ __html: generateDocumentHTML() }} />
      </div>
    </div>
  );
};

export default ViewDocumentDetail;
