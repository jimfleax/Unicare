import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import TechnicianReport from "../src/models/TechnicianReport";
import { generateToken } from "../src/services/authService";

describe("Technician Report Endpoints", () => {
  let studentToken: string;
  let adminToken: string;
  let technicianId: string;
  let technicianName: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await TechnicianReport.deleteMany({});

    const student = await User.create({
      name: "Jane Student",
      email: "jane@example.com",
      password: "password123",
      role: "student",
      rollNo: "21CS045",
    });
    studentToken = generateToken(student._id.toString());

    const admin = await User.create({
      name: "Chief Admin",
      email: "chief@example.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(admin._id.toString());

    const tech = await User.create({
      name: "Bob Handyman",
      email: "bob@example.com",
      password: "password123",
      role: "technician",
      specialty: "HVAC",
      phone: "+1 555-0199",
    });
    technicianId = tech._id.toString();
    technicianName = tech.name;
  });

  describe("POST /api/technician-reports", () => {
    it("should allow student to submit report against a technician by ID", async () => {
      const res = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianId,
          issueType: "Unresponsive / SLA Breach",
          description:
            "Technician was assigned 4 days ago with zero status updates.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.report.status).toBe("Pending Review");
      expect(res.body.data.report.issueType).toBe("Unresponsive / SLA Breach");
    });

    it("should resolve technician by name if technicianId not provided", async () => {
      const res = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName,
          issueType: "Poor Quality Work",
          description: "Cable work was left hanging exposed.",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.report.technicianId.toString()).toBe(technicianId);
    });

    it("should return 400 when technician is not found", async () => {
      const res = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName: "NonExistent Person",
          issueType: "Other",
          description: "Testing invalid tech name",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Valid technician must be specified");
    });

    it("should reject whitespace-only or invalid technicianName with 400", async () => {
      const whitespaceRes = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName: "    ",
          issueType: "Other",
          description: "Testing whitespace name",
        });

      expect(whitespaceRes.status).toBe(400);
      expect(whitespaceRes.body.message).toContain(
        "Valid technician must be specified",
      );

      const nonStringRes = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName: 12345,
          issueType: "Other",
          description: "Testing numeric name",
        });

      expect(nonStringRes.status).toBe(400);
      expect(nonStringRes.body.message).toContain(
        "Valid technician must be specified",
      );
    });

    it("should escape regex metacharacters and treat technicianName literally", async () => {
      const res = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName: "Bob.*",
          issueType: "Other",
          description: "Attempting regex wildcard",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Valid technician must be specified");
    });

    it("should accept partial match when exactly one technician matches", async () => {
      const res = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName: "Handyman",
          issueType: "Poor Quality Work",
          description: "Cable work was loose",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.report.technicianId.toString()).toBe(technicianId);
    });

    it("should return 400 asking reporter to choose from roster when multiple technicians match partial name", async () => {
      await User.create({
        name: "Bob Electrician",
        email: "bobelectric@example.com",
        password: "password123",
        role: "technician",
        specialty: "Electrical",
      });

      const res = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianName: "Bob",
          issueType: "Unresponsive / SLA Breach",
          description: "Which Bob was it?",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message.toLowerCase()).toContain("roster");
    });
  });

  describe("GET /api/technician-reports and PATCH /api/technician-reports/:id", () => {
    it("should allow admin to list all reports and update triage status", async () => {
      const createRes = await request(app)
        .post("/api/technician-reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          technicianId,
          issueType: "Unprofessional Conduct",
          description: "Refused to assist student during lab hours.",
        });

      const reportId = createRes.body.data.report._id;

      // Admin fetches all reports
      const listRes = await request(app)
        .get("/api/technician-reports")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].technicianId.name).toBe("Bob Handyman");
      expect(listRes.body.data[0].reportedBy.rollNo).toBe("21CS045");

      // Admin updates status
      const patchRes = await request(app)
        .patch(`/api/technician-reports/${reportId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "Under Investigation",
          adminNotes: "Contacted supervisor for shift verification.",
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.report.status).toBe("Under Investigation");
      expect(patchRes.body.data.report.adminNotes).toBe(
        "Contacted supervisor for shift verification.",
      );

      // Regular student cannot patch status
      const studentPatchRes = await request(app)
        .patch(`/api/technician-reports/${reportId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ status: "Resolved" });

      expect(studentPatchRes.status).toBe(403);
    });
  });
});
