export default function StatsCard({ value, icon, label }) {
    return (
        <div className="stat-card">
            <div className="stat-header">
                <span className="stat-value">{value}</span>
                <span className="stat-icon">{icon}</span>
            </div>
            <p className="stat-label">{label}</p>
        </div>
    );
}