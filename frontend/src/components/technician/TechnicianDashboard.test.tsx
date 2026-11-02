import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TechnicianDashboard } from "./TechnicianDashboard";
import type { IssueRecord } from "../../types";
import * as api from "../../services/api";
import useSWR from "swr";
import * as authContext from "../../context/AuthContext";

// Mock dependencies
vi.mock("swr");
vi.mock("../../services/api", async () => {
  const actual = await vi.importActual("../../services/api");
  return {
    ...actual,
    createRequisitionApi: vi.fn(),
    updateTechnicianStatusApi: vi.fn(),
    addRepairLogApi: vi.fn(),
  };
});
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("TechnicianDashboard", () => {
  const mockTechnicians = [
    {
      id: "tech-1",
      name: "John Doe",
      title: "Senior Tech",
      status: "On Shift",
    },
    {
      id: "tech-2",
      name: "Jane Smith",
      title: "Junior Tech",
      status: "Off Duty",
    },
  ];

  const mockParts = [
    {
      id: "part-1",
      name: "Motherboard",
      stock: 5,
      unit: "pcs",
      category: "Hardware",
      status: "In Stock",
    },
  ];

  const mutateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup useSWR mock
    (useSWR as any).mockImplementation((key: string) => {
      if (key === "/users/technicians") {
        return { data: mockTechnicians, mutate: mutateMock };
      }
      if (key === "/inventory") {
        return { data: mockParts, mutate: mutateMock };
      }
      return { data: [], mutate: mutateMock };
    });

    (authContext.useAuth as any).mockReturnValue({
      user: { _id: "tech-1", name: "John Doe", role: "technician" },
    });
  });

  describe("Requisition Modal", () => {
    it("should render the Requisition Modal and submit successfully", async () => {
      // Mock the API response
      (api.createRequisitionApi as any).mockResolvedValueOnce(true);

      // Mock window.alert
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(
        <TechnicianDashboard
          records={[]}
          onStatusChange={vi.fn()}
          onSelectIssue={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      // Switch to SPARE PARTS tab
      const partsTab = screen.getByText(/SPARE PARTS/i);
      fireEvent.click(partsTab);

      // Ensure the part is rendered
      expect(screen.getByText("Motherboard")).toBeDefined();

      // Click 'Requisition Item' button
      const reqButton = screen.getByText("Requisition Item");
      fireEvent.click(reqButton);

      // Verify modal is open by checking for its header or content
      expect(screen.getByText("Request Motherboard")).toBeDefined();

      // Fill in the form
      const qtyInput = screen.getByLabelText(/Quantity Needed/i);
      const reasonInput = screen.getByLabelText(/Reason \/ Justification/i);

      fireEvent.change(qtyInput, { target: { value: "2" } });
      fireEvent.change(reasonInput, {
        target: { value: "Need replacement for server room" },
      });

      // Submit the form
      const submitBtn = screen.getByRole("button", { name: /Submit Request/i });
      fireEvent.click(submitBtn);

      // Verify API call
      await waitFor(() => {
        expect(api.createRequisitionApi).toHaveBeenCalledWith({
          inventoryId: "part-1",
          technicianId: "tech-1",
          quantityRequested: 2,
          reason: "Need replacement for server room",
        });
      });

      // Verify alert and modal close behavior
      expect(alertMock).toHaveBeenCalledWith(
        "Requisition for Motherboard submitted successfully.",
      );
      expect(screen.queryByText("Request Motherboard")).toBeNull();
    });

    it("should show failure alert when API fails", async () => {
      (api.createRequisitionApi as any).mockResolvedValueOnce(false);
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(
        <TechnicianDashboard
          records={[]}
          onStatusChange={vi.fn()}
          onSelectIssue={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText(/SPARE PARTS/i));
      fireEvent.click(screen.getByText("Requisition Item"));

      fireEvent.change(screen.getByLabelText(/Quantity Needed/i), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Reason \/ Justification/i), {
        target: { value: "Testing failure" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Submit Request/i }));

      await waitFor(() => {
        expect(api.createRequisitionApi).toHaveBeenCalled();
        expect(alertMock).toHaveBeenCalledWith(
          "Failed to submit requisition. Please try again.",
        );
      });
    });
  });

  describe("Isolation & Status Updates", () => {
    it("should update the logged-in technician status", async () => {
      (api.updateTechnicianStatusApi as any).mockResolvedValueOnce(true);

      render(
        <TechnicianDashboard
          records={[]}
          onStatusChange={vi.fn()}
          onSelectIssue={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      // Should find the status dropdown
      const statusSelect = screen.getByRole("combobox") as HTMLSelectElement;
      expect(statusSelect.value).toBe("On Shift"); // User tech-1 has status 'On Shift'

      // Change status to 'Off Duty'
      fireEvent.change(statusSelect, { target: { value: "Off Duty" } });

      await waitFor(() => {
        expect(api.updateTechnicianStatusApi).toHaveBeenCalledWith("Off Duty");
        expect(mutateMock).toHaveBeenCalled();
      });
    });

    it("should not allow selecting a different technician in roster (inspect queue sets search filter instead)", async () => {
      render(
        <TechnicianDashboard
          records={[]}
          onStatusChange={vi.fn()}
          onSelectIssue={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      // Click Roster tab
      const rosterTab = screen.getByText(/On-Duty Technician Roster/i);
      fireEvent.click(rosterTab);

      // Click 'Inspect Jane Smith's Queue'
      const inspectBtn = screen.getByText(/Inspect Jane Smith's Queue/i);
      fireEvent.click(inspectBtn);

      // Verify the search box gets filled (the search box should have value "Jane Smith")
      const searchBox = screen.getByPlaceholderText(
        /Search ticket title, assigned tech/i,
      ) as HTMLInputElement;
      expect(searchBox.value).toBe("Jane Smith");
    });
  });

  describe("Work Log & Resolution Workflows", () => {
    const mockIssue: IssueRecord = {
      id: "issue-123",
      title: "Broken Projector in Hall B",
      location: "Hall B",
      priority: "High",
      status: "In Progress",
      assignee: "John Doe",
      reporter: "Jane Student",
      date: "2026-11-02",
      description: "Lamp does not turn on",
    };

    it("should open Work Log modal and submit log", async () => {
      (api.addRepairLogApi as any).mockResolvedValueOnce(true);
      const onRefresh = vi.fn();

      render(
        <TechnicianDashboard
          records={[mockIssue]}
          onStatusChange={vi.fn()}
          onSelectIssue={vi.fn()}
          onRefresh={onRefresh}
        />,
      );

      // Click Work Log button on ticket card
      const workLogBtn = screen.getByRole("button", { name: /Work Log/i });
      fireEvent.click(workLogBtn);

      // Verify modal is displayed
      expect(screen.getByText(/POST WORK LOG/i)).toBeDefined();

      // Fill in diagnostic update
      const textarea = screen.getByPlaceholderText(
        /Describe repair steps, replaced parts, or testing completed.../i,
      );
      fireEvent.change(textarea, {
        target: { value: "Replaced blown bulb with spare" },
      });

      // Submit form
      const saveBtn = screen.getByRole("button", { name: /Save Work Log/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(api.addRepairLogApi).toHaveBeenCalledWith(
          "issue-123",
          "Replaced blown bulb with spare",
        );
        expect(onRefresh).toHaveBeenCalled();
      });
      expect(screen.queryByText(/POST WORK LOG/i)).toBeNull();
    });

    it("should open Resolution modal on Mark Resolved and submit with resolution note", async () => {
      (api.addRepairLogApi as any).mockResolvedValueOnce(true);
      const onStatusChange = vi.fn();
      const onRefresh = vi.fn();

      render(
        <TechnicianDashboard
          records={[mockIssue]}
          onStatusChange={onStatusChange}
          onSelectIssue={vi.fn()}
          onRefresh={onRefresh}
        />,
      );

      // Click Mark Resolved button
      const resolveBtn = screen.getByRole("button", { name: /Mark Resolved/i });
      fireEvent.click(resolveBtn);

      // Verify resolution confirmation modal is displayed
      expect(screen.getByText(/CONFIRM RESOLUTION/i)).toBeDefined();

      // Enter optional resolution summary
      const noteInput = screen.getByPlaceholderText(
        /Describe what was done to fix this issue/i,
      );
      fireEvent.change(noteInput, {
        target: { value: "Replaced lamp bulb and calibrated color" },
      });

      // Click confirm button
      const confirmBtn = screen.getByRole("button", {
        name: /Confirm & Mark Resolved/i,
      });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(api.addRepairLogApi).toHaveBeenCalledWith(
          "issue-123",
          "Resolved: Replaced lamp bulb and calibrated color",
        );
        expect(onStatusChange).toHaveBeenCalledWith("issue-123", "Resolved");
        expect(onRefresh).toHaveBeenCalled();
      });
      expect(screen.queryByText(/CONFIRM RESOLUTION/i)).toBeNull();
    });
  });
});
