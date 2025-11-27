import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuración base
const baseConfig = {
  server: 'localhost',
  database: 'MenUCA',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Configuraciones por tipo de usuario
const dbConfigs = {
  // Para operaciones generales/autenticación
  auth: {
    ...baseConfig,
    user: 'sa',
    password: '12345DAD'
  },
  // Para consumidores
  consumidor: {
    ...baseConfig,
    user: 'app_consumidor',
    password: 'password_consumidor'
  },
  // Para vendedores  
  vendedor: {
    ...baseConfig,
    user: 'app_vendedor',
    password: 'password_vendedor'
  },
  // Para administradores
  administrador: {
    ...baseConfig,
    user: 'app_administrador',
    password: 'password_admin'
  }
};

// Pools por tipo de usuario
const pools = {};

export const connectDB = async (userType = 'auth') => {
  try {
    const config = dbConfigs[userType];
    if (!config) throw new Error(`Tipo de usuario no válido: ${userType}`);
    
    console.log(`Conectando como: ${userType}`);
    
    if (!pools[userType]) {
      pools[userType] = await sql.connect(config);
      console.log(`Pool creado para: ${userType}`);
    }
    
    return pools[userType];
  } catch (err) {
    console.error(`Error conectando como ${userType}:`, err.message);
    throw err;
  }
};

// Obtener conexión según el rol del usuario
export const getConnectionByRole = (userRole) => {
  const roleMap = {
    'consumidor': 'consumidor',
    'vendedor': 'vendedor', 
    'administrador': 'administrador'
  };
  
  return connectDB(roleMap[userRole] || 'auth');
};

// Función para establecer usuario actual en contexto
export const setCurrentUserContext = async (userId, userPool) => {
  try {
    await userPool.request()
      .input('userId', sql.Int, userId)
      .query('EXEC sp_set_context_info @userId');
  } catch (err) {
    console.error('Error estableciendo contexto:', err);
  }
};

// Función mejorada GetCurrentUserID para SQL Server
export const createGetCurrentUserFunction = async () => {
  try {
    const adminPool = await connectDB('administrador');
    
    // Crear función mejorada que usa CONTEXT_INFO
    await adminPool.request().batch(`
      IF OBJECT_ID('dbo.GetCurrentUserID') IS NOT NULL
        DROP FUNCTION dbo.GetCurrentUserID;
      
      CREATE FUNCTION dbo.GetCurrentUserID()
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
      END
    `);
    
    console.log('Función GetCurrentUserID creada/actualizada');
  } catch (err) {
    console.error('Error creando función GetCurrentUserID:', err);
  }
};

// Middleware para inyectar usuario en contexto
export const userContextMiddleware = async (req, res, next) => {
  if (req.user && req.userPool) {
    try {
      await setCurrentUserContext(req.user.usuario_id, req.userPool);
    } catch (err) {
      console.error('Error en userContextMiddleware:', err);
    }
  }
  next();
};

export { sql };