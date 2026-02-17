import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.scss";
import { Link } from "react-router-dom";
import RecentDoc from "../../components/RecentDoc/RecentDoc";
import Calendar from "../../components/Calendar/Calendar";
import Note from "../../components/Note/Note";
import ModalNote from "../../components/ModalNote/ModalNote";
import { useKeyboardManager } from "../../hooks/useKeyboardManager";

const BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/homepage`;

// Define types for the data structure
interface NoteItem {
  note_id: number;
  header: string;
  content: string;
  date_created: string;
  person_created: string;
}

interface DocItem {
  id: string;
  title: string;
  version: number;
  date_created: string;
}

interface HomeData {
  totalDocs: number;
  mostPopularDocs: DocItem[];
  notes: NoteItem[];
  recentDocs: DocItem[];
}

const Home: React.FC = () => {
  // Initialize keyboard manager for Dashboard shortcuts
  useKeyboardManager({
    debug: true,
    autoStart: true
  });

  // State to hold fetched data
  const [data, setData] = useState<HomeData>({
    totalDocs: 0,
    mostPopularDocs: [],
    notes: [],
    recentDocs: [],
  });

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // State for modal visibility
  const [showAddNotePopup, setShowAddNotePopup] = useState(false);

  // State for selected note
  const [selected, setSelected] = useState<string | number>("");

  // Function to add a note
  const addNote = async (noteData: Omit<NoteItem, "note_id">) => {
    try {
      const response = await axios.post(`${BASE_URL}/notes`, noteData);
      if (response.data && response.data.message) {
        setData((prevData) => ({
          ...prevData,
          notes: [
            ...prevData.notes,
            {
              note_id: response.data.note_id,
              ...noteData,
            },
          ],
        }));
      }
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // Handle adding a note
  const handleAddNote = (
    noteData: Omit<NoteItem, "note_id" | "date_created" | "person_created">
  ) => {
    addNote({
      date_created: new Date().toISOString().slice(0, 10),
      person_created: "YourUserName",
      ...noteData,
    });
    setShowAddNotePopup(false);
  };

  // Function to update notes
  const onUpdate = () => {
    fetchAllNotes();
  };

  // Fetch all notes
  const fetchAllNotes = async () => {
    try {
      const res = await axios.get<NoteItem[]>(`${BASE_URL}/notes`);
      setData((prevData) => ({ ...prevData, notes: res.data }));
    } catch (err) {
      console.error("Error fetching all notes:", err);
    }
  };

  // Fetch all data for the homepage
  const fetchData = async () => {
    try {
      const currentUserId = localStorage.getItem('current_user_id') || localStorage.getItem('user_id') || 'ID001';
      const backendBaseUrl = process.env.REACT_APP_BACKEND_URL;
      
      const [
        totalDocsResponse,
        mostPopularDocsResponse,
        recentDocsResponse,
        notesResponse,
      ] = await Promise.all([
        axios.get<{ total: number }[]>(`${BASE_URL}/documents/total`),
        axios.get<DocItem[]>(`${BASE_URL}/documents/most-popular`),
        axios.get<{ documents: any[], count: number }>(`${backendBaseUrl}/document-instance/recent?limit=5`),
        axios.get<NoteItem[]>(`${BASE_URL}/notes`),
      ]);
      
      // Transform recent saved documents to match DocItem interface
      const recentDocs = (recentDocsResponse.data.documents || []).map(doc => ({
        id: `doc-${doc.document_container_id}`,
        title: doc.template_title || doc.document_template_id,
        version: doc.version || 1.0,
        date_created: new Date(doc.issue_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }));
      
      setData({
        totalDocs: totalDocsResponse.data[0].total,
        mostPopularDocs: mostPopularDocsResponse.data,
        notes: notesResponse.data,
        recentDocs: recentDocs,
      });
    } catch (err) {
      setError("There was an error fetching the data. Please try again.");
      console.error("Error during data fetching:", err);
    }
  };

  // Fetch notes and data on component mount
  useEffect(() => {
    fetchAllNotes();
    fetchData();
  }, []);

  // Map document titles to IDs
  const titleToId = (title: string): string => {
    const mapping: { [key: string]: string } = {
      "Employment Contract": "TPL01",
      "Lease Agreement": "TPL02",
      "NDA Agreement": "TPL03",
      "Service Agreement": "TPL04",
      "Sales Contract": "TPL05",
    };
    return mapping[title] || "TPL01"; // Default fallback
  };

  return (
    <div className="home">
      <div className="home-container">
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>
              Welcome <span>Back,</span>
            </h1>
          </div>
          <div className="buttons-section">
            <Link to="/createDoc">
              <button className="btn-create">Create Document</button>
            </Link>
            <Link to="/viewDoc">
              <button className="btn-view">View Document</button>
            </Link>
            <Link to="/sensitive-data">
              <button className="btn-validate">Validate Data</button>
            </Link>
          </div>
        </div>

        <div className="calendar-section">
          <Calendar />
        </div>
      </div>

      {/* Top Section */}
      <div className="top">
        <div className="title">Document Summary</div>
        <div className="top-container">
          {/* Document Summary Section */}
          <Link to="">
            <div className="doc">
              <span className="container-title">Documents</span>
              <div className="detail">
                <span>{data.totalDocs}</span>
              </div>
            </div>
          </Link>

          <div className="pop-doc">
            <span className="container-title">Most Popular Documents</span>
            <div className="detail">
              {data.mostPopularDocs.map((doc, index) => (
                <div key={index}>
                  <span className="doc-title">{doc.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="note-section">
            <div className="note-header"></div>
            <Note
              data={data}
              onUpdate={onUpdate}
              setShowAddNotePopup={setShowAddNotePopup}
              setSelected={setSelected}
              selected={selected}
            />
            <ModalNote
              showAddNotePopup={showAddNotePopup}
              handleAddNote={handleAddNote}
              setShowAddNotePopup={setShowAddNotePopup}
            />
          </div>
        </div>
      </div>

      {/* Notes Display Section */}
      <div className="mid">
        <div className="title">Notes</div>
        <div className="mid-container">
          {data?.notes.map((note, index) => (
            <div
              className={`container ${
                selected === note.note_id ? "selected" : ""
              }`}
              key={index}
            >
              <div className="card">
                <h2>{note.header}</h2>
                <p>{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="bottom">
        <div className="title">Recent Created Documents</div>
        <div className="bottom-left">
          <RecentDoc
            docData={data.recentDocs.map((doc) => ({
              id: titleToId(doc.title), // Convert title to proper ID
              title: doc.title,
              version: String(doc.version),
              date_created: doc.date_created || new Date().toISOString(),
            }))}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <p className={`error ${error ? "visible" : ""}`}>{error}</p>
      )}
    </div>
  );
};

export default Home;
