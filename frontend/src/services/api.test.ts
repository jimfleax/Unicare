import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkHealthApi } from "./api";

describe("checkHealthApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when the API responds with success: true", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "System healthy" }),
    });

    const result = await checkHealthApi();
    expect(result).toBe(true);
  });

  it("should return false when the API responds with success: false", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: "System error" }),
    });

    const result = await checkHealthApi();
    expect(result).toBe(false);
  });

  it("should return false when the API response is not ok", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const result = await checkHealthApi();
    expect(result).toBe(false);
  });

  it("should return false on network error", async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const result = await checkHealthApi();
    expect(result).toBe(false);
  });
});

import { createRequisitionApi } from "./api";

describe("createRequisitionApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
    // Mock getAuthHeaders internals or let it run (it uses localStorage)
    // Actually getStoredToken reads localStorage. Mocking fetch is usually enough.
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when requisition is created successfully", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const payload = {
      inventoryId: "inv-123",
      technicianId: "tech-123",
      quantityRequested: 2,
      reason: "Need parts",
    };

    const result = await createRequisitionApi(payload);
    expect(result).toBe(true);

    // Check if fetch was called correctly
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/requisitions"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("should return false when API responds with an error", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const result = await createRequisitionApi({
      inventoryId: "inv-123",
      technicianId: "tech-123",
      quantityRequested: 2,
    });
    expect(result).toBe(false);
  });

  it("should return false on network error", async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const result = await createRequisitionApi({
      inventoryId: "inv-123",
      technicianId: "tech-123",
      quantityRequested: 2,
    });
    expect(result).toBe(false);
  });
});

import {
  createAssetApi,
  updateAssetApi,
  deleteAssetApi,
  createInventoryApi,
  updateInventoryApi,
  deleteInventoryApi,
} from "./api";

describe("Asset & Inventory CRUD API wrappers", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Assets
  it("createAssetApi should return true on ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await createAssetApi({ name: "Asset" });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/assets"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("updateAssetApi should return true on ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await updateAssetApi("TAG-123", { name: "Updated" });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/assets/TAG-123"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("deleteAssetApi should return true on ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await deleteAssetApi("TAG-123");
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/assets/TAG-123"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  // Inventory
  it("createInventoryApi should return true on ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await createInventoryApi({ name: "Part" });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/inventory"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("updateInventoryApi should return true on ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await updateInventoryApi("id-123", { name: "Updated" });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/inventory/id-123"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("deleteInventoryApi should return true on ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await deleteInventoryApi("id-123");
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/inventory/id-123"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

import { fetchPrioritiesApi, fetchLocationsApi } from "./api";

describe("fetchPrioritiesApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return array of {value, label, color} objects for priorities", async () => {
    const mockPriorities = [
      { value: "Critical", label: "Critical", color: "var(--red)" },
      { value: "High", label: "High", color: "var(--amber-border)" },
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockPriorities }),
    });

    const result = await fetchPrioritiesApi();
    expect(result).toEqual(mockPriorities);
    expect(result[0]).toHaveProperty("value");
    expect(result[0]).toHaveProperty("label");
    expect(result[0]).toHaveProperty("color");
  });

  it("should throw when the API call fails", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchPrioritiesApi()).rejects.toThrow();
  });
});

describe("fetchLocationsApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return array of {value, label, color} objects for locations", async () => {
    const mockLocations = [
      { value: "Main Library", label: "Main Library", color: "var(--red)" },
      { value: "Science Block", label: "Science Block", color: "#3b82f6" },
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockLocations }),
    });

    const result = await fetchLocationsApi();
    expect(result).toEqual(mockLocations);
    expect(result[0]).toHaveProperty("value");
    expect(result[0]).toHaveProperty("label");
    expect(result[0]).toHaveProperty("color");
  });

  it("should throw when the API call fails", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchLocationsApi()).rejects.toThrow();
  });
});

import { subscribeToPushNotificationsApi } from "./api";

describe("subscribeToPushNotificationsApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when push subscription is successful", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    const fakeSubscription = {
      endpoint: "https://fcm.googleapis.com/fcm/send/fake-endpoint",
    } as unknown as PushSubscription;
    const result = await subscribeToPushNotificationsApi(fakeSubscription);

    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/subscribe"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(fakeSubscription),
      }),
    );
  });

  it("should return false when API responds with an error", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    const fakeSubscription = {
      endpoint: "fake",
    } as unknown as PushSubscription;
    const result = await subscribeToPushNotificationsApi(fakeSubscription);

    expect(result).toBe(false);
  });

  it("should return false on network error", async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const fakeSubscription = {
      endpoint: "fake",
    } as unknown as PushSubscription;
    const result = await subscribeToPushNotificationsApi(fakeSubscription);

    expect(result).toBe(false);
  });
});

import {
  uploadImageApi,
  updateMyAvatarApi,
  fetchAlertsApi,
  createAlertApi,
  deleteAlertApi,
  submitTechnicianReportApi,
  fetchTechnicianReportsApi,
  updateTechnicianReportStatusApi,
} from "./api";

describe("uploadImageApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should upload image and return formatted url when response is relative", async () => {
    const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { url: "/uploads/incidents/test.png" },
      }),
    });

    const result = await uploadImageApi(fakeFile, "incidents");
    expect(result).toMatch(
      /http:\/\/localhost:5000\/uploads\/incidents\/test\.png/,
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/upload"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("should return absolute url directly when already starting with http", async () => {
    const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        },
      }),
    });

    const result = await uploadImageApi(fakeFile, "incidents");
    expect(result).toBe(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    );
  });

  it("should return null when upload response is not ok", async () => {
    const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    const result = await uploadImageApi(fakeFile);
    expect(result).toBeNull();
  });

  it("should return null on network error", async () => {
    const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });
    (globalThis.fetch as any).mockRejectedValueOnce(
      new Error("Network failure"),
    );

    const result = await uploadImageApi(fakeFile);
    expect(result).toBeNull();
  });
});

describe("updateMyAvatarApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when avatar is updated successfully", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    const result = await updateMyAvatarApi("/uploads/avatars/new.png");
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/me/avatar"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ avatarUrl: "/uploads/avatars/new.png" }),
      }),
    );
  });

  it("should return false when avatar update returns non-ok response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    const result = await updateMyAvatarApi("/uploads/avatars/new.png");
    expect(result).toBe(false);
  });

  it("should return false on network error", async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const result = await updateMyAvatarApi("/uploads/avatars/new.png");
    expect(result).toBe(false);
  });
});

describe("fetchAlertsApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return array of alerts when response is successful", async () => {
    const mockAlerts = [
      {
        _id: "1",
        title: "Power outage",
        loc: "Lab A",
        date: "Today",
        type: "alert",
      },
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockAlerts }),
    });

    const result = await fetchAlertsApi();
    expect(result).toEqual(mockAlerts);
  });

  it("should return empty array when response is not ok or error thrown", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    const result = await fetchAlertsApi();
    expect(result).toEqual([]);
  });
});

describe("createAlertApi and deleteAlertApi", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("createAlertApi should post alert and return true on success", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    const result = await createAlertApi({
      title: "Scheduled drill",
      loc: "Building B",
    });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/alerts"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Scheduled drill", loc: "Building B" }),
      }),
    );
  });

  it("deleteAlertApi should delete alert and return true on success", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    const result = await deleteAlertApi("alert123");
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/alerts/alert123"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

describe("Technician Reports API", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submitTechnicianReportApi should post payload and return true on success", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    const payload = {
      technicianId: "tech123",
      issueType: "Unresponsive / SLA Breach",
      description: "Did not respond within 48h",
    };
    const result = await submitTechnicianReportApi(payload);
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/technician-reports"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("fetchTechnicianReportsApi should return reports array", async () => {
    const mockReports = [
      {
        _id: "r1",
        issueType: "Poor Quality Work",
        description: "Loose wiring",
      },
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockReports }),
    });

    const result = await fetchTechnicianReportsApi();
    expect(result).toEqual(mockReports);
  });

  it("updateTechnicianReportStatusApi should patch status and return true", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    const result = await updateTechnicianReportStatusApi(
      "r1",
      "Resolved",
      "Issue handled",
    );
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/technician-reports/r1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          status: "Resolved",
          adminNotes: "Issue handled",
        }),
      }),
    );
  });
});
