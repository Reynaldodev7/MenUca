import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authController = {
  async register(req, res) {
    try {
      console.log('Body recibido:', req.body);

      const { nombre, apellido, correo, contraseña, tipo_usuario } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es requerido' });
      }
      if (!apellido) {
        return res.status(400).json({ error: 'El campo apellido es requerido' });
      }
      if (!correo) {
        return res.status(400).json({ error: 'El campo correo es requerido' });
      }
      if (!contraseña) {
        return res.status(400).json({ error: 'El campo contraseña es requerido' });
      }
      if (!tipo_usuario) {
        return res.status(400).json({ error: 'El campo tipo_usuario es requerido' });
      }

      console.log('Campos validados correctamente');

      const existingUser = await User.findByEmail(correo);
      if (existingUser) {
        return res.status(400).json({
          error: 'El correo ya está registrado'
        });
      }

      const hashedPassword = await bcrypt.hash(contraseña, 10);

      const newUser = await User.create({
        nombre,
        apellido,
        correo,
        contraseña: hashedPassword,
        tipo_usuario
      });

      console.log('Usuario creado en BD:', newUser.usuario_id);

      const { contraseña: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async login(req, res) {
    try {
      console.log('Intentando login...');
      console.log('Body recibido:', req.body);

      const { correo, contraseña } = req.body;

      if (!correo || !contraseña) {
        return res.status(400).json({
          error: 'Correo y contraseña son requeridos'
        });
      }

      console.log('Buscando usuario:', correo);

      const user = await User.findByEmail(correo);
      console.log('Usuario encontrado:', user ? 'Sí' : 'No');
      
      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      console.log('Verificando contraseña...');

      const validPassword = await bcrypt.compare(contraseña, user.contraseña);
      console.log('Contraseña válida:', validPassword);

      if (!validPassword) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      console.log('Generando token JWT...');

      const token = jwt.sign(
        { 
          usuario_id: user.usuario_id, 
          correo: user.correo,
          tipo_usuario: user.tipo_usuario 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { contraseña: _, ...userWithoutPassword } = user;

      console.log('Login exitoso para:', user.correo);

      res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async getMe(req, res) {
    try {
      console.log('GET /api/auth/me - Usuario ID:', req.user.usuario_id);
      
      console.log('User.findById disponible en getMe:', typeof User.findById);
      
      const user = await User.findById(req.user.usuario_id);
      
      if (!user) {
        console.log('Usuario no encontrado en BD');
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('Usuario encontrado:', { 
        id: user.usuario_id, 
        nombre: user.nombre, 
        correo: user.correo 
      });

      const { contraseña, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);

    } catch (error) {
      console.error('ERROR en getMe:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { nombre, apellido, correo } = req.body;
      const usuario_id = req.user.usuario_id;

      console.log('Actualizando perfil para usuario:', usuario_id);
      console.log('Datos recibidos:', { nombre, apellido, correo });

      if (!nombre && !apellido && !correo) {
        return res.status(400).json({ 
          error: 'Se requiere al menos un campo para actualizar' 
        });
      }

      if (correo) {
        const existingUser = await User.findByEmail(correo);
        if (existingUser && existingUser.usuario_id !== usuario_id) {
          return res.status(400).json({ error: 'El correo ya está en uso' });
        }
      }

      const currentUser = await User.findById(usuario_id);
      if (!currentUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const updateData = {
        nombre: nombre || currentUser.nombre,
        apellido: apellido || currentUser.apellido,
        correo: correo || currentUser.correo
      };

      const updatedUser = await User.update(usuario_id, updateData);

      const { contraseña: _, ...userWithoutPassword } = updatedUser;

      console.log('Perfil actualizado correctamente para:', usuario_id);
      res.json({
        message: 'Perfil actualizado correctamente',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const usuario_id = req.user.usuario_id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'La contraseña actual y nueva son requeridas' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
      }

      const user = await User.findById(usuario_id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.contraseña);
      if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await User.updatePassword(usuario_id, hashedNewPassword);

      res.json({ message: 'Contraseña actualizada correctamente' });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
};