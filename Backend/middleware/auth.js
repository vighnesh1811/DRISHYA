import jwt from 'jsonwebtoken';

function getToken(request) {
  return request.cookies.drishya_token;
}

export function requireAuth(request, response, next) {
  const token = getToken(request);
  if (!token) return response.status(401).json({ message: 'Authentication required' });

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    response.clearCookie('drishya_token');
    response.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== 'admin') return response.status(403).json({ message: 'Administrator access required' });
  next();
}
