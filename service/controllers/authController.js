// src/service/controllers/authController.js
console.log("----- authController.js carregado: " + new Date().toLocaleString() + " -----");
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const path = require('path');

// Caminho para o arquivo de dados dos usuários, relativo à pasta 'data'
const usersFilePath = path.resolve(__dirname, '..', 'data', 'users.json');

// --- NOVO: Limpar cache de require (medida extrema de depuração) ---
delete require.cache[require.resolve(usersFilePath)]; 
// --- FIM DO NOVO ---

// Função para ler todos os usuários do arquivo JSON
async function readUsers() {
    try {
        console.log(`DEBUG (readUsers): Tentando ler o arquivo: ${usersFilePath}`);
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data);
        console.log("DEBUG (readUsers): Conteúdo lido do users.json:", users);
        return users;
    } catch (error) {
        if (error.code === 'ENOENT' || error.name === 'SyntaxError') {
            console.warn("AVISO: users.json não encontrado ou vazio/corrompido. Retornando array vazio.");
            return [];
        }
        throw error;
    }
}

// Função para escrever usuários no arquivo JSON
async function writeUsers(users) {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// Lógica de Registro (mantida, mas não será usada publicamente)
async function register(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        const users = await readUsers();
        if (users.find(user => user.username === username)) {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            password: hashedPassword,
            role: 'user'
        };

        users.push(newUser);
        await writeUsers(users);

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro no registro do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar.' });
    }
}

// Lógica de Login
async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        const users = await readUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }

        console.log("DEBUG (Login): Usuário lido do JSON antes do processamento:", user); // Log
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const userInfo = {
                id: user.id,
                username: user.username,
                role: user.role || 'user'
            };
            console.log("DEBUG (authController.login): Objeto userInfo FINAL antes de enviar para o frontend:", userInfo); // Log
            res.status(200).json({ message: 'Login bem-sucedido!', user: userInfo });
        } else {
            res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro no login do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// Lógica para criar usuário por um Admin
async function createUserByAdmin(req, res) {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        const users = await readUsers();
        if (users.find(user => user.username === username)) {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            password: hashedPassword,
            role: role || 'user'
        };

        users.push(newUser);
        await writeUsers(users);

        res.status(201).json({ message: 'Usuário criado com sucesso por admin!', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (error) {
        console.error('Erro ao criar usuário por admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar usuário.' });
    }
}

module.exports = {
    register,
    login,
    createUserByAdmin
};