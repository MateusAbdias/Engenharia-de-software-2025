// src/service/routes/authRoutes.js

console.log("----- authRoutes.js carregado: " + new Date().toLocaleString() + " -----");
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const fs = require('fs').promises; // <--- APENAS ESTA LINHA AQUI, UMA VEZ!
const bcrypt = require('bcrypt');
const path = require('path');
// --- Middlewares de Autenticação (Definições Completas) ---
// Estas funções foram movidas para server.js na última iteração,
// mas se você as está definindo aqui, elas precisam estar completas e consistentes.
// No entanto, para evitar duplicação, elas devem vir de 'middlewares/authMiddleware.js'.
// A forma correta de importá-las aqui é:
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');


// --- LOGS DE DEPURAÇÃO ---
console.log('DEBUG (authRoutes): Tipo de isAuthenticated:', typeof isAuthenticated);
console.log('DEBUG (authRoutes): Tipo de isAdmin:', typeof isAdmin);
console.log('DEBUG (authRoutes): Tipo de authController.login:', typeof authController.login);
console.log('DEBUG (authRoutes): Tipo de authController.createUserByAdmin:', typeof authController.createUserByAdmin);
// Fim dos logs de depuração

// Rota para login de usuário
router.post(/^\/api\/login\/?$/, authController.login);

// --- ROTA PROTEGIDA PARA CRIAR USUÁRIOS (apenas para Admin) ---
// Esta rota precisa de isAuthenticated E isAdmin para funcionar
router.post(/^\/api\/admin\/create-user\/?$/, isAuthenticated, isAdmin, authController.createUserByAdmin);

// ESTA É A ÚNICA LINHA QUE DEVE ESTAR NO FINAL DESTE ARQUIVO!
module.exports = router;