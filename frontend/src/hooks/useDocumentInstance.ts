import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8800';

interface DocumentInstance {
  document_container_id?: number;
  identity_id: string;
  document_template_id: string;
  issue_date?: string;
  signed_date?: string | null;
  var_list?: string | null;
  template_title?: string;
  template_type?: string;
  template_content?: string;
  category_title?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

interface SaveDocumentPayload {
  document_template_id: string;
  identity_id: string;
  var_list?: string;
  tenant_id?: string;
}

interface UseDocumentInstanceReturn {
  saveDocument: (payload: SaveDocumentPayload) => Promise<any>;
  updateDocument: (id: number, data: Partial<DocumentInstance>) => Promise<any>;
  getDocument: (id: number) => Promise<DocumentInstance>;
  getUserDocuments: (identity_id: string) => Promise<DocumentInstance[]>;
  getRecentDocuments: (limit?: number) => Promise<DocumentInstance[]>;
  deleteDocument: (id: number) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useDocumentInstance = (): UseDocumentInstanceReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDocument = async (payload: SaveDocumentPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/document-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save document');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: number, data: Partial<DocumentInstance>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/document-instance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update document');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (id: number): Promise<DocumentInstance> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/document-instance/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch document');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserDocuments = async (identity_id: string): Promise<DocumentInstance[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/document-instance/user/${identity_id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user documents');
      }

      const data = await response.json();
      return data.documents || [];
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecentDocuments = async (limit: number = 5): Promise<DocumentInstance[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/document-instance/recent?limit=${limit}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recent documents');
      }

      const data = await response.json();
      return data.documents || [];
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/document-instance/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveDocument,
    updateDocument,
    getDocument,
    getUserDocuments,
    getRecentDocuments,
    deleteDocument,
    loading,
    error,
  };
};
