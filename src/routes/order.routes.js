import express from "express";
import addOrder from "../controllers/order.controllers.js";

const router = express.Router();

router.post("/addOrder", addOrder);

export default router;