import React from "react";

const CustomizeSalesContent = ({ selected, docTitle, setSelected }) => {
  return (
    <div className="customize-sales-content">
      {/* Sales-specific content sections */}
      <div 
        className={`doc-sales-overview ${selected === 1 ? "selected" : ""}`}
        onClick={() => setSelected(1)}
      >
        <b>Sales Contract Overview</b>
        <span>This Sales Contract establishes the terms for the sale of goods/services between the seller and buyer.</span>
      </div>
      
      <div 
        className={`doc-parties ${selected === 2 ? "selected" : ""}`}
        onClick={() => setSelected(2)}
      >
        <b>Seller & Buyer</b>
        <div className="party-details">
          <div><strong>Seller:</strong> The party selling the goods/services</div>
          <div><strong>Buyer:</strong> The party purchasing the goods/services</div>
        </div>
      </div>
      
      <div 
        className={`doc-terms ${selected === 3 ? "selected" : ""}`}
        onClick={() => setSelected(3)}
      >
        <b>Sale Details</b>
        <div className="sales-terms">
          <div><strong>Product/Service:</strong> [Description of items being sold]</div>
          <div><strong>Quantity:</strong> [Number of units]</div>
          <div><strong>Price:</strong> [Total sale amount]</div>
          <div><strong>Delivery Date:</strong> [Expected delivery]</div>
          <div><strong>Payment Terms:</strong> [Payment method and schedule]</div>
        </div>
      </div>
      
      <div 
        className={`doc-signature ${selected === 4 ? "selected" : ""}`}
        onClick={() => setSelected(4)}
      >
        <b>Signatures</b>
        <div className="signature-requirements">
          <div>Seller: Name, Title, Date</div>
          <div>Buyer: Name, Date</div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeSalesContent;
