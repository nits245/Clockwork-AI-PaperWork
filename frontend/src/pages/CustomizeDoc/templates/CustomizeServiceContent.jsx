import React from "react";

const CustomizeServiceContent = ({ selected, docTitle, setSelected }) => {
  return (
    <div className="customize-service-content">
      {/* Service-specific content sections */}
      <div 
        className={`doc-service-overview ${selected === 1 ? "selected" : ""}`}
        onClick={() => setSelected(1)}
      >
        <b>Service Agreement Overview</b>
        <span>This Service Agreement establishes the terms for services to be provided between the service provider and client.</span>
      </div>
      
      <div 
        className={`doc-parties ${selected === 2 ? "selected" : ""}`}
        onClick={() => setSelected(2)}
      >
        <b>Service Provider & Client</b>
        <div className="party-details">
          <div><strong>Service Provider:</strong> The party providing the services</div>
          <div><strong>Client:</strong> The party receiving the services</div>
        </div>
      </div>
      
      <div 
        className={`doc-terms ${selected === 3 ? "selected" : ""}`}
        onClick={() => setSelected(3)}
      >
        <b>Service Details</b>
        <div className="service-terms">
          <div><strong>Scope of Work:</strong> [Description of services to be provided]</div>
          <div><strong>Duration:</strong> [Service period]</div>
          <div><strong>Payment Terms:</strong> [Payment schedule and amount]</div>
          <div><strong>Deliverables:</strong> [Expected outcomes/deliverables]</div>
        </div>
      </div>
      
      <div 
        className={`doc-signature ${selected === 4 ? "selected" : ""}`}
        onClick={() => setSelected(4)}
      >
        <b>Signatures</b>
        <div className="signature-requirements">
          <div>Service Provider: Name, Title, Date</div>
          <div>Client: Name, Date</div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeServiceContent;
