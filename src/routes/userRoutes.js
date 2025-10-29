// src/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import validate from '../middlewares/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from '../schemas/userSchema.js';

const router = express.Router();

/**
 * Rotas de Usuários com Validação
 * Base URL: /users
 */

// CREATE - Criar novo usuário
router.post('/', validate(createUserSchema, 'body'), userController.create);

// READ - Listar todos os usuários
router.get('/', userController.getAll);

// READ - Buscar usuário por ID
router.get('/:id', validate(idParamSchema, 'params'), userController.getById);

// UPDATE - Atualizar usuário
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.update,
);

// DELETE - Remover usuário
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  userController.remove,
);

export default router;