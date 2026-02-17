import React from "react";
import HTMLReactParser from "html-react-parser";

interface Party {
  parties_name: string;
  Parties_company: string;
  parties_address: string;
}

interface ReviewSalesContentProps {
  title: string;
  content: string;
  parties: Party[];
  version: string;
}

const ReviewSalesContent: React.FC<ReviewSalesContentProps> = ({
  title,
  content,
  parties,
  version,
}) => {
  return (
    <div className="review-sales-content">
      <div className="header">{HTMLReactParser(title)}</div>
      
      {/* Sales-specific sections */}
      <div className="sales-section">
        <h3>💰 Sales Contract Overview</h3>
        <p>This Sales Contract establishes the terms for the sale of goods/services between the seller and buyer.</p>
      </div>

      <div className="sales-section">
        <h3>Seller & Buyer</h3>
        <div className="parties-grid">
          {parties.map((party, index) => (
            <div className="party-card" key={index}>
              <div className="party-role">
                {index === 0 ? "Seller" : "Buyer"}
              </div>
              <div><strong>Name:</strong> {party.parties_name}</div>
              <div><strong>Company:</strong> {party.Parties_company}</div>
              <div><strong>Address:</strong> {party.parties_address}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sales-section">
        <h3>Sale Details</h3>
        <div className="terms-grid">
          <div className="term-box">
            <strong>Product/Service:</strong> As specified in contract
          </div>
          <div className="term-box">
            <strong>Quantity:</strong> As specified in contract
          </div>
          <div className="term-box">
            <strong>Price:</strong> As specified in contract
          </div>
          <div className="term-box">
            <strong>Delivery Date:</strong> As specified in contract
          </div>
          <div className="term-box">
            <strong>Payment Terms:</strong> As specified in contract
          </div>
        </div>
      </div>

      <div className="sales-section">
        <h3>Contract Terms</h3>
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

export default ReviewSalesContent;
