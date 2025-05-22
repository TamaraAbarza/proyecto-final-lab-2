// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en el entorno');
}

const authenticateToken = (req, res, next) => {
  let token;

  // Primero, intenta obtenerlo del encabezado Authorization
  if (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ')) {
    token = req.headers['authorization'].split(' ')[1];
  }
  // Si no está en el encabezado, intenta obtenerlo de las cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  else {
    //return res.status(401).json({ message: 'Falta el token de acceso' });
    return res.redirect('/');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      //return res.status(403).json({ message: 'Token inválido' });
      return res.redirect('/');
    }
    req.usuario = usuario; // Guarda la información del usuario en la request
    next();
  });
};

const authorizeRoles = (rolesPermitidos) => (req, res, next) => {
  if (!req.usuario || !req.usuario.rol) {
    return res.status(403).json({ message: 'Rol no encontrado en el token' });
  }
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ message: 'Acceso no autorizado' });
  }
  next();
};

// Para redirigir a usuarios autenticados según su rol
const verificarAutenticado = (req, res, next) => {
  let token;

  // Verifica si el token está presente en las cookies o en el encabezado Authorization
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ')) {
    token = req.headers['authorization'].split(' ')[1];
  }

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
      if (err) {
        return next(); // Si el token es inválido, continúa con la ejecución del middleware
      }
      // Si el token es válido, redirige al usuario según su rol
      if (usuario.rol === 'paciente') {
        return res.redirect('/paciente/home');
      } else {
        return res.redirect('/usuario/home');
      }
    });
  } else {
    return next(); // Si no hay token, continúa con la ejecución del siguiente middleware
  }
};

module.exports = { authenticateToken, authorizeRoles,verificarAutenticado };