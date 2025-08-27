import { TrendingUp, TrendingDown } from "lucide-react";

export default function KPI({ title, value, icon, change, prefix = "", suffix = "" }) {
  const isPositive = change >= 0;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-IN').format(val);
    }
    return val;
  };

  return (
    <div className="card card-kpi h-100">
      <div className="card-body">
        <div className="kpi-header">
          <div className="kpi-title">{title}</div>
          {icon && <div className="kpi-icon">{icon}</div>}
        </div>
        <div className="value">
          {prefix}{formatValue(value)}{suffix}
        </div>
        {change !== undefined && change !== null && (
          <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change)}%</span>
            <span className="ms-1">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
