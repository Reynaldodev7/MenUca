
CREATE DATABASE MenUCA;
GO

USE MenUCA;
GO

-- ===========================================
-- TABLA USUARIO 
-- ===========================================
CREATE TABLE Usuario (
    usuario_id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('consumidor', 'vendedor', 'administrador')) NOT NULL,
    fecha_registro DATETIME DEFAULT GETDATE(),
    activo BIT DEFAULT 1
);
GO

-- ===========================================
-- TABLA RESTAURANTE 
-- ===========================================
CREATE TABLE Restaurante (
    restaurante_id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    precio_general VARCHAR(20) CHECK (precio_general IN ('economico', 'moderado', 'premium')) NOT NULL,
    tipo_comida VARCHAR(100),
    tiempo_espera_promedio INT, -- minutos
    horario_apertura TIME,
    horario_cierre TIME,
    ofertas_disponibles TEXT,
    vendedor_id INT NOT NULL,
    activo BIT DEFAULT 1,
    FOREIGN KEY (vendedor_id) REFERENCES Usuario(usuario_id)
);
GO

-- Crear índices por separado (SQL Server)
CREATE INDEX idx_tipo_comida ON Restaurante(tipo_comida);
CREATE INDEX idx_precio ON Restaurante(precio_general);
GO

-- ===========================================
-- TABLA PLATILLO (Adaptada para SQL Server)
-- ===========================================
CREATE TABLE Platillo (
    platillo_id INT PRIMARY KEY IDENTITY(1,1),
    restaurante_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    ingredientes TEXT,
    incluye_bebida BIT DEFAULT 0,
    unidades_disponibles INT DEFAULT 0,
    activo BIT DEFAULT 1,
    FOREIGN KEY (restaurante_id) REFERENCES Restaurante(restaurante_id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_restaurante ON Platillo(restaurante_id);
GO

-- ===========================================
-- TABLA RESEÑA 
-- ===========================================
CREATE TABLE Reseña (
    reseña_id INT PRIMARY KEY IDENTITY(1,1),
    usuario_id INT NOT NULL,
    restaurante_id INT NOT NULL,
    puntaje_general DECIMAL(2,1) NOT NULL CHECK (puntaje_general >= 1 AND puntaje_general <= 5),
    titulo VARCHAR(150),
    descripcion TEXT,
    calidad_comida INT CHECK (calidad_comida BETWEEN 1 AND 5),
    tiempo_espera INT CHECK (tiempo_espera BETWEEN 1 AND 5),
    atencion_cliente INT CHECK (atencion_cliente BETWEEN 1 AND 5),
    cantidad_comida INT CHECK (cantidad_comida BETWEEN 1 AND 5),
    fecha_reseña DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(usuario_id),
    FOREIGN KEY (restaurante_id) REFERENCES Restaurante(restaurante_id) ON DELETE CASCADE,
    CONSTRAINT unique_usuario_restaurante UNIQUE (usuario_id, restaurante_id)
);
GO

-- ===========================================
-- TABLAS ADICIONALES 
-- ===========================================
CREATE TABLE Acompanamiento (
    acompanamiento_id INT PRIMARY KEY IDENTITY(1,1),
    platillo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_extra DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (platillo_id) REFERENCES Platillo(platillo_id) ON DELETE CASCADE
);
GO

CREATE TABLE OpcionBebida (
    bebida_id INT PRIMARY KEY IDENTITY(1,1),
    platillo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_extra DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (platillo_id) REFERENCES Platillo(platillo_id) ON DELETE CASCADE
);
GO

SELECT * FROM Usuario
-- Modificar columnas TEXT a VARCHAR(MAX) para compatibilidad con triggers
ALTER TABLE Restaurante ALTER COLUMN ofertas_disponibles NVARCHAR(MAX);
ALTER TABLE Platillo ALTER COLUMN ingredientes NVARCHAR(MAX);
ALTER TABLE Reseña ALTER COLUMN descripcion NVARCHAR(MAX);
GO
-- ===========================================
-- PERMISOS Y ROLES DE BASE DE DATOS
-- ===========================================

CREATE ROLE db_consumidor;
CREATE ROLE db_vendedor;
CREATE ROLE db_administrador;
GO

-- Permisos para consumidor
GRANT SELECT ON Restaurante TO db_consumidor;
GRANT SELECT ON Platillo TO db_consumidor;
GRANT SELECT ON Reseña TO db_consumidor;
GRANT INSERT ON Reseña TO db_consumidor;
GRANT EXECUTE ON sp_GetRestaurantes TO db_consumidor;
GO

-- Permisos para vendedor
GRANT SELECT, INSERT ON Restaurante TO db_vendedor;
GRANT SELECT, INSERT, UPDATE ON Platillo TO db_vendedor;
GRANT EXECUTE ON sp_Vendedor_AgregarPlatillo TO db_vendedor;
GRANT EXECUTE ON sp_Vendedor_AgregarRestaurante TO db_vendedor;
GRANT EXECUTE ON sp_GetRestaurantes TO db_vendedor;
GO

-- Permisos para administrador
GRANT SELECT, INSERT, UPDATE, DELETE ON Usuario TO db_administrador;
GRANT SELECT, INSERT, UPDATE, DELETE ON Restaurante TO db_administrador;
GRANT SELECT, INSERT, UPDATE, DELETE ON Platillo TO db_administrador;
GRANT SELECT, INSERT, UPDATE, DELETE ON Reseña TO db_administrador;
GRANT SELECT, INSERT, UPDATE, DELETE ON LogAuditoria TO db_administrador;
GRANT EXECUTE ON sp_BackupDatosCriticos TO db_administrador;
GRANT EXECUTE ON sp_GetRestaurantes TO db_administrador;
GO

-- ===========================================
-- MEJORAS DE SEGURIDAD Y ROLES
-- ===========================================

-- Tabla de logs para auditoría
CREATE TABLE LogAuditoria (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    tabla_afectada VARCHAR(100) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    usuario_id INT NOT NULL,
    fecha_accion DATETIME DEFAULT GETDATE(),
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    ip_address VARCHAR(45)
);
GO

-- Índices para mejor performance
CREATE INDEX idx_usuario_tipo ON Usuario(tipo_usuario);
CREATE INDEX idx_restaurante_vendedor ON Restaurante(vendedor_id);
CREATE INDEX idx_reseña_restaurante ON Reseña(restaurante_id);
CREATE INDEX idx_reseña_usuario ON Reseña(usuario_id);
CREATE INDEX idx_log_fecha ON LogAuditoria(fecha_accion);
CREATE INDEX idx_log_usuario ON LogAuditoria(usuario_id);
CREATE INDEX idx_restaurante_activo ON Restaurante(activo, restaurante_id);
CREATE INDEX idx_platillo_restaurante_activo ON Platillo(restaurante_id, activo);
GO
-- ===========================================
-- PROCEDIMIENTOS ALMACENADOS PARA ROLES
-- ===========================================

-- SP para que vendedor agregue platillo solo a su restaurante
CREATE PROCEDURE sp_Vendedor_AgregarPlatillo
    @restaurante_id INT,
    @nombre VARCHAR(100),
    @precio DECIMAL(10,2),
    @ingredientes TEXT,
    @incluye_bebida BIT = 0,
    @unidades_disponibles INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @vendedor_id INT = dbo.GetCurrentUserID();
    
    IF NOT EXISTS (SELECT 1 FROM Restaurante WHERE restaurante_id = @restaurante_id AND vendedor_id = @vendedor_id)
    BEGIN
        RAISERROR('No tienes permisos para agregar platillos a este restaurante', 16, 1);
        RETURN;
    END
    
    INSERT INTO Platillo (restaurante_id, nombre, precio, ingredientes, incluye_bebida, unidades_disponibles)
    VALUES (@restaurante_id, @nombre, @precio, @ingredientes, @incluye_bebida, @unidades_disponibles);
END;
GO

-- SP para que vendedor agregue restaurante
CREATE PROCEDURE sp_Vendedor_AgregarRestaurante
    @nombre VARCHAR(100),
    @ubicacion VARCHAR(200),
    @precio_general VARCHAR(20),
    @tipo_comida VARCHAR(100),
    @tiempo_espera_promedio INT,
    @horario_apertura TIME,
    @horario_cierre TIME,
    @ofertas_disponibles TEXT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @vendedor_id INT = dbo.GetCurrentUserID();
    
    INSERT INTO Restaurante (nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, 
                           horario_apertura, horario_cierre, ofertas_disponibles, vendedor_id)
    VALUES (@nombre, @ubicacion, @precio_general, @tipo_comida, @tiempo_espera_promedio,
            @horario_apertura, @horario_cierre, @ofertas_disponibles, @vendedor_id);
END;
GO

-- SP para backup automático de datos críticos
CREATE PROCEDURE sp_BackupDatosCriticos
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @fecha VARCHAR(20) = REPLACE(CONVERT(VARCHAR, GETDATE(), 120), ':', '');
    
    -- Backup de usuarios activos
    EXEC('SELECT * INTO Usuario_Backup_' + @fecha + ' FROM Usuario WHERE activo = 1');
    
    -- Backup de restaurantes activos
    EXEC('SELECT * INTO Restaurante_Backup_' + @fecha + ' FROM Restaurante WHERE activo = 1');
    
    -- Backup de platillos activos
    EXEC('SELECT * INTO Platillo_Backup_' + @fecha + ' FROM Platillo WHERE activo = 1');
    
    -- Backup de reseñas
    EXEC('SELECT * INTO Reseña_Backup_' + @fecha + ' FROM Reseña');
    
    -- Backup de logs de auditoría
    EXEC('SELECT * INTO LogAuditoria_Backup_' + @fecha + ' FROM LogAuditoria');
END;
GO

-- SP para obtener restaurantes con permisos según rol
CREATE PROCEDURE sp_GetRestaurantes
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @usuario_id INT = dbo.GetCurrentUserID();
    DECLARE @tipo_usuario VARCHAR(20);
    
    SELECT @tipo_usuario = tipo_usuario FROM Usuario WHERE usuario_id = @usuario_id;
    
    IF @tipo_usuario = 'consumidor'
    BEGIN
        SELECT r.*, AVG(re.puntaje_general) as puntaje_promedio
        FROM Restaurante r
        LEFT JOIN Reseña re ON r.restaurante_id = re.restaurante_id
        WHERE r.activo = 1
        GROUP BY r.restaurante_id, r.nombre, r.ubicacion, r.precio_general, r.tipo_comida, 
                 r.tiempo_espera_promedio, r.horario_apertura, r.horario_cierre, r.ofertas_disponibles,
                 r.vendedor_id, r.activo;
    END
    ELSE IF @tipo_usuario = 'vendedor'
    BEGIN
        SELECT * FROM Restaurante 
        WHERE vendedor_id = @usuario_id AND activo = 1;
    END
    ELSE IF @tipo_usuario = 'administrador'
    BEGIN
        SELECT * FROM Restaurante;
    END
END;
GO
-- Procedimiento para establecer contexto
CREATE OR ALTER PROCEDURE sp_set_context_info
    @userId INT
AS
BEGIN
    DECLARE @context_info VARBINARY(128);
    SET @context_info = CAST(@userId AS VARBINARY(128));
    SET CONTEXT_INFO @context_info;
END;
GO

-- Función GetCurrentUserID 
CREATE OR ALTER FUNCTION dbo.GetCurrentUserID()
RETURNS INT
AS
BEGIN
    DECLARE @context_info VARBINARY(128);
    SET @context_info = CONTEXT_INFO();
    
    DECLARE @user_id INT;
    IF @context_info IS NOT NULL AND DATALENGTH(@context_info) >= 4
        SET @user_id = CAST(SUBSTRING(@context_info, 1, 4) AS INT);
    ELSE
        SET @user_id = NULL;
        
    RETURN @user_id;
END;
GO



--==========================================================
--INSERTS PRUEBA (BORRAR)
-- SCRIPT DE INSERTS CON MANEJO DE CONTEXTO PARA TRIGGERS
-- SCRIPT DE INSERTS CON CONTROL TOTAL DE IDs Y TRIGGERS DESHABILITADOS
BEGIN TRY
    BEGIN TRANSACTION;

    -- 1. Insertar usuarios de prueba
    INSERT INTO Usuario (nombre, apellido, correo, contraseña, tipo_usuario) VALUES
    ('Admin', 'Sistema', 'admin@menuca.com', 'hashed_password', 'administrador'),
    ('Juan', 'Pérez', 'juan.perez@email.com', 'hashed_password_123', 'consumidor'),
    ('María', 'Gómez', 'maria.gomez@email.com', 'hashed_password_456', 'vendedor'),
    ('Ana', 'Rodríguez', 'ana.rodriguez@email.com', 'hashed_password_101', 'consumidor'),
    ('Pedro', 'Martínez', 'pedro.martinez@email.com', 'hashed_password_112', 'vendedor');

    -- 2. Verificar IDs de usuarios insertados
    DECLARE @admin_id INT, @maria_id INT, @pedro_id INT, @juan_id INT, @ana_id INT;
    
    SELECT @admin_id = usuario_id FROM Usuario WHERE correo = 'admin@menuca.com';
    SELECT @maria_id = usuario_id FROM Usuario WHERE correo = 'maria.gomez@email.com';
    SELECT @pedro_id = usuario_id FROM Usuario WHERE correo = 'pedro.martinez@email.com';
    SELECT @juan_id = usuario_id FROM Usuario WHERE correo = 'juan.perez@email.com';
    SELECT @ana_id = usuario_id FROM Usuario WHERE correo = 'ana.rodriguez@email.com';

    -- 3. Establecer contexto como administrador
    EXEC sp_set_context_info @admin_id;

    -- 4. Insertar restaurantes uno por uno y capturar IDs
    DECLARE @restaurante1 INT, @restaurante2 INT, @restaurante3 INT, @restaurante4 INT, @restaurante5 INT;

    PRINT 'Insertando restaurante 1...';
    INSERT INTO Restaurante (nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, horario_apertura, horario_cierre, vendedor_id)
    VALUES ('La Parrilla Argentina', 'Av. Principal 123, San Salvador', 'moderado', 'Carnes y Parrilla', 25, '11:00', '22:00', @maria_id);
    SET @restaurante1 = SCOPE_IDENTITY();
    PRINT 'Restaurante 1 ID: ' + CAST(@restaurante1 AS VARCHAR);

    PRINT 'Insertando restaurante 2...';
    INSERT INTO Restaurante (nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, horario_apertura, horario_cierre, vendedor_id)
    VALUES ('Sushi Express', 'Centro Comercial Metro, San Salvador', 'premium', 'Comida Japonesa', 20, '12:00', '21:30', @pedro_id);
    SET @restaurante2 = SCOPE_IDENTITY();
    PRINT 'Restaurante 2 ID: ' + CAST(@restaurante2 AS VARCHAR);

    PRINT 'Insertando restaurante 3...';
    INSERT INTO Restaurante (nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, horario_apertura, horario_cierre, vendedor_id)
    VALUES ('Pupusería Doña Tere', 'Calle 5, Santa Tecla', 'economico', 'Comida Tradicional', 15, '07:00', '20:00', @maria_id);
    SET @restaurante3 = SCOPE_IDENTITY();
    PRINT 'Restaurante 3 ID: ' + CAST(@restaurante3 AS VARCHAR);

    PRINT 'Insertando restaurante 4...';
    INSERT INTO Restaurante (nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, horario_apertura, horario_cierre, vendedor_id)
    VALUES ('Pizza Italiana', 'Plaza Futura, San Salvador', 'moderado', 'Italiana', 30, '10:00', '23:00', @pedro_id);
    SET @restaurante4 = SCOPE_IDENTITY();
    PRINT 'Restaurante 4 ID: ' + CAST(@restaurante4 AS VARCHAR);

    PRINT 'Insertando restaurante 5...';
    INSERT INTO Restaurante (nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, horario_apertura, horario_cierre, vendedor_id)
    VALUES ('Healthy Corner', 'Zona Rosa, San Salvador', 'moderado', 'Saludable', 18, '08:00', '19:00', @maria_id);
    SET @restaurante5 = SCOPE_IDENTITY();
    PRINT 'Restaurante 5 ID: ' + CAST(@restaurante5 AS VARCHAR);

    -- 5. Verificar que los restaurantes existen antes de insertar platillos
    PRINT 'Verificando restaurantes...';
    IF NOT EXISTS (SELECT 1 FROM Restaurante WHERE restaurante_id = @restaurante1)
        RAISERROR('Restaurante 1 no existe', 16, 1);
    IF NOT EXISTS (SELECT 1 FROM Restaurante WHERE restaurante_id = @restaurante2)
        RAISERROR('Restaurante 2 no existe', 16, 1);
    IF NOT EXISTS (SELECT 1 FROM Restaurante WHERE restaurante_id = @restaurante3)
        RAISERROR('Restaurante 3 no existe', 16, 1);
    IF NOT EXISTS (SELECT 1 FROM Restaurante WHERE restaurante_id = @restaurante4)
        RAISERROR('Restaurante 4 no existe', 16, 1);
    IF NOT EXISTS (SELECT 1 FROM Restaurante WHERE restaurante_id = @restaurante5)
        RAISERROR('Restaurante 5 no existe', 16, 1);

    -- 6. Insertar platillos usando las VARIABLES verificadas
    PRINT 'Insertando platillos...';
    INSERT INTO Platillo (restaurante_id, nombre, precio, ingredientes, incluye_bebida, unidades_disponibles) VALUES
    -- Restaurante 1
    (@restaurante1, 'Bife de Chorizo', 18.50, 'Carne de res, sal, pimienta, papas, ensalada', 1, 20),
    (@restaurante1, 'Asado de Tira', 15.75, 'Costillas de res, chimichurri, papas fritas', 0, 15),
    (@restaurante1, 'Ensalada César', 8.99, 'Lechuga, pollo, crutones, aderezo césar', 0, 25),
    (@restaurante1, 'Milanesa Napolitana', 12.50, 'Carne empanizada, salsa, jamón, queso', 1, 18),
    (@restaurante1, 'Empanadas Criollas', 6.75, 'Carne, cebolla, huevo, aceitunas', 0, 30),
    
    -- Restaurante 2
    (@restaurante2, 'Sushi Mixto', 22.00, 'Salmón, atún, aguacate, pepino, arroz, alga', 1, 25),
    (@restaurante2, 'Tempura de Camarón', 12.50, 'Camarones, harina tempura, salsa agridulce', 0, 18),
    (@restaurante2, 'Ramen Tradicional', 15.99, 'Fideos, caldo, cerdo, huevo, vegetales', 0, 20),
    (@restaurante2, 'Gyozas de Cerdo', 9.75, 'Masa, cerdo, repollo, salsa soya', 0, 22),
    (@restaurante2, 'Sashimi Premium', 28.50, 'Salmón, atún, lubina fresca', 1, 15),
    
    -- Restaurante 3
    (@restaurante3, 'Pupusas Revueltas', 1.50, 'Masa de maíz, queso, frijol, chicharrón', 0, 50),
    (@restaurante3, 'Pupusas de Queso', 1.25, 'Masa de maíz, queso mozzarella', 0, 40),
    (@restaurante3, 'Pupusas de Frijol', 1.25, 'Masa de maíz, frijol refrito', 0, 35),
    (@restaurante3, 'Atol de Elote', 2.00, 'Maíz, leche, canela, azúcar', 0, 30),
    (@restaurante3, 'Plátanos Fritos', 3.50, 'Plátanos maduros, crema, frijoles', 0, 25),
    
    -- Restaurante 4
    (@restaurante4, 'Pizza Margherita', 12.00, 'Masa, salsa de tomate, mozzarella, albahaca', 0, 30),
    (@restaurante4, 'Pizza Pepperoni', 14.50, 'Masa, salsa de tomate, mozzarella, pepperoni', 1, 25),
    (@restaurante4, 'Pizza Hawaiana', 13.75, 'Masa, salsa, mozzarella, jamón, piña', 0, 20),
    (@restaurante4, 'Lasagna Tradicional', 16.99, 'Pasta, carne, salsa, queso, bechamel', 1, 18),
    (@restaurante4, 'Risotto de Champiñones', 11.50, 'Arroz, champiñones, vino, parmesano', 0, 22),
    
    -- Restaurante 5
    (@restaurante5, 'Ensalada César', 8.75, 'Lechuga, pollo, crutones, aderezo césar', 0, 35),
    (@restaurante5, 'Bowl de Quinoa', 10.25, 'Quinoa, aguacate, tomate, espinacas, limón', 1, 20),
    (@restaurante5, 'Wrap de Pollo', 9.50, 'Tortilla, pollo, lechuga, tomate, aguacate', 0, 28),
    (@restaurante5, 'Smoothie Verde', 6.99, 'Espinaca, plátano, piña, leche almendra', 0, 40),
    (@restaurante5, 'Ensalada de Atún', 11.25, 'Atún, lechuga, tomate, cebolla, aceitunas', 1, 25);

    -- 7. Insertar reseñas
    PRINT 'Insertando reseñas...';
    INSERT INTO Reseña (usuario_id, restaurante_id, puntaje_general, titulo, descripcion, calidad_comida, tiempo_espera, atencion_cliente, cantidad_comida) VALUES
    (@juan_id, @restaurante1, 4.5, 'Excelente carne', 'La carne estaba perfectamente cocida', 5, 4, 5, 4),
    (@juan_id, @restaurante2, 4.0, 'Buen sushi', 'El sushi fresco y bien presentado', 4, 4, 4, 4),
    (@juan_id, @restaurante3, 3.5, 'Pupusas auténticas', 'Sabor tradicional pero lugar lleno', 4, 3, 3, 5),
    (@ana_id, @restaurante4, 4.2, 'Pizza deliciosa', 'Masa perfecta e ingredientes frescos', 5, 3, 4, 4),
    (@ana_id, @restaurante5, 4.8, 'Muy saludable', 'Perfecto para comer sano', 5, 5, 5, 4);

    -- 8. Insertar opciones de bebidas y acompañamientos
    PRINT 'Insertando bebidas y acompañamientos...';
    INSERT INTO OpcionBebida (platillo_id, nombre, precio_extra) VALUES
    (1, 'Gaseosa 500ml', 1.50),
    (6, 'Té Verde', 1.75),
    (11, 'Horchata', 2.00),
    (16, 'Cerveza Nacional', 3.00),
    (21, 'Agua Mineral', 1.25);

    INSERT INTO Acompanamiento (platillo_id, nombre, precio_extra) VALUES
    (1, 'Papas Fritas Extra', 2.50),
    (6, 'Sopa Miso', 3.00),
    (11, 'Currito', 0.75),
    (16, 'Pan de Ajo', 2.25),
    (21, 'Sopa del Día', 3.50);

    -- VERIFICACIÓN FINAL
    SELECT 'INSERTS COMPLETADOS EXITOSAMENTE' as Resultado;
    
    SELECT 'Resumen de datos:' as Info;
    SELECT 'Usuarios:' as Tabla, COUNT(*) as Total FROM Usuario
    UNION ALL SELECT 'Restaurantes:', COUNT(*) FROM Restaurante
    UNION ALL SELECT 'Platillos:', COUNT(*) FROM Platillo
    UNION ALL SELECT 'Reseñas:', COUNT(*) FROM Reseña
    UNION ALL SELECT 'Bebidas:', COUNT(*) FROM OpcionBebida
    UNION ALL SELECT 'Acompañamientos:', COUNT(*) FROM Acompanamiento;

    -- Mostrar IDs generados
    SELECT 'IDs generados:' as Info;
    SELECT 'Admin ID:' as Tipo, @admin_id as ID
    UNION ALL SELECT 'María ID:', @maria_id
    UNION ALL SELECT 'Pedro ID:', @pedro_id
    UNION ALL SELECT 'Restaurante 1:', @restaurante1
    UNION ALL SELECT 'Restaurante 2:', @restaurante2
    UNION ALL SELECT 'Restaurante 3:', @restaurante3
    UNION ALL SELECT 'Restaurante 4:', @restaurante4
    UNION ALL SELECT 'Restaurante 5:', @restaurante5;

END TRY

-- Limpiar contexto
EXEC sp_set_context_info NULL;

--===================================	
-- SELECTS PARA VER TODO EL CONTENIDO DE CADA TABLA

-- 1. USUARIOS
SELECT '=== TABLA USUARIO ===' as Info;
SELECT 
    usuario_id,
    nombre,
    apellido,
    correo,
    tipo_usuario,
    FORMAT(fecha_registro, 'dd/MM/yyyy HH:mm') as fecha_registro,
    activo
FROM Usuario
ORDER BY usuario_id;

-- 2. RESTAURANTES
SELECT '=== TABLA RESTAURANTE ===' as Info;
SELECT 
    r.restaurante_id,
    r.nombre as restaurante,
    r.ubicacion,
    r.precio_general,
    r.tipo_comida,
    r.tiempo_espera_promedio,
    CONVERT(VARCHAR, r.horario_apertura, 108) as horario_apertura,
    CONVERT(VARCHAR, r.horario_cierre, 108) as horario_cierre,
    u.nombre + ' ' + u.apellido as vendedor,
    r.activo
FROM Restaurante r
INNER JOIN Usuario u ON r.vendedor_id = u.usuario_id
ORDER BY r.restaurante_id;

-- 3. PLATILLOS
SELECT '=== TABLA PLATILLO ===' as Info;
SELECT 
    p.platillo_id,
    r.nombre as restaurante,
    p.nombre as platillo,
    p.precio,
    LEFT(p.ingredientes, 50) + '...' as ingredientes,
    CASE WHEN p.incluye_bebida = 1 THEN 'Sí' ELSE 'No' END as incluye_bebida,
    p.unidades_disponibles,
    p.activo
FROM Platillo p
INNER JOIN Restaurante r ON p.restaurante_id = r.restaurante_id
ORDER BY p.restaurante_id, p.platillo_id;

-- 4. RESEÑAS
SELECT '=== TABLA RESEÑA ===' as Info;
SELECT 
    re.reseña_id,
    u.nombre + ' ' + u.apellido as usuario,
    r.nombre as restaurante,
    re.puntaje_general,
    re.titulo,
    LEFT(re.descripcion, 30) + '...' as descripcion,
    re.calidad_comida,
    re.tiempo_espera,
    re.atencion_cliente,
    re.cantidad_comida,
    FORMAT(re.fecha_reseña, 'dd/MM/yyyy HH:mm') as fecha_reseña
FROM Reseña re
INNER JOIN Usuario u ON re.usuario_id = u.usuario_id
INNER JOIN Restaurante r ON re.restaurante_id = r.restaurante_id
ORDER BY re.reseña_id;

-- 5. OPCIONES DE BEBIDA
SELECT '=== TABLA OPCIONBEBIDA ===' as Info;
SELECT 
    b.bebida_id,
    p.nombre as platillo,
    r.nombre as restaurante,
    b.nombre as bebida,
    b.precio_extra
FROM OpcionBebida b
INNER JOIN Platillo p ON b.platillo_id = p.platillo_id
INNER JOIN Restaurante r ON p.restaurante_id = r.restaurante_id
ORDER BY b.bebida_id;

-- 6. ACOMPAÑAMIENTOS
SELECT '=== TABLA ACOMPAÑAMIENTO ===' as Info;
SELECT 
    a.acompanamiento_id,
    p.nombre as platillo,
    r.nombre as restaurante,
    a.nombre as acompañamiento,
    a.precio_extra
FROM Acompanamiento a
INNER JOIN Platillo p ON a.platillo_id = p.platillo_id
INNER JOIN Restaurante r ON p.restaurante_id = r.restaurante_id
ORDER BY a.acompanamiento_id;

-- 8. RESUMEN GENERAL
SELECT '=== RESUMEN GENERAL ===' as Info;
SELECT 
    'Usuarios' as Tabla,
    COUNT(*) as Cantidad,
    STRING_AGG(tipo_usuario, ', ') WITHIN GROUP (ORDER BY tipo_usuario) as Tipos
FROM Usuario
UNION ALL
SELECT 
    'Restaurantes',
    COUNT(*),
    STRING_AGG(tipo_comida, ', ') 
FROM Restaurante
UNION ALL
SELECT 
    'Platillos',
    COUNT(*),
    'Precio promedio: $' + CAST(AVG(precio) AS VARCHAR(10))
FROM Platillo
UNION ALL
SELECT 
    'Reseñas',
    COUNT(*),
    'Puntaje promedio: ' + CAST(AVG(puntaje_general) AS VARCHAR(10))
FROM Reseña
UNION ALL
SELECT 
    'Bebidas',
    COUNT(*),
    ''
FROM OpcionBebida
UNION ALL
SELECT 
    'Acompañamientos',
    COUNT(*),
    ''
FROM Acompanamiento
-- 9. PUNTUACIONES PROMEDIO POR RESTAURANTE
SELECT '=== PUNTUACIONES POR RESTAURANTE ===' as Info;
SELECT 
    r.restaurante_id,
    r.nombre as restaurante,
    COUNT(re.reseña_id) as total_reseñas,
    AVG(re.puntaje_general) as puntaje_promedio,
    AVG(CAST(re.calidad_comida AS DECIMAL)) as calidad_promedio,
    AVG(CAST(re.tiempo_espera AS DECIMAL)) as tiempo_promedio,
    AVG(CAST(re.atencion_cliente AS DECIMAL)) as atencion_promedio
FROM Restaurante r
LEFT JOIN Reseña re ON r.restaurante_id = re.restaurante_id
GROUP BY r.restaurante_id, r.nombre
ORDER BY puntaje_promedio DESC;

-- 10. PLATILLOS MÁS CAROS POR RESTAURANTE
SELECT '=== PLATILLOS MÁS CAROS POR RESTAURANTE ===' as Info;
WITH RankedPlatillos AS (
    SELECT 
        r.nombre as restaurante,
        p.nombre as platillo,
        p.precio,
        ROW_NUMBER() OVER (PARTITION BY r.restaurante_id ORDER BY p.precio DESC) as rank_precio
    FROM Platillo p
    INNER JOIN Restaurante r ON p.restaurante_id = r.restaurante_id
    WHERE p.activo = 1
)
SELECT 
    restaurante,
    platillo,
    precio
FROM RankedPlatillos
WHERE rank_precio = 1
ORDER BY precio DESC;
