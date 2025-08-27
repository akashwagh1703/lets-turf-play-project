import React, { useEffect, useState } from "react";
import { Container, Table, Button, Form, Modal, Row, Col } from "react-bootstrap";
import { getTurfs } from "../services/turfService";
import {
  getAvailability,
  updateAvailability,
  toggleSlot,
} from "../services/availabilityService";
import { useAuth } from "../store/AuthContext";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AvailabilityManagement() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [slotData, setSlotData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const turfData = await getTurfs(user);
      setTurfs(turfData);
    }
    fetchData();
  }, [user]);

  const handleSelectTurf = async (turf) => {
    setSelectedTurf(turf);
    const data = await getAvailability(turf.id);
    setSlots(data);
  };

  const openModal = (slot = null) => {
    setSlotData(slot || {
      date: "",
      time: "",
      pricePerHour: selectedTurf?.pricePerHour.weekdays || 0,
      minBookingHours: 1,
      status: "available",
    });
    setShowModal(true);
  };

  const handleSaveSlot = async () => {
    const updated = await updateAvailability(selectedTurf.id, slotData);
    setSlots((prev) => {
      const index = prev.findIndex(
        (s) => s.date === updated.date && s.time === updated.time
      );
      if (index >= 0) prev[index] = updated;
      else prev.push(updated);
      return [...prev];
    });
    setShowModal(false);
  };

  const handleToggleSlot = async (slot) => {
    const newStatus = slot.status === "available" ? "blocked" : "available";
    const updated = await toggleSlot(
      selectedTurf.id,
      slot.date,
      slot.time,
      newStatus
    );
    setSlots(
      slots.map((s) =>
        s.date === updated.date && s.time === updated.time ? updated : s
      )
    );
  };

  return (
    <Container fluid className="p-0">
      <div className="page-header">
        <h3>Availability & Pricing</h3>
        <p className="text-muted">Manage time slots and pricing for each turf.</p>
      </div>

      <Form.Select
        className="w-auto mb-3"
        onChange={(e) =>
          handleSelectTurf(turfs.find((t) => t.id === parseInt(e.target.value)))
        }
      >
        <option>Select a Turf to manage...</option>
        {turfs.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Form.Select>

      {selectedTurf && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>{selectedTurf.name} Slots</strong>
            <Button onClick={() => openModal()} className="d-flex align-items-center gap-2">
              <Plus size={18} /> Add Slot
            </Button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <Table className="mb-0 table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Price/Hour (₹)</th>
                    <th>Min Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{s.date}</td>
                      <td>{s.time}</td>
                      <td>{s.pricePerHour}</td>
                      <td>{s.minBookingHours}</td>
                      <td>
                        <span className={`badge ${s.status === 'available' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <Button variant={s.status === "available" ? "warning" : "success"} size="sm" onClick={() => handleToggleSlot(s)}>
                          {s.status === "available" ? "Block" : "Unblock"}
                        </Button>
                        <button className="icon-button" onClick={() => openModal(s)}><Edit size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {slotData && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{slotData.id ? 'Edit Slot' : 'Add New Slot'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" value={slotData.date} onChange={(e) => setSlotData({ ...slotData, date: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Time (HH:MM-HH:MM)</Form.Label>
                    <Form.Control type="text" value={slotData.time} onChange={(e) => setSlotData({ ...slotData, time: e.target.value })} placeholder="e.g., 18:00-20:00" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Price per Hour (₹)</Form.Label>
                    <Form.Control type="number" value={slotData.pricePerHour} onChange={(e) => setSlotData({ ...slotData, pricePerHour: parseInt(e.target.value) })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Min Booking Hours</Form.Label>
                    <Form.Control type="number" value={slotData.minBookingHours} onChange={(e) => setSlotData({ ...slotData, minBookingHours: parseInt(e.target.value) })} />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSlot}>
              Save Slot
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}
