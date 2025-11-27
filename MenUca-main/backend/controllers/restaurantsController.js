import { sql } from '../config/database.js';

export const restaurantsController = {
  async getAllRestaurants(req, res) {
    try {
      console.log('Obteniendo todos los restaurantes activos...');

      const result = await sql.query`
                SELECT 
                    r.restaurante_id,
                    r.nombre,
                    r.ubicacion,
                    r.precio_general,
                    r.tipo_comida,
                    r.tiempo_espera_promedio,
                    r.horario_apertura,
                    r.horario_cierre,
                    r.ofertas_disponibles,
                    r.activo,
                    u.nombre as vendedor_nombre,
                    ISNULL(AVG(re.puntaje_general), 0) as puntaje_promedio,
                    COUNT(re.reseña_id) as total_reseñas
                FROM Restaurante r
                INNER JOIN Usuario u ON r.vendedor_id = u.usuario_id
                LEFT JOIN Reseña re ON r.restaurante_id = re.restaurante_id
                WHERE r.activo = 1
                GROUP BY 
                    r.restaurante_id, r.nombre, r.ubicacion, r.precio_general, 
                    r.tipo_comida, r.tiempo_espera_promedio, r.horario_apertura, 
                    r.horario_cierre, r.ofertas_disponibles, r.activo, u.nombre
                ORDER BY puntaje_promedio DESC, r.nombre ASC
            `;

      console.log(`Restaurantes encontrados: ${result.recordset.length}`);

      // Función robusta para formatear horarios
      const formatTime = (timeValue) => {
        if (!timeValue) return '09:00';

        // Si es string, verificar formato
        if (typeof timeValue === 'string') {
          // Si ya tiene formato HH:mm
          if (/^\d{1,2}:\d{2}$/.test(timeValue)) {
            return timeValue;
          }
          // Si es un string largo, extraer tiempo
          const timeMatch = timeValue.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          }
        }

        // Si es objeto Date
        if (timeValue instanceof Date) {
          return timeValue.toTimeString().substring(0, 5);
        }

        // Si es otro tipo, convertirlo a string y extraer
        try {
          const timeStr = timeValue.toString();
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          }
        } catch (e) {
          console.log('Error formateando tiempo:', e);
        }

        return '09:00';
      };

      const restaurants = result.recordset.map(restaurant => ({
        restaurante_id: restaurant.restaurante_id,
        nombre: restaurant.nombre,
        ubicacion: restaurant.ubicacion,
        precio_general: restaurant.precio_general,
        tipo_comida: restaurant.tipo_comida,
        tiempo_espera_promedio: restaurant.tiempo_espera_promedio,
        horario_apertura: formatTime(restaurant.horario_apertura),
        horario_cierre: formatTime(restaurant.horario_cierre),
        ofertas_disponibles: restaurant.ofertas_disponibles,
        vendedor_nombre: restaurant.vendedor_nombre,
        puntaje_promedio: parseFloat(restaurant.puntaje_promedio) || 0,
        total_reseñas: restaurant.total_reseñas,
        activo: restaurant.activo
      }));

      res.json(restaurants);
    } catch (error) {
      console.error('Error obteniendo restaurantes:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },
  async getRestaurantById(req, res) {
    try {
      const { id } = req.params;
      console.log(`Obteniendo restaurante con ID: ${id}`);

      const result = await sql.query`
                SELECT 
                    r.restaurante_id,
                    r.nombre,
                    r.ubicacion,
                    r.precio_general,
                    r.tipo_comida,
                    r.tiempo_espera_promedio,
                    r.horario_apertura,
                    r.horario_cierre,
                    r.ofertas_disponibles,
                    r.activo,
                    u.nombre as vendedor_nombre,
                    ISNULL(AVG(re.puntaje_general), 0) as puntaje_promedio,
                    COUNT(re.reseña_id) as total_reseñas
                FROM Restaurante r
                INNER JOIN Usuario u ON r.vendedor_id = u.usuario_id
                LEFT JOIN Reseña re ON r.restaurante_id = re.restaurante_id
                WHERE r.restaurante_id = ${id} AND r.activo = 1
                GROUP BY 
                    r.restaurante_id, r.nombre, r.ubicacion, r.precio_general, 
                    r.tipo_comida, r.tiempo_espera_promedio, r.horario_apertura, 
                    r.horario_cierre, r.ofertas_disponibles, r.activo, u.nombre
            `;

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Restaurante no encontrado' });
      }

      const restaurant = result.recordset[0];

      const formatTime = (timeValue) => {
        if (!timeValue) return '09:00';
        if (typeof timeValue === 'string') {
          if (/^\d{1,2}:\d{2}$/.test(timeValue)) {
            return timeValue;
          }
          const timeMatch = timeValue.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          }
        }
        if (timeValue instanceof Date) {
          return timeValue.toTimeString().substring(0, 5);
        }
        try {
          const timeStr = timeValue.toString();
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          }
        } catch (e) {
          console.log('Error formateando tiempo:', e);
        }
        return '09:00';
      };

      const formattedRestaurant = {
        restaurante_id: restaurant.restaurante_id,
        nombre: restaurant.nombre,
        ubicacion: restaurant.ubicacion,
        precio_general: restaurant.precio_general,
        tipo_comida: restaurant.tipo_comida,
        tiempo_espera_promedio: restaurant.tiempo_espera_promedio,
        horario_apertura: formatTime(restaurant.horario_apertura),
        horario_cierre: formatTime(restaurant.horario_cierre),
        ofertas_disponibles: restaurant.ofertas_disponibles,
        vendedor_nombre: restaurant.vendedor_nombre,
        puntaje_promedio: parseFloat(restaurant.puntaje_promedio) || 0,
        total_reseñas: restaurant.total_reseñas,
        activo: restaurant.activo
      };

      console.log(`Restaurante encontrado: ${formattedRestaurant.nombre}`);
      res.json(formattedRestaurant);

    } catch (error) {
      console.error('Error obteniendo restaurante:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async getRestaurantDishes(req, res) {
    try {
      const { id } = req.params;
      console.log(`Obteniendo platillos para restaurante ID: ${id}`);

      const result = await sql.query`
            SELECT 
                platillo_id,
                nombre,
                precio,
                ingredientes,
                incluye_bebida,
                unidades_disponibles,
                activo,
                restaurante_id
            FROM Platillo 
            WHERE restaurante_id = ${id} AND activo = 1
            ORDER BY nombre ASC
        `;

      const dishes = result.recordset.map(dish => ({
        platillo_id: dish.platillo_id,
        nombre: dish.nombre,
        precio: parseFloat(dish.precio) || 0,
        ingredientes: dish.ingredientes,
        incluye_bebida: dish.incluye_bebida || false,
        unidades_disponibles: dish.unidades_disponibles || 0,
        activo: dish.activo,
        restaurante_id: dish.restaurante_id
      }));

      console.log(`Platillos encontrados: ${dishes.length}`);
      res.json(dishes);

    } catch (error) {
      console.error('Error obteniendo platillos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async registerRestaurant(req, res) {
    try {
      console.log('Registrando nuevo restaurante...');
      console.log('Datos recibidos:', req.body);

      if (req.user.tipo_usuario !== 'vendedor') {
        return res.status(403).json({
          error: 'Solo los vendedores pueden registrar restaurantes'
        });
      }

      const {
        nombre,
        ubicacion,
        precio_general,
        tipo_comida,
        tiempo_espera_promedio,
        horario_apertura,
        horario_cierre,
        ofertas_disponibles,
        dishes
      } = req.body;

      if (!nombre || !ubicacion || !precio_general || !tipo_comida) {
        return res.status(400).json({
          error: 'Nombre, ubicación, precio general y tipo de comida son requeridos'
        });
      }

      const transaction = new sql.Transaction();

      try {
        await transaction.begin();

        const insertResult = await transaction.request()
          .input('nombre', sql.NVarChar, nombre)
          .input('ubicacion', sql.NVarChar, ubicacion)
          .input('precio_general', sql.NVarChar, precio_general)
          .input('tipo_comida', sql.NVarChar, tipo_comida)
          .input('tiempo_espera_promedio', sql.Int, tiempo_espera_promedio || 20)
          .input('horario_apertura', sql.NVarChar, horario_apertura || '08:00')
          .input('horario_cierre', sql.NVarChar, horario_cierre || '22:00')
          .input('ofertas_disponibles', sql.Int, ofertas_disponibles || 0)
          .input('vendedor_id', sql.Int, req.user.usuario_id)
          .query(`
                    INSERT INTO Restaurante (
                        nombre, ubicacion, precio_general, tipo_comida, 
                        tiempo_espera_promedio, horario_apertura, horario_cierre, 
                        ofertas_disponibles, vendedor_id
                    )
                    OUTPUT INSERTED.restaurante_id
                    VALUES (
                        @nombre, @ubicacion, @precio_general, @tipo_comida,
                        @tiempo_espera_promedio, @horario_apertura, @horario_cierre,
                        @ofertas_disponibles, @vendedor_id
                    )
                `);

        const restaurantId = insertResult.recordset[0].restaurante_id;

        if (dishes && dishes.length > 0) {
          for (const dish of dishes) {
            if (dish.nombre && dish.precio) {
              await transaction.request()
                .input('nombre', sql.NVarChar, dish.nombre)
                .input('precio', sql.Decimal(10, 2), parseFloat(dish.precio))
                .input('ingredientes', sql.NVarChar, dish.ingredientes || '')
                .input('incluye_bebida', sql.Bit, dish.incluye_bebida || false)
                .input('unidades_disponibles', sql.Int, dish.unidades_disponibles || 0)
                .input('restaurante_id', sql.Int, restaurantId)
                .query(`
                                INSERT INTO Platillo (
                                    nombre, precio, ingredientes, incluye_bebida,
                                    unidades_disponibles, restaurante_id
                                )
                                VALUES (
                                    @nombre, @precio, @ingredientes, @incluye_bebida,
                                    @unidades_disponibles, @restaurante_id
                                )
                            `);
            }
          }
        }

        await transaction.commit();

        const selectResult = await sql.query`
                SELECT * FROM Restaurante WHERE restaurante_id = ${restaurantId}
            `;

        const newRestaurant = selectResult.recordset[0];

        console.log('Restaurante registrado exitosamente:', newRestaurant.restaurante_id);

        res.status(201).json({
          message: 'Restaurante registrado exitosamente',
          restaurant: newRestaurant,
          dishesAdded: dishes ? dishes.length : 0
        });

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error registrando restaurante:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },
  async getRestaurantReviews(req, res) {
    try {
      const { id } = req.params;
      console.log(`Obteniendo reseñas para restaurante ID: ${id}`);

      const result = await sql.query`
            SELECT 
                r.reseña_id,
                r.puntaje_general,
                r.titulo,
                r.descripcion as comentario,
                r.calidad_comida,
                r.tiempo_espera,
                r.atencion_cliente,
                r.cantidad_comida,
                r.fecha_reseña as fecha_creacion,
                u.nombre as usuario_nombre,
                u.correo as usuario_correo
            FROM Reseña r
            INNER JOIN Usuario u ON r.usuario_id = u.usuario_id
            WHERE r.restaurante_id = ${id}
            ORDER BY r.fecha_reseña DESC
        `;

      const reviews = result.recordset.map(review => ({
        reseña_id: review.reseña_id,
        puntaje_general: review.puntaje_general,
        titulo: review.titulo,
        comentario: review.comentario,
        calidad_comida: review.calidad_comida,
        tiempo_espera: review.tiempo_espera,
        atencion_cliente: review.atencion_cliente,
        cantidad_comida: review.cantidad_comida,
        fecha_creacion: review.fecha_creacion,
        usuario_nombre: review.usuario_nombre,
        usuario_correo: review.usuario_correo
      }));

      console.log(`Reseñas encontradas: ${reviews.length}`);
      res.json(reviews);

    } catch (error) {
      console.error('Error obteniendo reseñas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async addReview(req, res) {
    try {
      const { id } = req.params;
      const {
        puntaje_general,
        titulo,
        descripcion,
        calidad_comida,
        tiempo_espera,
        atencion_cliente,
        cantidad_comida
      } = req.body;

      if (!puntaje_general || puntaje_general < 1 || puntaje_general > 5) {
        return res.status(400).json({ error: 'Puntaje debe ser entre 1 y 5' });
      }

      // Verificar si el usuario ya hizo una reseña para este restaurante
      const existingReview = await sql.query`
            SELECT reseña_id FROM Reseña 
            WHERE usuario_id = ${req.user.usuario_id} AND restaurante_id = ${id}
        `;

      if (existingReview.recordset.length > 0) {
        return res.status(400).json({ error: 'Ya has realizado una reseña para este restaurante' });
      }

      const result = await sql.query`
            INSERT INTO Reseña (
                puntaje_general, titulo, descripcion, 
                calidad_comida, tiempo_espera, atencion_cliente, cantidad_comida,
                usuario_id, restaurante_id
            )
            VALUES (
                ${puntaje_general}, ${titulo || ''}, ${descripcion || ''},
                ${calidad_comida || null}, ${tiempo_espera || null}, 
                ${atencion_cliente || null}, ${cantidad_comida || null},
                ${req.user.usuario_id}, ${id}
            )
        `;

      res.status(201).json({ message: 'Reseña agregada exitosamente' });

    } catch (error) {
      console.error('Error agregando reseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },
  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre, ubicacion, precio_general, tipo_comida,
        tiempo_espera_promedio, horario_apertura, horario_cierre,
        ofertas_disponibles
      } = req.body;

      // Verificar que el restaurante pertenezca al vendedor
      const restaurantCheck = await sql.query`
            SELECT restaurante_id FROM Restaurante 
            WHERE restaurante_id = ${id} AND vendedor_id = ${req.user.usuario_id}
        `;

      if (restaurantCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Restaurante no encontrado o no autorizado' });
      }

      await sql.query`
            UPDATE Restaurante SET
                nombre = ${nombre},
                ubicacion = ${ubicacion},
                precio_general = ${precio_general},
                tipo_comida = ${tipo_comida},
                tiempo_espera_promedio = ${tiempo_espera_promedio},
                horario_apertura = ${horario_apertura},
                horario_cierre = ${horario_cierre},
                ofertas_disponibles = ${ofertas_disponibles}
            WHERE restaurante_id = ${id}
        `;

      const updatedRestaurant = await sql.query`
            SELECT * FROM Restaurante WHERE restaurante_id = ${id}
        `;

      res.json({
        message: 'Restaurante actualizado exitosamente',
        restaurant: updatedRestaurant.recordset[0]
      });

    } catch (error) {
      console.error('Error actualizando restaurante:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el restaurante pertenezca al vendedor
      const restaurantCheck = await sql.query`
            SELECT restaurante_id FROM Restaurante 
            WHERE restaurante_id = ${id} AND vendedor_id = ${req.user.usuario_id}
        `;

      if (restaurantCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Restaurante no encontrado o no autorizado' });
      }

      // Soft delete - marcar como inactivo
      await sql.query`
            UPDATE Restaurante SET activo = 0 
            WHERE restaurante_id = ${id}
        `;

      res.json({ message: 'Restaurante eliminado exitosamente' });

    } catch (error) {
      console.error('Error eliminando restaurante:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async addDish(req, res) {
    try {
      const { id } = req.params;
      const { nombre, precio, ingredientes, incluye_bebida, unidades_disponibles } = req.body;

      // Verificar que el restaurante pertenezca al vendedor
      const restaurantCheck = await sql.query`
            SELECT restaurante_id FROM Restaurante 
            WHERE restaurante_id = ${id} AND vendedor_id = ${req.user.usuario_id}
        `;

      if (restaurantCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Restaurante no encontrado o no autorizado' });
      }

      const result = await sql.query`
            INSERT INTO Platillo (
                restaurante_id, nombre, precio, ingredientes,
                incluye_bebida, unidades_disponibles
            )
            OUTPUT INSERTED.platillo_id
            VALUES (
                ${id}, ${nombre}, ${precio}, ${ingredientes},
                ${incluye_bebida || false}, ${unidades_disponibles || 0}
            )
        `;

      const newDish = await sql.query`
            SELECT * FROM Platillo WHERE platillo_id = ${result.recordset[0].platillo_id}
        `;

      res.status(201).json({
        message: 'Platillo agregado exitosamente',
        dish: newDish.recordset[0]
      });

    } catch (error) {
      console.error('Error agregando platillo:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async updateDish(req, res) {
    try {
      const { id, dishId } = req.params;
      const { nombre, precio, ingredientes, incluye_bebida, unidades_disponibles } = req.body;

      // Verificar permisos
      const permissionCheck = await sql.query`
            SELECT p.platillo_id 
            FROM Platillo p
            INNER JOIN Restaurante r ON p.restaurante_id = r.restaurante_id
            WHERE p.platillo_id = ${dishId} 
            AND r.restaurante_id = ${id} 
            AND r.vendedor_id = ${req.user.usuario_id}
        `;

      if (permissionCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Platillo no encontrado o no autorizado' });
      }

      await sql.query`
            UPDATE Platillo SET
                nombre = ${nombre},
                precio = ${precio},
                ingredientes = ${ingredientes},
                incluye_bebida = ${incluye_bebida},
                unidades_disponibles = ${unidades_disponibles}
            WHERE platillo_id = ${dishId}
        `;

      const updatedDish = await sql.query`
            SELECT * FROM Platillo WHERE platillo_id = ${dishId}
        `;

      res.json({
        message: 'Platillo actualizado exitosamente',
        dish: updatedDish.recordset[0]
      });

    } catch (error) {
      console.error('Error actualizando platillo:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async deleteDish(req, res) {
    try {
      const { id, dishId } = req.params;

      // Verificar permisos
      const permissionCheck = await sql.query`
            SELECT p.platillo_id 
            FROM Platillo p
            INNER JOIN Restaurante r ON p.restaurante_id = r.restaurante_id
            WHERE p.platillo_id = ${dishId} 
            AND r.restaurante_id = ${id} 
            AND r.vendedor_id = ${req.user.usuario_id}
        `;

      if (permissionCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Platillo no encontrado o no autorizado' });
      }

      // Soft delete
      await sql.query`
            UPDATE Platillo SET activo = 0 
            WHERE platillo_id = ${dishId}
        `;

      res.json({ message: 'Platillo eliminado exitosamente' });

    } catch (error) {
      console.error('Error eliminando platillo:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async getMyRestaurants(req, res) {
    try {
      const result = await sql.query`
            SELECT 
                r.*,
                ISNULL(AVG(re.puntaje_general), 0) as puntaje_promedio,
                COUNT(re.reseña_id) as total_reseñas,
                COUNT(p.platillo_id) as total_platillos
            FROM Restaurante r
            LEFT JOIN Reseña re ON r.restaurante_id = re.restaurante_id
            LEFT JOIN Platillo p ON r.restaurante_id = p.restaurante_id AND p.activo = 1
            WHERE r.vendedor_id = ${req.user.usuario_id} AND r.activo = 1
            GROUP BY 
                r.restaurante_id, r.nombre, r.ubicacion, r.precio_general, 
                r.tipo_comida, r.tiempo_espera_promedio, r.horario_apertura, 
                r.horario_cierre, r.ofertas_disponibles, r.vendedor_id, r.activo
            ORDER BY r.nombre ASC
        `;

      const restaurants = result.recordset.map(restaurant => ({
        ...restaurant,
        puntaje_promedio: parseFloat(restaurant.puntaje_promedio) || 0,
        total_reseñas: restaurant.total_reseñas,
        total_platillos: restaurant.total_platillos
      }));

      res.json(restaurants);

    } catch (error) {
      console.error('Error obteniendo restaurantes del vendedor:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
};