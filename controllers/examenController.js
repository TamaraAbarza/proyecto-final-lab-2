const examenService = require("../services/examenService");
const resultadoService = require("../services/resultadoService");
const ordenTrabajoService = require("../services/ordenTrabajoService");
const historialService = require("../services/historialService");
const { OrdenTrabajo, Resultado } = require("../models");

// Formulario crear/editar
const getForm = async (req, res) => {
  try {
    const examen = req.params.id
      ? await examenService.getExamenId(req.params.id)
      : {};
    res.render("cargaDatos/formExamen", {
      title: examen.id ? "Editar Examen" : "Crear Examen",
      examen,
      action: examen.id ? `/examen/actualizar/${examen.id}` : "/examen/crear",
      btnText: examen.id ? "Actualizar" : "Crear"
    });
  } catch (error) {
    console.error("Error al cargar formulario examen:", error);
    res.status(500).render("error", { message: "Error al mostrar formulario" });
  }
};

// Crear examen
const crear = async (req, res) => {
  try {
    await examenService.crearExamen(req.body);
    res.redirect("/cargar_datos");
  } catch (error) {
    console.error("Error al crear examen:", error);
    res
      .status(400)
      .render("cargaDatos/formExamen", { error: error.message, ...req.body });
  }
};

// Actualizar examen
const actualizar = async (req, res) => {
  try {
    await examenService.actualizarExamen(req.params.id, req.body);
    res.redirect("/cargar_datos");
  } catch (error) {
    console.error("Error al actualizar examen:", error);
    res
      .status(400)
      .render("cargaDatos/formExamen", { error: error.message, ...req.body });
  }
};

// Eliminar examen (lógico)
const eliminar = async (req, res) => {
  try {
    await examenService.eliminarExamen(req.params.id);
    res.redirect("/cargar_datos");
  } catch (error) {
    console.error("Error al eliminar examen:", error);
    res.status(500).render("error", { message: "Error al eliminar examen" });
  }
};

const getRegistrarResultado = async (req, res) => {
  try {
    const { ordenId, examenId } = req.params;
    const datos = await examenService.getDatosParaResultado(examenId, ordenId);

    // Calcular edad
    const edadPaciente = resultadoService.calcularEdad(
      datos.ordenTrabajo.paciente.fechaNacimiento
    );

    // Preparar array de determinaciones con rangos
    const determinaciones = datos.examen.determinaciones.map((det) => {
      // Filtrar los valores de referencia adecuados
      const refs = det.valoresReferencia.filter((v) => {
        const minE = v.edadMinima || 0;
        const maxE = v.edadMaxima || Infinity;
        const matchGenero =
          !v.genero || v.genero === datos.ordenTrabajo.paciente.genero;
        return matchGenero && edadPaciente >= minE && edadPaciente <= maxE;
      });
      const ref = refs[0] || {};

      return {
        id: det.id,
        nombre: det.nombreDeterminacion,
        unidadMedida: det.unidadMedida,
        valorMin: ref.valorReferenciaMinimo ?? null,
        valorMax: ref.valorReferenciaMaximo ?? null
      };
    });

    // Detectar si vino alerta por fuera de rango
    const alerta = req.query.alerta === "1";

    res.render("resultado/formResultado", {
      datos,
      determinaciones,
      alerta,
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error en getRegistrarResultado:", error);
    res.status(500).render("error", {
      message: "No se pudieron cargar datos del formulario.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

const registrarResultado = async (req, res) => {
  try {
    const { examenId } = req.params;
    const { ordenId, muestraId } = req.body;
    // Extraer valores
    const determinaciones = Object.entries(req.body)
      .filter(([key]) => key.startsWith("det_"))
      .map(([key, valorFinal]) => ({
        determinacionId: key.split("_")[1],
        valorFinal: parseFloat(valorFinal)
      }));

    // Validar en servidor
    const alertas = [];
    for (const d of determinaciones) {
      const refs = await resultadoService.getValoresReferencia(
        d.determinacionId
      );
      const { valorReferenciaMinimo, valorReferenciaMaximo } = refs;
      if (valorReferenciaMinimo != null && valorReferenciaMaximo != null) {
        if (
          d.valorFinal < valorReferenciaMinimo ||
          d.valorFinal > valorReferenciaMaximo
        ) {
          alertas.push({ determinacionId: d.determinacionId });
        }
      }
    }

    if (alertas.length > 0 && !req.query.forzar) {
      // Re-render con alerta
      req.flash(
        "warning",
        "Algunos valores están fuera de rango. ¿Desea forzar el registro?"
      );
      return res.redirect(`${req.originalUrl}?alerta=1`);
    }

    // Guardar resultados
    for (const d of determinaciones) {
      await resultadoService.crearResultado({
        muestraId,
        determinacionId: d.determinacionId,
        ordenId,
        valorFinal: d.valorFinal,
        fechaResultado: new Date()
      });
    }
    await examenService.verificarCargaResultados(ordenId, req.usuario.id);
    res.redirect("/orden/all");
  } catch (error) {
    console.error("Error en registrarResultado:", error);
    res.status(500).render("error", {
      message: "Error al registrar resultados.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

const getValidarResultados = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const orden = await ordenTrabajoService.getOrdenConDeterminaciones(ordenId);

    const edadPaciente = resultadoService.calcularEdad(
      orden.paciente.fechaNacimiento
    );

    const resultadosBrutos = await resultadoService.obtenerResultadosDeOrden(
      ordenId,
      orden.paciente
    );

    // Marco fueraDeRango
    const resultados = resultadosBrutos.map((r) => {
      let fueraDeRango = false;
      const { valorFinal, valorReferenciaMinimo, valorReferenciaMaximo } = r;
      if (valorReferenciaMinimo != null && valorReferenciaMaximo != null) {
        if (
          valorFinal < valorReferenciaMinimo ||
          valorFinal > valorReferenciaMaximo
        ) {
          fueraDeRango = true;
        }
      }
      return { ...r, fueraDeRango };
    });

    res.render("orden/ordenParaValidar", {
      orden,
      edadPaciente,
      resultados,
      editar: false,
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al renderizar los detalles de la orden:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const validarResultados = async (req, res) => {
  try {
    const ordenId = req.params.ordenId;
    const usuarioId = req.usuario.id;
    const validar = req.query.validar === "true";

    const orden = await OrdenTrabajo.findByPk(ordenId);
    if (!orden) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Actualizar el estado de la orden
    if (validar) {
      orden.estado = "informada";

      // Registrar en el historial estado de orden
      await historialService.crear({
        ordenId: ordenId,
        estadoNuevo: "informada",
        descripcion: "Orden validada",
        usuarioId
      });
    } else {
      orden.estado = "pre informe";
      resultadoService.eliminarResultadosPorOrden(ordenId);
    }

    await orden.save();

    //return res.redirect(`/orden/all`);
    return res.redirect(`/examen/${orden.id}/informe`);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la orden", error });
  }
};

const getActualizarValidacion = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const orden = await ordenTrabajoService.getOrdenConDeterminaciones(ordenId);

    const edadPaciente = resultadoService.calcularEdad(
      orden.paciente.fechaNacimiento
    );

    // Obtengo los resultados con valorFinal y rangos
    const resultadosBrutos = await resultadoService.obtenerResultadosDeOrden(
      ordenId,
      orden.paciente
    );

    // Marco fueraDeRango
    const resultados = resultadosBrutos.map((r) => {
      let fueraDeRango = false;
      const { valorFinal, valorReferenciaMinimo, valorReferenciaMaximo } = r;
      if (valorReferenciaMinimo != null && valorReferenciaMaximo != null) {
        if (
          valorFinal < valorReferenciaMinimo ||
          valorFinal > valorReferenciaMaximo
        ) {
          fueraDeRango = true;
        }
      }
      return { ...r, fueraDeRango };
    });

    res.render("orden/ordenParaValidar", {
      orden,
      edadPaciente,
      resultados,
      editar: true,
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al renderizar los detalles de la orden:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const informeResultados = async (req, res) => {
  try {
    const { ordenId } = req.params;

    const orden = await ordenTrabajoService.getOrdenConDeterminaciones(ordenId);
    const edadPaciente = resultadoService.calcularEdad(
      orden.paciente.fechaNacimiento
    );

    const resultadosBrutos = await resultadoService.obtenerResultadosDeOrden(
      ordenId,
      orden.paciente
    );

    const informePath = await resultadoService.generarInformePDF(
      orden,
      edadPaciente,
      resultadosBrutos
    );

    res.download(informePath, `informe_orden_${ordenId}.pdf`);
  } catch (error) {
    console.error("Error en downloadInformeResultados:", error);
    res.status(500).render("error", {
      message: "Hubo un error al descargar el informe.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const getActualizarResultado = async (req, res) => {
  try {
    const { ordenId, examenId } = req.params;
    // 1) traigo datos estáticos de examen, muestra y paciente
    const datos = await examenService.getDatosParaResultado(examenId, ordenId);
    if (!datos) return res.status(404).send("Resultado no encontrado");

    // 2) obtengo directamente el mapa de resultados por determinacion
    const resultadosMap = await examenService.obtenerResultadosPorOrden(ordenId);

    // 3) cálculo de edad
    const edadPaciente = resultadoService.calcularEdad(
      datos.ordenTrabajo.paciente.fechaNacimiento
    );

    // 4) preparo el listado de determinaciones
    const determinaciones = datos.examen.determinaciones.map(det => {
      const refs = det.valoresReferencia.filter(v => {
        const minE = v.edadMinima || 0;
        const maxE = v.edadMaxima || Infinity;
        const matchGenero = !v.genero || v.genero === datos.ordenTrabajo.paciente.genero;
        return matchGenero && edadPaciente >= minE && edadPaciente <= maxE;
      });
      const ref = refs[0] || {};

      const resultado = resultadosMap[det.id] || {};
      return {
        id: det.id,
        nombre: det.nombreDeterminacion,
        unidadMedida: det.unidadMedida,
        valorMin: ref.valorReferenciaMinimo ?? null,
        valorMax: ref.valorReferenciaMaximo ?? null,
        valorFinal: resultado.valorFinal ?? null,
        resultadoId: resultado.id ?? null
      };
    });

    res.render("resultado/modificarResultado", {
      datos,
      determinaciones,
      action: "modificar",
      role: req.usuario.rol,
      alerta: req.query.alerta
    });
  } catch (error) {
    console.error("Error en getActualizarResultado:", error);
    res.status(500).render("error", {
      message: "No se pudieron cargar los datos del formulario para actualizar.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

const actualizarResultado = async (req, res) => {
  try {
    const { ordenId, examenId } = req.params;

    // Extraigo todos los inputs cuyo name empieza con "det_"
    const cambios = Object.entries(req.body)
      .filter(([key]) => key.startsWith('det_'))
      .map(([key, valor]) => ({
        determinacionId: parseInt(key.split('_')[1], 10),
        valorFinal: parseFloat(valor)
      }));

    // Validación simple de rangos (puedes moverla al servicio si quieres)
    for (const { determinacionId, valorFinal } of cambios) {
      const { valorReferenciaMinimo, valorReferenciaMaximo } =
        await resultadoService.getValoresReferencia(determinacionId);
      if (
        valorReferenciaMinimo != null &&
        valorReferenciaMaximo != null &&
        (valorFinal < valorReferenciaMinimo || valorFinal > valorReferenciaMaximo)
      ) {
        // Si hay fuera de rango, forzar con ?forzar=1
        if (!req.query.forzar) {
          return res.redirect(`${req.originalUrl}?forzar=1`);
        }
      }
    }

    // Aplico los cambios directamente
    for (const { determinacionId, valorFinal } of cambios) {
      const resultado = await Resultado.findOne({
        where: { ordenId, determinacionId }
      });
      if (!resultado) {
        throw new Error(`Resultado no encontrado para determinación ${determinacionId}`);
      }
      resultado.valorFinal = valorFinal;
      resultado.fechaResultado = new Date();
      await resultado.save();
    }
    res.redirect('/orden/all');
  } catch (error) {
    console.error('Error en actualizarResultado:', error);
    res.status(500).render('error', {
      message: 'Error al actualizar resultados.',
      role: req.usuario.rol,
      error: error.message
    });
  }
};


module.exports = {
  getForm,
  crear,
  actualizar,
  eliminar,
  getRegistrarResultado,
  registrarResultado,
  getValidarResultados,
  validarResultados,
  getActualizarValidacion,
  informeResultados,
  getActualizarResultado,
  actualizarResultado
};
