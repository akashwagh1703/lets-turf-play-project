import { useEffect, useState } from "react";
import * as planService from "../services/planService.js";
import { useAuth } from "../store/AuthContext";
import { Form, Row, Col, Button, Modal, Table, Badge } from "react-bootstrap";
import { DollarSign, Tag, Users, Plus, Edit, Trash2, CheckCircle } from "lucide-react";

// ---------------- Tabs ----------------
function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "Plans", label: "Subscription Plans", icon: <DollarSign size={16} /> },
    { key: "Turf Owners", label: "Owner Subscriptions", icon: <Users size={16} /> },
    { key: "Promo Codes", label: "Promo Codes", icon: <Tag size={16} /> },
  ];
  return (
    <ul className="nav custom-tabs">
      {tabs.map((tab) => (
        <li className="nav-item" key={tab.key}>
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ---------------- Plans Tab ----------------
function PlansTab({ plans, onEdit, onAdd }) {
    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Button onClick={onAdd} className="d-flex align-items-center gap-2"><Plus size={18} /> Add New Plan</Button>
            </div>
            <Row className="g-4">
                {plans.map(plan => (
                    <Col md={6} lg={4} key={plan.id}>
                        <div className="card h-100">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{plan.name}</h5>
                                <h3 className="mb-3">
                                    {plan.subscriptionFee > 0 ? `₹${plan.subscriptionFee}` : `${plan.commissionPercent}%`}
                                    <span className="fs-6 text-muted">/{plan.billingCycle}</span>
                                </h3>
                                <ul className="list-unstyled mb-4 flex-grow-1">
                                    {plan.features.map(f => <li key={f} className="d-flex align-items-center gap-2 mb-2"><CheckCircle size={16} className="text-success"/> {f}</li>)}
                                </ul>
                                <Button variant="outline-primary" onClick={() => onEdit(plan)}>Edit Plan</Button>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

// ---------------- Owners Tab ----------------
function OwnersTab({ owners, plans, onAssign }) {
    return (
        <div className="table-responsive">
            <Table className="mb-0 table-hover">
                <thead>
                    <tr>
                        <th>Owner Name</th>
                        <th>Current Plan</th>
                        <th>Status</th>
                        <th>Joined Date</th>
                        <th>Next Billing</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {owners.map(owner => {
                        const plan = plans.find(p => p.id === owner.planId);
                        return (
                            <tr key={owner.id}>
                                <td><strong>{owner.name}</strong></td>
                                <td>{plan ? plan.name : 'N/A'}</td>
                                <td><Badge bg={owner.status === 'Active' ? 'success-subtle' : 'warning-subtle'} className={owner.status === 'Active' ? 'text-success-emphasis' : 'text-warning-emphasis'}>{owner.status}</Badge></td>
                                <td>{owner.joinedDate}</td>
                                <td>{owner.nextBillingDate || 'N/A'}</td>
                                <td>
                                    <Form.Select size="sm" onChange={(e) => onAssign(owner.id, parseInt(e.target.value))} defaultValue={owner.planId}>
                                        <option>Change Plan...</option>
                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Form.Select>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </div>
    );
}

// ---------------- Promo Codes Tab ----------------
function PromoCodesTab({ codes, onEdit, onAdd }) {
    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Button onClick={onAdd} className="d-flex align-items-center gap-2"><Plus size={18} /> Add Promo Code</Button>
            </div>
            <div className="table-responsive">
                <Table className="mb-0 table-hover">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Expiry</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map(code => {
                            const isExpired = new Date(code.expiry) < new Date();
                            return (
                                <tr key={code.code}>
                                    <td><Badge bg="primary-subtle" className="text-primary-emphasis p-2 font-monospace">{code.code}</Badge></td>
                                    <td>{code.discountPercent}%</td>
                                    <td>{code.expiry}</td>
                                    <td>{code.used} / {code.maxUsage}</td>
                                    <td><Badge bg={isExpired ? 'danger-subtle' : 'success-subtle'} className={isExpired ? 'text-danger-emphasis' : 'text-success-emphasis'}>{isExpired ? 'Expired' : 'Active'}</Badge></td>
                                    <td><button className="icon-button" onClick={() => onEdit(code)}><Edit size={16} /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

// ---------------- Plan Modal ----------------
function PlanModal({ show, handleClose, onSave, plan }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(plan || { name: '', commissionPercent: 0, subscriptionFee: 0, billingCycle: 'Monthly', features: [] });
    }, [plan]);

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({...formData, features: newFeatures});
    }

    const addFeature = () => setFormData({...formData, features: [...formData.features, '']});
    const removeFeature = (index) => setFormData({...formData, features: formData.features.filter((_, i) => i !== index)});
    
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton><Modal.Title>{plan ? 'Edit Plan' : 'Add New Plan'}</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3"><Form.Label>Plan Name</Form.Label><Form.Control value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></Form.Group>
                    <Row>
                        <Col><Form.Group className="mb-3"><Form.Label>Subscription Fee (₹)</Form.Label><Form.Control type="number" value={formData.subscriptionFee || 0} onChange={e => setFormData({...formData, subscriptionFee: Number(e.target.value)})} /></Form.Group></Col>
                        <Col><Form.Group className="mb-3"><Form.Label>Commission (%)</Form.Label><Form.Control type="number" value={formData.commissionPercent || 0} onChange={e => setFormData({...formData, commissionPercent: Number(e.target.value)})} /></Form.Group></Col>
                    </Row>
                    <Form.Group className="mb-3"><Form.Label>Billing Cycle</Form.Label><Form.Select value={formData.billingCycle} onChange={e => setFormData({...formData, billingCycle: e.target.value})}><option>Per Booking</option><option>Monthly</option><option>Yearly</option></Form.Select></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Features</Form.Label>
                        {formData.features?.map((f, i) => (
                            <div key={i} className="d-flex gap-2 mb-2">
                                <Form.Control value={f} onChange={e => handleFeatureChange(i, e.target.value)} />
                                <Button variant="danger" onClick={() => removeFeature(i)}><Trash2 size={16} /></Button>
                            </div>
                        ))}
                        <Button variant="outline-secondary" size="sm" onClick={addFeature}>Add Feature</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={() => onSave(formData)}>Save Plan</Button>
            </Modal.Footer>
        </Modal>
    );
}


// ---------------- Main RevenuePlans ----------------
export default function RevenuePlans() {
  const { user } = useAuth();
  const role = user?.role.toLowerCase();
  const [plans, setPlans] = useState([]);
  const [turfOwners, setTurfOwners] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeTab, setActiveTab] = useState("Plans");
  const [loading, setLoading] = useState(true);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // States for promo code modal would be similar
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [allPlans, owners, codes] = await Promise.all([
        planService.listPlans(),
        role === "admin" ? planService.listTurfOwners() : [],
        planService.listPromoCodes(),
      ]);
      setPlans(allPlans);
      setTurfOwners(owners);
      setPromoCodes(codes);
      setLoading(false);
    }
    fetchData();
  }, [role, user]);

  const handleOpenPlanModal = (plan = null) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  }
  
  const handleSavePlan = async (plan) => {
    await planService.savePlan(plan);
    const updatedPlans = await planService.listPlans();
    setPlans(updatedPlans);
    setShowPlanModal(false);
  }

  const handleAssignPlan = async (ownerId, planId) => {
    await planService.assignPlan(ownerId, planId);
    const updatedOwners = await planService.listTurfOwners();
    setTurfOwners(updatedOwners);
    alert('Plan assigned successfully!');
  }

  const renderContent = () => {
    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    switch(activeTab) {
        case "Plans": return <PlansTab plans={plans} onEdit={handleOpenPlanModal} onAdd={() => handleOpenPlanModal()} />;
        case "Turf Owners": 
            return role === 'admin' ? <OwnersTab owners={turfOwners} plans={plans} onAssign={handleAssignPlan} /> : <p>This section is for Admins only.</p>;
        case "Promo Codes": return <PromoCodesTab codes={promoCodes} onEdit={() => {}} onAdd={() => {}} />;
        default: return null;
    }
  }

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <h3>Revenue & Plan Management</h3>
        <p className="text-muted">Manage pricing models, subscriptions, and promotional codes.</p>
      </div>

      {role === 'admin' && <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />}

      <div className="card">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>

      {showPlanModal && (
        <PlanModal 
            show={showPlanModal} 
            handleClose={() => setShowPlanModal(false)}
            onSave={handleSavePlan}
            plan={editingPlan}
        />
      )}
    </div>
  );
}
