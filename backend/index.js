import express from "express";
import cors from "cors";
import homepage_ep_router from "./api/homepage_eps.js";
import view_document_ep_router from "./api/view_document_eps.js";
import db from "./utils/db.js";
import customise_document_ep_router from "./api/customise_document_eps.js";
import send_document_ep_router from "./api/send_document_eps.js";
import miscellaneous_ep_router from "./api/miscellaneous_eps.js";
import master_variables_router from "./api/master_variables_eps.js";
import template_variables_router from "./api/template_variables_eps.js";
import document_variables_router from "./api/document_variables_eps.js";
import document_instance_router from "./api/document_instance_eps.js";
import common_blocks_router from "./api/common_blocks_eps.js";
import participant_groups_router from "./api/participant_groups_eps.js";
import cascade_tasks_router from "./api/cascade_tasks_eps.js";
import { tenantMiddleware } from "./utils/tenant_middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Apply tenant middleware to all routes
app.use(tenantMiddleware);

// Add express routers
app.use("/view-document", view_document_ep_router);
app.use("/customise-document", customise_document_ep_router);
app.use("/send-document", send_document_ep_router);
app.use("/homepage", homepage_ep_router);
app.use("/master-variables", master_variables_router);
app.use("/template-variables", template_variables_router);
app.use("/document-variables", document_variables_router);
app.use("/document-instance", document_instance_router);
app.use("/common-blocks", common_blocks_router);
app.use("/participant-groups", participant_groups_router);
app.use("/cascade-tasks", cascade_tasks_router);
app.use("/", miscellaneous_ep_router);

// Set up swagger-ui
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clockwork Paperwork",
      version: "1.0.0",
    },
  },
  apis: ["./docs/*.js"],
};
const openapiSpecification = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

//check if the database is connected
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    return console.error("Database connection error: " + err.message);
  }
  console.log("Connected to PostgreSQL database successfully.");
  console.log("Database time:", result.rows[0].now);
  
  // Cascade service disabled temporarily
  console.log("Cascade service disabled (requires cascade_update_log table)");
});

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    version: process.env.npm_package_version 
  });
});

//listen to the backend
const PORT = process.env.BACKEND_PORT || 8800;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server successfully started on http://127.0.0.1:${PORT}`);
  console.log(`Also accessible via http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    const altPort = parseInt(PORT) + 1;
    console.log(`Port ${PORT} is already in use. Trying port ${altPort}...`);
    app.listen(altPort, '127.0.0.1', () => {
      console.log(`Server started on http://127.0.0.1:${altPort}`);
    });
  }
});
