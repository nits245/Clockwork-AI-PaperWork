import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./DocModal.scss";
import Cross from "../../../img/docControl/cross.svg";
import uuid from "react-uuid";
import SuccessfulePage from "./SuccessfulPage";
import emailjs from "@emailjs/browser";

// Define types for props
interface DocModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  title: string;
  doc_id: string;
}

// Define types for elements and selected IDs
interface EmailElement {
  name: string;
  id: string;
}

const DocModal: React.FC<DocModalProps> = ({ show, setShow, title, doc_id }) => {
  // Manage the state for the send button
  const [open, setOpen] = useState<boolean>(false);
  // Save the email that user type inside the input
  const [elements, setElements] = useState<EmailElement[]>([]);
  // Handle state change for the email input
  const [email, setEmail] = useState<string>("");
  // Handle state of the error message
  const [error, setError] = useState<string>("");
  // Handle state of the IDs selected from the email list
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Handle the state for emailjs response
  const [result, setResult] = useState<"yes" | "no">("yes");
  // State that handles disabling the send button to avoid multiple clicks
  const [disable, setDisable] = useState<boolean>(false);

  // Handle closing the modal
  const closeModal = () => {
    setShow(false);
    setElements([]);
    setDisable(false);
  };

  // Handle the change event of the input for the email
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Handle adding the email to the elements list
  const handleAdd = () => {
    if (email !== "") {
      if (email.includes("@")) {
        if (elements?.find((e) => e.name === email)) {
          setError("Please enter a different email!");
        } else {
          setError("");
          setElements((prev) => [...prev, { name: email, id: uuid() }]);
        }
      } else {
        setError("Please insert the correct email format!");
      }
    } else {
      setError("Please enter the email!");
    }
    setEmail("");
  };

  // Handle highlighting the element when clicked
  const handleElementClick = (id: string) => {
    // Check if the element is already selected
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      // Add the element to the selectedIds array
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle removing the email from the list
  const handleRemove = () => {
    const filteredElements = elements.filter(
      (element) => !selectedIds.includes(element.id),
    );
    setElements(filteredElements);
  };

  // Handle close event
  const handleClose = () => {
    setOpen((s) => !s);
    setElements([]);
  };

  // Handle sending email
  const onSend = () => {
    if (elements.length === 0) {
      setError("Please add the email address to the list!");
    } else {
      const emailsArray = elements.map((item) => item.name);
      console.log(emailsArray);

      // Convert the title from the text editor format into string
      const parser = new DOMParser();
      const doc = parser.parseFromString(title, "text/html");
      const text = doc.body.textContent || "";

      emailsArray.forEach((item) => {
        const templateParams = {
          docName: text,
          message: `Please kindly check and sign the document that was created by the Paperwork Team via URL: localhost:3000/recipient/${item}/${doc_id}`,
          email: item,
        };

        emailjs
          .send(
            "service_7d8l9ff",
            "template_25x692y",
            templateParams,
            "VBzIorHlAAspUrEhL",
          )
          .then(
            (result) => {
              console.log(result.text);
              setOpen((s) => !s);
              setResult("yes");
            },
            (error) => {
              console.log(error.text);
              setResult("no");
              setOpen((s) => !s);
            },
          );
      });
    }
  };

  // Handle sending emails to the database (API request)
  const onSendToDatabase = () => {
    if (elements.length === 0) {
      setError("Please add the email addresses to the list!");
    } else {
      const emailsArray = elements.map((item) => item.name);
      const apiUrl = `http://localhost:8800/send-document/container/${doc_id}`;

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailsArray),
      })
        .then((response) => {
          if (response.ok) {
            console.log("API request was successful.");
            setOpen((s) => !s);
          } else {
            console.error("API request failed.");
            setOpen((s) => !s);
          }
        })
        .catch((error) => {
          console.error("Error making API request:", error);
          setOpen((s) => !s);
        });
    }
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="modal">
      <div className="overlay" onClick={closeModal}></div>
      <div className="content-doc">
        <div className="wrapper">
          <div className="header-popup">
            <div className="title">Send</div>
            <img src={Cross} alt="Close" onClick={closeModal} />
          </div>
          <div className="input">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email"
              onChange={handleChange}
              value={email}
            />
            {error && <div className="error">{error}</div>}
            <button onClick={handleAdd}>Add</button>
          </div>

          <h5>Recipient List:</h5>
          <div className="container">
            {elements?.map((element) => (
              <span
                key={element.id}
                onClick={() => handleElementClick(element.id)}
                style={{
                  cursor: "pointer",
                  fontWeight: selectedIds.includes(element.id)
                    ? "bold"
                    : "normal",
                }}
                className="email"
              >
                {element.name}
              </span>
            ))}
          </div>
          <button className="remove-btn" onClick={handleRemove}>
            Remove
          </button>
          <div className="send-button">
            <button
              className={`${disable ? "send-btn disabled" : "send-btn"}`}
              disabled={disable}
              onClick={() => {
                setDisable(true);
                onSend();
                onSendToDatabase();
                console.log("hi");
              }}
            >
              Send
            </button>
            <SuccessfulePage
              closeModal={handleClose}
              open={open}
              result={result}
            />
            <button className="cancel-btn" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("portal") as HTMLElement,
  );
};

export default DocModal;