import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";
import view_document_ep_router from "./view_document_eps.js";

const send_document_ep_router = express.Router();
send_document_ep_router.use(cors());
send_document_ep_router.use(express.json());

const macro = new ep_macros();
const generateSearchString = macro.generate_search_string;
const select = macro.select;
const fetch = macro.query;

//get the number and ratio of sign entries of a template
send_document_ep_router.get("/:id/progress", (req, res) => {
  //https://stackoverflow.com/questions/4666042/sql-query-to-get-total-rows-and-total-rows-matching-specific-condition
  //https://stackoverflow.com/questions/1271810/counting-null-and-non-null-values-in-a-single-query
  //https://stackoverflow.com/questions/14962970/sql-query-if-value-is-null-then-return-1
  //select
  //  results:  the total number of the non-null signatures
  //  ratio:    number of approvals divided by the total matches in group (throws 0 if then dividing by zero)
  //from template parties BUT right-joined to AND grouped by ALL templates

  // THIS IS FUCKED. I ONLY GOT THIS TO WORK AFTER RUNNING IT THROUGHT CHAT GPT 10 TIMES!!!!!
  // THIS SINGLE ENDPOINT WILL MAKE A SMOOTH DB TRANSISTION IMPOSSIBLE!!!!! -- Jeremy
  const query = `
  SELECT 
      dt.document_template_id,
      COUNT(CASE WHEN dp.document_template_id IS NOT NULL THEN 1 ELSE NULL END) AS results,
      COALESCE(COUNT(CASE WHEN dp.parties_approval = TRUE THEN 1 ELSE NULL END)::FLOAT / NULLIF(COUNT(*), 0), 0) AS ratio
  FROM 
      document_template dt
  LEFT JOIN 
      document_parties dp 
  ON 
      dt.document_template_id = dp.document_template_id
  WHERE 
      dt.document_template_id = '${req.params.id}'
  GROUP BY 
      dt.document_template_id;
  `;
  console.log(query);

  macro.query(query, res);
});

//get all sign entries of a template
send_document_ep_router.get("/:id/signature", (req, res) => {
  macro.select(
    "document_parties",
    { where: "document_template_id='" + req.params.id + "'" },
    res
  );
});

/**
 * THIS IS FUCKED
 *
 * DONT EVENT ATTEMPT TO READ THIS FUNCTION-JSUT READ THE DOC
 *
 * THIS DOES NOT WORK.
 *
 * Processes the submission of new emails for a document container.
 * This endpoint receives an array of emails and the document template ID,
 * then updates the database by linking these emails to the specified document
 * if they do not already exist. It handles both registered users and guests.
 *
 * @route POST /container/:id
 * @param {express.Request} req - The request object from Express.js, containing:
 *   - `req.body`: an array of emails to be processed.
 *   - `req.params.id`: the document template ID to which emails will be linked.
 * @param {express.Response} res - The response object used to send back HTTP responses.
 *
 * @operation
 * 1. Validates that `req.body` contains an array of emails. If not, returns HTTP 400.
 * 2. Queries the database to find existing emails and identity IDs associated with the document template.
 * 3. Filters out emails already linked to the document template.
 * 4. For each new email:
 *    - Checks if it exists in the 'identity' table.
 *    - If it exists, adds a new entry to 'document_container'.
 *    - If it doesn't exist, registers it as a guest and adds to both 'document_container' and 'guest_identity'.
 * 5. Returns a successful response after all operations.
 *
 * @returns Sends an HTTP response:
 * - HTTP 200 with a message "Processing completed." on success.
 * - HTTP 400 if `req.body` is not an array.
 * - HTTP 500 on internal errors during database operations.
 */
send_document_ep_router.post("/container/:id", (req, res) => {
  const email_list = req.body;
  const doc_id = req.params.id; // Use req.params.id to get the value of ":id" in the route
  const identity_email_list = [];

  console.log("QUERY")

  // Check if email_list is an array
  if (!Array.isArray(email_list)) {
    return res.status(400).send("email_list is not provided as an array.");
  }

  const identityQuery = "SELECT identity_id FROM identity WHERE email = $1";

  const insertQuery =
    "INSERT INTO document_container (identity_id, document_template_id, issue_date) VALUES ($1, $2, $3)";

  const query = `SELECT identity.email AS combined_column
    FROM document_container
    INNER JOIN identity ON document_container.identity_id = identity.identity_id
    WHERE document_container.document_template_id = $1
    
    UNION
    
    SELECT document_container.identity_id AS combined_column
    FROM document_container
    WHERE document_container.document_template_id = $2;    
    `;

  db.query(query, [doc_id, doc_id], (error, result) => {
    if (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send("Internal Server Error");
    }

    // Extract the email data into identity_email_list
    for (const row of result.rows) {
      identity_email_list.push(row.combined_column);
    }

    // Now, filter out the emails that already exist in the database
    const remainingEmails = email_list.filter(
      (input_email) => !identity_email_list.includes(input_email)
    );

    // Iterate through the remaining emails
    remainingEmails.forEach((input_email) => {
      // Check if the email exists in the identity table

      db.query(identityQuery, [input_email], (identityError, results) => {
        const identityResults = results.rows;

        if (identityError) {
          console.error("Error executing identity SQL query:", identityError);
          // Handle the error as needed
        } else if (identityResults.length > 0) {
          const identity_id = identityResults[0].identity_id;
          const issue_date = new Date().toISOString(); // Today's date as an ISO string

          // Insert into the document_container table

          db.query(
            insertQuery,
            [identity_id, doc_id, issue_date],
            (insertError, _) => {
              if (insertError) {
                console.error("Error executing INSERT SQL query:", insertError);
                // Handle the error as needed
              } else {
                console.log("Inserted into document_container");
                // Continue processing or send a success response if needed
              }
            }
          );
        } else {
          // If the email is not found in the identity table, insert into guest_identity
          const issue_date = new Date().toISOString(); // Today's date as an ISO string
          // Insert into the document_container table
          db.query(
            insertQuery,
            [input_email, doc_id, issue_date],
            (insertError, insertResults) => {
              if (insertError) {
                console.error("Error executing INSERT SQL query:", insertError);
                // Handle the error as needed
              } else {
                const document_container_id = insertResults.insertId;
                console.log("Inserted into document_container");

                // Now, insert into guest_identity using the generated document_container_id
                const guestInsertQuery = `
                    INSERT INTO guest_identity (email, document_container_id)
                    VALUES ($1, $2);
                  `;
                db.query(
                  guestInsertQuery,
                  [input_email, document_container_id],
                  (guestInsertError, guestInsertResults) => {
                    if (guestInsertError) {
                      console.error(
                        "Error executing guest INSERT SQL query:",
                        guestInsertError
                      );
                      // Handle the error as needed
                    } else {
                      console.log("Inserted into guest_identity");
                      // Continue processing or send a success response if needed
                    }
                  }
                );
              }
            }
          );
        }
      });
    });
    // Return a response after processing all remaining emails
    res.status(200).json({ message: "Processing completed." });
  });
});

send_document_ep_router.get("/issued/:id", (req, res) => {
  let sql =
    "SELECT issue_date FROM document_container WHERE document_template_id = $1 ORDER BY issue_date DESC";
  db.query(sql, [req.params.id], (error, result) => {
    if (error) {
      result.status(500).send(error);
    } else {
      return res.json(result.rows);
    }
  });
});

export default send_document_ep_router;
