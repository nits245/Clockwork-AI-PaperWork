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

// Define the props for the NDA Template component
interface NDATemplateProps {
  templateData: TemplateData;
  currentTemplate: string;
  handleClickType: (selectedTemplate: string) => void;
}

const NDATemplate: React.FC<NDATemplateProps> = ({
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
        Review NDA Template
      </div>
      <div className="preview-container nda-template">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          
          {/* NDA-specific sections */}
          <div className="nda-section">
            <div className="section-header">Confidentiality Overview</div>
            <div className="section-content">
              This Non-Disclosure Agreement (NDA) protects confidential information 
              shared between parties during business discussions.
            </div>
          </div>

          <div className="nda-section">
            <div className="section-header">Parties Involved</div>
            <div className="section-content">
              <div className="party-box">
                <strong>Disclosing Party:</strong> The party sharing confidential information
              </div>
              <div className="party-box">
                <strong>Receiving Party:</strong> The party receiving confidential information
              </div>
            </div>
          </div>

          <div className="nda-section">
            <div className="section-header">Key Terms & Conditions</div>
            <div className="section-content">
              <div className="terms-grid">
                <div className="term-item">
                  <strong>Duration:</strong> [Duration Period]
                </div>
                <div className="term-item">
                  <strong>Scope:</strong> Business information, technical data, financial records
                </div>
                <div className="term-item">
                  <strong>Exceptions:</strong> Public information, independently developed
                </div>
                <div className="term-item">
                  <strong>Jurisdiction:</strong> [Governing Law]
                </div>
              </div>
            </div>
          </div>

          <div className="nda-section">
            <div className="section-header">Document Content</div>
            <div className="content nda-content">
              {documentTerm}
            </div>
          </div>

          <div className="nda-section">
            <div className="section-header">Signature Requirements</div>
            <div className="section-content">
              <div className="signature-grid">
                <div className="signature-box">
                  <div className="signature-label">Disclosing Party</div>
                  <div className="signature-line">_____________________</div>
                  <div className="signature-details">Name, Title, Date</div>
                </div>
                <div className="signature-box">
                  <div className="signature-label">Receiving Party</div>
                  <div className="signature-line">_____________________</div>
                  <div className="signature-details">Name, Title, Date</div>
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
                CUSTOMIZE NDA
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NDATemplate;
