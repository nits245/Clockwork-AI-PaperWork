import React from "react";
import HTMLReactParser from "html-react-parser";

interface Party {
  parties_name: string;
  Parties_company: string;
  parties_address: string;
}

interface ReviewLeaseContentProps {
  title: string;
  content: string;
  parties: Party[];
  version: string;
}

const ReviewLeaseContent: React.FC<ReviewLeaseContentProps> = ({
  title,
  content,
  parties,
  version,
}) => {
  return (
    <div className="review-lease-content">
      <div className="header">{HTMLReactParser(title)}</div>
      
      {/* Lease-specific sections */}
      <div className="lease-section">
        <h3>Property Lease Agreement</h3>
        <p>This Lease Agreement establishes the rental terms between landlord and tenant for the specified property.</p>
      </div>

      <div className="lease-section">
        <h3>Parties</h3>
        <div className="parties-grid">
          {parties.map((party, index) => (
            <div className="party-card" key={index}>
              <div className="party-role">
                {index === 0 ? "Landlord" : "Tenant"}
              </div>
              <div><strong>Name:</strong> {party.parties_name}</div>
              <div><strong>Company:</strong> {party.Parties_company}</div>
              <div><strong>Address:</strong> {party.parties_address}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lease-section">
        <h3>Property & Lease Details</h3>
        <div className="terms-grid">
          <div className="term-box">
            <strong>Property Address:</strong> As specified in lease
          </div>
          <div className="term-box">
            <strong>Lease Term:</strong> As specified in lease
          </div>
          <div className="term-box">
            <strong>Monthly Rent:</strong> As specified in lease
          </div>
          <div className="term-box">
            <strong>Security Deposit:</strong> As specified in lease
          </div>
        </div>
      </div>

      <div className="lease-section">
        <h3>Lease Terms</h3>
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

export default ReviewLeaseContent;
