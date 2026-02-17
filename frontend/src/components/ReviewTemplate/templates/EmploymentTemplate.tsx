import React from "react";
import Review from "../../../img/createDoc/review.svg";
import "../ReviewTemplate.scss";
import parse from "html-react-parser";
import { Link } from "react-router-dom";

// Define the structure of template data
interface TemplateData {
  title: string;
  term: string | React.ReactNode;
  type: string;
}

// Define the props for the Employment Template component
interface EmploymentTemplateProps {
  templateData: TemplateData;
  currentTemplate: string;
  handleClickType: (selectedTemplate: string) => void;
}

const EmploymentTemplate: React.FC<EmploymentTemplateProps> = ({
  templateData,
  currentTemplate,
  handleClickType,
}) => {
  const documentTerm =
    typeof templateData?.term === "string"
      ? parse(templateData?.term)
      : templateData?.term;

  const titleMatch = templateData.title.match(/<title>(.*?)<\/title>/);
  const extractedTitle = titleMatch ? titleMatch[1] : templateData.title;

  return (
    <>
      <div className="header-createDoc">
        <img src={Review} alt="Review" />
        Review Employment Contract
      </div>
      <div className="preview-container employment-template">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          
          {/* Employment-specific sections */}
          <div className="employment-section">
            <div className="section-header">Employment Overview</div>
            <div className="section-content">
              This Employment Contract establishes the terms and conditions of employment 
              between the employer and employee.
            </div>
          </div>

          <div className="employment-section">
            <div className="section-header">Parties</div>
            <div className="section-content">
              <div className="party-box">
                <strong>Employer:</strong> [Company Name]
              </div>
              <div className="party-box">
                <strong>Employee:</strong> [Employee Name]
              </div>
            </div>
          </div>

          <div className="employment-section">
            <div className="section-header">Employment Details</div>
            <div className="section-content">
              <div className="terms-grid">
                <div className="term-item">
                  <strong>Position:</strong> [Job Title]
                </div>
                <div className="term-item">
                  <strong>Start Date:</strong> [Employment Start Date]
                </div>
                <div className="term-item">
                  <strong>Salary:</strong> [Annual Salary]
                </div>
                <div className="term-item">
                  <strong>Work Schedule:</strong> [Hours/Week]
                </div>
              </div>
            </div>
          </div>

          <div className="employment-section">
            <div className="section-header">Contract Terms</div>
            <div className="content employment-content">
              {documentTerm}
            </div>
          </div>

          <div className="employment-section">
            <div className="section-header">Signatures</div>
            <div className="section-content">
              <div className="signature-grid">
                <div className="signature-box">
                  <div className="signature-label">Employer Representative</div>
                  <div className="signature-line">_____________________</div>
                  <div className="signature-details">Name, Title, Date</div>
                </div>
                <div className="signature-box">
                  <div className="signature-label">Employee</div>
                  <div className="signature-line">_____________________</div>
                  <div className="signature-details">Name, Date</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cus-btn">
            <Link to={`/CustomizeDoc/${templateData?.type}/default`}>
              <button
                onClick={() => handleClickType("default")}
                className={currentTemplate === "default" ? "selected" : ""}
              >
                CUSTOMIZE CONTRACT
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmploymentTemplate;
