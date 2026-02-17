import React from "react";
import HTMLReactParser from "html-react-parser";

interface Party {
  parties_name: string;
  Parties_company: string;
  parties_address: string;
}

interface ReviewServiceContentProps {
  title: string;
  content: string;
  parties: Party[];
  version: string;
}

const ReviewServiceContent: React.FC<ReviewServiceContentProps> = ({
  title,
  content,
  parties,
  version,
}) => {
  return (
    <div className="review-service-content">
      <div className="header">{HTMLReactParser(title)}</div>
      
      {/* Service-specific sections */}
      <div className="service-section">
        <h3>Service Agreement Overview</h3>
        <p>This Service Agreement establishes the terms for services to be provided between the service provider and client.</p>
      </div>

      <div className="service-section">
        <h3>Service Provider & Client</h3>
        <div className="parties-grid">
          {parties.map((party, index) => (
            <div className="party-card" key={index}>
              <div className="party-role">
                {index === 0 ? "Service Provider" : "Client"}
              </div>
              <div><strong>Name:</strong> {party.parties_name}</div>
              <div><strong>Company:</strong> {party.Parties_company}</div>
              <div><strong>Address:</strong> {party.parties_address}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="service-section">
        <h3>Service Details</h3>
        <div className="terms-grid">
          <div className="term-box">
            <strong>Scope of Work:</strong> As specified in agreement
          </div>
          <div className="term-box">
            <strong>Duration:</strong> As specified in agreement
          </div>
          <div className="term-box">
            <strong>Payment Terms:</strong> As specified in agreement
          </div>
          <div className="term-box">
            <strong>Deliverables:</strong> As specified in agreement
          </div>
        </div>
      </div>

      <div className="service-section">
        <h3>Agreement Terms</h3>
        <div className="content-box">
          {HTMLReactParser(content)}
        </div>
      </div>

      <div className="version-info">
        <strong>Version:</strong> {HTMLReactParser(version)}
      </div>
    </div>
  );
};

export default ReviewServiceContent;
