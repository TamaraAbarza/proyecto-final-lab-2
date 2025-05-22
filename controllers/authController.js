const usuarioService = require("../services/usuarioService");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//renderizar vistas
const vistaFormEmpleado = async (req, res) => {
  try {
    res.render("auth/login", {
      title: "Acceso para Empleados",
      rol: "Empleado",
    });
  } catch (error) {
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje: "Ocurrió un error"
    });
  }
};

const vistaFormPaciente = async (req, res) => {
  try {
    res.render("auth/login", {
      title: "Acceso para Pacientes",
      rol: "Paciente",
    });
  } catch (error) {
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje: "Ocurrió un error"
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    const usuario = await usuarioService.getUsuarioPorcorreo(correo);

    if (!usuario) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    // Genera el token
    const token = jwt.sign(
      {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Establece el token en una cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure solo en producción (HTTPS)
      maxAge: 3600000 // 1 hora
    });

    if (usuario.rol == "paciente") {
      return res.redirect("/paciente/home"); //redirigir a la vista paciente
    }
    return res.redirect("/orden/all");
    //return res.redirect("/usuario/home"); //redirigir a la vista del empleado
  } catch (error) {
    console.error("Error en el login:", error);
    return res
      .status(500)
      .json({ message: "Error en el inicio de sesión.", error });
  }
};

// Logout
const logout = (req, res) => {
  // Eliminar la cookie que contiene el token
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  return res.redirect("/"); // Redirigir al login
};

//---------------------------------------------------
//cambiar contraseña por mail

// Restablecer contraseña
const restablecerPassword = async (req, res) => {
  try {
    const { token, nuevaPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = hashedPassword;

    await usuario.save();
    res.status(200).json({ message: "¡Contraseña actualizada exitosamente!" });
  } catch (error) {
    res.status(400).json({ message: "Token inválido o expirado", error });
  }
};

// token JWT para el cambio de contraseña
const generateResetToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

// solicita restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;

    const usuario = await User.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const resetToken = generateResetToken(usuario.id);
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Configurar transporte para enviar correo
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        usuario: "tamaraabarza01@gmail.com", //process.env.EMAIL_USER,
        pass: "ljpa zxzs qikg meoi" //process.env.EMAIL_PASSWORD,
      }
    });

    // Enviar correo
    await transporter.sendMail({
      from: `"Laboratory Information System" <${process.env.EMAIL_USER}>`,
      to: usuario.correo,
      subject: "Restablecimiento de contraseña",
      text: `Usa el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
      html: generatePasswordResetHTML(resetLink) //función para generar el HTML
    });

    res.status(200).json({
      message: "Correo enviado con el enlace para restablecer la contraseña"
    });
  } catch (error) {
    console.error("Error en /request-password-reset:", error.message);
    res
      .status(500)
      .json({ message: "Error al solicitar el cambio de contraseña", error });
  }
};

//html del correo
const generatePasswordResetHTML = (resetLink) => {
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Restablecimiento de Contraseña</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  color: #333;
                  background: linear-gradient(to right, #fff5f8, #ffeef4);
                  margin: 0;
                  padding: 0;
              }
  
              .email-container {
                  max-width: 600px;
                  margin: 30px auto;
                  background-color: #fff;
                  border-radius: 8px;
                  padding: 30px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
  
              .header {
                  text-align: center;
                  margin-bottom: 20px;
              }
  
              .header h1 {
                  font-size: 2rem;
                  font-weight: bold;
                  color: #444;
                  margin-bottom: 10px;
              }
  
              .header p {
                  font-size: 1.1rem;
                  color: #555;
              }
  
              .body {
                  font-size: 1rem;
                  color: #555;
                  margin-bottom: 20px;
              }
  
             .cta-button {
              display: inline-block;
              padding: 12px 24px;
              font-size: 1rem;
              font-weight: bold;
              color: #fff !important;
              background-color: #d32f2f;
              text-decoration: none !important;
              border-radius: 4px;
              text-align: center;
              width: 100%;
              box-sizing: border-box;
              margin-top: 20px;
              }
  
              .cta-button:hover {
                  background-color: #b71c1c;
              }
  
              .note {
                  font-size: 0.9rem;
                  color: #999;
                  margin-top: 15px;
                  text-align: center;
              }
  
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  font-size: 0.8rem;
                  color: #777;
              }
  
              .footer a {
                  color: #d32f2f;
                  text-decoration: none;
              }
  
              .footer a:hover {
                  text-decoration: underline;
              }
          </style>
      </head>
  
      <body>
          <div class="email-container">
              <div class="header">
                  <h1>Restablecimiento de Contraseña</h1>
                  <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
              </div>
  
              <div class="body">
                  <p>Hola,</p>
                  <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no solicitaste este cambio,
                      podes ignorar este correo.</p>
                  <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
  
                  <!-- Botón para restablecer contraseña dentro del contenedor -->
                  <a href="${resetLink}" class="cta-button">Restablecer mi contraseña</a>
  
                  <p class="note">Este enlace caducará en 15 minutos, así que asegúrate de usarlo antes de que expire.</p>
              </div>
  
              <div class="footer">
                  <p>Si tienes alguna pregunta, no dudes en ponerte en contacto con nosotros.</p>
                  <p><a href="mailto:support@Laboratorio2.com">support@Laboratorio2s.com</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
};

module.exports = {
  vistaFormEmpleado,
  vistaFormPaciente,
  login,
  logout,
  restablecerPassword,
  requestPasswordReset
};
