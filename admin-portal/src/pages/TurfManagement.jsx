import React, { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { Plus } from "lucide-react";
import TurfTable from "../components/turfs/TurfTable";
import TurfForm from "../components/turfs/TurfForm";
import {
  getTurfs,
  addTurf,
  updateTurf,
  toggleStatus,
  approveTurf,
} from "../services/turfService";
import { useAuth } from "../store/AuthContext";

const TurfManagement = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getTurfs(user).then(setTurfs);
  }, [user]);

  const handleSave = async (turf) => {
    if (turf.id) {
      const updated = await updateTurf(turf.id, turf);
      setTurfs(turfs.map((t) => (t.id === turf.id ? updated : t)));
    } else {
      const added = await addTurf(turf);
      setTurfs([...turfs, added]);
    }
    setShowForm(false);
    setSelectedTurf(null);
  };

  const handleToggle = async (id, status) => {
    await toggleStatus(id, status);
    setTurfs(turfs.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleApprove = async (id, approved) => {
    await approveTurf(id, approved);
    setTurfs(turfs.map((t) => (t.id === id ? { ...t, approved } : t)));
  };

  const handleOpenForm = (turf = null) => {
    setSelectedTurf(turf);
    setShowForm(true);
  };

  return (
    <Container fluid className="p-0">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h3>Turf Management</h3>
          <p className="text-muted">Add, edit, and manage all turfs in the system.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="d-flex align-items-center gap-2">
          <Plus size={18} /> Add Turf
        </Button>
      </div>
      
      <div className="card">
        <div className="card-body p-0">
          <TurfTable
            turfs={turfs}
            onEdit={handleOpenForm}
            onToggle={handleToggle}
            onApprove={handleApprove}
          />
        </div>
      </div>

      <TurfForm
        show={showForm}
        handleClose={() => {
          setShowForm(false);
          setSelectedTurf(null);
        }}
        onSave={handleSave}
        turf={selectedTurf}
      />
    </Container>
  );
};

export default TurfManagement;
