import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { phase5Api } from '../../services/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { phase5Api.overview().then(setData).catch(() => {}); }, []);
  const equipment = data?.equipment || {};
  const bookings = data?.bookings || {};
  const cards = [['Products', equipment.totalProducts], ['Physical units', equipment.totalUnits], ['Available units', equipment.availableUnits], ['Pending bookings', bookings.pendingBookings], ['Active rentals', bookings.activeRentals], ['Revenue', `₹${Number(bookings.revenue || 0).toLocaleString('en-IN')}`]];
  return <section className="admin-control-page"><div className="container"><div className="admin-command-header"><div><p className="eyebrow">DRISHYA / CONTROL ROOM — 01</p><h1>Business <em>overview.</em></h1><p className="muted-copy">A clear view of the work behind every frame.</p></div><span className="dashboard-date">LIVE / {new Date().toLocaleDateString('en-IN')}</span></div><div className="stats-grid admin-stats">{cards.map(([label, value], index) => <div className={`stat-card stat-card-${(index % 4) + 1}`} key={label}><span className="stat-index">0{index + 1}</span><strong>{value || 0}</strong><span>{label}</span></div>)}</div><div className="admin-command-grid"><nav className="admin-nav-list"><span className="cart-panel-label">Command centre</span><Link to="/admin/equipment"><span>01</span>Equipment inventory <b>↗</b></Link><Link to="/admin/operations"><span>02</span>Rental operations <b>↗</b></Link><Link to="/admin/customers"><span>03</span>Customer directory <b>↗</b></Link><Link to="/admin/reports"><span>04</span>Business reports <b>↗</b></Link><Link to="/admin/enquiries"><span>05</span>Customer enquiries <b>↗</b></Link></nav><div><h2 className="admin-section-title">Recent booking requests</h2><div className="admin-booking-list">{data?.recentBookings?.map((booking) => <div className="booking-card" key={booking.id}><span>#{booking.id} · {booking.customerName}</span><b className="status-label">{booking.status}</b></div>)}</div></div></div></div></section>;
}
