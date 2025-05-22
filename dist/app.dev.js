"use strict";

var express = require("express");

var cors = require("cors");

var dotenv = require("dotenv").config();

var Conexion = require("./config/dbConfig");

var cookieParser = require("cookie-parser"); //cookies


require("./models/index");

var app = express();
var PORT = process.env.PORT || 3000;
app.use(cors()); // Middleware para habilitar CORS

app.use(express.json()); // Middleware para parsear JSON y formularios (body)

app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"]("public"));
app.use(cookieParser()); //cookies

var methodOverride = require("method-override");

app.use(methodOverride("_method"));

var _require = require('./middlewares/authMiddleware'),
    verificarAutenticado = _require.verificarAutenticado; // Configuración de Pug para vistas


app.set("view engine", "pug");
app.set("views", "./views"); // Importar rutas

var authRoutes = require("./routes/authRoutes");

var usuarioRoutes = require("./routes/usuarioRoutes");

var pacienteRoutes = require("./routes/pacienteRoutes");

var ordenRoutes = require("./routes/ordenTrabajoRoutes");

var muestraRoutes = require("./routes/muestraRoutes");
/*
const examenRoutes = require("./routes/examenRoutes");
*/
//otra ruta


var cargarDatosRoutes = require("./routes/cargarDatosRoutes");

var examenRoutes = require("./routes/examenRoutes");

var determinacionRoutes = require("./routes/determinacionRoutes");

var valorReferenciaRoutes = require("./routes/valorReferenciaRoutes"); // Configurar rutas


app.use(methodOverride('_method'));
app.use("/auth", authRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/paciente", pacienteRoutes);
app.use("/orden", ordenRoutes);
app.use("/muestra", muestraRoutes);
/*
app.use("/examen", examenRoutes);
//asdas
*/

app.use("/cargar_datos", cargarDatosRoutes);
app.use("/examen", examenRoutes);
app.use("/determinacion", determinacionRoutes);
app.use("/valor_referencia", valorReferenciaRoutes); // Ruta base

app.get("/", verificarAutenticado, function (req, res) {
  res.render("index"); // Renderiza la vista index.pug
});
/*
//probar
app.get("/", (req, res) => {
  res.json({ message: "El servidor está funcionando correctamente" });
});*/
// Conectar a la base de datos e iniciar el servidor

Conexion.conectar().then(function () {
  app.listen(PORT, function () {
    console.log("Servidor Express escuchando en http://localhost:".concat(PORT));
  });
})["catch"](function (err) {
  console.error("No se pudo iniciar la aplicación:", err);
});
module.exports = app;