const determinacionService = require('../services/determinacionService');
const examenService = require('../services/examenService');

// Formulario crear/editar
const getForm = async (req, res) => {
  try {
    const examenes = await examenService.getAllExamenes();
    const determinacion = req.params.id
      ? await determinacionService.getDeterminacionId(req.params.id)
      : {};
    res.render('cargaDatos/formDeterminacion', {
      title: determinacion.id ? 'Editar Determinación' : 'Crear Determinación',
      determinacion,
      examenes,
      action: determinacion.id ? `/determinacion/actualizar/${determinacion.id}` : '/determinacion/crear',
      btnText: determinacion.id ? 'Actualizar' : 'Crear',
    });
  } catch (error) {
    console.error('Error al cargar formulario determinación:', error);
    res.status(500).render('error', { message: 'Error al mostrar formulario' });
  }
};

// Crear
const crear = async (req, res) => {
  try {
    await determinacionService.crearDeterminacion(req.body);
    res.redirect('/cargar_datos');
  } catch (error) {
    console.error('Error al crear determinación:', error);
    res.status(400).render('cargaDatos/formDeterminacion', { error: error.message, ...req.body });
  }
};

// Actualizar
const actualizar = async (req, res) => {
  try {
    await determinacionService.actualizarDeterminacion(req.params.id, req.body);
    res.redirect('/cargar_datos');
  } catch (error) {
    console.error('Error al actualizar determinación:', error);
    res.status(400).render('cargaDatos/formDeterminacion', { error: error.message, ...req.body });
  }
};

// Eliminar (lógico)
const eliminar = async (req, res) => {
  try {
    await determinacionService.eliminarDeterminacion(req.params.id);
    res.redirect('/cargar_datos');
  } catch (error) {
    console.error('Error al eliminar determinación:', error);
    res.status(500).render('error', { message: 'Error al eliminar' });
  }
};

module.exports = { getForm, crear, actualizar, eliminar };