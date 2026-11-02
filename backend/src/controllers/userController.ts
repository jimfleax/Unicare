import { Request, Response } from "express";
import User from "../models/User";
import { catchAsync } from "../utils/catchAsync";

import { AuthRequest } from "../middleware/authMiddleware";

export const getTechnicians = catchAsync(
  async (req: Request, res: Response) => {
    const technicians = await User.find({ role: "technician" });

    // Mongoose documents can be converted to JSON directly or we can use map
    // To ensure the _id is mapped to id, we can convert to objects
    const data = technicians.map((tech) => {
      const obj = tech.toObject() as unknown as Record<string, unknown>;
      obj["id"] = obj["_id"];
      return obj;
    });

    res.status(200).json({
      success: true,
      data,
    });
  },
);

export const updateMyStatus = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    const validStatuses = ["On Shift", "In Field", "On Call", "Off Duty"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid status value" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

const MAX_AVATAR_URL_LENGTH = 2048;

const isValidAvatarUrl = (url: unknown): url is string => {
  if (typeof url !== "string") {
    return false;
  }
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_AVATAR_URL_LENGTH) {
    return false;
  }

  // Accept a relative /uploads/ path (no protocol-relative //, and no directory traversal)
  if (
    trimmed.startsWith("/uploads/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("..")
  ) {
    return true;
  }

  // Accept an https:// URL
  if (trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  return false;
};

export const updateMyAvatar = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { avatarUrl } = req.body;
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    if (typeof avatarUrl !== "string" || avatarUrl.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "avatarUrl is required" });
    }

    if (!isValidAvatarUrl(avatarUrl)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid avatarUrl" });
    }

    user.avatarUrl = avatarUrl.trim();
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

export const createTechnician = catchAsync(
  async (req: Request, res: Response) => {
    const { name, email, password, title, specialty, phone, avatarColor } =
      req.body;
    const user = await User.create({
      name,
      email,
      password,
      role: "technician",
      title,
      specialty,
      phone,
      avatarColor,
    });
    res.status(201).json({ success: true, data: user });
  },
);

export const updateTechnician = catchAsync(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "technician") {
      return res
        .status(404)
        .json({ success: false, error: "Technician not found" });
    }

    const updatableFields = [
      "name",
      "email",
      "title",
      "specialty",
      "phone",
      "avatarColor",
      "status",
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  },
);

export const deleteTechnician = catchAsync(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "technician") {
      return res
        .status(404)
        .json({ success: false, error: "Technician not found" });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  },
);

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = req.query.role
    ? { role: req.query.role }
    : {};
  const users = await User.find(filter);

  const data = users.map((u) => {
    const obj = u.toObject() as unknown as Record<string, unknown>;
    obj["id"] = obj["_id"];
    return obj;
  });

  res.status(200).json({ success: true, data });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  res.status(200).json({ success: true, data: user });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  res.status(200).json({ success: true, data: {} });
});
