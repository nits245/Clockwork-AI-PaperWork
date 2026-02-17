import React, { useState } from "react";
import axios from "axios";
import "./Note.scss";
import Edit from "../../img/home/editIcon2.svg";
import Delete from "../../img/home/delete.svg";
import Plus from "../../img/home/plus.svg";
import DeleteConfirmation from "./DeleteConfirmation";

// Define the props interface for the Note component
interface NoteProps {
  data: { notes: Array<{ note_id: number; header: string; content: string }> };
  onUpdate: () => void;
  setShowAddNotePopup: (show: boolean) => void;
  setSelected: (id: string | number) => void;
  selected: string | number;
}

const Note: React.FC<NoteProps> = ({
  data,
  onUpdate,
  setShowAddNotePopup,
  setSelected,
  selected,
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [editHeader, setEditHeader] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<number | null>(null);

  // Function to delete a note
  const deleteNote = async (noteId: number) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/homepage/notes/${noteId}`,
      );
      if (response.data && response.data.message) {
        console.log(response.data.message);
        onUpdate(); // Trigger the update to refresh the notes list
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (noteId: number) => {
    setNoteToDeleteId(noteId);
    setShowDeleteConfirmation(true);
  };

  // Confirm deletion of the note
  const handleDeleteConfirm = async () => {
    if (noteToDeleteId !== null) {
      await deleteNote(noteToDeleteId);
      setShowDeleteConfirmation(false);
    }
  };

  // Cancel delete action
  const handleDeleteCancel = () => {
    setNoteToDeleteId(null);
    setShowDeleteConfirmation(false);
  };

  // Handle edit button click
  const handleEditClick = (note: { note_id: number; header: string; content: string }) => {
    setEditNoteId(note.note_id);
    setEditHeader(note.header);
    setEditContent(note.content);
    setShowEditModal(true);
  };

  // Save the edited note
  const handleSaveClick = async () => {
    if (editNoteId !== null) {
      try {
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/homepage/notes/${editNoteId}`, {
          header: editHeader,
          content: editContent,
        });
        setShowEditModal(false);
        onUpdate(); // Trigger update to refresh the notes list
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  // Close the edit modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditNoteId(null);
    setEditHeader("");
    setEditContent("");
  };

  return (
    <div className="note">
      <div className="note-title">
        Notes
        <button className="add-button" onClick={() => setShowAddNotePopup(true)}>
          <img src={Plus} alt="Add" />
        </button>
      </div>
      <div className="note-container">
        {data?.notes.map((note, index) => (
          <div
            className="note-item"
            key={index}
            onClick={() => {
              selected === note.note_id
                ? setSelected("")
                : setSelected(note.note_id);
            }}
          >
            <span>{note.header}</span>
            <div className="icons">
              <img
                src={Edit}
                alt="Edit Icon"
                onClick={() => handleEditClick(note)}
              />
              <img
                src={Delete}
                alt="Delete Icon"
                onClick={() => handleDeleteClick(note.note_id)}
              />
            </div>
          </div>
        ))}

        {/* Delete Modal */}
        {showDeleteConfirmation && (
          <DeleteConfirmation
            onDeleteConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="container">
            <div className="edit-modal">
              <h3>Edit Note</h3>
              <label>
                Title
                <input
                  type="text"
                  value={editHeader}
                  onChange={(e) => setEditHeader(e.target.value)}
                />
              </label>
              <label>
                Content
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                ></textarea>
              </label>
              <button onClick={handleSaveClick}>Save Changes</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Note;
