import express from "express";
import cors from "cors";
import ep_macros from "../utils/macro.js";

const miscellaneous_ep_router = express.Router();
miscellaneous_ep_router.use(cors());
miscellaneous_ep_router.use(express.json());
const macros = new ep_macros();

miscellaneous_ep_router.get("/faq", (_, res) => {
  macros.query("SELECT * FROM faq", res);
});

miscellaneous_ep_router.get("/parties", (_, res) => {
  macros.query("SELECT * FROM parties", res);
});

export default miscellaneous_ep_router;
