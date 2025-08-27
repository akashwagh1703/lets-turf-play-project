import { useEffect, useState } from "react";
import * as bookingService from "../services/bookingService.js";

// Filter Component
function BookingFilters({ filters, setFilters, turfs }) {
  return (
    <div className="mb-3 d-flex gap-2 flex-wrap">
      <input
        type="text"
        className="form-control w-auto"
        placeholder="Search by player/customer"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      <select
        className="form-select w-auto"
        value={filters.turf}
        onChange={(e) => setFilters({ ...filters, turf: e.target.value })}
      >
        <option value="">All Turfs</option>
        {turfs.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        className="form-control w-auto"
        value={filters.date}
        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
      />
      <select
        className="form-select w-auto"
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">All Status</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Pending">Pending</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );
}

// Transaction Log Modal
function TransactionModal({ show, onClose, booking }) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Transactions for Booking #{booking.id}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {booking.transactions?.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.transactions.map((t, idx) => (
                    <tr key={t.id}>
                      <td>{idx + 1}</td>
                      <td>{t.date}</td>
                      <td>{t.amount}</td>
                      <td>{t.type}</td>
                      <td>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No transactions found.</p>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Bookings Component
export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    turf: "",
    date: "",
    status: "",
  });
  const [turfs, setTurfs] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    bookingService.listBookings().then((data) => {
      setBookings(data);
      const uniqueTurfs = [...new Set(data.map((b) => b.turf))].map(
        (name, i) => ({ id: i, name })
      );
      setTurfs(uniqueTurfs);
    });
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.customer
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesTurf = !filters.turf || b.turf === filters.turf;
    const matchesDate = !filters.date || b.date === filters.date;
    const matchesStatus = !filters.status || b.status === filters.status;
    return matchesSearch && matchesTurf && matchesDate && matchesStatus;
  });

  const handleRefund = (booking) => {
    if (window.confirm(`Initiate refund for booking #${booking.id}?`)) {
      bookingService.refundBooking(booking.id).then((res) => {
        alert(res.message);
        // Refresh bookings
        bookingService.listBookings().then(setBookings);
      });
    }
  };

  return (
    <div className="container-fluid">
      <h5 className="mb-3">Booking & Transaction Management</h5>
      <p className="text-muted">
        A comprehensive log of all bookings and financial transactions. Ensures
        financial transparency and enables auditing.
      </p>

      <BookingFilters filters={filters} setFilters={setFilters} turfs={turfs} />

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Turf</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.customer}</td>
                  <td>{b.turf}</td>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>
                    <span
                      className={
                        "badge bg-" +
                        (b.status === "Confirmed"
                          ? "success"
                          : b.status === "Pending"
                          ? "warning text-dark"
                          : "secondary")
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => setSelectedBooking(b)}
                    >
                      Transactions
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRefund(b)}
                    >
                      Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedBooking && (
        <TransactionModal
          show={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}
