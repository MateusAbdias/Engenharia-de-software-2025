const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const serviceDir = __dirname;
const projectRoot = path.join(serviceDir, '..'); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const formRoutes = require('./routes/formRoutes')(projectRoot);
app.use(formRoutes);

const formularioPath = path.join(projectRoot, 'pages', 'formulario');
app.use(express.static(formularioPath));

const visualizarPath = path.join(projectRoot, 'pages', 'visualizar');
app.use('/visualizar', express.static(visualizarPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(formularioPath, 'preencher.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});