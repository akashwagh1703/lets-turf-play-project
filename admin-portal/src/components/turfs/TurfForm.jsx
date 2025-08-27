import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const TurfForm = ({ show, handleClose, onSave, turf }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: { state: "", city: "", village: "", latitude: "", longitude: "" },
    pricePerHour: { weekdays: 0, weekends: 0 },
    media: { photos: [], videos: [], gifs: [], documents: [] },
    amenities: {
      lighting: false,
      parking: false,
      seating: false,
      refreshments: false,
    },
    status: "active",
  });

  useEffect(() => {
    if (turf) {
        // Deep copy to prevent issues with nested objects
        setFormData(JSON.parse(JSON.stringify(turf)));
    } else {
        // Reset form data for new turf
        setFormData({
            name: "",
            location: { state: "", city: "", village: "", latitude: "", longitude: "" },
            pricePerHour: { weekdays: 0, weekends: 0 },
            media: { photos: [], videos: [], gifs: [], documents: [] },
            amenities: { lighting: false, parking: false, seating: false, refreshments: false },
            status: "active",
        });
    }
  }, [turf, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["state", "city", "village", "latitude", "longitude"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else if (["weekdays", "weekends"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        pricePerHour: { ...prev.pricePerHour, [name]: Number(value) },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: checked },
    }));
  };

  const handleFileChange = (e, type) => {
    setFormData((prev) => ({
      ...prev,
      media: { ...prev.media, [type]: Array.from(e.target.files) },
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{turf ? "Edit Turf" : "Add New Turf"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={12}>
                <Form.Group>
                    <Form.Label>Turf Name</Form.Label>
                    <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Greenfield Arena" />
                </Form.Group>
            </Col>

            <Col md={6}>
                <Form.Group>
                    <Form.Label>State</Form.Label>
                    <Form.Control name="state" value={formData.location.state} onChange={handleChange} placeholder="e.g., Maharashtra" />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control name="city" value={formData.location.city} onChange={handleChange} placeholder="e.g., Pune" />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label>Village/Area</Form.Label>
                    <Form.Control name="village" value={formData.location.village} onChange={handleChange} placeholder="e.g., Hinjewadi" />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control name="latitude" value={formData.location.latitude} onChange={handleChange} type="number" placeholder="e.g., 18.5904" />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control name="longitude" value={formData.location.longitude} onChange={handleChange} type="number" placeholder="e.g., 73.7781" />
                </Form.Group>
            </Col>

            <Col md={6}>
                <Form.Group>
                    <Form.Label>Weekday Price (₹/hr)</Form.Label>
                    <Form.Control name="weekdays" value={formData.pricePerHour.weekdays} onChange={handleChange} type="number" />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label>Weekend Price (₹/hr)</Form.Label>
                    <Form.Control name="weekends" value={formData.pricePerHour.weekends} onChange={handleChange} type="number" />
                </Form.Group>
            </Col>
            
            <Col xs={12}>
                <Form.Group>
                    <Form.Label>Amenities</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                    {Object.keys(formData.amenities).map((a) => (
                        <Form.Check key={a} type="switch" id={`amenity-${a}`} label={a.charAt(0).toUpperCase() + a.slice(1)} name={a} checked={formData.amenities[a]} onChange={handleAmenityChange} />
                    ))}
                    </div>
                </Form.Group>
            </Col>

            <Col md={6}>
                <Form.Group>
                    <Form.Label>Photos</Form.Label>
                    <Form.Control type="file" multiple onChange={(e) => handleFileChange(e, "photos")} accept="image/*" />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label>Videos</Form.Label>
                    <Form.Control type="file" multiple onChange={(e) => handleFileChange(e, "videos")} accept="video/*" />
                </Form.Group>
            </Col>

            <Col md={12}>
                <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
        <Button variant="primary" onClick={() => onSave(formData)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TurfForm;
