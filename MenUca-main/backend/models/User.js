import { sql } from '../config/database.js';

export class User {
  static async create(userData) {
    const { nombre, apellido, correo, contraseña, tipo_usuario } = userData;

    try {
      const result = await sql.query`
        INSERT INTO Usuario (nombre, apellido, correo, contraseña, tipo_usuario)
        OUTPUT INSERTED.*
        VALUES (${nombre}, ${apellido}, ${correo}, ${contraseña}, ${tipo_usuario})
      `;

      return result.recordset[0];
    } catch (error) {
      if (error.number === 2627) {
        throw new Error('El correo ya está registrado');
      }
      throw error;
    }
  }

  static async findByEmail(correo) {
    try {
      console.log('Ejecutando query para correo:', correo);
      const result = await sql.query`
        SELECT * FROM Usuario WHERE correo = ${correo}
      `;
      console.log('Resultado de query:', result.recordset[0] ? 'Usuario encontrado' : 'Usuario no encontrado');
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }

  static async findById(usuario_id) {
    try {
      console.log('Buscando usuario por ID:', usuario_id);
      const result = await sql.query`
        SELECT * FROM Usuario WHERE usuario_id = ${usuario_id}
      `;
      console.log('Usuario encontrado:', result.recordset[0] ? 'Sí' : 'No');
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const result = await sql.query`
        SELECT usuario_id, nombre, apellido, correo, tipo_usuario, fecha_registro 
        FROM Usuario 
        WHERE activo = 1
      `;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async update(usuario_id, updateData) {
    try {
      const { nombre, apellido, correo } = updateData;
      
      const result = await sql.query`
        UPDATE Usuario 
        SET nombre = ${nombre}, apellido = ${apellido}, correo = ${correo}
        WHERE usuario_id = ${usuario_id};
        
        SELECT * FROM Usuario WHERE usuario_id = ${usuario_id};
      `;

      return result.recordset[0];
    } catch (error) {
      console.error('Error en User.update:', error);
      throw error;
    }
  }

  static async updatePassword(usuario_id, newPassword) {
    try {
      await sql.query`
        UPDATE Usuario 
        SET contraseña = ${newPassword}
        WHERE usuario_id = ${usuario_id}
      `;

      return true;
    } catch (error) {
      console.error('Error en User.updatePassword:', error);
      throw error;
    }
  }
}