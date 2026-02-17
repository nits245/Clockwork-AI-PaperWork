import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";

const view_document_ep_router = express.Router();
view_document_ep_router.use(cors());
view_document_ep_router.use(express.json());

const macro = new ep_macros();
const generateSearchString = macro.generate_search_string;
const select = macro.select;

view_document_ep_router.get("/default-templates", (req, res) => {
  const query = "SELECT type, title, content FROM document_default_template";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const dataArray = [];
    let idCounter = 1; // Initialize the counter at 1

    results.rows.forEach((result) => {
      const dataObject = {
        id: idCounter++, // Increment the counter and assign it as id
        docTitle: result.title,
        template: {
          type: result.type,
          term: result.content,
        },
        defaultTemplate: {
          type: `${result.type} (Default Template)`,
          term: "",
        },
      };

      dataArray.push(dataObject);
    });

    res.json(dataArray);
  });
});

//get all types
view_document_ep_router.get("/document-template/type/:id", (req, res) => {
  req.query.where = "document_default_template.type = '" + req.params.id + "'";
  if (req.query.search)
    req.query.where += generateSearchString(" AND ", req.query.search, [
      "title",
    ]);
  req.query.columns =
    "document_default_template.type AS id, document_default_template.*, COUNT(*) AS count";
  req.query.other =
    "INNER JOIN document_template ON document_default_template.type = document_template.type";
  req.query.groupBy = "document_default_template.type";
  select("document_default_template", req.query, res);
});

//get all types
view_document_ep_router.get("/document-template/type", (req, res) => {
  if (req.query.search)
    req.query.where = generateSearchString("", req.query.search, ["title"]);
  req.query.columns =
    "document_default_template.type AS id, document_default_template.*, COUNT(*) AS count";
  req.query.other =
    "INNER JOIN document_template ON document_default_template.type = document_template.type";
  req.query.groupBy = "document_default_template.type";
  select("document_default_template", req.query, res);
});

//get all documents by template
view_document_ep_router.get("/document-template", (req, res) => {
  req.query.columns =
    "document_template.document_template_id AS id, document_template.title, document_default_template.type, document_default_template.title AS type_name, COUNT(*) AS count";
  req.query.other =
    "INNER JOIN document_default_template ON document_default_template.type = document_template.type";
  req.query.groupBy =
    "document_template.document_template_id, document_template.type, document_template.title, document_default_template.type,  document_default_template.title ";
  if (req.query.search)
    req.query.where = generateSearchString("", req.query.search, [
      "document_template.title",
      "document_default_template.title",
    ]);
  select("document_template", req.query, res);
});

//get list of signatories of document
//tempId: ID of the template type
//docId: ID of the document
view_document_ep_router.get("/document-template/:tempId/:docId", (req, res) => {
  req.query.where =
    "document_template.type = '" +
    req.params.tempId +
    "' AND document_template.document_template_id = '" +
    req.params.docId +
    "'";
  if (req.query.search)
    req.query.where += generateSearchString(" AND ", req.query.search, [
      "document_template.title",
      "CONVERT(signed_date, CHAR)",
      "CONVERT(issue_date, CHAR)",
    ]);

  req.query.other =
    "INNER JOIN document_template ON document_template.document_template_id = document_container.document_template_id";
  select("document_container", req.query, res);
});

//get list of documents by type
view_document_ep_router.get("/document-template/:id", (req, res) => {
  req.query.where = "document_template.type = '" + req.params.id + "'";
  if (req.query.search)
    req.query.where += generateSearchString(" AND ", req.query.search, [
      "document_template.title",
      "content",
    ]);
  select("document_template", req.query, res);
});

view_document_ep_router.get("/document-template2/:id", (req, res) => {
  const type_id = req.params.id;

  // Query to retrieve document_template data with approval ratio
  const getPartyInfoWithRatio = `
  SELECT
  dt.*,
  (
      SELECT COALESCE(COUNT(CASE WHEN dp.parties_approval THEN 1 ELSE NULL END)::float / NULLIF(COUNT(dp.document_template_id), 0), 0)
      FROM document_parties dp
      WHERE dp.document_template_id = dt.document_template_id
  ) AS approvalRatio,
  (
      SELECT dc.issue_date
      FROM document_container dc
      WHERE dc.document_template_id = dt.document_template_id
      ORDER BY dc.issue_date DESC
      LIMIT 1
  ) AS issueDate
  FROM
    document_template dt
  WHERE
    dt.type = $1
  GROUP BY
    dt.document_template_id`;

  // Execute the query to retrieve document_template data with approval ratio
  db.query(getPartyInfoWithRatio, [type_id], (error, results) => {
    if (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send("Internal Server Error");
    }
    console.log;
    // Send the response with data and approval ratios
    res.json(results.rows);
  });
});

view_document_ep_router.get("/parties/:id", (req, res) => {
  // Get the party ID from the request parameters
  const partyId = req.params.id;

  // Define the SQL query to retrieve party information based on the given party ID
  const getPartyInfoQuery = `
  SELECT
    parties.parties_id,
    parties.parties_name,
    parties.parties_address,
    parties.parties_email,
    document_parties.parties_approval
  FROM
    document_parties
  INNER JOIN
    parties ON document_parties.parties_id = parties.parties_id
  WHERE
    document_parties.document_template_id = $1;
`;

  // Execute the query
  db.query(getPartyInfoQuery, [partyId], (err, result) => {
    if (err) {
      // Handle database query error
      return res.status(500).send(err);
    }

    if (result.rows.length === 0) {
      // If no party with the specified ID is found, return a 404 error
      return res.status(404).json({
        error: "Party not found.",
      });
    }

    // If the query is successful, return all matching party information
    res.status(200).json(result.rows);
  });
});

view_document_ep_router.get("/recipients/:id", (req, res) => {
  const partyId = req.params.id;

  // Define the SQL queries to retrieve information from both tables
  const getRecipientInfoQuery = `
    SELECT document_container.identity_id, identity.firstname, identity.email
    FROM document_container
    INNER JOIN identity ON document_container.identity_id = identity.identity_id
    WHERE document_container.document_template_id = $1;
  `;

  const getGuestInfoQuery = `
    SELECT document_container.identity_id, guest_identity.firstname, document_container.identity_id as email
    FROM document_container
    INNER JOIN guest_identity ON document_container.document_container_id = guest_identity.document_container_id
    WHERE document_container.document_template_id = $1;
  `;

  // Execute both queries
  db.query(getRecipientInfoQuery, [partyId], (err, recipientInfoResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "An error occurred while querying for recipient information.",
      });
    }

    db.query(getGuestInfoQuery, [partyId], (err, guestInfoResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: "An error occurred while querying for recipient information.",
        });
      }

      // Combine and return both results without labels
      const combinedResult = [
        ...recipientInfoResult.rows,
        ...guestInfoResult.rows,
      ];

      if (combinedResult.length === 0) {
        return res.status(404).json({
          error: "Recipient not found.",
        });
      }

      res.status(200).json(combinedResult);
    });
  });
});

view_document_ep_router.get("/document/:id", (req, res) => {
  // Get the party ID from the request parameters
  const template_id = req.params.id;

  // Define the SQL query to retrieve party information based on the given party ID
  const getPartyInfo = `
      SELECT *
      FROM document_template
      WHERE document_template_id = $1;
    `;

  // Execute the query
  db.query(getPartyInfo, [template_id], (err, result) => {
    if (err) {
      // Handle database query error
      return res.status(500).json({
        error: "An error occurred while querying for receipient information.",
      });
    }

    if (result.rows.length === 0) {
      // If no party with the specified ID is found, return a 404 error
      return res.status(404).json({
        error: "Template not found.",
      });
    }

    // If the query is successful, return all matching party information
    res.status(200).json(result.rows);
  });
});

view_document_ep_router.get("/configurations/:id", (req, res) => {
  const template_id = req.params.id;

  const query = `
      SELECT *
      FROM configuration
      WHERE document_template_id = $1;
    `;

  // Execute the query
  db.query(query, [template_id], (err, result) => {
    if (err) {
      // Handle database query error
      return res.status(500).json({
        error: "An error occurred while querying for receipient information.",
      });
    }

    if (result.rows.length === 0) {
      // If no party with the specified ID is found, return a 404 error
      return res.status(404).json({
        error: "Template not found.",
      });
    }

    // If the query is successful, return all matching party information
    res.status(200).json(result.rows);
  });
});

export default view_document_ep_router;
