const {
  Paciente,
  Examen,
  OrdenTrabajo,
  OrdenExamen,
  Determinacion,
  Muestra,
  sequelize,
  ordenExamen,
  Resultado,
  ValorReferencia
} = require("../models");

const auditoriaService = require("../services/auditoriaService");

const { Op } = require("sequelize");

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ordenTrabajoService = require("../services/ordenTrabajoService");
const historialService = require("../services/historialService");

const crearResultado = async ({
  muestraId,
  determinacionId,
  ordenId,
  valorFinal,
  fechaResultado
}) => {
  try {
    const orden = await ordenTrabajoService.getOrdenId(ordenId);

    if (!orden) {
      throw new Error(`No se encontró la orden de trabajo con ID: ${ordenId}`);
    }

    if (orden.estado !== "pre informe") {
      throw new Error(
        `La orden de trabajo con ID: ${ordenId} no se encuentra en estado "pre informe". Su estado actual es: ${orden.estado}`
      );
    }

    const nuevoResultado = await Resultado.create({
      muestraId,
      determinacionId,
      ordenId,
      valorFinal,
      fechaResultado
    });

    /*
    await auditoriaService.crearAuditoria({
      tablaAfectada: "Resultado",
      registroId: nuevoResultado.id,
      operacion: "inserción",
      detalles: "Se registraron nuevos resultados",
      usuarioId: req.usuario.id
    });*/

    return nuevoResultado;
  } catch (error) {
    console.error(`Error al crear el resultado: `, error);
    throw error;
  }
};

const actualizarResultado = async ({
  resultadoId,
  valorFinal,
  fechaResultado
}) => {
  try {
    const resultado = await Resultado.findByPk(resultadoId);
    if (!resultado) {
      throw new Error(`Resultado con ID ${resultadoId} no encontrado`);
    }

    resultado.valorFinal = valorFinal;
    resultado.fechaResultado = fechaResultado;
    await resultado.save();

    await auditoriaService.crearAuditoria({
      tablaAfectada: "Resultado",
      registroId: resultadoId,
      operacion: "actualización",
      detalles: "Se modificaron los resultados",
      usuarioId: req.usuario.id
    });

    return resultado;
  } catch (error) {
    console.error(`Error al actualizar el resultado ${resultadoId}:`, error);
    throw error;
  }
};

const eliminarResultado = async (resultadoId) => {
  try {
    const resultado = await Resultado.findOne({
      where: { id: resultadoId }
    });

    if (!resultado) {
      throw new Error(`No se encontró el resultado con ID: ${resultadoId}`);
    }

    await resultado.destroy();

    return { message: "Resultado eliminado exitosamente" };
  } catch (error) {
    console.error("Error al eliminar el resultado: ", error);
    throw error;
  }
};

const eliminarResultadosPorOrden = async (ordenId) => {
  try {
    const resultados = await Resultado.findAll({
      where: { ordenId }
    });

    if (resultados.length === 0) {
      throw new Error(
        `No se encontraron resultados asociados a la orden con ID: ${ordenId}`
      );
    }

    await Resultado.destroy({
      where: { ordenId }
    });

    //FALTA AUDITORIA --------------------------------------------------------
    // Registrar la acción de eliminación en el
    //  historial o auditoría si es necesario
    // await historialService.registrarAccion('eliminar resultados', { ordenId });

    return {
      message: `Todos los resultados de la orden con ID: ${ordenId} fueron eliminados exitosamente.`
    };
  } catch (error) {
    console.error("Error al eliminar los resultados: ", error);
    throw error;
  }
};

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth();
  const dia = hoy.getDate();

  if (
    mes < nacimiento.getMonth() ||
    (mes === nacimiento.getMonth() && dia < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
};

// Obtener el rango de referencia para una determinación
const getValoresReferencia = async (determinacionId) => {
  const v = await ValorReferencia.findOne({ where: { determinacionId } });
  return {
    valorReferenciaMinimo: v?.valorReferenciaMinimo ?? null,
    valorReferenciaMaximo: v?.valorReferenciaMaximo ?? null
  };
};

const obtenerResultadosDeOrden = async (ordenId, paciente) => {
  const rawResultados = await Resultado.findAll({
    where: { ordenId },
    include: [
      {
        model: Determinacion,
        as: "determinacion",
        include: [
          {
            model: Examen,
            as: "examen"
          },
          {
            model: ValorReferencia,
            as: "valoresReferencia",
            required: false
          }
        ]
      }
    ]
  });

  //filtro por edad/género y armo el array
  const { genero, fechaNacimiento } = paciente;
  const edad = Math.floor(
    (Date.now() - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const resultados = rawResultados.map((r) => {
    // obtengo determinación y examen
    const det = r.determinacion;
    const exam = det.examen;

    // filtro valores de referencia según género y edad
    const refs = det.valoresReferencia.filter((v) => {
      const minE = v.edadMinima || 0;
      const maxE = v.edadMaxima || Infinity;
      const matchGenero = !v.genero || v.genero === genero;
      return matchGenero && edad >= minE && edad <= maxE;
    });

    // tomo la primera referencia (o null si no hay)
    const ref = refs[0] || {};
    return {
      examenId: exam.id,
      nombreExamen: exam.nombreExamen,
      determinacionId: det.id,
      nombreDeterminacion: det.nombreDeterminacion,
      unidadMedida: det.unidadMedida,
      valorFinal: r.valorFinal,
      valorReferenciaMinimo: ref.valorReferenciaMinimo ?? null,
      valorReferenciaMaximo: ref.valorReferenciaMaximo ?? null
    };
  });

  return resultados;
};

const generarInformePDF = async (orden, edadPaciente, resultados) => {
  const informesDir = path.join(__dirname, "../public/informes");
  if (!fs.existsSync(informesDir)) {
    fs.mkdirSync(informesDir, { recursive: true });
  }
  const outputPath = path.join(informesDir, `informe_orden_${orden.id}.pdf`);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Encabezado
  doc
    .fontSize(14)
    .text(`Informe de Resultados - Orden #${orden.id}`, { align: "center" })
    .moveDown()
    .fontSize(10)
    .text(`Paciente: ${orden.paciente.apellido}, ${orden.paciente.nombre}`)
    .text(`Edad: ${edadPaciente} años`)
    .text(`Género: ${orden.paciente.genero}`)
    .text(`Diagnóstico: ${orden.diagnostico}`)
    .moveDown(2);

  // Agrupar por examen
  const grouped = {};
  resultados.forEach((r) => {
    if (!grouped[r.examenId]) {
      grouped[r.examenId] = { nombre: r.nombreExamen, items: [] };
    }
    grouped[r.examenId].items.push(r);
  });

  // Para cada examen, listado de determinaciones con tabla
  Object.values(grouped).forEach((exam) => {
    doc
      .fontSize(12)
      .text(exam.nombre, { underline: true })
      .moveDown(0.5)
      .fontSize(10);

    const startY = doc.y;
    const colWidths = [200, 100, 100];

    // Encabezado
    doc
      .rect(40, startY, colWidths[0], 20)
      .rect(40 + colWidths[0], startY, colWidths[1], 20)
      .rect(40 + colWidths[0] + colWidths[1], startY, colWidths[2], 20)
      .stroke();

    doc
      .text("Determinación", 42, startY + 5)
      .text("Valor", 42 + colWidths[0], startY + 5, {
        width: colWidths[1],
        align: "center"
      })
      .text("Referencia", 42 + colWidths[0] + colWidths[1], startY + 5, {
        width: colWidths[2],
        align: "center"
      });

    let rowY = startY + 20;

    // Filas de la tabla
    exam.items.forEach((item) => {
      const unidad = item.unidadMedida || "";
      const valor =
        item.valorFinal != null ? `${item.valorFinal} ${unidad}` : "N/A";
      const rango =
        item.valorReferenciaMinimo != null && item.valorReferenciaMaximo != null
          ? `${item.valorReferenciaMinimo} - ${item.valorReferenciaMaximo} ${unidad}`
          : "N/A";

      doc
        .rect(40, rowY, colWidths[0], 20)
        .rect(40 + colWidths[0], rowY, colWidths[1], 20)
        .rect(40 + colWidths[0] + colWidths[1], rowY, colWidths[2], 20)
        .stroke();

      doc
        .text(item.nombreDeterminacion, 42, rowY + 5)
        .text(valor, 42 + colWidths[0], rowY + 5, {
          width: colWidths[1],
          align: "center"
        })
        .text(rango, 42 + colWidths[0] + colWidths[1], rowY + 5, {
          width: colWidths[2],
          align: "center"
        });

      rowY += 20;
    });

    doc.moveDown(1);
  });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return outputPath;
};

module.exports = {
  crearResultado,
  obtenerResultadosDeOrden,
  calcularEdad,
  getValoresReferencia,
  eliminarResultado,
  eliminarResultadosPorOrden,
  generarInformePDF,
  actualizarResultado
};
