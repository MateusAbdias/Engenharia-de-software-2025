// src/service/routes/formRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises; // Use fs.promises para consistência assíncrona

// Importa os middlewares de autenticação
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

module.exports = (projectRoot) => {
    
    // Rota para salvar um novo formulário (POST)
    // Se você quiser que APENAS usuários logados possam salvar formulários, descomente 'isAuthenticated,'
    router.post('/salvar-formulario', (req, res) => { // Removi o comentário aqui
    // router.post('/salvar-formulario', isAuthenticated, (req, res) => { // Assim se quiser proteger
        const formData = req.body;
        const filePath = path.join(projectRoot, 'service', 'data', 'formularios.json');

        const newForm = {
            ...formData,
            id: `FORM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            timestamp: new Date().toISOString()
        };

        fs.readFile(filePath, 'utf8')
            .then(data => JSON.parse(data))
            .catch(err => {
                if (err.code === 'ENOENT') return [];
                throw err;
            })
            .then(forms => {
                forms.push(newForm);
                return fs.writeFile(filePath, JSON.stringify(forms, null, 2), 'utf8');
            })
            .then(() => {
                res.status(200).json({ message: "Formulário salvo com sucesso!", id: newForm.id });
            })
            .catch(error => {
                console.error("Erro ao processar formulário:", error);
                res.status(500).json({ message: "Erro ao salvar o formulário." });
            });
    });

    // Rota para obter a lista de formulários registrados (GET)
    // Protegida com isAuthenticated
    router.get('/formularios-registrados', isAuthenticated, async (req, res) => {
        const filePath = path.join(projectRoot, 'service', 'data', 'formularios.json');

        try {
            let forms = await fs.readFile(filePath, 'utf8')
                                .then(data => JSON.parse(data))
                                .catch(err => {
                                    if (err.code === 'ENOENT') return [];
                                    throw err;
                                });

            const search = req.query.search;
            if (search) {
                const searchTerm = search.toLowerCase();
                forms = forms.filter(form => 
                    (form.nome_vitima && form.nome_vitima.toLowerCase().includes(searchTerm)) ||
                    (form.nome_agressor && form.nome_agressor.toLowerCase().includes(searchTerm)) ||
                    (form.delegacia && form.delegacia.toLowerCase().includes(searchTerm)) ||
                    (form.id && form.id.toLowerCase().includes(searchTerm))
                );
            }

            const sort = req.query.sort;
            if (sort) {
                forms.sort((a, b) => {
                    const [key, order] = sort.split('_');

                    let valA = a[key] || '';
                    let valB = b[key] || '';

                    if (key === 'data') {
                        valA = new Date(a.timestamp);
                        valB = new Date(b.timestamp);
                    } else {
                        valA = String(valA).toLowerCase();
                        valB = String(valB).toLowerCase();
                    }

                    if (valA < valB) return order === 'asc' ? -1 : 1;
                    if (valA > valB) return order === 'asc' ? 1 : -1;
                    return 0;
                });
            }
            
            res.status(200).json(forms);
        } catch (error) {
            console.error("Erro ao carregar os formulários:", error);
            res.status(500).json({ error: "Erro ao carregar os dados dos formulários." });
        }
    });

    // Rota para buscar um formulário por ID
    // Protegida com isAuthenticated
    router.get('/formularios/:id', isAuthenticated, async (req, res) => {
        const formId = req.params.id;
        const filePath = path.join(projectRoot, 'service', 'data', 'formularios.json');

        try {
            const forms = await fs.readFile(filePath, 'utf8')
                                .then(data => JSON.parse(data))
                                .catch(err => {
                                    if (err.code === 'ENOENT') return [];
                                    throw err;
                                });

            const form = forms.find(f => f.id === formId);

            if (form) {
                res.status(200).json(form);
            } else {
                res.status(404).json({ error: "Formulário não encontrado." });
            }
        } catch (error) {
            console.error("Erro ao ler o arquivo formularios.json:", error);
            res.status(500).json({ error: "Erro ao carregar os dados do formulário." });
        }
    });

    return router;
};