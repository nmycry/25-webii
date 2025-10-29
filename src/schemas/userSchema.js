// src/schemas/userSchema.js
import { z } from 'zod';

/**
 * Schemas de validação para operações de usuário
 * Usando Zod para validação robusta e type-safe
 */

/**
 * Schema para criação de usuário (POST)
 * Todos os campos obrigatórios exceto foto
 */
export const createUserSchema = z.object({
  nome: z
    .string({
      required_error: 'Nome é obrigatório',
      invalid_type_error: 'Nome deve ser um texto',
    })
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email deve ser um texto',
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  senha: z
    .string({
      required_error: 'Senha é obrigatória',
      invalid_type_error: 'Senha deve ser um texto',
    })
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),

  papel: z
    .enum(['PROFESSOR', 'ADMIN'], {
      errorMap: () => ({ message: 'Papel deve ser PROFESSOR ou ADMIN' }),
    })
    .default('PROFESSOR')
    .optional(),

  foto: z
    .string()
    .url('URL da foto inválida')
    .optional()
    .nullable()
    .transform(val => val || null), // Converte string vazia para null
});

/**
 * Schema para atualização de usuário (PUT)
 * Todos os campos opcionais (partial)
 */
export const updateUserSchema = z
  .object({
    nome: z
      .string({
        invalid_type_error: 'Nome deve ser um texto',
      })
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim()
      .optional(),

    email: z
      .string({
        invalid_type_error: 'Email deve ser um texto',
      })
      .email('Email inválido')
      .toLowerCase()
      .trim()
      .optional(),

    senha: z
      .string({
        invalid_type_error: 'Senha deve ser um texto',
      })
      .min(6, 'Senha deve ter pelo menos 6 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .optional(),

    papel: z
      .enum(['PROFESSOR', 'ADMIN'], {
        errorMap: () => ({ message: 'Papel deve ser PROFESSOR ou ADMIN' }),
      })
      .optional(),

    foto: z
      .string()
      .url('URL da foto inválida')
      .optional()
      .nullable()
      .transform(val => val || null),
  })
  .strict() // Não permite campos extras
  .refine(data => Object.values(data).some(v => v !== undefined && v !== null), {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  })
  ;

/**
 * Schema para validação de ID (params)
 */
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID deve ser um número')
    .transform(Number)
    .refine(val => val > 0, 'ID deve ser um número positivo'),
});


/**
 * Schema para query parameters de listagem (futura paginação)
 */
export const listUsersQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 1))
      .refine(val => val > 0, 'Página deve ser maior que 0'),

    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 10))
      .refine(
        val => val > 0 && val <= 100,
        'Limite deve estar entre 1 e 100',
      ),

    papel: z.enum(['PROFESSOR', 'ADMIN']).optional(),
  })
  .optional();