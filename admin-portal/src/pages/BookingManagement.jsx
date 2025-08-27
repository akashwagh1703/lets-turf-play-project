import React, { useEffect, useState } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useAuth } from "../store/AuthContext";
import { getBookings, updateBookingStatus } from "../services/bookingService";
import { getTurfs } from "../services/turfService";

export default function BookingManagement() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [turfs, setTurfs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const turfData = await getTurfs(user);
      setTurfs(turfData);
      const bookingData = await getBookings(user, turfData);
      setBookings(bookingData);
    }
    fetchData();
  }, [user]);

  const handleStatusChange = async (id, status) => {
    const updated = await updateBookingStatus(id, status);
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
    );
  };

  return (
    <Container fluid className="p-0">
      <div className="page-header">
        <h3>Booking Management</h3>
        <p className="text-muted">View and manage all turf bookings.</p>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <Table className="mb-0 table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Turf</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  {user.role.toLowerCase() !== "staff" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td><strong>{b.customer}</strong></td>
                    <td>{b.turf}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (b.status === "Confirmed"
                            ? "bg-success-subtle text-success-emphasis"
                            : b.status === "Pending"
                            ? "bg-warning-subtle text-warning-emphasis"
                            : "bg-danger-subtle text-danger-emphasis")
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                    {user.role.toLowerCase() !== "staff" && (
                      <td>
                        <Form.Select
                          size="sm"
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        >
                          <option>Confirmed</option>
                          <option>Pending</option>
                          <option>Cancelled</option>
                        </Form.Select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </Container>
  );
}
