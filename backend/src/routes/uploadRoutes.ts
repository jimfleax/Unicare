import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import {
  uploadFile,
  uploadMultipleFiles,
} from "../controllers/uploadController";
import { AppError } from "../utils/AppError";

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files (JPG, PNG, WEBP) are allowed", 400));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Middleware to accept either 'file' or 'image' field for single file upload
const singleFileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const uploadHandler = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]);

  uploadHandler(req, res, (err) => {
    if (err) return next(err);
    const files = req.files as
      { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.file?.[0]) {
      req.file = files.file[0];
    } else if (files?.image?.[0]) {
      req.file = files.image[0];
    }
    next();
  });
};

router.post("/", protect, singleFileMiddleware, uploadFile);
router.post(
  "/multiple",
  protect,
  upload.array("files", 5),
  uploadMultipleFiles,
);

export default router;
