import React from "react";
import ReactDOM from "react-dom";
import "./DeleteConfirmation.scss";

// Define the props interface for DeleteConfirmation
interface DeleteConfirmationProps {
  onDeleteConfirm: () => void;
  onCancel: () => void;
}

// DeleteConfirmation serves as a confirmation modal for note deletion
const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  onDeleteConfirm,
  onCancel,
}) => {
  return ReactDOM.createPortal(
    <div className="delete-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <p>Are you sure you want to delete this note?</p>
        <button onClick={onDeleteConfirm}>Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>,
    document.getElementById("portal")!,
  );
};

export default DeleteConfirmation;