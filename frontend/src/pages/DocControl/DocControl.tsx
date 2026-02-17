import React, { useState, useEffect } from "react";
import BreadCrumbs from "../../components/BreadCrumbs/BreadCrumbs";
import DocControlList from "./DocControlList";
import "./DocControl.scss";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import allTemplates from "../../data/templates";

// Define the type for template data
interface Template {
  id: string;
  title: string;
  category: string;
  uses: string[];
  defaults: { [key: string]: any };
}

// Define the type for the document data expected by DocControlList
interface DocumentData {
  id: string;
  title: string;
  document_template_id: string;
  version: number;
  approvalRatio: number;
  created_date: string;
}

const DocControl: React.FC = () => {
  // State to hold the template data
  const [data, setData] = useState<DocumentData[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>("");

  // Get the ID from the route parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplatesFromCategory();
  }, [id]);

  const loadTemplatesFromCategory = () => {
    // Filter templates by category ID
    const filteredTemplates = (allTemplates as Template[]).filter(
      (template) => template.category?.toLowerCase().replace(/\s+/g, '-') === id?.toLowerCase()
    );

    if (filteredTemplates.length === 0) {
      console.warn(`No templates found for category: ${id}`);
    }

    // Set category title from first matching template
    if (filteredTemplates.length > 0) {
      setCategoryTitle(filteredTemplates[0].category);
    }

    // Transform templates to match DocControlList expected format
    const transformedData: DocumentData[] = filteredTemplates.map((template, index) => ({
      id: template.id,
      title: template.title,
      document_template_id: template.id,
      version: 1, // Default version
      approvalRatio: 1, // Approved by default
      created_date: new Date().toISOString(),
    }));

    setData(transformedData);
  };

  return (
    <>
      <BreadCrumbs />
      <div className="docControl">
        {data.length > 0 ? (
          <DocControlList data={data} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h3>No templates available in this category</h3>
            <button 
              onClick={() => navigate('/viewDoc')}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Back to Templates
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default DocControl;