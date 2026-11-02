import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import {
  createTechnicianReport,
  getTechnicianReports,
  updateTechnicianReportStatus,
} from "../controllers/technicianReportController";

const router = express.Router();

router.use(protect);

router.route("/").post(createTechnicianReport).get(getTechnicianReports);

router
  .route("/:id")
  .patch(authorize("admin", "lab_admin"), updateTechnicianReportStatus);

export default router;
