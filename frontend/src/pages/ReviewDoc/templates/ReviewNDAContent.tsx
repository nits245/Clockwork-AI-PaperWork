import React from "react";
import HTMLReactParser from "html-react-parser";

interface Party {
  parties_name: string;
  Parties_company: string;
  parties_address: string;
}

interface ReviewNDAContentProps {
  title: string;
  content: string;
  parties: Party[];
  version: string;
}

const ReviewNDAContent: React.FC<ReviewNDAContentProps> = ({
  title,
  content,
  parties,
  version,
}) => {
  return (
    <div>
      <div className="header">{HTMLReactParser(title)}</div>
      
      <h3>Non-Disclosure Agreement</h3>
      <p>This NDA establishes confidentiality terms between the disclosing and receiving parties.</p>

      <h3>Parties</h3>
      {parties.map((party, index) => (
        <div key={index} style={{marginBottom: '10px'}}>
          <strong>{index === 0 ? "Disclosing Party" : "Receiving Party"}:</strong>
          <div><strong>Name:</strong> {party.parties_name}</div>
          <div><strong>Company:</strong> {party.Parties_company}</div>
          <div><strong>Address:</strong> {party.parties_address}</div>
        </div>
      ))}

      <h3>Key Terms</h3>
      <div>
        <div><strong>Confidential Information:</strong> As defined in agreement</div>
        <div><strong>Duration:</strong> As specified in agreement</div>
        <div><strong>Permitted Use:</strong> As outlined in agreement</div>
        <div><strong>Return of Information:</strong> As required by agreement</div>
      </div>

      <h3>Agreement Details</h3>
      <div>{HTMLReactParser(content)}</div>
    </div>
  );
};

export default ReviewNDAContent;
