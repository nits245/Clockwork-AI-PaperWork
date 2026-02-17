import React from "react";
import HTMLReactParser from "html-react-parser";

interface Party {
  parties_name: string;
  Parties_company: string;
  parties_address: string;
}

interface ReviewEmploymentContentProps {
  title: string;
  content: string;
  parties: Party[];
  version: string;
}

const ReviewEmploymentContent: React.FC<ReviewEmploymentContentProps> = ({
  title,
  content,
  parties,
  version,
}) => {
  return (
    <div>
      <div className="header">{HTMLReactParser(title)}</div>
      
      <h3>Employment Overview</h3>
      <p>This Employment Contract establishes the terms and conditions of employment between the employer and employee.</p>

      <h3>Parties</h3>
      {parties.map((party, index) => (
        <div key={index} style={{marginBottom: '10px'}}>
          <strong>{index === 0 ? "Employer" : "Employee"}:</strong>
          <div><strong>Name:</strong> {party.parties_name}</div>
          <div><strong>Company:</strong> {party.Parties_company}</div>
          <div><strong>Address:</strong> {party.parties_address}</div>
        </div>
      ))}

      <h3>Employment Details</h3>
      <div>
        <div><strong>Position:</strong> As specified in contract</div>
        <div><strong>Start Date:</strong> As specified in contract</div>
        <div><strong>Salary:</strong> As specified in contract</div>
        <div><strong>Work Schedule:</strong> As specified in contract</div>
      </div>

      <h3>Contract Terms</h3>
      <div>{HTMLReactParser(content)}</div>
    </div>
  );
};

export default ReviewEmploymentContent;
