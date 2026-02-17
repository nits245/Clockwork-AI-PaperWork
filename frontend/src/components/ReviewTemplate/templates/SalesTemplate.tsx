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

// Define the props for the Sales Template component
interface SalesTemplateProps {
  templateData: TemplateData;
  currentTemplate: string;
  handleClickType: (selectedTemplate: string) => void;
}

const SalesTemplate: React.FC<SalesTemplateProps> = ({
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
        Review Sales Contract
      </div>
      <div className="preview-container sales-template">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          
          {/* Sales-specific sections */}
          <div className="sales-section">
            <div className="section-header">Sales Contract Overview</div>
            <div className="section-content">
              This Sales Contract establishes the terms for the sale of goods/services 
              between the seller and buyer.
            </div>
          </div>

          <div className="sales-section">
            <div className="section-header">Seller & Buyer</div>
            <div className="section-content">
              <div className="party-box">
                <strong>Seller:</strong> The party selling the goods/services
              </div>
              <div className="party-box">
                <strong>Buyer:</strong> The party purchasing the goods/services
              </div>
            </div>
          </div>

          <div className="sales-section">
            <div className="section-header">Sale Details</div>
            <div className="section-content">
              <div className="terms-grid">
                <div className="term-item">
                  <strong>Product/Service:</strong> [Description of items being sold]
                </div>
                <div className="term-item">
                  <strong>Quantity:</strong> [Number of units]
                </div>
                <div className="term-item">
                  <strong>Price:</strong> [Total sale amount]
                </div>
                <div className="term-item">
                  <strong>Delivery Date:</strong> [Expected delivery]
                </div>
                <div className="term-item">
                  <strong>Payment Terms:</strong> [Payment method and schedule]
                </div>
              </div>
            </div>
          </div>

          <div className="sales-section">
            <div className="section-header">Contract Terms</div>
            <div className="content sales-content">
              {documentTerm}
            </div>
          </div>

          <div className="sales-section">
            <div className="section-header">Signatures</div>
            <div className="section-content">
              <div className="signature-grid">
                <div className="signature-box">
                  <strong>Seller:</strong> Name, Title, Date
                </div>
                <div className="signature-box">
                  <strong>Buyer:</strong> Name, Date
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
                CUSTOMIZE SALES CONTRACT
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesTemplate;
