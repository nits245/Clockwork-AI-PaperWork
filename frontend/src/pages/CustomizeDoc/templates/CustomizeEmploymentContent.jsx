import React from "react";

const CustomizeEmploymentContent = ({ selected, docTitle, setSelected }) => {
  return (
    <div className="customize-employment-content">
      {/* Employment-specific content sections */}
      <div 
        className={`doc-employment-overview ${selected === 1 ? "selected" : ""}`}
        onClick={() => setSelected(1)}
      >
        <b>Employment Overview</b>
        <span>This Employment Contract establishes the terms and conditions of employment between the employer and employee.</span>
      </div>
      
      <div 
        className={`doc-parties ${selected === 2 ? "selected" : ""}`}
        onClick={() => setSelected(2)}
      >
        <b>Parties</b>
        <div className="party-details">
          <div><strong>Employer:</strong> [Company Name]</div>
          <div><strong>Employee:</strong> [Employee Name]</div>
        </div>
      </div>
      
      <div 
        className={`doc-terms ${selected === 3 ? "selected" : ""}`}
        onClick={() => setSelected(3)}
      >
        <b>Employment Details</b>
        <div className="employment-terms">
          <div><strong>Position:</strong> [Job Title]</div>
          <div><strong>Start Date:</strong> [Employment Start Date]</div>
          <div><strong>Salary:</strong> [Annual Salary]</div>
          <div><strong>Work Schedule:</strong> [Hours/Week]</div>
        </div>
      </div>
      
      <div 
        className={`doc-signature ${selected === 4 ? "selected" : ""}`}
        onClick={() => setSelected(4)}
      >
        <b>Signatures</b>
        <div className="signature-requirements">
          <div>Employer Representative: Name, Title, Date</div>
          <div>Employee: Name, Date</div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeEmploymentContent;
