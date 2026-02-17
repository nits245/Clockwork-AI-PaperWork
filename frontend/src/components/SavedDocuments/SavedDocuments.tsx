import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentInstance } from '../../hooks/useDocumentInstance';
import './SavedDocuments.scss';

interface SavedDocument {
  document_container_id: number;
  document_template_id: string;
  template_title: string;
  template_type: string;
  issue_date: string;
  signed_date?: string;
  category_title: string;
}

interface SavedDocumentsProps {
  userId?: string;
  limit?: number;
  showRecent?: boolean;
}

const SavedDocuments: React.FC<SavedDocumentsProps> = ({ 
  userId, 
  limit = 10,
  showRecent = false 
}) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const { getUserDocuments, getRecentDocuments, deleteDocument, loading, error } = useDocumentInstance();

  useEffect(() => {
    loadDocuments();
  }, [userId, showRecent]);

  const loadDocuments = async () => {
    try {
      let docs;
      if (showRecent) {
        docs = await getRecentDocuments(limit);
      } else if (userId) {
        docs = await getUserDocuments(userId);
      }
      setDocuments((docs || []) as any);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(doc => doc.document_container_id !== id));
      } catch (err) {
        alert('Failed to delete document');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="saved-documents-loading">Loading documents...</div>;
  }

  if (error) {
    return <div className="saved-documents-error">Error: {error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="saved-documents-empty">
        <p>No saved documents yet.</p>
        <p>Create a document to get started!</p>
      </div>
    );
  }

  return (
    <div className="saved-documents">
      <div className="documents-list">
        {documents.map((doc) => (
          <div key={doc.document_container_id} className="document-card">
            <div className="document-header">
              <div className="document-type-badge">{doc.template_type}</div>
              <div className="document-actions">
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/view-document/${doc.document_container_id}`)}
                  title="View Document"
                >
                  View
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(doc.document_container_id)}
                  title="Delete Document"
                >
                  Delete
                </button>
              </div>
            </div>
            <h3 className="document-title">{doc.template_title}</h3>
            <div className="document-meta">
              <span className="document-date">
                Created: {formatDate(doc.issue_date)}
              </span>
              {doc.signed_date && (
                <span className="document-signed">
                  Signed: {formatDate(doc.signed_date)}
                </span>
              )}
            </div>
            <div className="document-category">{doc.category_title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedDocuments;
