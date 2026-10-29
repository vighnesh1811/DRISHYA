import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingApi } from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function CheckoutPage() {
  const { items, dates, clear } = useCart();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (!dates.startDate || !dates.endDate || new Date(`${dates.startDate}T00:00:00Z`) >= new Date(`${dates.endDate}T00:00:00Z`)) {
      setError('Choose a valid pickup and return date before submitting your request.');
      return;
    }
    if (!items.length) {
      setError('Add at least one piece of equipment before submitting your request.');
      return;
    }
    if (!termsAccepted) {
      setError('Accept the rental terms before submitting your request.');
      return;
    }
    try {
      await bookingApi.create({ startDate: dates.startDate, endDate: dates.endDate, termsAccepted, items: items.map((item) => ({ equipmentId: item.id, quantity: item.quantity })) });
      clear();
      navigate('/dashboard/bookings');
    } catch (e) { setError(e.message); }
  }
  return <section className="checkout-page"><div className="container"><p className="eyebrow">DRISHYA / 04 — Final review</p><h1>Request your <em>rental.</em></h1>{error && <div className="alert alert-danger" role="alert">{error}</div>}<div className="checkout-layout"><div className="checkout-intro"><p className="checkout-number">01</p><p className="muted-copy">One last look before your production begins. We’ll confirm availability and send the next steps from our team.</p><Link className="text-link" to="/cart">← Edit selection</Link></div><form onSubmit={submit} className="checkout-card"><div className="checkout-dates"><div><span>Pickup</span><strong>{dates.startDate || 'Not set'}</strong></div><div><span>Return</span><strong>{dates.endDate || 'Not set'}</strong></div></div><span className="cart-panel-label">Your equipment</span><ul>{items.map((item) => <li key={item.id}><span>{item.name}</span><strong>× {item.quantity}</strong></li>)}</ul><label className="terms"><input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} /> I accept the rental terms and understand this request requires approval.</label><button className="btn btn-primary w-100" disabled={!items.length || !dates.startDate || !dates.endDate}>Submit booking request <span aria-hidden="true">↗</span></button></form></div></div></section>;
}
