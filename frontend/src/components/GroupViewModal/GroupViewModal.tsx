import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./GroupViewModal.scss";
import Check from "../../img/viewDoc/check.svg";
import axios from "axios";

// Define the structure of the props and data types
interface GroupViewModalProps {
  viewOpen: boolean;
  setViewOpen: (open: boolean) => void;
  docId: string;
}

interface Party {
  parties_id: string;
  parties_name: string;
  parties_approval: number;
}

interface Recipient {
  identity_id: string;
  firstname: string | null;
  email: string;
}

// GroupViewModal component to display modal with parties and recipients
const GroupViewModal: React.FC<GroupViewModalProps> = ({ viewOpen, setViewOpen, docId }) => {
  const [partiesData, setPartiesData] = useState<Party[]>([]);
  const [recipientData, setRecipientData] = useState<Recipient[]>([]);

  useEffect(() => {
    if (!viewOpen) return;

    const fetchData = async () => {
      try {
        // Fetch data from the API endpoint for parties
        const partiesResponse = await axios.get<Party[]>(
          `http://localhost:8800/view-document/parties/${docId}`,
        );
        if (partiesResponse.data) {
          setPartiesData(partiesResponse.data);
        } else {
          setPartiesData([]);
        }

        // Fetch data from the API endpoint for recipients
        const recipientsResponse = await axios.get<Recipient[]>(
          `http://localhost:8800/view-document/recipients/${docId}`,
        );
        if (recipientsResponse.data) {
          setRecipientData(recipientsResponse.data);
        } else {
          setRecipientData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecipientData([]);
      }
    };

    fetchData();
  }, [viewOpen, docId]);

  if (!viewOpen) return null;

  // Close the modal
  const closeModal = () => {
    setViewOpen(false);
  };

  return ReactDOM.createPortal(
    <div className="modal">
      <div className="overlay" onClick={closeModal}></div>
      <div className="contentModal">
        <h2>Parties</h2>
        <div className="parties-modal">
          {partiesData.map((item) => (
            <div className="modal-party" key={item.parties_id}>
              {item.parties_name}{" "}
              {item.parties_approval === 1 && <img src={Check} alt="Approved" />}
            </div>
          ))}
        </div>
        <h2>Recipient</h2>
        <div className="parties-modal">
          {recipientData.map((item) => (
            <div key={item.identity_id}>
              {item.firstname ? `${item.firstname}: ` : ""}{item.email}
            </div>
          ))}
        </div>
        <button className="close" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>,
    document.getElementById("portal")!,
  );
};

export default GroupViewModal;