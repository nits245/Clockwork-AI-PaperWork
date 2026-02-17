import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";

const homepage_ep_router = express.Router();
homepage_ep_router.use(cors());
homepage_ep_router.use(express.json());
const macro = new ep_macros();
const fetch = macro.query;

homepage_ep_router.get("/documents/total", (req, res) => {
  //write the query for the sql
  fetch("SELECT count(*) AS total FROM document_default_template", res);
});

homepage_ep_router.get("/documents/most-popular", (req, res) => {
  // Write the query for the SQL
  fetch(
    "SELECT title, COUNT(*) AS count FROM document_template GROUP BY title ORDER BY count DESC LIMIT 1",
    res
  );
});

homepage_ep_router.get("/documents/recently-created", (req, res) => {
  fetch(
    "SELECT ddt.type as id, ddt.title as title, dt.version as version, TO_CHAR(dt.created_date, 'DD/MM/YYYY') AS date_created FROM document_template dt JOIN document_default_template ddt ON dt.type = ddt.type ORDER BY dt.created_date DESC LIMIT 5;",
    res
  );
});

homepage_ep_router.get("/notes", (req, res) => {
  // Write the query for the SQL, using DATE_FORMAT to format the date
  fetch(
    "SELECT note_id, TO_CHAR(date_created, 'DD/MM/YYYY') AS date_created, person_created, header, content FROM notes WHERE is_removed = '0';",
    res
  );
});

//for update
homepage_ep_router.put("/notes/:note_id", (req, res) => {
  const noteId = req.params.note_id;
  const { header, content } = req.body;

  const sql = "UPDATE notes SET header = $1, content = $2 WHERE note_id = $3;";

  db.query(sql, [header, content, noteId], (err, result) => {
    if (err) return res.send(err);
    return res.json({ message: "Note updated successfully" });
  });
});

//for delete
homepage_ep_router.delete("/notes/:note_id", (req, res) => {
  const noteId = req.params.note_id;

  const sql = "UPDATE notes SET is_removed = '1' WHERE note_id = $1;";

  db.query(sql, [noteId], (err, _) => {
    if (err) return res.send(err);
    return res.json({ message: "Note deleted successfully" });
  });
});

//for insert
homepage_ep_router.post("/notes", (req, res) => {
  const { date_created, person_created, header, content } = req.body;

  const sql =
    "INSERT INTO notes (date_created, person_created, header, content, is_removed) VALUES ($1, $2, $3, $4, $5)";

  db.query(
    sql,
    [date_created, person_created, header, content, 0],
    (err, result) => {
      console.log(err);
      if (err) return res.send(err);
      return res.json({
        message: "Note inserted successfully",
        // we node to find the alternative to indertId in node-ps
        note_id: result.insertId,
      });
    }
  );
});

export default homepage_ep_router;
