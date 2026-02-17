import React, { useState, useEffect } from "react";
import DocList from "../../components/DocList/DocList";
import "./ViewDoc.scss";
import BreadCrumbs from "../../components/BreadCrumbs/BreadCrumbs";
import Sort from "../../img/viewDoc/sort.svg";

// Define the type for the document data
interface DocumentItem {
  document_template_id: string;
  version: number;
  created_date: string;
  id: string,
  title: string,
  date: string,
  count: number
}

const ViewDoc: React.FC = () => {
  // State to hold document data, typed as an array of DocumentItem
  const [data, setData] = useState<DocumentItem[]>([]);

  // Load template categories from local data
  useEffect(() => {
    loadTemplateCategories();
  }, []);

  const loadTemplateCategories = async () => {
    try {
      // Import templates dynamically
      const allTemplates = (await import('../../data/templates')).default;
      
      // Group templates by category
      const categoryMap = new Map<string, any>();
      
      // Add "Saved Documents" as the first category
      categoryMap.set('Saved Documents', {
        id: 'saved-documents',
        title: 'Saved Documents',
        date: new Date().toISOString(),
        count: 0, // Will be updated dynamically
        isSavedDocuments: true
      });
      
      allTemplates.forEach((template: any) => {
        const category = template.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            id: category.toLowerCase().replace(/\s+/g, '-'),
            title: category,
            date: new Date().toISOString(),
            count: 0
          });
        }
        const cat = categoryMap.get(category);
        cat.count += 1;
      });
      
      // Convert map to array
      const categories = Array.from(categoryMap.values());
      setData(categories);
    } catch (err) {
      console.error("Error loading template categories:", err);
    }
  };

  return (
    <>
      <BreadCrumbs />
      <div className="viewDoc">
        <span className="maintitle">View Documents</span>

        {/* Document Templates Section */}
        <div className="header">
          <span>Document Templates</span>
          <div className="icon">
            <img src={Sort} alt="Sort Icon" />
            <div>A-Z</div>
          </div>
        </div>
        <div className="container">
          <DocList data={data} />
        </div>
      </div>
    </>
  );
}

export default ViewDoc;