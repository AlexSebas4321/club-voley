-- ============================================================
-- CLUB DE VOLEY - Esquema de Base de Datos
-- Motor: PostgreSQL
-- Uso: abrir pgAdmin -> Query Tool -> pegar y ejecutar este archivo
-- ============================================================

DROP TABLE IF EXISTS chat_mensaje CASCADE;
DROP TABLE IF EXISTS mensaje CASCADE;
DROP TABLE IF EXISTS cuota CASCADE;
DROP TABLE IF EXISTS partido CASCADE;
DROP TABLE IF EXISTS noticia CASCADE;
DROP TABLE IF EXISTS horario CASCADE;
DROP TABLE IF EXISTS jugador CASCADE;
DROP TABLE IF EXISTS equipo CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- ------------------------------------------------------------
-- Tabla: usuario
-- ------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario   SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    contrasena   VARCHAR(255) NOT NULL,
    rol          VARCHAR(30)  NOT NULL CHECK (rol IN ('jugador', 'director_tecnico', 'administrador')),
    fecha_alta   TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Tabla: categoria
-- ------------------------------------------------------------
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(50)  NOT NULL,
    descripcion  VARCHAR(200)
);

-- ------------------------------------------------------------
-- Tabla: equipo
-- ------------------------------------------------------------
CREATE TABLE equipo (
    id_equipo           SERIAL PRIMARY KEY,
    id_categoria         INT REFERENCES categoria(id_categoria) ON DELETE SET NULL,
    id_director_tecnico  INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    nombre_equipo        VARCHAR(50) NOT NULL,
    descripcion          VARCHAR(200)
);

-- ------------------------------------------------------------
-- Tabla: jugador (1 a 1 con usuario)
-- ------------------------------------------------------------
CREATE TABLE jugador (
    id_jugador       SERIAL PRIMARY KEY,
    id_usuario       INT NOT NULL UNIQUE REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_equipo        INT REFERENCES equipo(id_equipo) ON DELETE SET NULL,
    fecha_nacimiento DATE,
    posicion         VARCHAR(30)
);

-- ------------------------------------------------------------
-- Tabla: horario
-- ------------------------------------------------------------
CREATE TABLE horario (
    id_horario  SERIAL PRIMARY KEY,
    id_equipo   INT NOT NULL REFERENCES equipo(id_equipo) ON DELETE CASCADE,
    dia         VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    lugar       VARCHAR(100)
);

-- ------------------------------------------------------------
-- Tabla: noticia
-- ------------------------------------------------------------
CREATE TABLE noticia (
    id_noticia         SERIAL PRIMARY KEY,
    id_usuario         INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    titulo             VARCHAR(150) NOT NULL,
    contenido          TEXT NOT NULL,
    imagen_url         VARCHAR(255),
    estado             VARCHAR(20) DEFAULT 'publicada' CHECK (estado IN ('publicada','borrador')),
    fecha_publicacion  DATE DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------
-- Tabla: partido
-- ------------------------------------------------------------
CREATE TABLE partido (
    id_partido SERIAL PRIMARY KEY,
    id_equipo  INT NOT NULL REFERENCES equipo(id_equipo) ON DELETE CASCADE,
    rival      VARCHAR(100) NOT NULL,
    fecha      DATE NOT NULL,
    resultado  VARCHAR(20)
);

-- ------------------------------------------------------------
-- Tabla: cuota (pago de cuota mensual - HU03)
-- ------------------------------------------------------------
CREATE TABLE cuota (
    id_cuota    SERIAL PRIMARY KEY,
    id_jugador  INT NOT NULL REFERENCES jugador(id_jugador) ON DELETE CASCADE,
    mes         INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio        INT NOT NULL,
    monto       NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado      VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagada','rechazada')),
    fecha_pago  TIMESTAMP,
    UNIQUE(id_jugador, mes, anio)
);

-- ------------------------------------------------------------
-- Tabla: chat_mensaje (mensajería interna 1 a 1 entre jugadores y directores)
-- ------------------------------------------------------------
CREATE TABLE chat_mensaje (
    id_mensaje      SERIAL PRIMARY KEY,
    id_remitente    INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_destinatario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    cuerpo          TEXT NOT NULL,
    leido           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_envio     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chat_remitente    ON chat_mensaje(id_remitente);
CREATE INDEX idx_chat_destinatario ON chat_mensaje(id_destinatario);

-- ------------------------------------------------------------
-- Tabla: mensaje (registro de correos enviados vía Gmail)
-- ------------------------------------------------------------
CREATE TABLE mensaje (
    id_mensaje        SERIAL PRIMARY KEY,
    id_remitente      INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    destinatario_email VARCHAR(150) NOT NULL,
    destinatario_rol   VARCHAR(30),
    asunto            VARCHAR(200) NOT NULL,
    cuerpo            TEXT NOT NULL,
    fecha_envio       TIMESTAMP DEFAULT NOW(),
    estado_envio      VARCHAR(20) DEFAULT 'enviado'
);

-- ------------------------------------------------------------
-- Datos de ejemplo (opcional, útil para probar la app)
-- La contraseña de todos los usuarios de ejemplo es: 123456
-- (hash bcrypt generado para "123456": $2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2)
-- ------------------------------------------------------------

-- Usuarios: 1 admin, 2 directores y 13 jugadores
INSERT INTO usuario (nombre, email, contrasena, rol) VALUES
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
('Renata Molina',   'jugador13@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador');

-- Categorías
INSERT INTO categoria (nombre, descripcion) VALUES
('Sub-14',           'Categoría formativa sub 14 años'),
('Mayores',          'Primera división del club'),
('Sub-16',           'Categoría formativa sub 16 años'),
('Sub-18',           'Categoría formativa sub 18 años'),
('Femenino Mayores', 'Primera división femenina del club');

-- Equipos
INSERT INTO equipo (id_categoria, id_director_tecnico, nombre_equipo, descripcion) VALUES
(2, 2, 'Mayores A',        'Equipo principal masculino'),
(1, 2, 'Sub-14 A',         'Equipo formativo sub 14'),
(3, 6, 'Sub-16 A',         'Equipo formativo sub 16'),
(4, 6, 'Sub-18 A',         'Equipo formativo sub 18'),
(5, 6, 'Mayores Femenino', 'Equipo principal femenino'),
(1, 2, 'Sub-14 B',         'Segundo equipo formativo sub 14');

-- Jugadores (id_usuario, id_equipo, fecha_nacimiento, posicion)
INSERT INTO jugador (id_usuario, id_equipo, fecha_nacimiento, posicion) VALUES
(3,  1, '2001-05-14', 'Armador'),
(4,  1, '2003-09-02', 'Punta'),
(5,  1, '2002-12-19', 'Central'),
(7,  2, '2012-03-11', 'Punta'),
(8,  2, '2011-11-27', 'Central'),
(9,  3, '2009-06-05', 'Armador'),
(10, 3, '2010-01-19', 'Opuesto'),
(11, 4, '2008-09-23', 'Líbero'),
(12, 4, '2007-12-02', 'Punta'),
(13, 5, '2000-04-16', 'Central'),
(14, 6, '2012-08-08', 'Armador'),
(15, 6, '2011-05-30', 'Central'),
(16, 5, '2001-10-21', 'Punta');

-- Horarios de entrenamiento
INSERT INTO horario (id_equipo, dia, hora_inicio, hora_fin, lugar) VALUES
(1, 'Lunes',     '19:00', '21:00', 'Gimnasio Municipal'),
(1, 'Miércoles', '19:00', '21:00', 'Gimnasio Municipal'),
(1, 'Viernes',   '18:30', '20:30', 'Gimnasio Municipal'),
(1, 'Sábado',    '10:00', '12:00', 'Gimnasio Municipal'),
(2, 'Martes',    '18:00', '19:30', 'Gimnasio Municipal'),
(2, 'Jueves',    '18:00', '19:30', 'Gimnasio Municipal'),
(2, 'Sábado',    '09:00', '10:30', 'Gimnasio Municipal'),
(3, 'Lunes',     '18:00', '20:00', 'Gimnasio Municipal'),
(3, 'Miércoles', '18:00', '20:00', 'Gimnasio Municipal'),
(3, 'Viernes',   '18:00', '19:30', 'Gimnasio Municipal'),
(4, 'Martes',    '20:00', '22:00', 'Gimnasio Municipal'),
(4, 'Jueves',    '20:00', '22:00', 'Gimnasio Municipal'),
(4, 'Sábado',    '11:00', '13:00', 'Gimnasio Municipal'),
(5, 'Lunes',     '20:00', '22:00', 'Gimnasio Municipal'),
(5, 'Miércoles', '20:00', '22:00', 'Gimnasio Municipal'),
(5, 'Sábado',    '14:00', '16:00', 'Gimnasio Municipal'),
(6, 'Martes',    '17:00', '18:30', 'Gimnasio Municipal'),
(6, 'Jueves',    '17:00', '18:30', 'Gimnasio Municipal'),
(6, 'Sábado',    '10:30', '12:00', 'Gimnasio Municipal');

-- Noticias (incluye un borrador para probar el panel del director)
INSERT INTO noticia (id_usuario, titulo, contenido, fecha_publicacion, estado) VALUES
(2, 'Pretemporada 2026: arranque confirmado',
    'El plantel de Mayores A comienza los entrenamientos de pretemporada este lunes en el Gimnasio Municipal. La primera semana estará dedicada a la puesta a punto física y a los trabajos de recepción.',
    '2026-08-03', 'publicada'),
(2, 'Sub-14 suma nuevos refuerzos',
    'La categoría Sub-14 incorporó cinco jugadores nuevos que se suman al proyecto formativo del club. El cuerpo técnico destacó las ganas y la energía del grupo en las primeras prácticas.',
    '2026-08-12', 'publicada'),
(2, 'Mayores A cerró la primera rueda invicto',
    'Con la victoria ante Gimnasia y Esgrima, el equipo principal terminó la primera rueda del torneo sin derrotas. El próximo objetivo es sostener el nivel en la segunda mitad de la temporada.',
    '2026-09-01', 'publicada'),
(1, 'Torneo de apertura: fixture y sedes',
    'Ya está disponible el fixture completo del Torneo de Apertura. Los partidos se jugarán en el Gimnasio Municipal y en el Club Social y Deportivo. Consultá los horarios en la sección de resultados.',
    '2026-09-10', 'publicada'),
(6, 'Escuelita de vóley: inscripción abierta',
    'La escuelita de vóley del club abre sus inscripciones para chicos y chicas de 8 a 13 años. Las clases se dictan los martes y jueves por la tarde. Los cupos son limitados.',
    '2026-09-18', 'publicada'),
(6, 'Mayores Femenino debuta en casa',
    'El equipo femenino de Mayores jugará su primer partido oficial en el Gimnasio Municipal. La cita es el sábado a las 16:00 y la entrada será libre para socios y familias.',
    '2026-09-25', 'publicada'),
(1, 'Jornada de sponsors y familia',
    'El club invita a sponsors, familias y socios a compartir una jornada abierta con partidos amistosos, food trucks y actividades para los más chicos. La actividad comenzará a las 11:00.',
    '2026-10-02', 'publicada'),
(2, 'Convocatoria a la selección del club',
    'Se abrió la convocatoria para integrar la selección del club que disputará el torneo regional. Los interesados deben hablar con su director técnico antes del viernes 23 de octubre.',
    '2026-10-12', 'publicada'),
(2, 'Planilla de viaje a Rosario',
    'Borrador interno con la lista de jugadores, horarios de salida y detalles logísticos para el viaje a Rosario. Falta confirmar la cantidad de micros y el presupuesto final.',
    '2026-10-20', 'borrador');

-- Partidos (algunos todavía sin resultado, para probar el estado "próximo")
INSERT INTO partido (id_equipo, rival, fecha, resultado) VALUES
(1, 'Club Atlético del Sur',    '2026-07-10', '3-1'),
(1, 'Deportivo Norte',          '2026-07-24', '2-3'),
(1, 'Club Social y Deportivo',  '2026-08-07', '3-0'),
(1, 'Estudiantes de La Plata',  '2026-08-21', '1-3'),
(1, 'Gimnasia y Esgrima',       '2026-09-04', '3-2'),
(1, 'Vélez Sarsfield',          '2026-09-18', NULL),
(2, 'Los Pinos Voley',          '2026-08-09', '2-1'),
(2, 'Colegio San José',         '2026-09-13', '3-0'),
(3, 'Club Italiano',            '2026-08-15', '3-2'),
(3, 'Defensores de Belgrano',   '2026-09-26', '0-3'),
(4, 'Ferro Carril Oeste',       '2026-08-22', '3-1'),
(4, 'Racing Club',              '2026-10-03', NULL),
(5, 'Banco Nación',             '2026-09-05', '3-0'),
(5, 'San Lorenzo',              '2026-10-10', NULL),
(6, 'Escuela Municipal',        '2026-09-12', '1-3'),
(6, 'Club Progreso',            '2026-10-17', NULL);

-- Cuotas mensuales (pagadas y pendientes, para probar el panel del jugador)
INSERT INTO cuota (id_jugador, mes, anio, monto, estado, fecha_pago) VALUES
(1,  8, 2026, 15000, 'pagada',    '2026-08-05 10:15:00'),
(1,  9, 2026, 15000, 'pagada',    '2026-09-04 18:40:00'),
(1, 10, 2026, 16000, 'pagada',    '2026-10-06 09:20:00'),
(2,  8, 2026, 15000, 'pagada',    '2026-08-06 11:00:00'),
(2,  9, 2026, 15000, 'pagada',    '2026-09-05 19:10:00'),
(2, 10, 2026, 16000, 'pendiente', NULL),
(3,  8, 2026, 15000, 'pagada',    '2026-08-10 20:05:00'),
(3,  9, 2026, 15000, 'pendiente', NULL),
(3, 10, 2026, 16000, 'pendiente', NULL),
(4,  9, 2026, 12000, 'pagada',    '2026-09-08 17:30:00'),
(4, 10, 2026, 12000, 'pendiente', NULL),
(5,  9, 2026, 12000, 'pendiente', NULL),
(5, 10, 2026, 12000, 'pendiente', NULL),
(6,  9, 2026, 15000, 'pagada',    '2026-09-09 18:20:00'),
(6, 10, 2026, 15000, 'pendiente', NULL),
(7,  9, 2026, 15000, 'pagada',    '2026-09-10 19:45:00'),
(7, 10, 2026, 15000, 'pendiente', NULL),
(8,  9, 2026, 15000, 'pagada',    '2026-09-11 20:00:00'),
(8, 10, 2026, 15000, 'pendiente', NULL),
(9,  9, 2026, 15000, 'pendiente', NULL),
(9, 10, 2026, 15000, 'pendiente', NULL),
(10, 9, 2026, 16000, 'pagada',    '2026-09-12 10:30:00'),
(10,10, 2026, 16000, 'pendiente', NULL),
(11, 9, 2026, 12000, 'pagada',    '2026-09-13 11:15:00'),
(11,10, 2026, 12000, 'pendiente', NULL),
(12, 9, 2026, 12000, 'pendiente', NULL),
(12,10, 2026, 12000, 'pendiente', NULL),
(13, 9, 2026, 16000, 'pagada',    '2026-09-14 12:00:00'),
(13,10, 2026, 16000, 'pendiente', NULL);

-- Conversaciones del chat interno (1 a 1)
INSERT INTO chat_mensaje (id_remitente, id_destinatario, cuerpo, leido, fecha_envio) VALUES
(2,  3,  'Hola Marcos, ¿cómo va la recuperación? Te esperamos el lunes.', TRUE,  '2026-10-20 09:15:00'),
(3,  2,  'Mucho mejor, profe. Ya estoy para volver a los entrenamientos.', TRUE,  '2026-10-20 09:22:00'),
(2,  3,  'Buenísimo. Igual arrancá con carga liviana esta semana.',        FALSE, '2026-10-20 09:25:00'),
(6,  9,  'Camila, confirmame si podés llegar 15 minutos antes el miércoles.', TRUE, '2026-10-21 18:05:00'),
(9,  6,  'Sí, sin problema. Llego 17:45.',                                  TRUE,  '2026-10-21 18:09:00'),
(1,  2,  'Juan, necesitamos cerrar la planilla de viaje antes del viernes.', FALSE, '2026-10-22 11:30:00'),
(2,  1,  'Listo, la subo hoy a la tarde y te aviso.',                       TRUE,  '2026-10-22 11:42:00'),
(2,  4,  'Lucía, ¿tenés disponibilidad para el torneo del sábado?',         TRUE,  '2026-10-23 16:20:00'),
(4,  2,  'Sí, cuenten conmigo.',                                            TRUE,  '2026-10-23 16:35:00'),
(6,  13, 'Emilia, gran partido el domingo. Nos vemos el lunes.',            FALSE, '2026-10-26 20:10:00'),
(13, 6,  'Gracias profe! El equipo estuvo muy bien.',                       TRUE,  '2026-10-26 20:18:00'),
(10, 6,  'Profe, ¿el sábado entrenamos en el mismo horario?',               FALSE, '2026-10-27 15:40:00');

-- Historial de correos enviados (para el panel del administrador)
INSERT INTO mensaje (id_remitente, destinatario_email, destinatario_rol, asunto, cuerpo, fecha_envio, estado_envio) VALUES
(1, 'jugador@clubvoley.com',   'jugador',          'Bienvenido a la temporada 2026', 'Hola Marcos, te damos la bienvenida a una nueva temporada del club. Cualquier duda, escribinos.', '2026-08-01 09:00:00', 'enviado'),
(2, 'jugador2@clubvoley.com',  'jugador',          'Horarios de la semana',          'Hola Lucía, te compartimos los horarios de entrenamiento de esta semana.', '2026-09-02 18:00:00', 'enviado'),
(1, 'director@clubvoley.com',  'director_tecnico', 'Recordatorio de reunión',        'Hola Juan, te recordamos la reunión de coordinación del próximo lunes a las 18:00.', '2026-10-01 10:30:00', 'enviado'),
(1, 'jugador3@clubvoley.com',  'jugador',          'Cuota de octubre',               'Hola Tomás, te recordamos regularizar la cuota de octubre desde el panel del jugador.', '2026-10-05 08:00:00', 'error');

-- Ajustar las secuencias para que los próximos registros creados desde los
-- paneles sigan la numeración correcta (importante al usar datos de ejemplo).
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'),       (SELECT MAX(id_usuario) FROM usuario));
SELECT setval(pg_get_serial_sequence('categoria', 'id_categoria'),   (SELECT MAX(id_categoria) FROM categoria));
SELECT setval(pg_get_serial_sequence('equipo', 'id_equipo'),         (SELECT MAX(id_equipo) FROM equipo));
SELECT setval(pg_get_serial_sequence('jugador', 'id_jugador'),       (SELECT MAX(id_jugador) FROM jugador));
SELECT setval(pg_get_serial_sequence('horario', 'id_horario'),       (SELECT MAX(id_horario) FROM horario));
SELECT setval(pg_get_serial_sequence('noticia', 'id_noticia'),       (SELECT MAX(id_noticia) FROM noticia));
SELECT setval(pg_get_serial_sequence('partido', 'id_partido'),       (SELECT MAX(id_partido) FROM partido));
SELECT setval(pg_get_serial_sequence('cuota', 'id_cuota'),           (SELECT MAX(id_cuota) FROM cuota));
SELECT setval(pg_get_serial_sequence('chat_mensaje', 'id_mensaje'),  (SELECT MAX(id_mensaje) FROM chat_mensaje));
SELECT setval(pg_get_serial_sequence('mensaje', 'id_mensaje'),       (SELECT MAX(id_mensaje) FROM mensaje));
