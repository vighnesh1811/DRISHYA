import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { equipmentApi, bookingApi } from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function EquipmentDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, setDates } = useCart();
  const [item, setItem] = useState(null);
  const [dates, setLocalDates] = useState({ startDate: '', endDate: '' });
  const [quantity, setQuantity] = useState(1);
  const [availability, setAvailability] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { equipmentApi.detail(slug).then(({ equipment }) => setItem(equipment)).catch((e) => setError(e.message)); }, [slug]);
  if (error) return <section className="content-page container"><p className="eyebrow">Equipment</p><h1>{error}</h1><Link to="/equipment">Back to collection</Link></section>;
  if (!item) return <section className="content-page container"><p className="muted-copy">Loading equipment…</p></section>;
  async function checkAvailability() { try { const result = await bookingApi.availability({ ...dates, equipmentId: item.id, quantity }); setAvailability(result.available ? 'Available for these dates' : 'Not available for these dates'); } catch (e) { setAvailability(e.message); } }
  function addToCart() { addItem(item, quantity); setDates(dates); navigate('/cart'); }
  return <section className="detail-page"><div className="container"><Link className="back-link" to="/equipment">← Back to collection</Link><div className="detail-layout"><div className="detail-visual"><span className="detail-index">DRISHYA / OBJECT 01</span><div className="equipment-image detail-image">{item.imageUrl ? <img loading="eager" decoding="async" src={item.imageUrl} alt={item.name} /> : <span>{item.categoryName}</span>}</div></div><div className="detail-info"><p className="eyebrow">{item.categoryName}</p><h1>{item.name}</h1><p className="muted-copy">{item.description || 'Professional equipment, maintained and ready for your production.'}</p><div className="price-block"><strong>₹{Number(item.dailyRate).toLocaleString('en-IN')}</strong><span>per day · ₹{Number(item.securityDeposit).toLocaleString('en-IN')} refundable deposit</span></div><div className="date-fields"><label>Pickup date<input aria-label="Pickup date" type="date" value={dates.startDate} onChange={(e) => setLocalDates({ ...dates, startDate: e.target.value })} /></label><label>Return date<input aria-label="Return date" type="date" value={dates.endDate} onChange={(e) => setLocalDates({ ...dates, endDate: e.target.value })} /></label><label>Quantity<input aria-label="Quantity" type="number" min="1" max={item.availableUnits} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></label></div><div className="detail-actions"><button className="btn btn-outline-dark" type="button" onClick={checkAvailability}>Check availability</button><button className="btn btn-primary" type="button" onClick={addToCart}>Add to cart <span aria-hidden="true">↗</span></button></div>{availability && <p className="availability mt-3">{availability}</p>}<p className="detail-note">Availability is confirmed by our team before your booking is approved.</p></div></div></div></section>;
}
