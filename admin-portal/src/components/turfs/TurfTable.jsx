import React from "react";
import { Table, Form } from "react-bootstrap";
import { Edit, CheckCircle, XCircle } from "lucide-react";

const TurfTable = ({ turfs, onEdit, onToggle, onApprove }) => {
  return (
    <div className="table-responsive">
      <Table className="mb-0 table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Location</th>
            <th>Price (₹/hr)</th>
            <th>Status</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {turfs.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td><strong>{t.name}</strong></td>
              <td>{`${t.location.city}, ${t.location.state}`}</td>
              <td>{`W/D: ₹${t.pricePerHour.weekdays}, W/E: ₹${t.pricePerHour.weekends}`}</td>
              <td>
                <Form.Check
                  type="switch"
                  id={`status-${t.id}`}
                  checked={t.status === "active"}
                  onChange={() =>
                    onToggle(t.id, t.status === "active" ? "inactive" : "active")
                  }
                />
              </td>
              <td>
                <Form.Check
                  type="switch"
                  id={`approve-${t.id}`}
                  checked={t.approved}
                  onChange={() => onApprove(t.id, !t.approved)}
                />
              </td>
              <td>
                <button className="icon-button" onClick={() => onEdit(t)}>
                  <Edit size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TurfTable;
