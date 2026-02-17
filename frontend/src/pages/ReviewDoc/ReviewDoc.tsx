import React, { useState, useEffect, useRef } from "react";
import "./ReviewDoc.scss";
import HTMLReactParser from "html-react-parser";
import { Link } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { PDFExport } from "@progress/kendo-react-pdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ReviewNDAContent from "./templates/ReviewNDAContent";
import ReviewEmploymentContent from "./templates/ReviewEmploymentContent";
import ReviewLeaseContent from "./templates/ReviewLeaseContent";
import ReviewServiceContent from "./templates/ReviewServiceContent";
import ReviewSalesContent from "./templates/ReviewSalesContent";

// Define types for recipient and party
interface Recipient {
  identity_id: string;
  firstname: string;
  email: string;
  // Add other fields if necessary
}

interface Party {
  parties_name: string;
  Parties_company: string;
  parties_address: string;
}

const ReviewDoc: React.FC = () => {
  // Get document ID from URL params
  let { id } = useParams<{ id: string }>();

  // State for blurring the signature
  const [blurry, setBlur] = useState<boolean>(true);

  // useRef for PDF export
  const pdfExportComponent = useRef<PDFExport | null>(null);

  // Handle the export to PDF
  const handleExportWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  // State variables for document data
  const [title, setTitle] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [content, setContent] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    null
  );
  const [docType, setDocType] = useState<string>("");

  // Fetch data on component mount
  useEffect(() => {
    setVersion("");
    setParties([]);
    setContent("");
    setSelectedRecipient(null);

    // Fetch document details
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/view-document/document/${id}`)
      .then((response) => {
        const documentData = response.data || {};
        setTitle(documentData[0]?.title || "");
        setVersion(String(documentData[0]?.version || ""));
        setContent(documentData[0]?.content || "");
        setDocType(documentData[0]?.type || "");
      })
      .catch((err) => {
        console.error(err.message);
      });

    // Fetch parties
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/view-document/parties/${id}`)
      .then((response) => {
        setParties(response.data || []);
      })
      .catch((err) => {
        console.error(err.message);
      });

    // Fetch recipients
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/view-document/recipients/${id}`)
      .then((response) => {
        setRecipients(response.data || []);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [id]);

  // Handle recipient selection
  const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const recipientId = e.target.value;
    const selected = recipients.find(
      (recipient) => recipient.identity_id === recipientId
    );
    setSelectedRecipient(selected || null);
  };

  // Component for recipient dropdown
  const RecipientDropdown = () => {
    const validRecipients = recipients.filter(
      (recipient) => recipient.firstname
    );

    if (validRecipients.length > 0) {
      return (
        <div>
          <select
            onChange={handleRecipientChange}
            value={selectedRecipient ? selectedRecipient.identity_id : ""}
          >
            <option value="">Select Recipients Name</option>
            {validRecipients.map((recipient) => (
              <option key={recipient.identity_id} value={recipient.identity_id}>
                {recipient.firstname}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  // Function to render type-specific content
  const renderTypeSpecificContent = () => {
    const commonProps = {
      title,
      content,
      parties,
      version,
    };

    switch (docType) {
      case 'TPL03': // NDA Agreement
        return <ReviewNDAContent {...commonProps} />;
      case 'TPL01': // Employment Contract
        return <ReviewEmploymentContent {...commonProps} />;
      case 'TPL02': // Lease Agreement
        return <ReviewLeaseContent {...commonProps} />;
      case 'TPL04': // Service Agreement
        return <ReviewServiceContent {...commonProps} />;
      case 'TPL05': // Sales Contract
        return <ReviewSalesContent {...commonProps} />;
      default:
        // Fall back to original content for other types
        return (
          <>
            <div className="header">{HTMLReactParser(title)}</div>
            <div className="parties">
              <h3>Party</h3>
              {parties.map((item, index) => (
                <div className="party" key={index}>
                  <b>Name:</b> {item.parties_name} <b>Company:</b>{" "}
                  {item.Parties_company} <b>Address:</b> {item.parties_address}
                </div>
              ))}
            </div>
            <div className="reciew-content">{HTMLReactParser(content)}</div>
          </>
        );
    }
  };

  return (
    <div className="reviewDoc">
      <div className="review-container">
        <PDFExport
          ref={pdfExportComponent}
          fileName={`${title}.pdf`}
          paperSize="A4"
          margin={{ left: "15mm", top: "20mm", right: "15mm", bottom: "20mm" }}
          scale={0.6}
        >
          <div className="recipient">
            <div className="recipient-dropdown">
              <RecipientDropdown />
            </div>
            <div className="version">
              <b>Version</b> {HTMLReactParser(version)}
            </div>
          </div>
          
          {renderTypeSpecificContent()}
          <div className="review-signature">
            <h3>ENTER INTO AS AN AGREEMENT BY THE PARTIES</h3>
            <div className="parties_sign_container">
              <div className="parties_side">
                {parties.map((item, index) => (
                  <div className="party_sign" key={index}>
                    <div className="Dname">
                      Discloser Name: {item.parties_name}
                    </div>
                    <div className="Sname">Signature: {item.parties_name}</div>
                    <div className="Sdate">Date: 8/31/2023</div>
                  </div>
                ))}
              </div>
              <div className="recipient_side">
                {selectedRecipient ? (
                  <>
                    <div>Name: {selectedRecipient.firstname}</div>
                    <div>Email: {selectedRecipient.email}</div>
                    <div
                      style={{
                        color: blurry ? "black" : "none",
                        display: blurry ? "" : "none",
                      }}
                    >
                      signature: dummy signature
                    </div>
                  </>
                ) : (
                  <p>No Recipient Selected</p>
                )}
              </div>
            </div>
          </div>
        </PDFExport>
      </div>
      <div className="review-button">
        <Link to={`/viewDoc/${docType}`}>
          <button className="cancel">Cancel</button>
        </Link>

        {blurry ? (
          <VisibilityIcon
            className="visibilityIcon"
            onClick={() => setBlur(false)}
          />
        ) : (
          <VisibilityOffIcon
            className="visibilityOffIcon"
            onClick={() => setBlur(true)}
          />
        )}

        <button className="export-pdf" onClick={handleExportWithComponent}>
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default ReviewDoc;
