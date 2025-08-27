import { useEffect, useState } from "react";
import * as userService from "../services/userService.js";
import { Plus, Edit, ToggleLeft, ToggleRight, KeyRound, Activity } from "lucide-react";
import { Modal, Form, Row, Col, Button } from "react-bootstrap";

// Users Table Component
function UsersTable({ users, onEdit, toggleStatus, resetPassword }) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table mb-0 align-middle table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">{u.role}</span>
                </td>
                <td>
                  {u.status === "Active" ? (
                    <span className="badge bg-success-subtle text-success-emphasis rounded-pill">Active</span>
                  ) : (
                    <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">Inactive</span>
                  )}
                </td>
                <td>
                  <button className="icon-button" title="Edit" onClick={() => onEdit(u)}>
                    <Edit size={16} />
                  </button>
                  <button className="icon-button" title={u.status === "Active" ? "Deactivate" : "Activate"} onClick={() => toggleStatus(u.id)}>
                    {u.status === "Active" ? <ToggleRight size={16} className="text-success" /> : <ToggleLeft size={16} />}
                  </button>
                  <button className="icon-button" title="Reset Password" onClick={() => resetPassword(u.id)}>
                    <KeyRound size={16} />
                  </button>
                  <button className="icon-button" title="Activity Logs">
                    <Activity size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserModal({ show, handleClose, user, setUser, onSave }) {
  if(!show || !user) return null;
  
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {user?.id ? "Edit User" : "Create New User"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control type="text" placeholder="John Doe" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" placeholder="john.doe@example.com" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control type="text" placeholder="+1 234 567 890" value={user.phone || ''} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave}>
          {user?.id ? "Update User" : "Create User"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Main Users Component
export default function Users() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    userService.listUsers().then(u => {
        const transformedUsers = u.map(user => ({
            ...user,
            role: user.role.split(' ').find(r => ['Admin', 'Manager', 'Staff'].includes(r)) || 'Staff'
        }));
        setUsers(transformedUsers);
    });
  }, []);

  const filteredUsers =
    filterRole === "All" ? users : users.filter((u) => u.role === filterRole);

  const openForm = (user = null) => {
    setEditingUser(user || { name: "", email: "", role: "Manager", phone: "" });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (editingUser.id) {
      userService.updateUser(editingUser.id, editingUser).then((updated) => {
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
        handleCloseForm();
      });
    } else {
      userService.createUser(editingUser).then((newU) => {
        setUsers([...users, newU]);
        handleCloseForm();
      });
    }
  };

  const toggleStatus = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    userService.updateUser(id, { status: newStatus }).then((updated) => {
      setUsers(users.map((u) => (u.id === id ? updated : u)));
    });
  };

  const resetPassword = (id) => {
    userService.resetPassword(id).then((res) => alert(res.message));
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h3>Users Management</h3>
          <p className="text-muted">Manage all users, roles, and permissions.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openForm()}>
          <Plus size={18} /> New User
        </button>
      </div>

      <div className="d-flex justify-content-start mb-3">
        <select
            className="form-select w-auto"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
        >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
        </select>
      </div>

      <UsersTable
        users={filteredUsers}
        onEdit={openForm}
        toggleStatus={toggleStatus}
        resetPassword={resetPassword}
      />

      <UserModal
        show={showForm}
        handleClose={handleCloseForm}
        user={editingUser}
        setUser={setEditingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
