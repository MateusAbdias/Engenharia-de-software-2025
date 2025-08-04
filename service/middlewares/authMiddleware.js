// src/service/middlewares/authMiddleware.js

const path = require('path');

function isAuthenticated(req, res, next) {
    let token = null;

    // 1. Tenta pegar do cabeçalho Authorization (padrão para requisições fetch de API)
    if (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ')) {
        token = req.headers['authorization'].split(' ')[1];
    } 
    // 2. Se não está no header, tenta do query parameter (para redirecionamentos de página)
    else if (req.query.token) {
        token = req.query.token;
    }
    // 3. Em último caso (e menos ideal para segurança em GETs de página), tentar do corpo (POSTs)
    // else if (req.body.token) { // Geralmente para POSTs
    //    token = req.body.token;
    // }

    // No caso de requisições de página GET, o token só virá via req.query.token (se a URL tiver)
    // Ou será undefined se a URL foi digitada direto sem o token.
    // A VERIFICAÇÃO DO LOCALSTORAGE DEVE SER FEITA NO FRONTEND PARA REDIRECIONAR.

    if (token) {
        try {
            const user = JSON.parse(token); // Para esta demo, o token é o objeto user JSON stringificado
            req.user = user; // Anexa as informações do usuário à requisição
            next(); // Prossegue
        } catch (e) {
            console.error('Erro ao parsear/verificar token de autenticação no backend:', e);
            // Se o token é inválido no backend, força redirecionamento para login
            return res.redirect('/login'); 
        }
    } else {
        // Se não há token válido no header ou query param (backend não recebeu)
        // Então, o frontend deve lidar com isso redirecionando se não tiver o token no localStorage.
        // Se o backend chegou aqui, é porque não recebeu o token válido.
        return res.redirect('/login'); 
    }
}

function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Necessita privilégios de administrador.' });
    }
}

module.exports = {
    isAuthenticated,
    isAdmin
};