-- ============================================================
-- CLUB DE VOLEY - Datos de ejemplo para una base que YA EXISTE
--
-- Este script NO elimina tablas ni datos.
-- Solo agrega los registros que todavía no existen.
-- Se puede ejecutar más de una vez sin duplicar los ejemplos.
--
-- Pegar en: Supabase -> SQL Editor -> New query -> Run
-- Usuarios demo: contraseña 123456
-- ============================================================

-- ------------------------------------------------------------
-- Usuarios
-- ------------------------------------------------------------
INSERT INTO usuario (nombre, email, contrasena, rol)
SELECT v.nombre, v.email, v.contrasena, v.rol
FROM (VALUES
    ('Alex Gallardo',   'admin@clubvoley.com',     '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'administrador'),
    ('Juan Pérez',      'director@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'director_tecnico'),
    ('Marcos Díaz',     'jugador@clubvoley.com',   '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Lucía Fernández', 'jugador2@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Tomás Ríos',      'jugador3@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Sofía Martínez',  'directora@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'director_tecnico'),
    ('Valentina López', 'jugador4@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Bruno Castro',    'jugador5@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Camila Herrera',  'jugador6@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Nicolás Vega',    'jugador7@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Martina Sosa',    'jugador8@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Diego Acosta',    'jugador9@clubvoley.com',  '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Emilia Torres',   'jugador10@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Julieta Ramos',   'jugador11@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Facundo Prieto',  'jugador12@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
    ('Renata Molina',   'jugador13@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador')
) AS v(nombre, email, contrasena, rol)
WHERE NOT EXISTS (
    SELECT 1 FROM usuario u WHERE u.email = v.email
);

-- ------------------------------------------------------------
-- Categorías
-- ------------------------------------------------------------
INSERT INTO categoria (nombre, descripcion)
SELECT v.nombre, v.descripcion
FROM (VALUES
    ('Sub-14',           'Categoría formativa sub 14 años'),
    ('Mayores',          'Primera división del club'),
    ('Sub-16',           'Categoría formativa sub 16 años'),
    ('Sub-18',           'Categoría formativa sub 18 años'),
    ('Femenino Mayores', 'Primera división femenina del club')
) AS v(nombre, descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM categoria c WHERE c.nombre = v.nombre
);

-- ------------------------------------------------------------
-- Equipos
-- ------------------------------------------------------------
INSERT INTO equipo (id_categoria, id_director_tecnico, nombre_equipo, descripcion)
SELECT c.id_categoria, u.id_usuario, v.nombre_equipo, v.descripcion
FROM (VALUES
    ('Mayores A',        'Equipo principal masculino', 'Mayores',          'director@clubvoley.com'),
    ('Sub-14 A',         'Equipo formativo sub 14',    'Sub-14',           'director@clubvoley.com'),
    ('Sub-16 A',         'Equipo formativo sub 16',    'Sub-16',           'directora@clubvoley.com'),
    ('Sub-18 A',         'Equipo formativo sub 18',    'Sub-18',           'directora@clubvoley.com'),
    ('Mayores Femenino', 'Equipo principal femenino',  'Femenino Mayores', 'directora@clubvoley.com'),
    ('Sub-14 B',         'Segundo equipo formativo sub 14', 'Sub-14',       'director@clubvoley.com')
) AS v(nombre_equipo, descripcion, categoria, director_email)
JOIN categoria c ON c.nombre = v.categoria
JOIN usuario u ON u.email = v.director_email
WHERE NOT EXISTS (
    SELECT 1 FROM equipo e WHERE e.nombre_equipo = v.nombre_equipo
);

-- ------------------------------------------------------------
-- Jugadores
-- ------------------------------------------------------------
INSERT INTO jugador (id_usuario, id_equipo, fecha_nacimiento, posicion)
SELECT u.id_usuario, e.id_equipo, v.fecha_nacimiento::date, v.posicion
FROM (VALUES
    ('jugador@clubvoley.com',   'Mayores A', '2001-05-14', 'Armador'),
    ('jugador2@clubvoley.com',  'Mayores A', '2003-09-02', 'Punta'),
    ('jugador3@clubvoley.com',  'Mayores A', '2002-12-19', 'Central'),
    ('jugador4@clubvoley.com',  'Sub-14 A',  '2012-03-11', 'Punta'),
    ('jugador5@clubvoley.com',  'Sub-14 A',  '2011-11-27', 'Central'),
    ('jugador6@clubvoley.com',  'Sub-16 A',  '2009-06-05', 'Armador'),
    ('jugador7@clubvoley.com',  'Sub-16 A',  '2010-01-19', 'Opuesto'),
    ('jugador8@clubvoley.com',  'Sub-18 A',  '2008-09-23', 'Líbero'),
    ('jugador9@clubvoley.com',  'Sub-18 A',  '2007-12-02', 'Punta'),
    ('jugador10@clubvoley.com', 'Mayores Femenino', '2000-04-16', 'Central'),
    ('jugador11@clubvoley.com', 'Sub-14 B',  '2012-08-08', 'Armador'),
    ('jugador12@clubvoley.com', 'Sub-14 B',  '2011-05-30', 'Central'),
    ('jugador13@clubvoley.com', 'Mayores Femenino', '2001-10-21', 'Punta')
) AS v(email, equipo, fecha_nacimiento, posicion)
JOIN usuario u ON u.email = v.email
JOIN equipo e ON e.nombre_equipo = v.equipo
WHERE NOT EXISTS (
    SELECT 1 FROM jugador j WHERE j.id_usuario = u.id_usuario
);

-- ------------------------------------------------------------
-- Horarios
-- ------------------------------------------------------------
INSERT INTO horario (id_equipo, dia, hora_inicio, hora_fin, lugar)
SELECT e.id_equipo, v.dia, v.hora_inicio::time, v.hora_fin::time, v.lugar
FROM (VALUES
    ('Mayores A',        'Lunes',     '19:00', '21:00', 'Gimnasio Municipal'),
    ('Mayores A',        'Miércoles', '19:00', '21:00', 'Gimnasio Municipal'),
    ('Mayores A',        'Viernes',   '18:30', '20:30', 'Gimnasio Municipal'),
    ('Mayores A',        'Sábado',    '10:00', '12:00', 'Gimnasio Municipal'),
    ('Sub-14 A',         'Martes',    '18:00', '19:30', 'Gimnasio Municipal'),
    ('Sub-14 A',         'Jueves',    '18:00', '19:30', 'Gimnasio Municipal'),
    ('Sub-14 A',         'Sábado',    '09:00', '10:30', 'Gimnasio Municipal'),
    ('Sub-16 A',         'Lunes',     '18:00', '20:00', 'Gimnasio Municipal'),
    ('Sub-16 A',         'Miércoles', '18:00', '20:00', 'Gimnasio Municipal'),
    ('Sub-16 A',         'Viernes',   '18:00', '19:30', 'Gimnasio Municipal'),
    ('Sub-18 A',         'Martes',    '20:00', '22:00', 'Gimnasio Municipal'),
    ('Sub-18 A',         'Jueves',    '20:00', '22:00', 'Gimnasio Municipal'),
    ('Sub-18 A',         'Sábado',    '11:00', '13:00', 'Gimnasio Municipal'),
    ('Mayores Femenino', 'Lunes',     '20:00', '22:00', 'Gimnasio Municipal'),
    ('Mayores Femenino', 'Miércoles', '20:00', '22:00', 'Gimnasio Municipal'),
    ('Mayores Femenino', 'Sábado',    '14:00', '16:00', 'Gimnasio Municipal'),
    ('Sub-14 B',         'Martes',    '17:00', '18:30', 'Gimnasio Municipal'),
    ('Sub-14 B',         'Jueves',    '17:00', '18:30', 'Gimnasio Municipal'),
    ('Sub-14 B',         'Sábado',    '10:30', '12:00', 'Gimnasio Municipal')
) AS v(equipo, dia, hora_inicio, hora_fin, lugar)
JOIN equipo e ON e.nombre_equipo = v.equipo
WHERE NOT EXISTS (
    SELECT 1 FROM horario h
    WHERE h.id_equipo = e.id_equipo
      AND h.dia = v.dia
      AND h.hora_inicio = v.hora_inicio::time
);

-- ------------------------------------------------------------
-- Noticias
-- ------------------------------------------------------------
INSERT INTO noticia (id_usuario, titulo, contenido, fecha_publicacion, estado)
SELECT u.id_usuario, v.titulo, v.contenido, v.fecha_publicacion::date, v.estado
FROM (VALUES
    ('director@clubvoley.com', 'Pretemporada 2026: arranque confirmado',
     'El plantel de Mayores A comienza los entrenamientos de pretemporada este lunes en el Gimnasio Municipal. La primera semana estará dedicada a la puesta a punto física y a los trabajos de recepción.',
     '2026-08-03', 'publicada'),
    ('director@clubvoley.com', 'Sub-14 suma nuevos refuerzos',
     'La categoría Sub-14 incorporó cinco jugadores nuevos que se suman al proyecto formativo del club. El cuerpo técnico destacó las ganas y la energía del grupo en las primeras prácticas.',
     '2026-08-12', 'publicada'),
    ('director@clubvoley.com', 'Mayores A cerró la primera rueda invicto',
     'Con la victoria ante Gimnasia y Esgrima, el equipo principal terminó la primera rueda del torneo sin derrotas. El próximo objetivo es sostener el nivel en la segunda mitad de la temporada.',
     '2026-09-01', 'publicada'),
    ('admin@clubvoley.com', 'Torneo de apertura: fixture y sedes',
     'Ya está disponible el fixture completo del Torneo de Apertura. Los partidos se jugarán en el Gimnasio Municipal y en el Club Social y Deportivo. Consultá los horarios en la sección de resultados.',
     '2026-09-10', 'publicada'),
    ('directora@clubvoley.com', 'Escuelita de vóley: inscripción abierta',
     'La escuelita de vóley del club abre sus inscripciones para chicos y chicas de 8 a 13 años. Las clases se dictan los martes y jueves por la tarde. Los cupos son limitados.',
     '2026-09-18', 'publicada'),
    ('directora@clubvoley.com', 'Mayores Femenino debuta en casa',
     'El equipo femenino de Mayores jugará su primer partido oficial en el Gimnasio Municipal. La cita es el sábado a las 16:00 y la entrada será libre para socios y familias.',
     '2026-09-25', 'publicada'),
    ('admin@clubvoley.com', 'Jornada de sponsors y familia',
     'El club invita a sponsors, familias y socios a compartir una jornada abierta con partidos amistosos, food trucks y actividades para los más chicos. La actividad comenzará a las 11:00.',
     '2026-10-02', 'publicada'),
    ('director@clubvoley.com', 'Convocatoria a la selección del club',
     'Se abrió la convocatoria para integrar la selección del club que disputará el torneo regional. Los interesados deben hablar con su director técnico antes del viernes 23 de octubre.',
     '2026-10-12', 'publicada'),
    ('director@clubvoley.com', 'Planilla de viaje a Rosario',
     'Borrador interno con la lista de jugadores, horarios de salida y detalles logísticos para el viaje a Rosario. Falta confirmar la cantidad de micros y el presupuesto final.',
     '2026-10-20', 'borrador')
) AS v(email, titulo, contenido, fecha_publicacion, estado)
JOIN usuario u ON u.email = v.email
WHERE NOT EXISTS (
    SELECT 1 FROM noticia n WHERE n.titulo = v.titulo
);

-- ------------------------------------------------------------
-- Partidos
-- ------------------------------------------------------------
INSERT INTO partido (id_equipo, rival, fecha, resultado)
SELECT e.id_equipo, v.rival, v.fecha::date, v.resultado
FROM (VALUES
    ('Mayores A',        'Club Atlético del Sur',   '2026-07-10', '3-1'),
    ('Mayores A',        'Deportivo Norte',         '2026-07-24', '2-3'),
    ('Mayores A',        'Club Social y Deportivo', '2026-08-07', '3-0'),
    ('Mayores A',        'Estudiantes de La Plata', '2026-08-21', '1-3'),
    ('Mayores A',        'Gimnasia y Esgrima',      '2026-09-04', '3-2'),
    ('Mayores A',        'Vélez Sarsfield',         '2026-09-18', NULL),
    ('Sub-14 A',         'Los Pinos Voley',         '2026-08-09', '2-1'),
    ('Sub-14 A',         'Colegio San José',        '2026-09-13', '3-0'),
    ('Sub-16 A',         'Club Italiano',           '2026-08-15', '3-2'),
    ('Sub-16 A',         'Defensores de Belgrano',  '2026-09-26', '0-3'),
    ('Sub-18 A',         'Ferro Carril Oeste',      '2026-08-22', '3-1'),
    ('Sub-18 A',         'Racing Club',             '2026-10-03', NULL),
    ('Mayores Femenino', 'Banco Nación',            '2026-09-05', '3-0'),
    ('Mayores Femenino', 'San Lorenzo',             '2026-10-10', NULL),
    ('Sub-14 B',         'Escuela Municipal',       '2026-09-12', '1-3'),
    ('Sub-14 B',         'Club Progreso',           '2026-10-17', NULL)
) AS v(equipo, rival, fecha, resultado)
JOIN equipo e ON e.nombre_equipo = v.equipo
WHERE NOT EXISTS (
    SELECT 1 FROM partido p
    WHERE p.id_equipo = e.id_equipo
      AND p.rival = v.rival
      AND p.fecha = v.fecha::date
);

-- ------------------------------------------------------------
-- Cuotas
-- ------------------------------------------------------------
INSERT INTO cuota (id_jugador, mes, anio, monto, estado, fecha_pago)
SELECT j.id_jugador, v.mes, v.anio, v.monto, v.estado, v.fecha_pago::timestamp
FROM (VALUES
    ('jugador@clubvoley.com',   8,  2026, 15000, 'pagada',    '2026-08-05 10:15:00'),
    ('jugador@clubvoley.com',   9,  2026, 15000, 'pagada',    '2026-09-04 18:40:00'),
    ('jugador@clubvoley.com',   10, 2026, 16000, 'pagada',    '2026-10-06 09:20:00'),
    ('jugador2@clubvoley.com',  8,  2026, 15000, 'pagada',    '2026-08-06 11:00:00'),
    ('jugador2@clubvoley.com',  9,  2026, 15000, 'pagada',    '2026-09-05 19:10:00'),
    ('jugador2@clubvoley.com',  10, 2026, 16000, 'pendiente', NULL),
    ('jugador3@clubvoley.com',  8,  2026, 15000, 'pagada',    '2026-08-10 20:05:00'),
    ('jugador3@clubvoley.com',  9,  2026, 15000, 'pendiente', NULL),
    ('jugador3@clubvoley.com',  10, 2026, 16000, 'pendiente', NULL),
    ('jugador4@clubvoley.com',  9,  2026, 12000, 'pagada',    '2026-09-08 17:30:00'),
    ('jugador4@clubvoley.com',  10, 2026, 12000, 'pendiente', NULL),
    ('jugador5@clubvoley.com',  9,  2026, 12000, 'pendiente', NULL),
    ('jugador5@clubvoley.com',  10, 2026, 12000, 'pendiente', NULL),
    ('jugador6@clubvoley.com',  9,  2026, 15000, 'pagada',    '2026-09-09 18:20:00'),
    ('jugador6@clubvoley.com',  10, 2026, 15000, 'pendiente', NULL),
    ('jugador7@clubvoley.com',  9,  2026, 15000, 'pagada',    '2026-09-10 19:45:00'),
    ('jugador7@clubvoley.com',  10, 2026, 15000, 'pendiente', NULL),
    ('jugador8@clubvoley.com',  9,  2026, 15000, 'pagada',    '2026-09-11 20:00:00'),
    ('jugador8@clubvoley.com',  10, 2026, 15000, 'pendiente', NULL),
    ('jugador9@clubvoley.com',  9,  2026, 15000, 'pendiente', NULL),
    ('jugador9@clubvoley.com',  10, 2026, 15000, 'pendiente', NULL),
    ('jugador10@clubvoley.com', 9,  2026, 16000, 'pagada',    '2026-09-12 10:30:00'),
    ('jugador10@clubvoley.com', 10, 2026, 16000, 'pendiente', NULL),
    ('jugador11@clubvoley.com', 9,  2026, 12000, 'pagada',    '2026-09-13 11:15:00'),
    ('jugador11@clubvoley.com', 10, 2026, 12000, 'pendiente', NULL),
    ('jugador12@clubvoley.com', 9,  2026, 12000, 'pendiente', NULL),
    ('jugador12@clubvoley.com', 10, 2026, 12000, 'pendiente', NULL),
    ('jugador13@clubvoley.com', 9,  2026, 16000, 'pagada',    '2026-09-14 12:00:00'),
    ('jugador13@clubvoley.com', 10, 2026, 16000, 'pendiente', NULL)
) AS v(email, mes, anio, monto, estado, fecha_pago)
JOIN usuario u ON u.email = v.email
JOIN jugador j ON j.id_usuario = u.id_usuario
WHERE NOT EXISTS (
    SELECT 1 FROM cuota c
    WHERE c.id_jugador = j.id_jugador
      AND c.mes = v.mes
      AND c.anio = v.anio
);

-- ------------------------------------------------------------
-- Chat interno
-- ------------------------------------------------------------
INSERT INTO chat_mensaje (id_remitente, id_destinatario, cuerpo, leido, fecha_envio)
SELECT r.id_usuario, d.id_usuario, v.cuerpo, v.leido, v.fecha_envio::timestamp
FROM (VALUES
    ('director@clubvoley.com',  'jugador@clubvoley.com',   'Hola Marcos, ¿cómo va la recuperación? Te esperamos el lunes.', TRUE,  '2026-10-20 09:15:00'),
    ('jugador@clubvoley.com',   'director@clubvoley.com',  'Mucho mejor, profe. Ya estoy para volver a los entrenamientos.', TRUE,  '2026-10-20 09:22:00'),
    ('director@clubvoley.com',  'jugador@clubvoley.com',   'Buenísimo. Igual arrancá con carga liviana esta semana.', FALSE, '2026-10-20 09:25:00'),
    ('directora@clubvoley.com', 'jugador6@clubvoley.com',  'Camila, confirmame si podés llegar 15 minutos antes el miércoles.', TRUE, '2026-10-21 18:05:00'),
    ('jugador6@clubvoley.com',  'directora@clubvoley.com', 'Sí, sin problema. Llego 17:45.', TRUE,  '2026-10-21 18:09:00'),
    ('admin@clubvoley.com',     'director@clubvoley.com',  'Juan, necesitamos cerrar la planilla de viaje antes del viernes.', FALSE, '2026-10-22 11:30:00'),
    ('director@clubvoley.com',  'admin@clubvoley.com',     'Listo, la subo hoy a la tarde y te aviso.', TRUE,  '2026-10-22 11:42:00'),
    ('director@clubvoley.com',  'jugador2@clubvoley.com',  'Lucía, ¿tenés disponibilidad para el torneo del sábado?', TRUE,  '2026-10-23 16:20:00'),
    ('jugador2@clubvoley.com',  'director@clubvoley.com',  'Sí, cuenten conmigo.', TRUE,  '2026-10-23 16:35:00'),
    ('directora@clubvoley.com', 'jugador10@clubvoley.com', 'Emilia, gran partido el domingo. Nos vemos el lunes.', FALSE, '2026-10-26 20:10:00'),
    ('jugador10@clubvoley.com', 'directora@clubvoley.com', 'Gracias profe! El equipo estuvo muy bien.', TRUE,  '2026-10-26 20:18:00'),
    ('jugador7@clubvoley.com',  'directora@clubvoley.com', 'Profe, ¿el sábado entrenamos en el mismo horario?', FALSE, '2026-10-27 15:40:00')
) AS v(remitente_email, destinatario_email, cuerpo, leido, fecha_envio)
JOIN usuario r ON r.email = v.remitente_email
JOIN usuario d ON d.email = v.destinatario_email
WHERE NOT EXISTS (
    SELECT 1 FROM chat_mensaje cm
    WHERE cm.id_remitente = r.id_usuario
      AND cm.id_destinatario = d.id_usuario
      AND cm.cuerpo = v.cuerpo
      AND cm.fecha_envio = v.fecha_envio::timestamp
);

-- ------------------------------------------------------------
-- Historial de correos
-- ------------------------------------------------------------
INSERT INTO mensaje (id_remitente, destinatario_email, destinatario_rol, asunto, cuerpo, fecha_envio, estado_envio)
SELECT u.id_usuario, v.destinatario_email, v.destinatario_rol, v.asunto, v.cuerpo, v.fecha_envio::timestamp, v.estado_envio
FROM (VALUES
    ('admin@clubvoley.com',    'jugador@clubvoley.com',  'jugador',          'Bienvenido a la temporada 2026', 'Hola Marcos, te damos la bienvenida a una nueva temporada del club. Cualquier duda, escribinos.', '2026-08-01 09:00:00', 'enviado'),
    ('director@clubvoley.com', 'jugador2@clubvoley.com', 'jugador',          'Horarios de la semana',          'Hola Lucía, te compartimos los horarios de entrenamiento de esta semana.', '2026-09-02 18:00:00', 'enviado'),
    ('admin@clubvoley.com',    'director@clubvoley.com', 'director_tecnico', 'Recordatorio de reunión',        'Hola Juan, te recordamos la reunión de coordinación del próximo lunes a las 18:00.', '2026-10-01 10:30:00', 'enviado'),
    ('admin@clubvoley.com',    'jugador3@clubvoley.com', 'jugador',          'Cuota de octubre',               'Hola Tomás, te recordamos regularizar la cuota de octubre desde el panel del jugador.', '2026-10-05 08:00:00', 'error')
) AS v(remitente_email, destinatario_email, destinatario_rol, asunto, cuerpo, fecha_envio, estado_envio)
JOIN usuario u ON u.email = v.remitente_email
WHERE NOT EXISTS (
    SELECT 1 FROM mensaje m
    WHERE m.destinatario_email = v.destinatario_email
      AND m.asunto = v.asunto
      AND m.fecha_envio = v.fecha_envio::timestamp
);

-- ------------------------------------------------------------
-- Ajustar secuencias para que los próximos registros sigan la numeración
-- ------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'),       COALESCE((SELECT MAX(id_usuario) FROM usuario), 1), true);
SELECT setval(pg_get_serial_sequence('categoria', 'id_categoria'),   COALESCE((SELECT MAX(id_categoria) FROM categoria), 1), true);
SELECT setval(pg_get_serial_sequence('equipo', 'id_equipo'),         COALESCE((SELECT MAX(id_equipo) FROM equipo), 1), true);
SELECT setval(pg_get_serial_sequence('jugador', 'id_jugador'),       COALESCE((SELECT MAX(id_jugador) FROM jugador), 1), true);
SELECT setval(pg_get_serial_sequence('horario', 'id_horario'),       COALESCE((SELECT MAX(id_horario) FROM horario), 1), true);
SELECT setval(pg_get_serial_sequence('noticia', 'id_noticia'),       COALESCE((SELECT MAX(id_noticia) FROM noticia), 1), true);
SELECT setval(pg_get_serial_sequence('partido', 'id_partido'),       COALESCE((SELECT MAX(id_partido) FROM partido), 1), true);
SELECT setval(pg_get_serial_sequence('cuota', 'id_cuota'),           COALESCE((SELECT MAX(id_cuota) FROM cuota), 1), true);
SELECT setval(pg_get_serial_sequence('chat_mensaje', 'id_mensaje'),  COALESCE((SELECT MAX(id_mensaje) FROM chat_mensaje), 1), true);
SELECT setval(pg_get_serial_sequence('mensaje', 'id_mensaje'),       COALESCE((SELECT MAX(id_mensaje) FROM mensaje), 1), true);
