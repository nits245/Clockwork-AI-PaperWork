import React, { useState } from "react";
import Review from "../../img/createDoc/review.svg";
import "./ReviewTemplate.scss";
import parse from "html-react-parser";
import { Link } from "react-router-dom";
import NDATemplate from "./templates/NDATemplate";
import EmploymentTemplate from "./templates/EmploymentTemplate";
import LeaseTemplate from "./templates/LeaseTemplate";
import ServiceTemplate from "./templates/ServiceTemplate";
import SalesTemplate from "./templates/SalesTemplate";

// Define the structure of template data
interface TemplateData {
  title: string;
  term: string | React.ReactNode;
  type: string;
}

// Define the props for the ReviewTemplate component
interface ReviewTemplateProps {
  type: string;
  templateData: TemplateData;
}

const ReviewTemplate: React.FC<ReviewTemplateProps> = ({ type, templateData }) => {
  const [template, setTemplate] = useState<string>("default");

  const handleClickType = (selectedTemplate: string) => {
    setTemplate(selectedTemplate);
    console.log("Template Set To:", selectedTemplate);
    handleCustomiseClick(selectedTemplate);
  };

  const handleCustomiseClick = (selectedTemplate: string) => {
    console.log("Currently Customising:", selectedTemplate);
  };

  if (!templateData || !templateData.title || !templateData.term) {
    return <div>Loading...</div>;
  }

  const documentTerm =
    typeof templateData?.term === "string"
      ? parse(templateData?.term)
      : templateData?.term;

  const titleMatch = templateData.title.match(/<title>(.*?)<\/title>/);
  const extractedTitle = titleMatch ? titleMatch[1] : templateData.title;

  // Function to render type-specific templates
  const renderTypeSpecificTemplate = () => {
    const commonProps = {
      templateData,
      currentTemplate: template,
      handleClickType,
    };

    // Check document type and render appropriate template
    switch (templateData.type) {
      case 'TPL03': // NDA Agreement
        return <NDATemplate {...commonProps} />;
      case 'TPL01': // Employment Contract
        return <EmploymentTemplate {...commonProps} />;
      case 'TPL02': // Lease Agreement
        return <LeaseTemplate {...commonProps} />;
      case 'TPL04': // Service Agreement
        return <ServiceTemplate {...commonProps} />;
      case 'TPL05': // Sales Contract
        return <SalesTemplate {...commonProps} />;
      default:
        // Fall back to original template logic for other types
        return type === "default" ? (
          <DefaultTemplate
            extractedTitle={extractedTitle}
            documentTerm={documentTerm}
            handleClickType={handleClickType}
            handleCustomiseClick={handleCustomiseClick}
            templateData={templateData}
            currentTemplate={template}
          />
        ) : (
          <BlankTemplate
            extractedTitle={extractedTitle}
            handleClickType={handleClickType}
            handleCustomiseClick={handleCustomiseClick}
            templateData={templateData}
            currentTemplate={template}
          />
        );
    }
  };

  return (
    <>
      {type === "default" ? renderTypeSpecificTemplate() : (
        <BlankTemplate
          extractedTitle={extractedTitle}
          handleClickType={handleClickType}
          handleCustomiseClick={handleCustomiseClick}
          templateData={templateData}
          currentTemplate={template}
        />
      )}
    </>
  );
};

// Define props for the DefaultTemplate component
interface TemplateProps {
  extractedTitle: string;
  documentTerm?: React.ReactNode; // Make documentTerm optional
  handleClickType: (selectedTemplate: string) => void;
  handleCustomiseClick: (selectedTemplate: string) => void;
  templateData: TemplateData;
  currentTemplate: string;
}

const DefaultTemplate: React.FC<TemplateProps> = ({
  extractedTitle,
  documentTerm,
  handleClickType,
  handleCustomiseClick,
  templateData,
  currentTemplate,
}) => {
  return (
    <>
      <div className="header-createDoc">
        <img src={Review} alt="Review" />
        Review template
      </div>
      <div className="preview-container">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          <div className="preview-party">Party</div>
          <div className="party-content">
            This is the place where you can select the parties involved in your document
          </div>
          <div className="preview-content">
            <span>Content</span>
            <div className="content">{documentTerm}</div>
          </div>
          <div className="preview-signature">Signature and date</div>
          <div className="cus-btn">
            <Link to={`/CustomizeDoc/${templateData?.type}/default`}>
              <button
                onClick={() => handleClickType("default")}
                className={currentTemplate === "default" ? "selected" : ""}
              >
                CUSTOMISE
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

const BlankTemplate: React.FC<Omit<TemplateProps, "documentTerm">> = ({
  extractedTitle,
  handleClickType,
  handleCustomiseClick,
  templateData,
  currentTemplate,
}) => {
  return (
    <>
      <div className="header-createDoc">
        <img src={Review} alt="Review" />
        Review template
      </div>
      <div className="preview-container">
        <div className="preview-title">{extractedTitle}</div>
        <div className="body-container">
          <div className="preview-party">Party</div>
          <div className="preview-content">
            <span>Content</span>
          </div>
          <div className="preview-signature">
            <span>Signature and date</span>
          </div>
          <div className="cus-btn">
            <Link to={`/CustomizeDoc/${templateData?.type}/blank`}>
              <button
                onClick={() => handleClickType("blank")}
                className={currentTemplate === "blank" ? "selected" : ""}
              >
                CUSTOMISE
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewTemplate;