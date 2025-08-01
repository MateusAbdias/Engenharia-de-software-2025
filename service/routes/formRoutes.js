const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = (projectRoot) => {
    
    // Rota para salvar um novo formulário (POST)
    router.post('/salvar-formulario', (req, res) => {
        const formData = req.body;
        const filePath = path.join(projectRoot, 'service', 'data', 'formularios.json');

        // Adiciona um ID único e um timestamp
        const newForm = {
            ...formData,
            id: `FORM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            timestamp: new Date().toISOString()
        };

        fs.readFile(filePath, 'utf8', (err, data) => {
            let forms = [];
            if (err) {
                if (err.code === 'ENOENT') {
                    // Se o arquivo não existe, começa com um array vazio
                    forms = [];
                } else {
                    console.error("Erro ao ler o arquivo formularios.json:", err);
                    return res.status(500).json({ message: "Erro ao salvar o formulário." });
                }
            } else {
                try {
                    forms = JSON.parse(data);
                } catch (parseError) {
                    console.error("Erro ao fazer o parse do JSON:", parseError);
                    return res.status(500).json({ message: "Erro: arquivo de dados corrompido." });
                }
            }
            
            forms.push(newForm);

            fs.writeFile(filePath, JSON.stringify(forms, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("Erro ao escrever no arquivo formularios.json:", writeErr);
                    return res.status(500).json({ message: "Erro ao salvar o formulário." });
                }
                res.status(200).json({ message: "Formulário salvo com sucesso!", id: newForm.id });
            });
        });
    });

    // Rota para obter a lista de formulários registrados (GET)
    router.get('/formularios-registrados', (req, res) => {
        const filePath = path.join(projectRoot, 'service', 'data', 'formularios.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // Se o arquivo não existe, retorna um array vazio
                    return res.status(200).json([]);
                }
                console.error("Erro ao ler o arquivo formularios.json:", err);
                return res.status(500).json({ error: "Erro ao carregar os dados dos formulários." });
            }
            
            let forms = [];
            try {
                forms = JSON.parse(data);
            } catch (parseError) {
                console.error("Erro ao fazer o parse do JSON:", parseError);
                return res.status(500).json({ error: "Erro: o arquivo de dados está corrompido." });
            }

            // Lógica de filtragem (busca)
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

            // Lógica de ordenação
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
        });
    });

    // NOVA ROTA para buscar um formulário por ID
    router.get('/formularios/:id', (req, res) => {
        const formId = req.params.id;
        const filePath = path.join(projectRoot, 'service', 'data', 'formularios.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Erro ao ler o arquivo formularios.json:", err);
                return res.status(500).json({ error: "Erro ao carregar os dados do formulário." });
            }

            let forms = [];
            try {
                forms = JSON.parse(data);
            } catch (parseError) {
                console.error("Erro ao fazer o parse do JSON:", parseError);
                return res.status(500).json({ error: "Erro: o arquivo de dados está corrompido." });
            }

            const form = forms.find(f => f.id === formId);

            if (form) {
                res.status(200).json(form);
            } else {
                res.status(404).json({ error: "Formulário não encontrado." });
            }
        });
    });

    return router;
};