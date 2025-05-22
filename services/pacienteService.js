// services/pacienteService.js
const { 
  OrdenTrabajo, 
  Paciente, 
  Usuario,
  OrdenExamen, 
  Examen, 
  Determinacion, 
} = require('../models');
const UsuarioService = require("../services/usuarioService")
const { Op } = require("sequelize");
const { sequelize } = require('../config/dbConfig');

const getPacientePorId = async (id) => {
  try {
    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }
    return paciente;
  } catch (error) {
    throw new Error(
      error.message || "Ocurrió un error al obtener el paciente."
    );
  }
};

const getPacientes = async () => {
  try {
    const pacientes = await Paciente.findAll({
      order: [["apellido", "ASC"]]
    });
    return pacientes;
  } catch (error) {
    throw new Error(
      error.message || "Ocurrió un error al obtener la lista de pacientes."
    );
  }
};

const getPacientePorDni = async (dni) => {
  try {
    const paciente = await Paciente.findOne({
      where: { dni },
      include: {
        model: Usuario,
        as: "usuario",
        attributes: ["correo"]
      }
    });

    return paciente;
  } catch (error) {
    console.error("Error al obtener el paciente:", error);
    throw new Error("Error al obtener el paciente");
  }
};

const registrarPaciente = async (pacienteData, nombreUsuario, usuarioLogueadoId) => {
  const t = await sequelize.transaction();
  try {
    const { correo, dni, ...paciente } = pacienteData;

    // Validar si ya existe el paciente
    const pacienteExistente = await Paciente.findOne({ where: { dni }, transaction: t });
    if (pacienteExistente) {
      throw new Error("El DNI ya está registrado.");
    }

    // Llamar al servicio para crear el usuario
    const usuarioNuevo = await UsuarioService.crearUsuario(correo, dni, "paciente", nombreUsuario, usuarioLogueadoId);

    if (!usuarioNuevo || !usuarioNuevo.id) {
      throw new Error("Error al crear el usuario");
    }

    // Crear el paciente
    const pacienteNuevo = await Paciente.create(
      {
        usuarioId: usuarioNuevo.id,
        dni,
        ...paciente,
      },
      { transaction: t }
    );

    await t.commit();

    return { usuarioId: usuarioNuevo.id, pacienteId: pacienteNuevo.id }; // Asegúrate de devolver el id correcto
  } catch (error) {
    await t.rollback();
    console.error("Error al registrar el paciente", error);
    throw error;
  }
};

const eliminarPaciente = async (id) => {
  try {
    const paciente = await Paciente.findOne({ where: { id } });
    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }
    await paciente.update({ estado: false });
    return { success: true, message: "Paciente eliminado exitosamente" };
  } catch (error) {
    throw new Error(
      error.message || "Ocurrió un error al eliminar el paciente."
    );
  }
};

const actualizarPaciente = async (pacienteId, pacienteData) => {
  const {
    usuarioId,
    nombre,
    apellido,
    dni,
    fechaNacimiento,
    genero,
    embarazo,
    telefono,
    direccion
  } = pacienteData;

  try {
    // Verificar si el DNI ya está registrado en otro paciente
    const pacienteExistente = await Paciente.findOne({
      where: { dni, id: { [Op.ne]: pacienteId } }
    });

    if (pacienteExistente) {
      throw new Error("El DNI ya está registrado en otro paciente.");
    }

    // Obtener el paciente actual para actualizar sus datos
    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    // Actualizar los datos del paciente
    await paciente.update({
      usuarioId,
      nombre,
      apellido,
      dni,
      fechaNacimiento,
      genero,
      embarazo,
      telefono,
      direccion
    });

    return paciente;
  } catch (error) {
    throw new Error(`Error al actualizar paciente: ${error.message}`);
  }
};

const getInformes = async (patientId) => {
    throw new Error(
      error.message || "Ocurrió un error"
    );
};

/*
const getInformes = async (patientId) => {
  try {
    return await OrdenTrabajo.findAll({
      where: {
        pacienteId: patientId,
        estado: 'informada'
      },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'fechaNacimiento', 'sexo']
        },
        {
          model: OrdenExamen,
          as: 'ordenExamenes',
          include: [
            {
              model: Examen,
              as: 'examen',
              attributes: ['id', 'nombreExamen', 'descripcion', 'diasEstimadosResultados']
            },
            {
              model: Determinacion,
              as: 'determinaciones',
              include: [
                {
                  model: ExamenDeterminacion,
                  as: 'examenDeterminacion',
                  include: [
                    {
                      model: TipoDeterminacion,
                      as: 'tipoDeterminacion',
                      attributes: ['id', 'nombre', 'descripcion']
                    },
                    {
                      model: UnidadMedida,
                      as: 'unidadMedida',
                      attributes: ['id', 'abreviatura', 'descripcion']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['id', 'DESC']]
    });
  } catch (error) {
    console.error('Error al obtener informes:', error);
    throw error; // Re-lanza el error para que el llamador también pueda manejarlo
  }
};
*/

module.exports = {
  getPacientePorId,
  registrarPaciente,
  getPacientePorDni,
  eliminarPaciente,
  getPacientes,
  actualizarPaciente,
  getInformes
};
