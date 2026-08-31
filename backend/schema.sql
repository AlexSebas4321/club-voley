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
INSERT INTO usuario (nombre, email, contrasena, rol) VALUES
('Alex Gallardo',  'admin@clubvoley.com',    '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'administrador'),
('Juan Pérez',     'director@clubvoley.com','$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'director_tecnico'),
('Marcos Díaz',    'jugador@clubvoley.com', '$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
('Lucía Fernández','jugador2@clubvoley.com','$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador'),
('Tomás Ríos',     'jugador3@clubvoley.com','$2b$10$Ap0YLBau95uPkNU5JnobHeVP4Bs/3mOjNN8iD6EkJwBks2y79Tkq2', 'jugador');

INSERT INTO categoria (nombre, descripcion) VALUES
('Sub-14', 'Categoría formativa sub 14 años'),
('Mayores', 'Primera división del club');

INSERT INTO equipo (id_categoria, id_director_tecnico, nombre_equipo, descripcion) VALUES
(2, 2, 'Mayores A', 'Equipo principal masculino');

INSERT INTO jugador (id_usuario, id_equipo, fecha_nacimiento, posicion) VALUES
(3, 1, '2001-05-14', 'Armador'),
(4, 1, '2003-09-02', 'Punta'),
(5, 1, '2002-12-19', 'Central');

INSERT INTO horario (id_equipo, dia, hora_inicio, hora_fin, lugar) VALUES
(1, 'Lunes', '19:00', '21:00', 'Gimnasio Municipal'),
(1, 'Miércoles', '19:00', '21:00', 'Gimnasio Municipal'),
(1, 'Viernes', '18:30', '20:30', 'Gimnasio Municipal');

INSERT INTO noticia (id_usuario, titulo, contenido) VALUES
(2, 'Arranca la pretemporada', 'El plantel de Mayores A comienza los entrenamientos de pretemporada este lunes.');

INSERT INTO partido (id_equipo, rival, fecha, resultado) VALUES
(1, 'Club Atlético del Sur', '2026-07-10', '3-1'),
(1, 'Deportivo Norte',       '2026-07-24', '2-3');
