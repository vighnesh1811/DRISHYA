import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

function parseItems(items) {
  if (Array.isArray(items)) return items;
  try { return JSON.parse(items || '[]'); } catch { return []; }
}

export default function AdminOperationsPage() {
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [message, setMessage] = useState('');
  const [unitForm, setUnitForm] = useState({ equipmentId: '', assetCode: '', conditionNotes: '' });
  const [operation, setOperation] = useState(null);
  const [operationForm, setOperationForm] = useState({ customerVerified: false, paymentAmount: '', depositAmount: '', paymentMethod: 'cash', conditionNotes: '', missingAccessories: '', damageCharges: '', depositRefund: '', unitIds: [] });

  async function refresh() {
    try {
      const [bookingResult, unitResult] = await Promise.all([adminApi.bookings(), adminApi.units()]);
      setBookings(bookingResult.bookings); setUnits(unitResult.units);
      if (!unitForm.equipmentId && unitResult.units[0]) setUnitForm((value) => ({ ...value, equipmentId: unitResult.units[0].equipmentId }));
    } catch (error) { setMessage(error.message); }
  }
  useEffect(() => { refresh(); }, []);

  async function updateStatus(id, status) { try { await adminApi.updateBookingStatus(id, status); setMessage(`Booking ${status}`); refresh(); } catch (error) { setMessage(error.message); } }
  async function createUnit(event) { event.preventDefault(); try { await adminApi.createUnit(unitForm); setMessage('Physical unit added'); setUnitForm({ equipmentId: '', assetCode: '', conditionNotes: '' }); refresh(); } catch (error) { setMessage(error.message); } }
  async function submitOperation(event) {
    event.preventDefault();
    try {
      if (operation.type === 'handover') await adminApi.handover(operation.id, { ...operationForm, paymentAmount: Number(operationForm.paymentAmount || 0), depositAmount: Number(operationForm.depositAmount || 0) });
      else await adminApi.returnBooking(operation.id, { ...operationForm, damageCharges: Number(operationForm.damageCharges || 0), depositRefund: Number(operationForm.depositRefund || 0) });
      setMessage(`${operation.type === 'handover' ? 'Handover' : 'Return'} recorded`); setOperation(null); refresh();
    } catch (error) { setMessage(error.message); }
  }
  function toggleUnit(id) { setOperationForm((value) => ({ ...value, unitIds: value.unitIds.includes(id) ? value.unitIds.filter((unitId) => unitId !== id) : [...value.unitIds, id] })); }

  return <section className="admin-control-page"><div className="container"><div className="admin-command-header"><div><p className="eyebrow">DRISHYA / CONTROL ROOM — 03</p><h1>Rental <em>operations.</em></h1><p className="muted-copy">Move every booking from request to return with confidence.</p></div><span className="dashboard-date">{bookings.length.toString().padStart(2, '0')} BOOKINGS</span></div>{message && <div className="alert alert-info">{message}</div>}
    <div className="row g-5">
      <div className="col-lg-8"><h2 className="admin-section-title">Booking requests</h2>{bookings.map((booking) => <article className="booking-card admin-booking" key={booking.id}><div className="admin-booking-info"><strong>#{booking.id} · {booking.customerName}</strong><span>{booking.startDate} → {booking.endDate}</span><small>{parseItems(booking.items).map((item) => `${item.name} × ${item.quantity}`).join(', ')}</small><b className="status-label mt-2">{booking.status}</b></div><div className="admin-actions">{booking.status === 'requested' && <><button className="btn btn-sm btn-primary" onClick={() => updateStatus(booking.id, 'approved')}>Approve</button><button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(booking.id, 'cancelled')}>Reject</button></>}{booking.status === 'approved' && <button className="btn btn-sm btn-primary" onClick={() => setOperation({ id: booking.id, type: 'handover' })}>Handover</button>}{booking.status === 'active' && <button className="btn btn-sm btn-primary" onClick={() => setOperation({ id: booking.id, type: 'return' })}>Process return</button>}</div></article>)}</div>
      <div className="col-lg-4"><form className="admin-form d-grid gap-3" onSubmit={createUnit}><h2>Add physical unit</h2><input required placeholder="Equipment ID" value={unitForm.equipmentId} onChange={(e) => setUnitForm({ ...unitForm, equipmentId: e.target.value })} /><input required placeholder="Asset code e.g. DR-SNY-001" value={unitForm.assetCode} onChange={(e) => setUnitForm({ ...unitForm, assetCode: e.target.value })} /><input placeholder="Condition notes" value={unitForm.conditionNotes} onChange={(e) => setUnitForm({ ...unitForm, conditionNotes: e.target.value })} /><button className="btn btn-primary">Add unit</button></form><h2 className="admin-section-title mt-5">Physical units</h2>{units.map((unit) => <div className="unit-row" key={unit.id}><span><strong>{unit.assetCode}</strong><small>{unit.name} · {unit.status}</small></span><button className="btn btn-sm btn-outline-secondary" disabled={unit.status === 'rented'} onClick={async () => { try { await adminApi.maintenance(unit.id, { enabled: unit.status !== 'maintenance' }); refresh(); } catch (error) { setMessage(error.message); } }}>{unit.status === 'maintenance' ? 'Restore' : 'Maintenance'}</button></div>)}</div>
    </div>
    {operation && <div className="operation-panel"><form className="admin-form d-grid gap-3" onSubmit={submitOperation}><button type="button" className="operation-close" onClick={() => setOperation(null)}>Close</button><h2>{operation.type === 'handover' ? 'Record handover' : 'Record return'}</h2>{operation.type === 'handover' && <><label className="terms"><input type="checkbox" required checked={operationForm.customerVerified} onChange={(e) => setOperationForm({ ...operationForm, customerVerified: e.target.checked })} /> Customer identity verified</label><input type="number" min="0" placeholder="Rental payment" value={operationForm.paymentAmount} onChange={(e) => setOperationForm({ ...operationForm, paymentAmount: e.target.value })} /><input type="number" min="0" placeholder="Security deposit received" value={operationForm.depositAmount} onChange={(e) => setOperationForm({ ...operationForm, depositAmount: e.target.value })} /><select value={operationForm.paymentMethod} onChange={(e) => setOperationForm({ ...operationForm, paymentMethod: e.target.value })}><option value="cash">Cash at pickup</option><option value="upi">UPI at pickup</option></select></>}{operation.type === 'return' && <><input placeholder="Condition on return" value={operationForm.conditionNotes} onChange={(e) => setOperationForm({ ...operationForm, conditionNotes: e.target.value })} /><input placeholder="Missing accessories" value={operationForm.missingAccessories} onChange={(e) => setOperationForm({ ...operationForm, missingAccessories: e.target.value })} /><input type="number" min="0" placeholder="Damage charges" value={operationForm.damageCharges} onChange={(e) => setOperationForm({ ...operationForm, damageCharges: e.target.value })} /><input type="number" min="0" placeholder="Deposit refund" value={operationForm.depositRefund} onChange={(e) => setOperationForm({ ...operationForm, depositRefund: e.target.value })} /></>}<p className="muted-copy">Select physical units involved:</p>{units.filter((unit) => operation.type === 'handover' ? unit.status === 'available' : unit.status === 'rented').map((unit) => <label key={unit.id} className="unit-check"><input type="checkbox" checked={operationForm.unitIds.includes(unit.id)} onChange={() => toggleUnit(unit.id)} /> {unit.assetCode} — {unit.name}</label>)}<button className="btn btn-primary">{operation.type === 'handover' ? 'Record handover' : 'Complete return'}</button></form></div>}
  </div></section>;
}
