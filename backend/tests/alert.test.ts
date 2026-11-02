import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import Asset from "../src/models/Asset";
import Incident from "../src/models/Incident";
import MaintenanceSchedule from "../src/models/MaintenanceSchedule";
import Alert from "../src/models/Alert";
import { generateToken } from "../src/services/authService";

interface AlertItem {
  _id: string;
  title: string;
  loc?: string;
  date?: string;
  type?: string;
  source?: string;
}

describe("Alert Endpoints", () => {
  let adminToken: string;
  let labAdminToken: string;
  let studentToken: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Incident.deleteMany({});
    await MaintenanceSchedule.deleteMany({});
    await Alert.deleteMany({});

    const admin = await User.create({
      name: "System Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(admin._id.toString());

    const labAdmin = await User.create({
      name: "Lab Admin User",
      email: "labadmin@example.com",
      password: "password123",
      role: "lab_admin",
    });
    labAdminToken = generateToken(labAdmin._id.toString());

    const student = await User.create({
      name: "Student User",
      email: "student@example.com",
      password: "password123",
      role: "student",
    });
    studentToken = generateToken(student._id.toString());
  });

  describe("GET /api/alerts", () => {
    it("should reject unauthorized access from regular students", async () => {
      const res = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow access for both admin and lab_admin", async () => {
      const resAdmin = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(resAdmin.status).toBe(200);

      const resLabAdmin = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${labAdminToken}`);
      expect(resLabAdmin.status).toBe(200);
    });

    it("should synthesize alerts from manual broadcasts, critical incidents, and maintenance schedules", async () => {
      const asset = await Asset.create({
        tagId: "AST-999",
        name: "Main Server Rack",
        location: "Server Room B",
        category: "Infrastructure",
        healthStatus: "degraded",
      });

      // 1. Create a manual alert
      await Alert.create({
        title: "Network maintenance tonight at 11 PM",
        loc: "Campus-wide",
        date: "Tonight",
        type: "notice",
        active: true,
      });

      const adminUser = await User.findOne({ role: "admin" });

      // 2. Create a critical incident
      await Incident.create({
        assetId: asset._id,
        description: "Server rack cooling unit failure",
        priority: "Critical",
        status: "Open",
        reportedBy: adminUser!._id,
      });

      // 3. Create a maintenance schedule
      await MaintenanceSchedule.create({
        assetId: asset._id,
        assignedTo: adminUser!._id,
        description: "Quarterly UPS Battery Check",
        scheduledDate: new Date(),
        status: "Pending",
      });

      const res = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);

      const titles = res.body.data.map((a: AlertItem) => a.title);
      expect(
        titles.some((t: string) => t.includes("Network maintenance")),
      ).toBe(true);
      expect(
        titles.some((t: string) =>
          t.includes("Critical Alert: Main Server Rack"),
        ),
      ).toBe(true);
      expect(
        titles.some((t: string) => t.includes("Quarterly UPS Battery Check")),
      ).toBe(true);
    });

    it("should not let past scheduled maintenance crowd out upcoming maintenance in the 5-item limit", async () => {
      const asset = await Asset.create({
        tagId: "AST-100",
        name: "Cooling Unit",
        location: "Lab 1",
        category: "HVAC",
      });
      const adminUser = await User.findOne({ role: "admin" });

      // Create 5 past maintenance schedules (overdue)
      for (let i = 1; i <= 5; i++) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - (10 + i));
        await MaintenanceSchedule.create({
          assetId: asset._id,
          assignedTo: adminUser!._id,
          description: `Past Maintenance #${i}`,
          scheduledDate: pastDate,
          status: "Pending",
        });
      }

      // Create a future maintenance schedule
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      await MaintenanceSchedule.create({
        assetId: asset._id,
        assignedTo: adminUser!._id,
        description: "Future Calibration Schedule",
        scheduledDate: futureDate,
        status: "Pending",
      });

      const res = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const upcoming = res.body.data.find((a: AlertItem) =>
        a.title.includes("Future Calibration Schedule"),
      );
      expect(upcoming).toBeDefined();
      expect(upcoming.source).toBe("maintenance");
    });
  });

  describe("POST /api/alerts and DELETE /api/alerts/:id", () => {
    it("should allow admin to create and delete a broadcast alert", async () => {
      const createRes = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Power grid inspection",
          loc: "Block C Lab",
          date: "Tomorrow",
          type: "alert",
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.title).toBe("Power grid inspection");

      const alertId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/alerts/${alertId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      const getRes = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.body.data.some((a: AlertItem) => a._id === alertId)).toBe(
        false,
      );
    });
  });
});
