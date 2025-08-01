const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'formularios.json');

const generateManualId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let result = '';

    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    for (let i = 0; i < 3; i++) {
        result += nums.charAt(Math.floor(Math.random() * nums.length));
    }

    return result;
};

const lerForms = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        if (data.trim() === '') {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return [];
        }
        console.error("Erro ao ler o arquivo de formulários:", error);
        return [];
    }
};

const escreverForms = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Erro ao escrever no arquivo de formulários:", error);
    }
};

exports.salvarFormulario = (req, res) => {
    const novoForm = req.body;
    const newId = generateManualId();
    novoForm.id = newId;

    const now = new Date();
    novoForm.timestamp = now.toISOString();

    const formsExistentes = lerForms();
    formsExistentes.push(novoForm);

    escreverForms(formsExistentes);
    res.status(200).send();
};

exports.getFormularios = (req, res) => {
    const { sort, search } = req.query; 
    let formularios = lerForms();

    // FILTRAR
    if (search) {
        const searchTerm = search.toLowerCase();
        formularios = formularios.filter(form => {
            const vitima = (form.nome_vitima || '').toLowerCase();
            const agressor = (form.nome_agressor || '').toLowerCase();
            const delegacia = (form.delegacia || '').toLowerCase();
            const id = (form.id || '').toLowerCase();
            
            return vitima.includes(searchTerm) || 
                   agressor.includes(searchTerm) || 
                   delegacia.includes(searchTerm) ||
                   id.includes(searchTerm);
        });
    }


    if (sort) {
        formularios.sort((a, b) => {
            switch (sort) {
                case 'data_asc':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'data_desc':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'vitima_asc':
                    return (a.nome_vitima || '').localeCompare(b.nome_vitima || '');
                case 'delegacia_asc':
                    return (a.delegacia || '').localeCompare(b.delegacia || '');
                case 'agressor_asc':
                    return (a.nome_agressor || '').localeCompare(b.nome_agressor || '');
                default:
                    return 0;
            }
        });
    }

    res.status(200).json(formularios);
};