import pkg from 'jsonwebtoken';
const { verify } = pkg;

// Middleware to verify JWT token
const auth = (req, res, next) => {
  console.log('Auth middleware - Request path:', req.path);
  console.log('Auth middleware - Request method:', req.method);
  console.log('Auth middleware - Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Auth middleware - Token verified, user:', decoded);
    next();
  } catch (err) {
    console.log('Auth middleware - Invalid token:', err.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware for role-based access
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('Role authorization check:');
    console.log('Required roles:', roles);
    console.log('User role:', req.user.role);
    console.log('User object:', req.user);
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    
    if (!roles.includes(req.user.role)) {
      console.log('Access denied - role mismatch');
      console.log('User role:', req.user.role, 'is not in required roles:', roles);
      return res.status(403).json({ message: 'Access denied.' });
    }
    console.log('Access granted');
    next();
  };
};

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

export default auth;