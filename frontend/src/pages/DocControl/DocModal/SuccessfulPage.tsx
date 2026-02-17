import React from "react";
import Check from "../../../img/docControl/check.svg";
import "./SuccessfulPage.scss";
import Cross from "../../../img/docControl/crossRed.svg";

// Define prop types
interface SuccessfulPageProps {
  closeModal: () => void;
  open: boolean;
  result: "yes" | "no";  // Assuming result can only be "yes" or "no"
}

const SuccessfulPage: React.FC<SuccessfulPageProps> = ({ closeModal, open, result }) => {
  if (!open) return null;

  return (
    <div>
      <div className="modal">
        <div className="overlay" onClick={closeModal}></div>
        <div className="content-doc">
          <div className="successful-message">
            <div>
              {result === "yes" ? (
                <img src={Check} alt="Success" />
              ) : (
                <img className="cross" src={Cross} alt="Error" />
              )}
            </div>
            {result === "yes" ? (
              <span>Document has already been sent to the recipient!</span>
            ) : (
              <span>Something went wrong, please contact support!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessfulPage;