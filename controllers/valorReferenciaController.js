const valorReferenciaService = require('../services/valorReferenciaService');
const determinacionService = require('../services/determinacionService');

// Formulario crear/editar
const getForm = async (req, res) => {
  try {
    const determinaciones = await determinacionService.getAllDeterminaciones();
    const valor = req.params.id
      ? await valorReferenciaService.getValorReferenciaId(req.params.id)
      : {};
    res.render('cargaDatos/formValorReferencia', {
      title: valor.id ? 'Editar Valor Referencia' : 'Crear Valor Referencia',
      valor,
      determinaciones,
      action: valor.id ? `/valor_referencia/actualizar/${valor.id}` : '/valor_referencia/crear',
      btnText: valor.id ? 'Actualizar' : 'Crear',
    });
  } catch (error) {
    console.error('Error al cargar formulario valor referencia:', error);
    res.status(500).render('error', { message: 'Error al mostrar formulario' });
  }
};

const crear = async (req, res) => {
  try {
    await valorReferenciaService.crearValorReferencia(req.body);
    res.redirect('/cargar_datos');
  } catch (error) {
    console.error('Error al crear valor referencia:', error);
    res.status(400).render('cargaDatos/formValorReferencia', { error: error.message, ...req.body });
  }
};

const actualizar = async (req, res) => {
  try {
    await valorReferenciaService.actualizarValorReferencia(req.params.id, req.body);
    res.redirect('/cargar_datos');
  } catch (error) {
    console.error('Error al actualizar valor referencia:', error);
    res.status(400).render('cargaDatos/formValorReferencia', { error: error.message, ...req.body });
  }
};

// Eliminar (lógico)
const eliminar = async (req, res) => {
  try {
    await valorReferenciaService.eliminarValorReferencia(req.params.id);
    res.redirect('/cargar_datos');
  } catch (error) {
    console.error('Error al eliminar valor referencia:', error);
    res.status(500).render('error', { message: 'Error al eliminar' });
  }
};

module.exports = { getForm, crear, actualizar, eliminar };