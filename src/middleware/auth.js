const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET.length < 32) {
    throw new Error('AUTH_JWT_SECRET debe tener al menos 32 caracteres');
  }
  return process.env.AUTH_JWT_SECRET;
};

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256']
    });
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'No tienes permisos para esta operación' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  getJwtSecret
};
