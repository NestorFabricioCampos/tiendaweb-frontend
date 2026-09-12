const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../middleware/auth');
const Empleado = require('../models/Empleado');

const INVALID_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5F4v0WvN7l3xq7bY1QmL7Xf9m7j7m7m';

const login = async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const adminMatches = adminEmail && passwordHash && normalizedEmail === adminEmail.trim().toLowerCase();
  const empleado = await Empleado.findOne({ email: normalizedEmail, activo: true }).select('+passwordHash');
  const empleadoPasswordHash = empleado?.passwordHash || passwordHash || INVALID_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, empleadoPasswordHash);

  if ((!adminMatches && !empleado) || !passwordMatches) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  try {
    const role = empleado?.role || 'admin';
    const userEmail = empleado?.email || normalizedEmail;
    const token = jwt.sign(
      { sub: userEmail, role },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '15m' }
    );

    res.json({ token, expiresIn: 900, user: { email: userEmail, role } });
  } catch (error) {
    res.status(503).json({ message: 'La autenticación no está configurada correctamente' });
  }
};

module.exports = { login };
