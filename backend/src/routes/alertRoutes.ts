import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import {
  getAlerts,
  createAlert,
  deleteAlert,
} from "../controllers/alertController";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "lab_admin"));

router.route("/").get(getAlerts).post(createAlert);

router.route("/:id").delete(deleteAlert);

export default router;
