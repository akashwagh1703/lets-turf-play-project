import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Table, Row, Col } from "react-bootstrap";
import { roleService } from "../services/roleService";
import { Plus } from "lucide-react";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", permissions: [] });

  useEffect(() => {
    roleService.getRoles().then(setRoles);
    roleService.getPermissions().then(setPermissions);
  }, []);

  const handleSave = () => {
    roleService.addRole(form).then((newRole) => {
      setRoles([...roles, newRole]);
      setShowModal(false);
      setForm({ name: "", permissions: [] });
    });
  };

  const handlePermissionChange = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h3>Role & Permission Management</h3>
          <p className="text-muted">Define user roles and their access levels.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
            <Plus size={18} /> Add Role
        </Button>
      </div>

      <div className="card">
        <div className="card-body p-0">
            <div className="table-responsive">
                <Table className="mb-0 table-hover">
                    <thead>
                    <tr>
                        <th>Role</th>
                        <th>Permissions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roles.map((r) => (
                        <tr key={r.id}>
                        <td><strong>{r.name}</strong></td>
                        <td>
                            <div className="d-flex flex-wrap gap-2">
                                {r.permissions.map(p => (
                                    <span key={p} className="badge bg-primary-subtle text-primary-emphasis">{p}</span>
                                ))}
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Content Editor"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Permissions</Form.Label>
              <Row>
                {permissions.map((perm) => (
                  <Col md={6} key={perm}>
                    <Form.Check
                      type="switch"
                      id={`perm-${perm}`}
                      label={perm}
                      checked={form.permissions.includes(perm)}
                      onChange={() => handlePermissionChange(perm)}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Role
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
