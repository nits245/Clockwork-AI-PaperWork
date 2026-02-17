import React from "react";

const CustomizeLeaseContent = ({ selected, docTitle, setSelected }) => {
  return (
    <div className="customize-lease-content">
      {/* Lease-specific content sections */}
      <div 
        className={`doc-lease-overview ${selected === 1 ? "selected" : ""}`}
        onClick={() => setSelected(1)}
      >
        <b>Property Lease Agreement</b>
        <span>This Lease Agreement establishes the rental terms between landlord and tenant for the specified property.</span>
      </div>
      
      <div 
        className={`doc-parties ${selected === 2 ? "selected" : ""}`}
        onClick={() => setSelected(2)}
      >
        <b>Parties</b>
        <div className="party-details">
          <div><strong>Landlord:</strong> [Property Owner Name]</div>
          <div><strong>Tenant:</strong> [Tenant Name]</div>
        </div>
      </div>
      
      <div 
        className={`doc-terms ${selected === 3 ? "selected" : ""}`}
        onClick={() => setSelected(3)}
      >
        <b>Property & Lease Details</b>
        <div className="lease-terms">
          <div><strong>Property Address:</strong> [Full Property Address]</div>
          <div><strong>Lease Term:</strong> [Start Date - End Date]</div>
          <div><strong>Monthly Rent:</strong> $[Amount]</div>
          <div><strong>Security Deposit:</strong> $[Amount]</div>
        </div>
      </div>
      
      <div 
        className={`doc-signature ${selected === 4 ? "selected" : ""}`}
        onClick={() => setSelected(4)}
      >
        <b>Signatures</b>
        <div className="signature-requirements">
          <div>Landlord: Name, Date</div>
          <div>Tenant: Name, Date</div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeLeaseContent;
