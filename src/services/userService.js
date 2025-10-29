// src/services/userService.js
import prisma from '../config/database.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../errors/AppError.js';

/**
 * User Service
 * Responsável pela lógica de negócio relacionada aos usuários
 */

/**
 * Busca todos os usuários do sistema
 * @returns {Promise<Array>} Lista de usuários
 */
export const getAllUsers = async () => {
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return usuarios;
};

/**
 * Busca um usuário por ID
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Usuário encontrado
 * @throws {ValidationError} Se ID for inválido
 * @throws {NotFoundError} Se usuário não existir
 */
export const getUserById = async userId => {
  // Validação: ID deve ser um número positivo
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new ValidationError('ID inválido. Deve ser um número positivo');
  }

  const usuario = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
    },
  });

  if (!usuario) {
    throw new NotFoundError(
      `Usuário com ID ${userId} não encontrado`,
      'User',
    );
  }

  return usuario;
};

/**
 * Verifica se um email já está cadastrado
 * @param {string} email - Email a ser verificado
 * @returns {Promise<boolean>} True se email existe
 */
const emailExists = async email => {
  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  return !!usuario;
};

/**
 * Cria um novo usuário
 * @param {Object} userData - Dados do novo usuário
 * @returns {Promise<Object>} Usuário criado
 * @throws {ConflictError} Se email já existir
 */
export const createUser = async userData => {
  // Verificar se email já existe
  const emailJaExiste = await emailExists(userData.email);
  if (emailJaExiste) {
    throw new ConflictError('Email já cadastrado no sistema', 'email');
  }

  // Preparar dados para criação
  const dadosUsuario = {
    nome: userData.nome,
    email: userData.email,
    senha: userData.senha, // TODO: Hash da senha (faremos na aula de segurança)
    papel: userData.papel || 'PROFESSOR',
    foto: userData.foto || null,
  };

  // Criar usuário no banco
  const novoUsuario = await prisma.user.create({
    data: dadosUsuario,
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
    },
  });

  return novoUsuario;
};

/**
 * Atualiza um usuário existente
 * @param {number} userId - ID do usuário
 * @param {Object} userData - Dados para atualizar
 * @returns {Promise<Object>} Usuário atualizado
 * @throws {ValidationError} Se ID for inválido
 * @throws {NotFoundError} Se usuário não existir
 * @throws {ConflictError} Se email já estiver em uso
 */
export const updateUser = async (userId, userData) => {
  // Validar ID
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new ValidationError('ID inválido. Deve ser um número positivo');
  }

  // Verificar se usuário existe
  const usuarioExistente = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!usuarioExistente) {
    throw new NotFoundError(
      `Usuário com ID ${userId} não encontrado`,
      'User',
    );
  }

  // Se email está sendo alterado, verificar unicidade
  if (userData.email && userData.email !== usuarioExistente.email) {
    const emailJaExiste = await emailExists(userData.email);
    if (emailJaExiste) {
      throw new ConflictError('Email já está em uso por outro usuário', 'email');
    }
  }

  // Preparar dados para atualização
  const dadosAtualizacao = {};
  if (userData.nome) dadosAtualizacao.nome = userData.nome;
  if (userData.email) dadosAtualizacao.email = userData.email;
  if (userData.senha) dadosAtualizacao.senha = userData.senha; // TODO: Hash
  if (userData.papel) dadosAtualizacao.papel = userData.papel;
  if (userData.foto !== undefined) dadosAtualizacao.foto = userData.foto;

  // Atualizar no banco
  const usuarioAtualizado = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: dadosAtualizacao,
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return usuarioAtualizado;
};

/**
 * Remove um usuário do sistema
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Dados do usuário removido
 * @throws {ValidationError} Se ID for inválido
 * @throws {NotFoundError} Se usuário não existir
 */
export const deleteUser = async userId => {
  // Validar ID
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new ValidationError('ID inválido. Deve ser um número positivo');
  }

  // Verificar se usuário existe
  const usuarioExistente = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      nome: true,
      email: true,
    },
  });

  if (!usuarioExistente) {
    throw new NotFoundError(
      `Usuário com ID ${userId} não encontrado`,
      'User',
    );
  }

  // Remover do banco
  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });

  return usuarioExistente;
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};