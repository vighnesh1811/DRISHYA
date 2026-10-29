import { useEffect, useState } from 'react';
import { bookingApi } from '../../services/api';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { bookingApi.mine().then(({ bookings: result }) => setBookings(result)).catch((e) => setError(e.message)); }, []);
  return <section className="booking-page"><div className="container"><p className="eyebrow">DRISHYA / 06 — Your account</p><div className="booking-heading"><div><h1>Booking <em>history.</em></h1><p className="muted-copy">A record of every frame you’ve made with us.</p></div><span className="dashboard-date">{bookings.length.toString().padStart(2, '0')} REQUESTS</span></div>{error && <div className="alert alert-danger">{error}</div>}{!bookings.length && !error && <div className="empty-cart"><span className="cart-panel-label">No bookings yet</span><p className="muted-copy">Your next production starts with the right kit.</p></div>}<div className="booking-list">{bookings.map((booking, index) => <article className="booking-card" key={booking.id}><span className="booking-index">0{index + 1}</span><div className="booking-main"><div className="booking-title"><strong>Booking #{booking.id}</strong><b className="status-label">{booking.status}</b></div><span>{booking.startDate} → {booking.endDate}</span><small>{booking.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</small></div><div className="booking-total"><span>Total / deposit</span><strong>₹{Number(booking.subtotal).toLocaleString('en-IN')}</strong><small>+ ₹{Number(booking.depositAmount).toLocaleString('en-IN')}</small></div><span className="booking-arrow" aria-hidden="true">↗</span></article>)}</div></div></section>;
}
