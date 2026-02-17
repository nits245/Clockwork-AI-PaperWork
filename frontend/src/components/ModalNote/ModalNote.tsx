import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./ModalNote.scss";

// Define the props interface
interface ModalNoteProps {
  showAddNotePopup: boolean;
  handleAddNote: (note: { header: string; content: string }) => void;
  setShowAddNotePopup: (show: boolean) => void;
}

const ModalNote: React.FC<ModalNoteProps> = ({
  showAddNotePopup,
  handleAddNote,
  setShowAddNotePopup,
}) => {
  // Manage the state for title and content
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  if (!showAddNotePopup) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="modal">
      <div
        className="overlay"
        onClick={() => setShowAddNotePopup(false)}
      ></div>
      <div className="content">
        <h1>Add New Note</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddNote({
              header: title,
              content: content,
            });
            setTitle("");
            setContent("");
            setShowAddNotePopup(false);
          }}
        >
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Title of the note"
            maxLength={35}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <span className="text-length">
            {35 - title.length} characters remaining
          </span>

          <label htmlFor="content">Content</label>
          <textarea
            className="content-text"
            id="content"
            name="content"
            placeholder="Content of the note...."
            maxLength={400}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <span className="text-length">
            {400 - content.length} characters remaining
          </span>

          <button
            className="reset"
            type="button"
            onClick={() => {
              setTitle("");
              setContent("");
            }}
          >
            Reset
          </button>

          <div className="btn">
            <button className="add" type="submit">
              Add
            </button>
            <button
              className="close"
              type="button"
              onClick={() => setShowAddNotePopup(false)}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById("portal")!,
  );
};

export default ModalNote;