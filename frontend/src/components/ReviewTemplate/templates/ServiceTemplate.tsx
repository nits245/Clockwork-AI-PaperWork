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

// Define the props for the Service Template component
interface ServiceTemplateProps {
  templateData: TemplateData;
  currentTemplate: string;
  handleClickType: (selectedTemplate: string) => void;
}

const ServiceTemplate: React.FC<ServiceTemplateProps> = ({
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
        Review Service Agreement
      </div>
      <div className="preview-container service-template">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          
          {/* Service-specific sections */}
          <div className="service-section">
            <div className="section-header">Service Agreement Overview</div>
            <div className="section-content">
              This Service Agreement establishes the terms for services to be provided 
              between the service provider and client.
            </div>
          </div>

          <div className="service-section">
            <div className="section-header">Service Provider & Client</div>
            <div className="section-content">
              <div className="party-box">
                <strong>Service Provider:</strong> The party providing the services
              </div>
              <div className="party-box">
                <strong>Client:</strong> The party receiving the services
              </div>
            </div>
          </div>

          <div className="service-section">
            <div className="section-header">Service Details</div>
            <div className="section-content">
              <div className="terms-grid">
                <div className="term-item">
                  <strong>Scope of Work:</strong> [Description of services to be provided]
                </div>
                <div className="term-item">
                  <strong>Duration:</strong> [Service period]
                </div>
                <div className="term-item">
                  <strong>Payment Terms:</strong> [Payment schedule and amount]
                </div>
                <div className="term-item">
                  <strong>Deliverables:</strong> [Expected outcomes/deliverables]
                </div>
              </div>
            </div>
          </div>

          <div className="service-section">
            <div className="section-header">Agreement Terms</div>
            <div className="content service-content">
              {documentTerm}
            </div>
          </div>

          <div className="service-section">
            <div className="section-header">Signatures</div>
            <div className="section-content">
              <div className="signature-grid">
                <div className="signature-box">
                  <strong>Service Provider:</strong> Name, Title, Date
                </div>
                <div className="signature-box">
                  <strong>Client:</strong> Name, Date
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
                CUSTOMIZE SERVICE AGREEMENT
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceTemplate;
