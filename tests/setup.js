// tests/setup.js
import { beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '../src/config/database.js';

/**
 * Setup executado antes de todos os testes
 * Garante que o banco de dados está conectado
 */
beforeAll(async () => {
  try {
    await prisma.$connect();
    console.log('🔗 Conectado ao banco de dados para testes');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    throw error;
  }
});

/**
 * Cleanup executado após todos os testes
 * Desconecta do banco de dados
 */
afterAll(async () => {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do banco de dados');
});

/**
 * Executado antes de cada teste
 * Limpa dados de teste (opcional - ativar quando necessário)
 */
beforeEach(async () => {
  // Descomente as linhas abaixo para limpar dados entre testes
  // CUIDADO: Isso vai deletar TODOS os dados das tabelas!
  await prisma.user.deleteMany({});
  console.log('🧹 Dados de teste limpos');
});