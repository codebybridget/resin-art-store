import express from "express";
import { addItem, listItems, removeItem } from "../controllers/itemController.js";
import upload from "../middleware/uploadMiddleware.js";
import adminAuth from "../middleware/adminAuth.js";

const itemRouter = express.Router();

// ✅ Add item (Admin protected)
itemRouter.post("/add", adminAuth, upload.single("image"), addItem);

// ✅ List items (Public)
itemRouter.get("/list", listItems);

// ✅ Remove item (Admin protected)
itemRouter.post("/remove", adminAuth, removeItem);

export default itemRouter;
