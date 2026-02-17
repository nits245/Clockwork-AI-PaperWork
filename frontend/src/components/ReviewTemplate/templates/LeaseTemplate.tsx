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

// Define the props for the Lease Template component
interface LeaseTemplateProps {
  templateData: TemplateData;
  currentTemplate: string;
  handleClickType: (selectedTemplate: string) => void;
}

const LeaseTemplate: React.FC<LeaseTemplateProps> = ({
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
        Review Lease Agreement
      </div>
      <div className="preview-container lease-template">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          
          {/* Lease-specific sections */}
          <div className="lease-section">
            <div className="section-header">Property Lease Agreement</div>
            <div className="section-content">
              This Lease Agreement establishes the rental terms between landlord and tenant 
              for the specified property.
            </div>
          </div>

          <div className="lease-section">
            <div className="section-header">Parties</div>
            <div className="section-content">
              <div className="party-box">
                <strong>Landlord:</strong> [Property Owner Name]
              </div>
              <div className="party-box">
                <strong>Tenant:</strong> [Tenant Name]
              </div>
            </div>
          </div>

          <div className="lease-section">
            <div className="section-header">Property & Lease Details</div>
            <div className="section-content">
              <div className="terms-grid">
                <div className="term-item">
                  <strong>Property Address:</strong> [Full Property Address]
                </div>
                <div className="term-item">
                  <strong>Lease Term:</strong> [Start Date - End Date]
                </div>
                <div className="term-item">
                  <strong>Monthly Rent:</strong> $[Amount]
                </div>
                <div className="term-item">
                  <strong>Security Deposit:</strong> $[Amount]
                </div>
              </div>
            </div>
          </div>

          <div className="lease-section">
            <div className="section-header">Lease Terms</div>
            <div className="content lease-content">
              {documentTerm}
            </div>
          </div>

          <div className="lease-section">
            <div className="section-header">Signatures</div>
            <div className="section-content">
              <div className="signature-grid">
                <div className="signature-box">
                  <div className="signature-label">Landlord</div>
                  <div className="signature-line">_____________________</div>
                  <div className="signature-details">Name, Date</div>
                </div>
                <div className="signature-box">
                  <div className="signature-label">Tenant</div>
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
                CUSTOMIZE LEASE
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaseTemplate;
