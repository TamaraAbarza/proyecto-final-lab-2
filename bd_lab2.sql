-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-05-2025 a las 21:43:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_lab2`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditorias`
--

CREATE TABLE `auditorias` (
  `id` int(11) NOT NULL,
  `tabla_afectada` varchar(255) NOT NULL,
  `registro_id` int(11) NOT NULL,
  `operacion` enum('inserción','actualización','eliminación','otro') NOT NULL,
  `detalles` text DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditorias`
--

INSERT INTO `auditorias` (`id`, `tabla_afectada`, `registro_id`, `operacion`, `detalles`, `usuario_id`, `createdAt`, `updatedAt`) VALUES
(1, 'Usuario', 2, 'inserción', 'Se registró un nuevo usuario', 1, '2025-05-22 17:56:21', '2025-05-22 17:56:21'),
(2, 'Usuario', 3, 'inserción', 'Se registró un nuevo usuario', 1, '2025-05-22 17:56:51', '2025-05-22 17:56:51'),
(3, 'Usuario', 4, 'inserción', 'Se registró un nuevo usuario', 1, '2025-05-22 17:57:24', '2025-05-22 17:57:24'),
(4, 'Paciente', 1, 'inserción', 'Se registró un nuevo paciente', 2, '2025-05-22 18:23:49', '2025-05-22 18:23:49'),
(5, 'Paciente', 2, 'inserción', 'Se registró un nuevo paciente', 1, '2025-05-22 19:13:24', '2025-05-22 19:13:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `determinaciones`
--

CREATE TABLE `determinaciones` (
  `id` int(11) NOT NULL,
  `nombre_determinacion` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(255) DEFAULT NULL,
  `examen_id` int(11) NOT NULL,
  `estado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `determinaciones`
--

INSERT INTO `determinaciones` (`id`, `nombre_determinacion`, `unidad_medida`, `examen_id`, `estado`) VALUES
(1, 'Glóbulos Rojos (Eritrocitos)', 'millones/µL', 1, NULL),
(2, 'Hemoglobina (Hb)', 'g/dL', 1, NULL),
(3, 'Hematocrito (Hto)', '%', 1, NULL),
(4, 'Glóbulos Blancos (Leucocitos)', 'miles/μL', 1, NULL),
(5, 'Glucosa', 'mg/dL', 2, NULL),
(6, 'Colesterol Total', 'mg/dL', 3, NULL),
(7, 'Colesterol LDL', 'mg/dL', 3, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `examenes`
--

CREATE TABLE `examenes` (
  `id` int(11) NOT NULL,
  `nombre_examen` varchar(255) NOT NULL,
  `tipo_muestra` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `codigo` varchar(255) NOT NULL,
  `dias_estimados_resultados` int(11) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `examenes`
--

INSERT INTO `examenes` (`id`, `nombre_examen`, `tipo_muestra`, `descripcion`, `codigo`, `dias_estimados_resultados`, `estado`) VALUES
(1, 'Hemograma Completo', 'Sangre', NULL, 'HC001', 4, 1),
(2, 'Glucemia', 'Suero', NULL, 'GLU001', 2, 1),
(3, 'Perfil Lipídico', 'Suero', NULL, 'PL00', 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_estados_orden`
--

CREATE TABLE `historial_estados_orden` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `estado_nuevo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `muestras`
--

CREATE TABLE `muestras` (
  `id` int(11) NOT NULL,
  `orden_examen_id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `fecha_recepcion` datetime NOT NULL,
  `tipo_muestra` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_examen`
--

CREATE TABLE `ordenes_examen` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `examen_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_trabajo`
--

CREATE TABLE `ordenes_trabajo` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `diagnostico` text NOT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `estado` enum('esperando toma de muestra','analítica','pre informe','para validar','informada') DEFAULT 'esperando toma de muestra',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` datetime NOT NULL,
  `genero` enum('F','M') NOT NULL,
  `embarazo` tinyint(4) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) DEFAULT 1,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `dni`, `telefono`, `direccion`, `fecha_nacimiento`, `genero`, `embarazo`, `fecha_registro`, `estado`, `usuario_id`) VALUES
(1, 'Maria', 'Lucero', '12345678', '02664340212', 'calle 123', '1987-07-02 00:00:00', 'F', 0, '2025-05-22 18:23:49', 1, 5),
(2, 'Fernando', 'Saez', '41702345', '02662340080', 'direcion 123', '1999-01-05 00:00:00', 'M', 0, '2025-05-22 19:13:23', 1, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultados`
--

CREATE TABLE `resultados` (
  `id` int(11) NOT NULL,
  `muestra_id` int(11) NOT NULL,
  `determinacion_id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `valor_final` decimal(10,2) NOT NULL,
  `fecha_resultado` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre_usuario` varchar(255) DEFAULT NULL,
  `rol` enum('administrativo','recepcionista','técnico','bioquímico','paciente') NOT NULL,
  `correo` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre_usuario`, `rol`, `correo`, `password`, `estado`) VALUES
(1, 'Tamara Abarza', 'administrativo', 'abarzatamara6@gmail.com', '$2b$10$J6rKsBXD3BDFCC73AKWmRuOd5eWSbA9GRcsIvwmfhZ3IM6N2J4JH6', 1),
(2, 'Pedro Recepcion', 'recepcionista', 'recepcion@gmail.com', '$2b$10$5yYTr9uAH2QVbgj7luzqcuZXlSmPbwdvEFReWjzMkEB7kyFCE2ywS', 1),
(3, 'Tania Tecnico', 'técnico', 'tecnico@gmail.com', '$2b$10$vUr5MY5jEva0ZNrhjItk9u22V9Bw4wmjDxa26ZjFg.QhgC9bIlzC2', 1),
(4, 'Maria bioquimica', 'bioquímico', 'bioquimico@gmail.com', '$2b$10$kV3gqw66nwZFYBZpZhUf1OwXEc1AqYyCe2hDsN0UYudF2KujtXAcS', 1),
(5, 'Maria Lucero', 'paciente', 'maria@correo.com', '$2b$10$U3wcgZkTYqYTC8Y7NkQV4uAwJKiEvnGcOt6uGl9oYArsv/HYrwiwi', 1),
(6, 'Fernando Saez', 'paciente', 'fernandosaez@gmail.com', '$2b$10$x.EZK5RFHYos9Uhm72xa0uhKKEr0WvKH9iEIOe802GEoehEv6epqG', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valores_referencia`
--

CREATE TABLE `valores_referencia` (
  `id` int(11) NOT NULL,
  `determinacion_id` int(11) NOT NULL,
  `edad_minima` int(11) NOT NULL,
  `edad_maxima` int(11) NOT NULL,
  `genero` enum('F','M') DEFAULT NULL,
  `valor_referencia_minimo` float NOT NULL,
  `valor_referencia_maximo` float NOT NULL,
  `estado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `valores_referencia`
--

INSERT INTO `valores_referencia` (`id`, `determinacion_id`, `edad_minima`, `edad_maxima`, `genero`, `valor_referencia_minimo`, `valor_referencia_maximo`, `estado`) VALUES
(1, 1, 0, 1, '', 3, 5.5, NULL),
(2, 1, 18, 99, 'F', 4, 5, NULL),
(3, 2, 18, 99, 'M', 13.5, 17.5, NULL),
(4, 2, 18, 99, 'F', 12, 15.5, NULL),
(5, 3, 18, 99, 'M', 41, 53, NULL),
(6, 3, 18, 99, 'F', 36, 46, NULL),
(7, 3, 18, 99, 'F', 36, 46, 0),
(8, 4, 0, 99, '', 4.5, 10, NULL),
(9, 5, 18, 99, '', 70, 100, NULL),
(10, 1, 20, 99, '', 200, 999999, NULL),
(11, 7, 20, 99, '', 100, 99999, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditorias`
--
ALTER TABLE `auditorias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `determinaciones`
--
ALTER TABLE `determinaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `examen_id` (`examen_id`);

--
-- Indices de la tabla `examenes`
--
ALTER TABLE `examenes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `codigo_2` (`codigo`),
  ADD UNIQUE KEY `codigo_3` (`codigo`),
  ADD UNIQUE KEY `codigo_4` (`codigo`),
  ADD UNIQUE KEY `codigo_5` (`codigo`),
  ADD UNIQUE KEY `codigo_6` (`codigo`),
  ADD UNIQUE KEY `codigo_7` (`codigo`),
  ADD UNIQUE KEY `codigo_8` (`codigo`),
  ADD UNIQUE KEY `codigo_9` (`codigo`);

--
-- Indices de la tabla `historial_estados_orden`
--
ALTER TABLE `historial_estados_orden`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_id` (`orden_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `muestras`
--
ALTER TABLE `muestras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_examen_id` (`orden_examen_id`),
  ADD KEY `paciente_id` (`paciente_id`);

--
-- Indices de la tabla `ordenes_examen`
--
ALTER TABLE `ordenes_examen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_id` (`orden_id`),
  ADD KEY `examen_id` (`examen_id`);

--
-- Indices de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_id` (`paciente_id`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `muestra_id` (`muestra_id`),
  ADD KEY `determinacion_id` (`determinacion_id`),
  ADD KEY `orden_id` (`orden_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `correo_2` (`correo`),
  ADD UNIQUE KEY `correo_3` (`correo`),
  ADD UNIQUE KEY `correo_4` (`correo`),
  ADD UNIQUE KEY `correo_5` (`correo`),
  ADD UNIQUE KEY `correo_6` (`correo`),
  ADD UNIQUE KEY `correo_7` (`correo`),
  ADD UNIQUE KEY `correo_8` (`correo`),
  ADD UNIQUE KEY `correo_9` (`correo`),
  ADD UNIQUE KEY `correo_10` (`correo`);

--
-- Indices de la tabla `valores_referencia`
--
ALTER TABLE `valores_referencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `determinacion_id` (`determinacion_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditorias`
--
ALTER TABLE `auditorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `determinaciones`
--
ALTER TABLE `determinaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `examenes`
--
ALTER TABLE `examenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `historial_estados_orden`
--
ALTER TABLE `historial_estados_orden`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `muestras`
--
ALTER TABLE `muestras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ordenes_examen`
--
ALTER TABLE `ordenes_examen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `resultados`
--
ALTER TABLE `resultados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `valores_referencia`
--
ALTER TABLE `valores_referencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditorias`
--
ALTER TABLE `auditorias`
  ADD CONSTRAINT `auditorias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `determinaciones`
--
ALTER TABLE `determinaciones`
  ADD CONSTRAINT `determinaciones_ibfk_1` FOREIGN KEY (`examen_id`) REFERENCES `examenes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_estados_orden`
--
ALTER TABLE `historial_estados_orden`
  ADD CONSTRAINT `historial_estados_orden_ibfk_17` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `historial_estados_orden_ibfk_18` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `muestras`
--
ALTER TABLE `muestras`
  ADD CONSTRAINT `muestras_ibfk_13` FOREIGN KEY (`orden_examen_id`) REFERENCES `ordenes_examen` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `muestras_ibfk_14` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_examen`
--
ALTER TABLE `ordenes_examen`
  ADD CONSTRAINT `ordenes_examen_ibfk_15` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `ordenes_examen_ibfk_16` FOREIGN KEY (`examen_id`) REFERENCES `examenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD CONSTRAINT `ordenes_trabajo_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD CONSTRAINT `resultados_ibfk_16` FOREIGN KEY (`muestra_id`) REFERENCES `muestras` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resultados_ibfk_17` FOREIGN KEY (`determinacion_id`) REFERENCES `determinaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resultados_ibfk_18` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `valores_referencia`
--
ALTER TABLE `valores_referencia`
  ADD CONSTRAINT `valores_referencia_ibfk_1` FOREIGN KEY (`determinacion_id`) REFERENCES `determinaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
