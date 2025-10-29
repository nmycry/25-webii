// src/controllers/userController.js
import * as userService from '../services/userService.js';

/**
 * User Controller
 * Responsável por gerenciar requisições HTTP relacionadas aos usuários
 * Com middleware de validação, apenas delega para o Service
 */

/**
 * GET /users
 * Lista todos os usuários
 */
export const getAll = async (req, res, next) => {
  try {
    const usuarios = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    next(error); // Passa para middleware de erro
  }
};

/**
 * GET /users/:id
 * Busca um usuário específico por ID
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /users
 * Cria um novo usuário
 */
export const create = async (req, res, next) => {
  try {
    const novoUsuario = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: novoUsuario,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /users/:id
 * Atualiza um usuário existente
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioAtualizado = await userService.updateUser(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /users/:id
 * Remove um usuário do sistema
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioRemovido = await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Usuário removido com sucesso',
      data: usuarioRemovido,
    });
  } catch (error) {
    next(error);
  }
};