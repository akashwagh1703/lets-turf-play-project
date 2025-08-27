import React from "react";
import { Card } from "react-bootstrap";

const TurfAnalytics = ({ turf }) => {
  return (
    <Card className="p-3 mb-3">
      <h5>{turf.name} Performance</h5>
      <p>Bookings: {turf.performance.bookings}</p>
      <p>Revenue: ₹{turf.performance.revenue}</p>
    </Card>
  );
};

export default TurfAnalytics;
