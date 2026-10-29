import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <section className="content-page container"><p className="muted-copy">Loading session…</p></section>;
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}
