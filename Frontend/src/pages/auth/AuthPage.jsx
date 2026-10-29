import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage({ admin = false, register = false }) {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (register) await registerUser(form);
      else await login({ email: form.email, password: form.password }, admin);
      navigate(admin ? '/admin/dashboard' : (location.state?.from || '/dashboard'));
    } catch (submissionError) { setError(submissionError.message); } finally { setBusy(false); }
  }

  return (
    <section className={`auth-page ${admin ? 'auth-page-admin' : ''}`}>
      <div className="auth-layout container">
        <div className="auth-aside"><span className="auth-mark">DRISHYA<span> / {admin ? 'CONTROL ROOM' : 'CUSTOMER'}</span></span><p className="eyebrow">{admin ? 'Operations, with clarity.' : 'Every vision deserves a frame.'}</p><div className="auth-aside-index">07<br /><span>Access / 2025</span></div></div>
      <div className="auth-card">
        <p className="eyebrow">{admin ? 'DRISHYA Control Room' : register ? 'Begin your production' : 'Welcome back, creator'}</p>
        <h1>{register ? <>Create your <em>account.</em></> : <>Sign {admin ? 'in to the control room' : 'in'}.</>}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit} className="d-grid gap-3">
          {register && <>
            <label>Full name<input required minLength={2} maxLength={120} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
            <label>Mobile number<input minLength={7} maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          </>}
          <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input required minLength={register ? 8 : 1} maxLength={72} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {register && <label>Confirm password<input required minLength={8} maxLength={72} type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></label>}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
        </form>
        {!admin && <p className="auth-switch">{register ? 'Already registered?' : 'New to DRISHYA?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>}
      </div>
      </div>
    </section>
  );
}
