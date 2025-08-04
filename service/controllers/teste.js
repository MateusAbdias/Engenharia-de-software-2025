// src/service/controllers/hash_generator.js

const bcrypt = require('bcrypt');

async function generateHash() {
    // --- ESCOLHA UMA SENHA SIMPLES E FÁCIL DE LEMBRAR PARA TESTE ---
    const passwordToHash = '0205'; // <--- **ALTO FOCO AQUI: DEFINA SUA NOVA SENHA AQUI**
    const usernameToUse = 'alison'; // <--- **ALTO FOCO AQUI: DEFINA O NOME DE USUÁRIO PARA ESTE TESTE**

    console.log(`Gerando hash para o usuário: "${usernameToUse}" com a senha: "${passwordToHash}"`);

    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    console.log(`{`);
    console.log(`  "id": 2,`); // Use um ID diferente se 1 já estiver ocupado pelo superadmin
    console.log(`  "username": "${usernameToUse}",`);
    console.log(`  "password": "${hashedPassword}",`);
    console.log(`  "role": "admin"`); // Defina a role como 'admin' para que ele possa usar a tela de admin
    console.log(`}`);
    console.log('-------------------------------------\n');
}

generateHash();