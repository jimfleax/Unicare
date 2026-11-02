import React, { useState } from "react";
import useSWR from "swr";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { api, fetcher } from "../../services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui";

const DEFAULT_ROLES = [
  { value: "student", label: "Student" },
  { value: "technician", label: "Technician" },
  { value: "admin", label: "Admin" },
  { value: "lab_admin", label: "Lab Admin" },
];

const DEFAULT_TECH_STATUSES = [
  { value: "Off Duty", label: "Off Duty" },
  { value: "On Shift", label: "On Shift" },
  { value: "In Field", label: "In Field" },
  { value: "On Call", label: "On Call" },
];

export const UserManagementPortal: React.FC = () => {
  const {
    data: usersData,
    error: usersError,
    isLoading,
    mutate,
  } = useSWR("/users", fetcher);
  const { data: rawRoles } = useSWR("/metadata/user-roles", fetcher);
  const { data: rawStatuses } = useSWR(
    "/metadata/technician-statuses",
    fetcher,
  );

  const roles =
    Array.isArray(rawRoles) && rawRoles.length > 0
      ? rawRoles
      : Array.isArray(rawRoles?.data) && rawRoles.data.length > 0
        ? rawRoles.data
        : DEFAULT_ROLES;

  const statuses =
    Array.isArray(rawStatuses) && rawStatuses.length > 0
      ? rawStatuses
      : Array.isArray(rawStatuses?.data) && rawStatuses.data.length > 0
        ? rawStatuses.data
        : DEFAULT_TECH_STATUSES;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    specialty: "",
    status: "Off Duty",
    branch: "",
    batch: "",
    rollNo: "",
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const users = Array.isArray(usersData)
    ? usersData
    : Array.isArray(usersData?.data)
      ? usersData.data
      : [];

  const filteredUsers = users.filter((u: any) => {
    const name = u.name || "";
    const email = u.email || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      filterRole !== "all"
        ? (u.role || "").toLowerCase() === filterRole.toLowerCase()
        : true;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUserId(user.id || user._id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "student",
        specialty: user.specialty || "",
        status: user.status || "Off Duty",
        branch: user.branch || "",
        batch: user.batch || "",
        rollNo: user.rollNo || "",
      });
    } else {
      setEditingUserId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
        specialty: "",
        status: "Off Duty",
        branch: "",
        batch: "",
        rollNo: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) payload.password = formData.password;

      if (formData.role === "technician") {
        payload.specialty = formData.specialty;
        payload.status = formData.status;
      } else if (formData.role === "student") {
        payload.branch = formData.branch;
        payload.batch = formData.batch;
        payload.rollNo = formData.rollNo;
      }

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
      } else {
        await api.post("/users", payload);
      }
      setIsModalOpen(false);
      mutate();
    } catch (err) {
      console.error(err);
      alert("Error saving user");
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="adm-container">
        <h1 className="adm-header">User Management</h1>

        <div className="adm-actions-row">
          <button className="adm-btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Create User
          </button>
          <div className="adm-search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ minWidth: "150px" }}>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger
                className="adm-select"
                style={{ height: "38px", minWidth: "150px" }}
              >
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r: any, idx: number) => (
                  <SelectItem
                    key={r.value || r.id || idx}
                    value={r.value || r.role || String(r.id || idx)}
                  >
                    {r.label || r.name || r.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : usersError ? (
          <p style={{ color: "var(--red, #ef4444)", padding: "16px 0" }}>
            Failed to load users: {usersError.message || "Unauthorized or network error."}
          </p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Categories/Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u: any) => {
                  const userId = u.id || u._id;
                  return (
                    <tr key={userId}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                      <td>
                        {u.role === "technician" && (
                          <span className="adm-badge badge-tech">
                            {u.specialty || u.status || "Technician"}
                          </span>
                        )}
                        {u.role === "student" && (
                          <span className="adm-badge badge-student">
                            {[u.branch, u.batch, u.rollNo].filter(Boolean).join(" · ") || u.branch || "Student"}
                          </span>
                        )}
                        {(u.role === "admin" || u.role === "lab_admin") && (
                          <span
                            className="adm-badge"
                            style={{
                              background: "rgba(99, 102, 241, 0.1)",
                              color: "#818cf8",
                            }}
                          >
                            Administrator
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="adm-btn-icon"
                                onClick={() => handleOpenModal(u)}
                                aria-label="Edit user"
                              >
                                <Edit2 size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit user</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="adm-btn-icon text-red"
                                onClick={() =>
                                  setUserToDelete({ id: userId, name: u.name })
                                }
                                aria-label="Delete user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Delete user</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* User Create/Edit Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent style={{ maxWidth: "520px" }}>
            <DialogHeader>
              <DialogTitle>
                {editingUserId ? "Edit User" : "Create User"}
              </DialogTitle>
              <DialogDescription>
                {editingUserId
                  ? "Update account details and role permissions."
                  : "Create a new user account with role permissions."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} style={{ marginTop: "16px" }}>
              <div className="adm-form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="adm-form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="adm-form-group">
                <label htmlFor="password">
                  Password {editingUserId && "(Leave empty to keep)"}
                </label>
                <input
                  id="password"
                  type="password"
                  required={!editingUserId}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="adm-form-group">
                <label htmlFor="role">Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(val) =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger id="role" style={{ width: "100%" }}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r: any, idx: number) => (
                      <SelectItem
                        key={r.value || r.id || idx}
                        value={r.value || r.role || String(r.id || idx)}
                      >
                        {r.label || r.name || r.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "technician" && (
                <>
                  <div className="adm-form-group">
                    <label htmlFor="specialty">Specialty</label>
                    <input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                    />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor="status">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) =>
                        setFormData({ ...formData, status: val })
                      }
                    >
                      <SelectTrigger id="status" style={{ width: "100%" }}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s: any, idx: number) => (
                          <SelectItem
                            key={s.value || s.id || idx}
                            value={s.value || s.status || String(s.id || idx)}
                          >
                            {s.label || s.status || s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.role === "student" && (
                <>
                  <div className="adm-form-group">
                    <label htmlFor="branch">Branch</label>
                    <input
                      id="branch"
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                    />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor="batch">Batch</label>
                    <input
                      id="batch"
                      value={formData.batch}
                      onChange={(e) =>
                        setFormData({ ...formData, batch: e.target.value })
                      }
                    />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor="rollNo">Roll No</label>
                    <input
                      id="rollNo"
                      value={formData.rollNo}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNo: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="adm-modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete User AlertDialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={(open) => {
            if (!open) setUserToDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{userToDelete?.name}</strong>? This action is permanent
                and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                style={{ background: "var(--red)", color: "#fff" }}
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};
