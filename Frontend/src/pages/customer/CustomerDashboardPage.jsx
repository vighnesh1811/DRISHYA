import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { phase5Api } from '../../services/api';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  useEffect(() => { phase5Api.dashboard().then(({ summary: result }) => setSummary(result)).catch(() => {}); }, []);
  const cards = [['Active rentals', summary?.activeRentals || 0], ['Pending requests', summary?.pendingRequests || 0], ['Confirmed bookings', summary?.confirmedBookings || 0], ['Completed rentals', summary?.completedBookings || 0]];
  return <section className="dashboard-page"><div className="container"><div className="dashboard-header"><div><p className="eyebrow">DRISHYA / 05 — Your account</p><h1>Good to see you, <em>{user?.fullName?.split(' ')[0]}.</em></h1><p className="muted-copy">Your production desk, kept simple.</p></div><span className="dashboard-date">CUSTOMER / {new Date().getFullYear()}</span></div><div className="stats-grid">{cards.map(([label, value], index) => <div className={`stat-card stat-card-${index + 1}`} key={label}><span className="stat-index">0{index + 1}</span><strong>{value}</strong><span>{label}</span></div>)}</div><div className="dashboard-lower"><div><p className="eyebrow">Next move</p><h2>Ready for your<br /><em>next frame?</em></h2><Link className="btn btn-primary" to="/equipment">Browse equipment <span aria-hidden="true">↗</span></Link></div><nav className="dashboard-links"><Link to="/dashboard/bookings"><span>01</span>View booking history <b>↗</b></Link><Link to="/dashboard/profile"><span>02</span>Manage your profile <b>↗</b></Link></nav></div></div></section>;
}
