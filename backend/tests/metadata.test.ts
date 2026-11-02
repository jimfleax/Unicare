import request from "supertest";
import app from "../src/app";
import Metadata from "../src/models/Metadata";
import Asset from "../src/models/Asset";
import User from "../src/models/User";
import { generateToken } from "../src/services/authService";

describe("Metadata API", () => {
  let token: string;

  beforeEach(async () => {
    await Metadata.deleteMany({});
    await Asset.deleteMany({});
    await User.deleteMany({});
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "student",
    });
    token = generateToken(user.id);
  });

  describe("GET /api/metadata/priorities", () => {
    it("should return priority metadata with value, label, and color", async () => {
      await Metadata.create({
        type: "priority",
        value: "Critical",
        label: "Critical",
        color: "var(--red)",
      });

      const response = await request(app)
        .get("/api/metadata/priorities")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: "Critical",
            label: "Critical",
            color: "var(--red)",
          }),
        ]),
      );
    });
  });

  describe("GET /api/metadata/locations", () => {
    it("should return location metadata with value, label, and color", async () => {
      await Metadata.create({
        type: "location",
        value: "Library",
        label: "Library",
        color: "#3b82f6",
      });

      const response = await request(app)
        .get("/api/metadata/locations")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: "Library",
            label: "Library",
            color: "#3b82f6",
          }),
        ]),
      );
    });

    it("should return default color for locations not found in Metadata", async () => {
      // Assuming Asset distinct location is retrieved and mapped
      await Asset.create({
        tagId: "A-001",
        name: "Asset 1",
        location: "Unknown Location",
        category: "Electrical",
        healthStatus: "healthy",
      });

      const response = await request(app)
        .get("/api/metadata/locations")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: "Unknown Location",
            label: "Unknown Location",
            color: "var(--txt-sub)", // Testing fallback color
          }),
        ]),
      );
    });
  });

  describe("GET /api/metadata/asset-health-statuses", () => {
    it("should return valid asset health statuses", async () => {
      const response = await request(app)
        .get("/api/metadata/asset-health-statuses")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        { value: "healthy", label: "Healthy" },
        { value: "degraded", label: "Degraded" },
        { value: "broken", label: "Broken" },
      ]);
    });
  });

  describe("GET /api/metadata/technician-statuses", () => {
    it("should return valid technician shift statuses", async () => {
      const response = await request(app)
        .get("/api/metadata/technician-statuses")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        { value: "On Shift", label: "On Shift" },
        { value: "In Field", label: "In Field" },
        { value: "On Call", label: "On Call" },
        { value: "Off Duty", label: "Off Duty" },
      ]);
    });
  });

  describe("GET /api/metadata/user-roles", () => {
    it("should return valid user account roles", async () => {
      const response = await request(app)
        .get("/api/metadata/user-roles")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        { value: "student", label: "Student" },
        { value: "technician", label: "Technician" },
        { value: "admin", label: "Admin" },
        { value: "lab_admin", label: "Lab Admin" },
      ]);
    });
  });

  describe("GET /api/metadata/technician-report-types", () => {
    it("should return valid technician report issue types", async () => {
      const response = await request(app)
        .get("/api/metadata/technician-report-types")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        {
          value: "Unresponsive / SLA Breach",
          label: "Unresponsive / SLA Breach",
        },
        { value: "Unprofessional Conduct", label: "Unprofessional Conduct" },
        { value: "Poor Quality Work", label: "Poor Quality Work" },
        { value: "Other", label: "Other" },
      ]);
    });
  });

  describe("GET /api/metadata/maintenance-statuses", () => {
    it("should return valid maintenance schedule statuses", async () => {
      const response = await request(app)
        .get("/api/metadata/maintenance-statuses")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        { value: "Pending", label: "Pending" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ]);
    });
  });
});
