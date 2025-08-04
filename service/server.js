// src/service/server.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// --- NOVO: Importa os middlewares de autenticação do arquivo separado ---
const { isAuthenticated, isAdmin } = require('./middlewares/authMiddleware');

const serviceDir = __dirname;
const projectRoot = path.join(serviceDir, '..'); // Volta para a raiz do projeto (Engenharia-de-software-2025)
console.log(`DEBUG: projectRoot é ${projectRoot}`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Rotas de API e Formulários ---
// formRoutes precisará ser modificado para usar isAuthenticated
const formRoutes = require('./routes/formRoutes')(projectRoot);
app.use(formRoutes);

// authRoutes agora não precisa mais exportar isAuthenticated/isAdmin, só as rotas
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// --- Rotas para as páginas HTML específicas (URLs amigáveis) ---

// AJUSTADO: Rota principal (raiz do site) agora serve /home
app.get('/', (req, res) => {
    const filePath = path.join(projectRoot, 'pages', 'inicial', 'home.html'); // ALTERADO AQUI
    console.log(`DEBUG: Tentando servir / (raiz) de: ${filePath}`);
    res.sendFile(filePath);
});

// Rota amigável para a página de login
app.get(/^\/login\/?$/, (req, res) => {
    const filePath = path.join(projectRoot, 'pages', 'login', 'login.html');
    console.log(`DEBUG: Tentando servir /login de: ${filePath}`);
    res.sendFile(filePath);
});

// Rota amigável para a página do formulário
app.get(/^\/formulario\/?$/, (req, res) => {
    const filePath = path.join(projectRoot, 'pages', 'formulario', 'preencher.html');
    console.log(`DEBUG: Tentando servir /formulario de: ${filePath}`);
    res.sendFile(filePath);
});

// Rota amigável para a página de visualização (frontend lida com redirect)
app.get(/^\/visualizar\/?$/, (req, res) => { // Removido isAuthenticated daqui.
    const filePath = path.join(projectRoot, 'pages', 'visualizar', 'index.html');
    console.log(`DEBUG: Tentando servir /visualizar. (Proteção via JS no HTML)`);
    res.sendFile(filePath);
});

// Rota amigável para a página HOME (Esta já existia e servia home.html)
app.get(/^\/home\/?$/, (req, res) => {
    const filePath = path.join(projectRoot, 'pages', 'inicial', 'home.html');
    console.log(`DEBUG: Tentando servir /home de: ${filePath}`);
    res.sendFile(filePath);
});

// --- ROTA PARA O DASHBOARD (PROTEGIDA!) ---
// Autenticação é feita pelo middleware isAuthenticated
app.get(/^\/dashboard\/?$/, isAuthenticated, (req, res) => {
    const filePath = path.join(projectRoot, 'pages', 'dashboard', 'index.html');
    console.log(`DEBUG: Tentando servir /dashboard para usuário logado: ${req.user.username}`);
    res.sendFile(filePath);
});

// --- ROTA PARA GERENCIAMENTO ADMIN (PROTEGIDA!) ---
app.get(/^\/admin\/users\/?$/, isAuthenticated, isAdmin, (req, res) => {
    const filePath = path.join(projectRoot, 'pages', 'admin', 'user_management.html');
    console.log(`DEBUG: Tentando servir /admin/users para admin: ${req.user.username}`);
    res.sendFile(filePath);
});

// --- 3. Servir arquivos estáticos (CSS, JS, Imagens) ---
app.use(express.static(path.join(projectRoot, 'pages')));


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Páginas disponíveis:`);
    console.log(`- Raiz (Home): http://localhost:${PORT}/`); // ALTERADO NA MENSAGEM
    console.log(`- Formulário: http://localhost:${PORT}/formulario`);
    console.log(`- Visualizar (Protegida no Frontend): http://localhost:${PORT}/visualizar`);
    console.log(`- Login: http://localhost:${PORT}/login`);
    console.log(`- Home: http://localhost:${PORT}/home`);
    console.log(`- Dashboard (PROTEGIDO no Backend): http://localhost:${PORT}/dashboard`);
    console.log(`- Gerenciamento Admin (PROTEGIDO no Backend): http://localhost:${PORT}/admin/users`);
});