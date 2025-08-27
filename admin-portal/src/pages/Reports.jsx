import { BarChart } from "lucide-react";

export default function Reports() {
  return (
    <div className="container-fluid p-0">
      <h3 className="mb-4">Reports</h3>
      <div className="card">
        <div className="card-body text-center py-5">
            <BarChart size={48} className="text-muted mx-auto mb-3"/>
            <h5 className="text-muted">Reports Feature Coming Soon</h5>
            <p className="text-muted">Detailed analytics and downloadable reports will be available here.</p>
        </div>
      </div>
    </div>
  )
}
