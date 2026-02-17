import React from "react";

const CustomizeNDAContent = ({ selected, docTitle, setSelected }) => {
  return (
    <div className="customize-nda-content">
      {/* NDA-specific content sections */}
      <div 
        className={`doc-confidentiality ${selected === 1 ? "selected" : ""}`}
        onClick={() => setSelected(1)}
      >
        <b>Confidentiality Overview</b>
        <span>This Non-Disclosure Agreement (NDA) protects confidential information shared between parties during business discussions.</span>
      </div>
      
      <div 
        className={`doc-parties ${selected === 2 ? "selected" : ""}`}
        onClick={() => setSelected(2)}
      >
        <b>Parties Involved</b>
        <div className="party-details">
          <div><strong>Disclosing Party:</strong> The party sharing confidential information</div>
          <div><strong>Receiving Party:</strong> The party receiving confidential information</div>
        </div>
      </div>
      
      <div 
        className={`doc-terms ${selected === 3 ? "selected" : ""}`}
        onClick={() => setSelected(3)}
      >
        <b>Key Terms & Conditions</b>
        <div className="nda-terms">
          <div><strong>Duration:</strong> [Duration Period]</div>
          <div><strong>Scope:</strong> Business information, technical data, financial records</div>
          <div><strong>Exceptions:</strong> Public information, independently developed</div>
          <div><strong>Jurisdiction:</strong> [Governing Law]</div>
        </div>
      </div>
      
      <div 
        className={`doc-signature ${selected === 4 ? "selected" : ""}`}
        onClick={() => setSelected(4)}
      >
        <b>Signature Requirements</b>
        <div className="signature-requirements">
          <div>Disclosing Party: Name, Title, Date</div>
          <div>Receiving Party: Name, Title, Date</div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeNDAContent;
