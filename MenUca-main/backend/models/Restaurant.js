import { sql } from '../config/database.js';

export class Restaurant {
  // Crear nuevo restaurante
  static async create(restaurantData) {
    const { nombre, ubicacion, precio_general, tipo_comida, tiempo_espera_promedio, horario_apertura, horario_cierre, ofertas_disponibles, vendedor_id } = restaurantData;
    
    try {
      const result = await sql.query`
        INSERT INTO Restaurante (
          nombre, ubicacion, precio_general, tipo_comida, 
          tiempo_espera_promedio, horario_apertura, horario_cierre, 
          ofertas_disponibles, vendedor_id
        )
        OUTPUT INSERTED.*
        VALUES (
          ${nombre}, ${ubicacion}, ${precio_general}, ${tipo_comida},
          ${tiempo_espera_promedio}, ${horario_apertura}, ${horario_cierre},
          ${ofertas_disponibles}, ${vendedor_id}
        )
      `;
      
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los restaurantes activos
  static async getAll() {
    try {
      const result = await sql.query`
        SELECT 
          r.*,
          u.nombre as vendedor_nombre,
          u.apellido as vendedor_apellido
        FROM Restaurante r
        INNER JOIN Usuario u ON r.vendedor_id = u.usuario_id
        WHERE r.activo = 1
        ORDER BY r.nombre
      `;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Obtener restaurante por ID
  static async getById(restaurante_id) {
    try {
      const result = await sql.query`
        SELECT 
          r.*,
          u.nombre as vendedor_nombre,
          u.apellido as vendedor_apellido
        FROM Restaurante r
        INNER JOIN Usuario u ON r.vendedor_id = u.usuario_id
        WHERE r.restaurante_id = ${restaurante_id} AND r.activo = 1
      `;
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener restaurantes de un vendedor específico
  static async getByVendor(vendedor_id) {
    try {
      const result = await sql.query`
        SELECT * FROM Restaurante 
        WHERE vendedor_id = ${vendedor_id} AND activo = 1
        ORDER BY nombre
      `;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar restaurante
  static async update(restaurante_id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => {
        return `${key} = ${updateData[key] !== undefined ? `'${updateData[key]}'` : 'NULL'}`;
      }).join(', ');

      const result = await sql.query`
        UPDATE Restaurante 
        SET ${sql.raw(fields)}
        WHERE restaurante_id = ${restaurante_id}
        OUTPUT INSERTED.*
      `;
      
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar restaurante (soft delete)
  static async delete(restaurante_id) {
    try {
      const result = await sql.query`
        UPDATE Restaurante 
        SET activo = 0 
        WHERE restaurante_id = ${restaurante_id}
        OUTPUT INSERTED.*
      `;
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }
}