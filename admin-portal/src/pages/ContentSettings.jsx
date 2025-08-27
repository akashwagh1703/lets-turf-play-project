import { useEffect, useState } from "react";
import * as settingsService from "../services/settingsService.js";
import { Form, Row, Col, Button, InputGroup, ListGroup } from "react-bootstrap";
import { Save, Trash2 } from "lucide-react";

// ---------------- Tabs ----------------
function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    "Pages", "Notifications", "Payment Gateway", "Global Settings", 
    "Announcements", "SEO & Features", "Role Permissions",
  ];
  return (
    <ul className="nav custom-tabs">
      {tabs.map((tab) => (
        <li className="nav-item" key={tab}>
          <button
            className={`nav-link ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ---------------- Page Editor ----------------
function PageEditor({ data, onSave }) {
  const [selectedPage, setSelectedPage] = useState(Object.keys(data)[0] || "");
  const [content, setContent] = useState(data[selectedPage] || "");

  useEffect(() => {
    setContent(data[selectedPage] || "");
  }, [selectedPage, data]);

  const handleSave = () => {
    onSave("pages", { ...data, [selectedPage]: content });
    alert(`Page "${selectedPage}" saved!`);
  };

  return (
    <div>
      <h5 className="mb-3">Page Content Editor</h5>
      <Form.Select className="w-auto mb-3" value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}>
        {Object.keys(data).map((p) => <option key={p} value={p}>{p}</option>)}
      </Form.Select>
      <Form.Control as="textarea" rows={12} value={content} onChange={(e) => setContent(e.target.value)} />
      <Button className="mt-3 d-flex align-items-center gap-2" onClick={handleSave}><Save size={16} /> Save Page Content</Button>
    </div>
  );
}

// ---------------- Notifications Settings ----------------
function NotificationsSettings({ data, onSave }) {
    const [templates, setTemplates] = useState(data);

    const handleChange = (type, key, value) => {
        setTemplates(prev => ({ ...prev, [type]: { ...prev[type], [key]: value } }));
    };

    const handleSave = () => {
        onSave("templates", templates);
        alert("Notification templates saved!");
    }

    return (
        <div>
            <h5 className="mb-4">Notification Templates</h5>
            {Object.entries(templates).map(([type, group]) => (
                <div key={type} className="mb-4">
                    <h6>{type} Templates</h6>
                    <Row className="g-3">
                        {Object.entries(group).map(([key, value]) => (
                            <Col md={6} key={key}>
                                <Form.Group>
                                    <Form.Label>{key.replace(/([A-Z])/g, ' $1')}</Form.Label>
                                    <Form.Control as="textarea" rows={4} value={value} onChange={e => handleChange(type, key, e.target.value)} />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}
            <Button className="mt-3 d-flex align-items-center gap-2" onClick={handleSave}><Save size={16} /> Save Templates</Button>
        </div>
    );
}

// ---------------- Payment Gateway Settings ----------------
function PaymentSettings({ data, onSave }) {
    const [credentials, setCredentials] = useState(data);

    const handleChange = (gateway, key, value) => {
        setCredentials(prev => ({ ...prev, [gateway]: { ...prev[gateway], [key]: value } }));
    };

    const handleSave = () => {
        onSave("credentials", credentials);
        alert("Payment credentials saved!");
    }

    return (
        <div>
            <h5 className="mb-4">Payment Gateway Credentials</h5>
            <Row className="g-4">
                {Object.entries(credentials).map(([gateway, keys]) => (
                    <Col md={6} key={gateway}>
                        <div className="card">
                            <div className="card-header text-capitalize">{gateway}</div>
                            <div className="card-body">
                                {Object.entries(keys).map(([key, value]) => (
                                    <Form.Group key={key} className="mb-3">
                                        <Form.Label>{key.replace(/([A-Z])/g, ' $1')}</Form.Label>
                                        <Form.Control type="password" value={value} onChange={e => handleChange(gateway, key, e.target.value)} />
                                    </Form.Group>
                                ))}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
            <Button className="mt-4 d-flex align-items-center gap-2" onClick={handleSave}><Save size={16} /> Save Credentials</Button>
        </div>
    );
}

// ---------------- Global Settings ----------------
function GlobalSettings({ data, onSave }) {
    const [settings, setSettings] = useState(data);

    const handleChange = (key, value, isCheckbox = false) => {
        setSettings(prev => ({ ...prev, [key]: isCheckbox ? value : e.target.value }));
    };
    
    const handleSave = () => {
        onSave("global", settings);
        alert("Global settings saved!");
    };

    return (
        <div>
            <h5 className="mb-4">Global Platform Settings</h5>
            <Row className="g-3">
                <Col md={4}><Form.Group><Form.Label>Currency</Form.Label><Form.Control value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Timezone</Form.Label><Form.Control value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Business Hours</Form.Label><Form.Control value={settings.businessHours} onChange={e => setSettings({...settings, businessHours: e.target.value})} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Date Format</Form.Label><Form.Control value={settings.dateFormat} onChange={e => setSettings({...settings, dateFormat: e.target.value})} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Time Format</Form.Label><Form.Control value={settings.timeFormat} onChange={e => setSettings({...settings, timeFormat: e.target.value})} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Tax (%)</Form.Label><Form.Control type="number" value={settings.taxPercent} onChange={e => setSettings({...settings, taxPercent: e.target.value})} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Commission (%)</Form.Label><Form.Control type="number" value={settings.commissionPercent} onChange={e => setSettings({...settings, commissionPercent: e.target.value})} /></Form.Group></Col>
                <Col md={12} className="mt-4">
                    <Form.Check type="switch" id="auto-confirm" label="Automatically confirm new bookings" checked={settings.autoConfirmBookings} onChange={e => setSettings({...settings, autoConfirmBookings: e.target.checked})} />
                </Col>
            </Row>
            <Button className="mt-4 d-flex align-items-center gap-2" onClick={handleSave}><Save size={16} /> Save Global Settings</Button>
        </div>
    );
}

// ---------------- Announcements Settings ----------------
function AnnouncementsSettings({ data, onSave }) {
    const [announcements, setAnnouncements] = useState(data);
    const [newAnnouncement, setNewAnnouncement] = useState("");

    const addAnnouncement = () => {
        if (!newAnnouncement.trim()) return;
        const updated = [...announcements, newAnnouncement];
        setAnnouncements(updated);
        setNewAnnouncement("");
        onSave("announcements", updated);
    };

    const removeAnnouncement = (index) => {
        const updated = announcements.filter((_, i) => i !== index);
        setAnnouncements(updated);
        onSave("announcements", updated);
    };
    
    return (
        <div>
            <h5 className="mb-3">Platform Announcements</h5>
            <InputGroup className="mb-3">
                <Form.Control placeholder="New announcement..." value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} />
                <Button onClick={addAnnouncement}>Add</Button>
            </InputGroup>
            <ListGroup>
                {announcements.map((item, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                        {item}
                        <button className="icon-button text-danger" onClick={() => removeAnnouncement(index)}><Trash2 size={16} /></button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
}

// ---------------- SEO & Features Settings ----------------
function SeoAndFeaturesSettings({ seoData, featuresData, onSave }) {
    const [seo, setSeo] = useState(seoData);
    const [features, setFeatures] = useState(featuresData);

    const handleSave = () => {
        onSave("seo", seo);
        onSave("features", features);
        alert("SEO & Features saved!");
    };

    return (
        <div>
            <Row className="g-4">
                <Col lg={6}>
                    <h5 className="mb-3">SEO Settings</h5>
                    <Form.Group className="mb-3"><Form.Label>Meta Title</Form.Label><Form.Control value={seo.metaTitle} onChange={e => setSeo({...seo, metaTitle: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Meta Description</Form.Label><Form.Control as="textarea" rows={3} value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} /></Form.Group>
                    <Form.Group><Form.Label>Meta Keywords (comma-separated)</Form.Label><Form.Control value={seo.metaKeywords.join(', ')} onChange={e => setSeo({...seo, metaKeywords: e.target.value.split(',').map(k => k.trim())})} /></Form.Group>
                </Col>
                <Col lg={6}>
                    <h5 className="mb-3">Feature Flags</h5>
                    <div className="card">
                        <ListGroup variant="flush">
                            {Object.entries(features).map(([key, value]) => (
                                <ListGroup.Item key={key}>
                                    <Form.Check type="switch" id={`feature-${key}`} label={key.replace(/([A-Z])/g, ' $1')} checked={value} onChange={e => setFeatures({...features, [key]: e.target.checked})} />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Col>
            </Row>
            <Button className="mt-4 d-flex align-items-center gap-2" onClick={handleSave}><Save size={16} /> Save SEO & Features</Button>
        </div>
    );
}

// ---------------- Role Permissions Settings ----------------
function RolePermissionsSettings({ data, onSave }) {
    const [roles, setRoles] = useState(data);

    const handlePermissionChange = (role, permission, checked) => {
        setRoles(prev => ({ ...prev, [role]: { ...prev[role], [permission]: checked } }));
    };

    const handleSave = () => {
        onSave("roles", roles);
        alert("Role permissions saved!");
    };

    return (
        <div>
            <h5 className="mb-3">Role-Based Permissions</h5>
            <Row className="g-4">
                {Object.entries(roles).map(([role, permissions]) => (
                    <Col md={6} lg={4} key={role}>
                        <div className="card h-100">
                            <div className="card-header">{role}</div>
                            <ListGroup variant="flush">
                                {Object.entries(permissions).map(([permission, value]) => (
                                    <ListGroup.Item key={permission}>
                                        <Form.Check type="switch" id={`${role}-${permission}`} label={permission.replace(/([A-Z])/g, ' $1')} checked={value} onChange={e => handlePermissionChange(role, permission, e.target.checked)} />
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    </Col>
                ))}
            </Row>
            <Button className="mt-4 d-flex align-items-center gap-2" onClick={handleSave}><Save size={16} /> Save Permissions</Button>
        </div>
    );
}


// ---------------- Main Component ----------------
export default function ContentSettings() {
  const [activeTab, setActiveTab] = useState("Pages");
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getSettings().then(data => {
      setSettingsData(data);
      setLoading(false);
    });
  }, []);

  const handleSave = (key, data) => {
    setSettingsData(prev => ({ ...prev, [key]: data }));
    // In a real app, you'd call the specific service function
    // e.g., settingsService.saveGlobal(data)
    console.log(`Saving ${key}...`, data);
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (!settingsData) return <p>Could not load settings.</p>;

    switch (activeTab) {
      case "Pages": return <PageEditor data={settingsData.pages} onSave={handleSave} />;
      case "Notifications": return <NotificationsSettings data={settingsData.templates} onSave={handleSave} />;
      case "Payment Gateway": return <PaymentSettings data={settingsData.credentials} onSave={handleSave} />;
      case "Global Settings": return <GlobalSettings data={settingsData.global} onSave={handleSave} />;
      case "Announcements": return <AnnouncementsSettings data={settingsData.announcements} onSave={handleSave} />;
      case "SEO & Features": return <SeoAndFeaturesSettings seoData={settingsData.seo} featuresData={settingsData.features} onSave={handleSave} />;
      case "Role Permissions": return <RolePermissionsSettings data={settingsData.roles} onSave={handleSave} />;
      default: return null;
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <h3>Content & Settings</h3>
        <p className="text-muted">Manage all global settings and static content of the platform.</p>
      </div>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="card">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
