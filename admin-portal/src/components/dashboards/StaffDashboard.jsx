import KPI from "../KPI.jsx";
import { Clock, Check, AlertCircle } from 'lucide-react';

export default function StaffDashboard({ data, icons }) {
  const { kpis, schedule, activeBookings } = data;

  const getStatusIcon = (status) => {
    switch(status) {
        case 'Done': return <Check size={18} className="text-success" />;
        case 'Pending': return <AlertCircle size={18} className="text-warning" />;
        case 'Upcoming': return <Clock size={18} className="text-info" />;
        default: return null;
    }
  }

  return (
    <>
      {/* KPIs */}
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <KPI title="Upcoming Bookings" value={kpis.upcomingBookings.value} icon={icons.upcomingBookings} />
        </div>
        <div className="col-lg-4 col-md-6">
          <KPI title="Completed Check-ins" value={kpis.checkinsToday.value} icon={icons.checkinsToday} />
        </div>
        <div className="col-lg-4 col-md-6">
          <KPI title="Pending Tasks" value={kpis.pendingTasks.value} icon={icons.pendingTasks} />
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-lg-7">
            <div className="card h-100">
                <div className="card-header"><strong>Today’s Schedule</strong></div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        {schedule.map((t, i) => (
                        <li className="list-group-item d-flex align-items-center gap-3 px-0" key={i}>
                            <div className="schedule-time">{t.time}</div>
                            <div className="schedule-task flex-grow-1">{t.task}</div>
                            <div className="schedule-status">{getStatusIcon(t.status)}</div>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="col-lg-5">
            <div className="card h-100">
                <div className="card-header"><strong>Currently Active on Turfs</strong></div>
                <div className="card-body">
                    {activeBookings?.length > 0 ? (
                    <ul className="list-group list-group-flush">
                        {activeBookings.map((s) => (
                        <li className="list-group-item px-0" key={s.id}>
                            <div className="fw-bold">{s.turf}</div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{s.customer}</span>
                                <span className="badge bg-success-subtle text-success-emphasis">{s.time}</span>
                            </div>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-muted text-center mt-4">No active bookings right now.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
