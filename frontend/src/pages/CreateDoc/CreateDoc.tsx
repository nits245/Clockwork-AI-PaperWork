import React, { useState, useEffect } from 'react';
import FormWizard from '../../components/FormWizard/FormWizard';
import { allTemplates } from '../../data/templates';
import './CreateDoc.scss';

interface Template {
  id: string;
  title: string;
  category?: string;
  uses: string[];
  defaults: Record<string, string | undefined>;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: Template[];
}

/**
 * CreateDoc component for selecting employment agreement templates.
 */
const CreateDoc: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showFormWizard, setShowFormWizard] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const templatesPerPage = 5;

  // Enhanced categories with all template types
  const categories: TemplateCategory[] = [
    {
      id: 'employment-agreements',
      name: 'Employment Agreements',
      description: 'Comprehensive employment agreements for all types of workers',
      templates: allTemplates.filter((t: any) => {
        const category = t.category?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        return category.includes('employment') || 
               id.includes('employ') || id.includes('fulltime') || 
               id.includes('parttime') || id.includes('casual') || 
               id.includes('contractor');
      }) as Template[]
    },
    {
      id: 'program-participants',
      name: 'Program Participants',
      description: 'Agreements for program participation and enrollment',
      templates: allTemplates.filter((t: any) => {
        const category = t.category?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        return category.includes('program') || id.includes('prog') || id.includes('program');
      }) as Template[]
    },
    {
      id: 'residential-lease',
      name: 'Shared Residential Lease',
      description: 'Rental agreements for shared housing and co-living arrangements',
      templates: allTemplates.filter((t: any) => {
        const category = t.category?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        return category.includes('lease') || category.includes('residential') ||
               id.includes('lease') || id.includes('rental');
      }) as Template[]
    },
    {
      id: 'trial-participants',
      name: 'Trial Participants',
      description: 'Clinical trial and research participant agreements',
      templates: allTemplates.filter((t: any) => {
        const category = t.category?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        return category.includes('trial') || id.includes('trial') || id.includes('research');
      }) as Template[]
    },
    {
      id: 'academic-university',
      name: 'Academic & University',
      description: 'University forms, acknowledgements, and academic consent documents',
      templates: allTemplates.filter((t: any) => {
        const category = t.category?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        return category.includes('academic') || category.includes('university') ||
               id.includes('swinburne') || id.includes('academic') || id.includes('university');
      }) as Template[]
    },
    {
      id: 'nlive-program',
      name: 'nLive Program',
      description: 'nLive participant agreements using master reference blocks',
      templates: allTemplates.filter((t: any) => {
        const category = t.category?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        return category.includes('nlive') || id.includes('nlive');
      }) as Template[]
    }
  ];

  // Initialize with first category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, []);

  const handleFillTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowFormWizard(true);
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions = {
      'Employment Agreements': 'Full-time, part-time, casual, and contractor agreements',
      'Program Participants': 'Research programs, training, and internship agreements',
      'Shared Residential Lease': 'Shared housing and rental agreements',
      'Trial Participants': 'Clinical trials, research studies, and product testing',
      'Academic & University': 'University forms, acknowledgements, and academic consent documents',
      'nLive Program': 'nLive participant agreements with pre-configured master reference blocks'
    };
    return descriptions[category as keyof typeof descriptions] || 'Legal document templates';
  };

  const handleCloseWizard = () => {
    setShowFormWizard(false);
  };

  // Get current category's templates
  const getCurrentTemplates = () => {
    return categories.find(cat => cat.id === selectedCategory)?.templates || [];
  };

  // Calculate pagination
  const currentTemplates = getCurrentTemplates();
  const totalPages = Math.ceil(currentTemplates.length / templatesPerPage);
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const paginatedTemplates = currentTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate);

  // Reset to page 1 when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTemplate(null);
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      {showFormWizard && selectedTemplate && (
        <div className="fullscreen-overlay">
          <FormWizard 
            template={selectedTemplate}
            onClose={handleCloseWizard} 
          />
        </div>
      )}
      
      <div className="createDoc">
        <span className="title">Employment Agreement Generator</span>
        <div className="container">
          {/* Left section: Template Categories */}
          <div className="left-createDoc">
            <div className="header-createDoc">
              Template Category
            </div>
            <div className="list-container">
              {categories.map((category) => (
                <span
                  className={
                    selectedCategory === category.id ? "list-createDoc selected" : "list-createDoc"
                  }
                  onClick={() => handleCategoryChange(category.id)}
                  key={category.id}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          {/* Middle section: Available Templates */}
          <div className="mid-createDoc">
            <div className="header-createDoc">
              Available Templates
              {selectedCategory && currentTemplates.length > 0 && (
                <span className="template-count"> ({currentTemplates.length} total)</span>
              )}
            </div>
            {selectedCategory ? (
              <>
                <div className="variations-list">
                  {paginatedTemplates.map(template => (
                    <div 
                      key={template.id}
                      className={selectedTemplate?.id === template.id ? "variation-item selected" : "variation-item"}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h4>{template.title}</h4>
                      <p>{template.id.includes('fulltime') ? 'Comprehensive full-time employment agreement' : 
                          template.id.includes('parttime') ? 'Part-time employment agreement' :
                          template.id.includes('casual') ? 'Casual employment agreement' :
                          'Agreement template for ' + selectedCategory.replace('-', ' ')}</p>
                      <div className="variation-meta">
                        <span className="clause-count">{template.uses.length} clauses</span>
                        <span className="field-count">{Object.keys(template.defaults).length} fields</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button 
                      className="pagination-btn"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          className={currentPage === pageNum ? "page-number active" : "page-number"}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      className="pagination-btn"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-selection">
                <p>Select a category to view templates</p>
              </div>
            )}
          </div>

          {/* Right section: Preview and actions */}
          <div className="right-createDoc">
            <div className="header-createDoc">
              Preview & Actions
            </div>
            {selectedTemplate ? (
              <div className="template-preview">
                <h4>{selectedTemplate.title}</h4>
                <div className="template-description">
                  <p><strong>Description:</strong> {selectedTemplate.id.includes('fulltime') ? 'Comprehensive full-time employment agreement covering standard working hours, salary, benefits, and employment terms suitable for permanent positions.' : selectedTemplate.id.includes('parttime') ? 'Part-time employment agreement designed for flexible working arrangements with pro-rated benefits and reduced hours.' : 'Casual employment agreement for flexible, non-permanent work arrangements with hourly rates and minimal ongoing commitments.'}</p>
                  <p><strong>Includes:</strong> {selectedTemplate.uses.length} legal clauses with {Object.keys(selectedTemplate.defaults).length} customizable fields</p>
                  <p><strong>Suitable for:</strong> {selectedTemplate.id.includes('fulltime') ? 'Permanent employees, management roles, professional positions' : selectedTemplate.id.includes('parttime') ? 'Part-time staff, flexible workers, job sharing arrangements' : 'Temporary staff, seasonal workers, casual labor'}</p>
                </div>
                
                <button 
                  className="create-btn"
                  onClick={() => handleFillTemplate(selectedTemplate)}
                >
                  Create Document
                </button>
              </div>
            ) : (
              <div className="no-selection">
                <p>Choose a template to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateDoc;