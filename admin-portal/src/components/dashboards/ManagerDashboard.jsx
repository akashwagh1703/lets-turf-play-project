import KPI from "../KPI.jsx";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

export default function ManagerDashboard({ data, icons }) {
  const { kpis, charts, upcomingBookings } = data;

  return (
    <>
      {/* KPIs */}
      <div className="row g-4">
        <div className="col-xl-3 col-md-6">
          <KPI title="Monthly Revenue" value={kpis.monthlyRevenue.value} change={kpis.monthlyRevenue.change} icon={icons.monthlyRevenue} prefix="₹" />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPI title="Monthly Bookings" value={kpis.monthlyBookings.value} change={kpis.monthlyBookings.change} icon={icons.monthlyBookings} />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPI title="Occupancy Rate" value={kpis.occupancyRate.value} change={kpis.occupancyRate.change} icon={icons.occupancyRate} suffix="%" />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPI title="Pending Approvals" value={kpis.pendingApprovals.value} change={kpis.pendingApprovals.change} icon={icons.pendingApprovals} />
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-lg-8">
            <div className="card h-100">
                <div className="card-header"><strong>Booking Trend (Last 7 Days)</strong></div>
                <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={charts.bookingTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="bookings" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </div>
        </div>
        <div className="col-lg-4">
            <div className="card h-100">
                <div className="card-header"><strong>Upcoming Bookings</strong></div>
                <div className="card-body">
                {upcomingBookings?.length > 0 ? (
                    <ul className="list-group list-group-flush">
                        {upcomingBookings.map((b) => (
                        <li className="list-group-item d-flex justify-content-between align-items-center px-0" key={b.id}>
                            <div>
                                <div className="fw-bold">{b.customer}</div>
                                <small className="text-muted">{b.turf}</small>
                            </div>
                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">{b.time}</span>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted text-center mt-4">No upcoming bookings.</p>
                )}
                </div>
            </div>
        </div>
      </div>
      
      <div className="row g-4 mt-4">
        <div className="col-12">
            <div className="card">
                <div className="card-header"><strong>Peak Hours Analysis (Occupancy %)</strong></div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={charts.occupancyByTime}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis dataKey="time" />
                            <YAxis unit="%" />
                            <Tooltip cursor={{fill: 'rgba(22, 163, 74, 0.1)'}}/>
                            <Legend />
                            <Bar dataKey="occupancy" fill="#16a34a" name="Occupancy Rate" barSize={40} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
