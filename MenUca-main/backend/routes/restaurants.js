import express from 'express';
import { restaurantsController } from '../controllers/restaurantsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', restaurantsController.getAllRestaurants);
router.get('/:id', restaurantsController.getRestaurantById);
router.get('/:id/dishes', restaurantsController.getRestaurantDishes);
router.get('/:id/reviews', restaurantsController.getRestaurantReviews);

// Rutas protegidas - Vendedores
router.get('/vendor/my-restaurants', authenticateToken, restaurantsController.getMyRestaurants);
router.post('/register', authenticateToken, restaurantsController.registerRestaurant);
router.put('/:id', authenticateToken, restaurantsController.updateRestaurant);
router.delete('/:id', authenticateToken, restaurantsController.deleteRestaurant);

// Gestión de platillos
router.post('/:id/dishes', authenticateToken, restaurantsController.addDish);
router.put('/:id/dishes/:dishId', authenticateToken, restaurantsController.updateDish);
router.delete('/:id/dishes/:dishId', authenticateToken, restaurantsController.deleteDish);

// Reseñas
router.post('/:id/reviews', authenticateToken, restaurantsController.addReview);

export default router;