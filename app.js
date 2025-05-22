const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const Conexion = require("./config/dbConfig");
const cookieParser = require("cookie-parser"); //cookies
require("./models/index");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Middleware para habilitar CORS
app.use(express.json()); // Middleware para parsear JSON y formularios (body)
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser()); //cookies
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const { verificarAutenticado} = require('./middlewares/authMiddleware');

// Configuración de Pug para vistas
app.set("view engine", "pug");
app.set("views", "./views");

// Importar rutas

const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const pacienteRoutes = require("./routes/pacienteRoutes");
const ordenRoutes = require("./routes/ordenTrabajoRoutes");
const muestraRoutes = require("./routes/muestraRoutes");
/*
const examenRoutes = require("./routes/examenRoutes");
*/
//otra ruta
const cargarDatosRoutes = require ("./routes/cargarDatosRoutes");
const examenRoutes = require ("./routes/examenRoutes");
const determinacionRoutes = require ("./routes/determinacionRoutes");
const valorReferenciaRoutes = require ("./routes/valorReferenciaRoutes");
const auditoriaRoutes = require ("./routes/auditoriaRoutes");

// Configurar rutas
app.use(methodOverride('_method'));
app.use("/auth", authRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/paciente", pacienteRoutes);
app.use("/orden", ordenRoutes);
app.use("/muestra", muestraRoutes);
app.use("/cargar_datos",cargarDatosRoutes);
app.use("/examen",examenRoutes);
app.use("/determinacion",determinacionRoutes)
app.use("/valor_referencia",valorReferenciaRoutes);
app.use("/auditoria",auditoriaRoutes)

// Ruta base
app.get("/", verificarAutenticado, (req, res) => {
  res.render("index"); // Renderiza la vista index.pug
});

/*
//probar
app.get("/", (req, res) => {
  res.json({ message: "El servidor está funcionando correctamente" });
});*/

// Conectar a la base de datos e iniciar el servidor
Conexion.conectar()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo iniciar la aplicación:", err);
  });

module.exports = app;
