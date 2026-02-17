import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";

const customise_document_ep_router = express.Router();
customise_document_ep_router.use(cors());
customise_document_ep_router.use(express.json());
const macros = new ep_macros();

//no need this route, the data is sent through props from create_document
customise_document_ep_router.get("/:id", (req, res) => {
  macros.select(
    "document_template",
    { where: "document_template_id='" + req.params.id + "'" },
    res
  );
});

//no need id, just return all the parties from parties
//--> It is temporarily in a different file as it has nothing to do with the template
customise_document_ep_router.get("/:id/parties", (req, res) => {
  macros.select(
    "document_parties",
    {
      cols: "document_praties.*,parties.parties_name",
      other:
        "INNER JOIN parties ON parties.parties_id = document_parties.parties_id ",
      where: "document_template_id='" + req.params.id + "'",
    },
    res
  );
});

customise_document_ep_router.post("/:id/parties", (req, res) => {
  const { parties_ids } = req.body;

  db.query(
    "DELETE FROM document_parties WHERE document_template_id=$1",
    [req.params.id], // Use the boolean value directly
    (err, _) => {
      if (err) return res.send(err);
      console.log("Parties purged successfully");
      if (!parties_ids)
        return res.status(500).send("Missing parties_id list parties_ids");
      parties_ids.forEach((element) => {
        var err = undefined;
        db.query(
          "INSERT INTO document_parties (document_template_id, parties_id, parties_approval) VALUES ($1,$2,$3)",
          [req.params.id, element, 0], // Use the boolean value directly
          (errr, _) => {
            if (err) err = errr;
            else console.log("Party " + element + " put successfully");
          }
        );
        if (err) return res.status(500).send(err);
      });
      console.log("Parties put successfully");
      return res.send("Parties purged and put successfully");
    }
  );
});

customise_document_ep_router.post("/:id/configuration", (req, res) => {
  const dataArray = req.body;
  console.log(dataArray);
  const exists_tinyint = (name) => (dataArray.includes(name) ? 1 : 0);

  // Create an object to hold the values for each field
  const fieldValues = {
    student_id: exists_tinyint("student_id"),
    address: exists_tinyint("address"),
    title: exists_tinyint("title"),
    age: exists_tinyint("age"),
    email: exists_tinyint("email"),
  };

  const sql =
    "INSERT INTO configuration (document_template_id, student_id, address, title, age, email) VALUES ($1, $2, $3, $4, $5, $6)";

  db.query(
    sql,
    [
      req.params.id,
      fieldValues.student_id,
      fieldValues.address,
      fieldValues.title,
      fieldValues.age,
      fieldValues.email,
    ],
    (err, _) => {
      if (err) return res.send(err);
      return res.json({
        message: "Document configuration appended successfully",
        insert_id: req.params.id,
      });
    }
  );
});

customise_document_ep_router.put("/:id/configuration", (req, res) => {
  const dataArray = req.body;

  const exists_tinyint = (name) => (dataArray.includes(name) ? 1 : 0);

  // Create an object to hold the values for each field
  const fieldValues = {
    student_id: exists_tinyint("student_id"),
    address: exists_tinyint("address"),
    title: exists_tinyint("title"),
    age: exists_tinyint("age"),
    email: exists_tinyint("email"),
  };

  const sql =
    "UPDATE configuration SET student_id=$1, address=$2, title=$3, age=$4, email=$5 WHERE document_template_id=$6";
  db.query(
    sql,
    [
      fieldValues.student_id,
      fieldValues.address,
      fieldValues.title,
      fieldValues.age,
      fieldValues.email,
      req.params.id,
    ],
    (err, result) => {
      if (err) return res.send(err);
      return res.json({
        message: "Document configuration edited successfully",
        insert_id: req.params.id,
      });
    }
  );
});

// edit a template (NOT INCREMENT IT)

customise_document_ep_router.put("/:id", (req, res) => {
  const { type, title, content, parties_number, date_modified } = req.body;
  const id = req.params.id;

  {
    // Insert the new template
    const insertQuery =
      "UPDATE document_template SET type=$1, title=$2, content=$3, parties_number=$4, date_modified=$5 WHERE document_template_id=$6";

    db.query(
      insertQuery,
      [type, title, content, parties_number, date_modified, id],
      (insert_err, insert_result) => {
        if (insert_err) {
          return res.send(insert_err);
        }

        return res.json({
          message: "Template edited successfully",
        }); // Return the new ID
      }
    ); // end of second query
  }
});

// fork a template (do increment it)

customise_document_ep_router.post("/template", (req, res) => {
  const { type, title, content, parties_number, created_date } = req.body;
  console.log(req.body);
  // Query to get the latest version with the given type
  const getLatestVersion =
    "SELECT version FROM document_template WHERE type = $1 ORDER BY version DESC LIMIT 1";

  db.query(
    getLatestVersion,
    [type],
    (latest_version_err, latest_version_result) => {
      if (latest_version_err) {
        return res.status(500).json({
          error: "An error occurred while querying for the latest version.",
        });
      }

      let new_version = 1; // Initialize the new version to 1 as default
      if (latest_version_result.rows.length > 0) {
        let latest_version = latest_version_result.rows[0].version;
        new_version = (parseFloat(latest_version) + 0.1).toFixed(1);
      }
      // Create the new template ID
      const document_template_id = `${type}_${new_version}`;

      // Insert the new template
      const insertQuery =
        "INSERT INTO document_template (document_template_id, type, title, content, parties_number, created_date, date_modified, version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

      db.query(
        insertQuery,
        [
          document_template_id,
          type,
          title,
          content,
          parties_number,
          created_date,
          created_date,
          new_version,
        ],
        (insert_err, insert_result) => {
          if (insert_err) {
            console.log(insert_err);
            return res.status(500).json({
              error: `An error occurred while inserting the template`,
            });
          }

          return res.json({
            message: "Template inserted successfully",
            document_template_id,
          }); // Return the new ID
        }
      ); // end of second query
    }
  ); // end of first query
}); // end of event

export default customise_document_ep_router;
