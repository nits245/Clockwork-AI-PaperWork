import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BreadCrumbs from "../../components/BreadCrumbs/BreadCrumbs";
import { useDocumentInstance } from "../../hooks/useDocumentInstance";
import "./SavedDocumentsControl.scss";

import reviewIcon from "../../img/docControl/reviewIcon.svg";
import sendIcon from "../../img/docControl/sendIcon.svg";

interface SavedDocument {
  document_container_id: number;
  document_template_id: string;
  template_title: string;
  template_type: string;
  issue_date: string;
  signed_date?: string;
  category_title: string;
}

const SavedDocumentsControl: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const { getUserDocuments, deleteDocument, loading, error } = useDocumentInstance();

  // Get current user ID from localStorage or auth context
  // Use ID001 as default for test data (matches database test data)
  const currentUserId = localStorage.getItem('current_user_id') || localStorage.getItem('user_id') || 'ID001';

  useEffect(() => {
    // Ensure user_id is set in localStorage for consistency
    if (!localStorage.getItem('user_id')) {
      localStorage.setItem('user_id', currentUserId);
      console.log('Set user_id in localStorage to:', currentUserId);
    } else {
      console.log('Current user_id in localStorage:', localStorage.getItem('user_id'));
      console.log('To use test data, run: localStorage.setItem("user_id", "ID001") and refresh');
    }
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      console.log('Fetching documents for user:', currentUserId);
      const docs = await getUserDocuments(currentUserId);
      console.log('API Response - Documents:', docs);
      console.log('Documents count:', docs?.length || 0);
      console.log('Setting documents state...');
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

  // Add logging for render state
  console.log('Render state - Loading:', loading, 'Error:', error, 'Documents:', documents.length);

  if (loading && documents.length === 0) {
    return (
      <>
        <BreadCrumbs />
        <div className="savedDocumentsControl">
          <div className="loading-state">Loading documents...</div>
        </div>
      </>
    );
  }

  if (error && documents.length === 0) {
    return (
      <>
        <BreadCrumbs />
        <div className="savedDocumentsControl">
          <div className="error-state">Error: {error}</div>
        </div>
      </>
    );
  }

  if (!loading && documents.length === 0) {
    return (
      <>
        <BreadCrumbs />
        <div className="savedDocumentsControl">
          <div className="empty-state">
            <h3>No saved documents yet</h3>
            <p>Create a document to get started!</p>
            <button 
              onClick={() => navigate('/createDoc')}
              className="btn-create"
            >
              Create Document
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BreadCrumbs />
      <div className="savedDocumentsControl">
        <div className="docControlHeader">
          <h3 className="templateName">TEMPLATE NAME</h3>
          <h3 className="templateCategory">CATEGORY</h3>
          <h3 className="templateAction">ACTION</h3>
        </div>

        <div className="docControlList">
          <div className="table">
            {documents.map((doc, index) => (
              <div key={index} className="table-row">
                <span className="template-name">
                  {doc.template_title}
                </span>
                <span className="template-category">
                  {doc.category_title || doc.template_type || 'Document'}
                </span>
                <div className="template-action">
                  <img
                    src={reviewIcon}
                    alt="View Document"
                    className="reviewicon"
                    title="View Document"
                    onClick={() => navigate(`/view-document/${doc.document_container_id}`)}
                  />
                  <img
                    src={sendIcon}
                    alt="Delete Document"
                    className="sendicon delete-icon"
                    title="Delete Document"
                    onClick={() => handleDelete(doc.document_container_id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedDocumentsControl;
