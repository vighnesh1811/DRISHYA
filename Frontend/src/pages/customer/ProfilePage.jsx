import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { phase5Api } from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [message, setMessage] = useState('');
  async function submit(event) { event.preventDefault(); try { const result = await phase5Api.updateProfile(form); setForm((value) => ({ ...value, ...result.user })); setMessage(result.message); } catch (error) { setMessage(error.message); } }
  return <section className="profile-page"><div className="container"><p className="eyebrow">DRISHYA / 07 — Account settings</p><div className="profile-layout"><div><h1>Your <em>profile.</em></h1><p className="muted-copy">Keep your contact details current so our team can reach you about your productions.</p><div className="profile-identity"><span>{user?.fullName?.slice(0, 1).toUpperCase()}</span><div><strong>{user?.fullName}</strong><small>{user?.email}</small></div></div></div><form className="profile-form d-grid gap-3" onSubmit={submit}><span className="cart-panel-label">Personal details</span><label>Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label><label>Email<input disabled value={user?.email || ''} /></label><label>Mobile number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><button className="btn btn-primary">Save changes <span aria-hidden="true">↗</span></button>{message && <p className="muted-copy">{message}</p>}</form></div></div></section>;
}
