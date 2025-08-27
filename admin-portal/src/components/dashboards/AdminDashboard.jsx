import KPI from "../KPI.jsx";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";
import { Button } from "react-bootstrap";
import { Check, Eye } from "lucide-react";

const PIE_COLORS = ["#16a34a", "#4ade80", "#86efac"];

export default function AdminDashboard({ data, icons }) {
  const { kpis, charts, pendingApprovals, recentBookings } = data;

  return (
    <>
      {/* KPIs */}
      <div className="row g-4">
        <div className="col-xl-3 col-md-6">
          <KPI title="Total Revenue" value={kpis.totalRevenue.value} change={kpis.totalRevenue.change} icon={icons.totalRevenue} prefix="₹" />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPI title="Total Bookings" value={kpis.totalBookings.value} change={kpis.totalBookings.change} icon={icons.totalBookings} />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPI title="Active Turfs" value={kpis.activeTurfs.value} change={kpis.activeTurfs.change} icon={icons.activeTurfs} />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPI title="New Users This Month" value={kpis.newUsers.value} change={kpis.newUsers.change} icon={icons.newUsers} />
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mt-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header"><strong>Revenue Trend (YTD)</strong></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={charts.revenueTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip formatter={(value) => [`₹${new Intl.NumberFormat('en-IN').format(value)}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header"><strong>Owner Plan Distribution</strong></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={charts.planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {charts.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Lists */}
      <div className="row g-4 mt-4">
        <div className="col-lg-5">
            <div className="card h-100">
                <div className="card-header"><strong>Pending Approvals</strong></div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        {pendingApprovals.map(item => (
                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                <div>
                                    <div className="fw-bold">{item.name}</div>
                                    <small className="text-muted">{item.type} requested on {item.requestDate}</small>
                                </div>
                                <div>
                                    <Button variant="outline-success" size="sm" className="me-2"><Check size={16}/></Button>
                                    <Button variant="outline-secondary" size="sm"><Eye size={16}/></Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="col-lg-7">
            <div className="card h-100">
                <div className="card-header"><strong>Recent Transactions</strong></div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr><th>Customer</th><th>Turf</th><th>Amount</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((b) => (
                                <tr key={b.id}>
                                    <td><strong>{b.customer}</strong></td>
                                    <td>{b.turf}</td>
                                    <td>₹{new Intl.NumberFormat('en-IN').format(b.amount)}</td>
                                    <td><span className={`badge bg-${b.status === "Confirmed" ? "success" : "warning"}-subtle text-${b.status === "Confirmed" ? "success" : "warning"}-emphasis`}>{b.status}</span></td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
