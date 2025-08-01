console.log('Script.js foi carregado.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM totalmente carregado. Tentando encontrar o formulário.');
    const form = document.getElementById('formulario-fonar');
    
    if (form) {
        console.log('Formulário encontrado! Adicionando o listener de submit.');

        form.addEventListener('submit', async (event) => {
            console.log('Evento de submit capturado.');
            
            event.preventDefault();
            console.log('event.preventDefault() chamado. O formulário deve ter sido bloqueado.');

            const errorFields = form.querySelectorAll('.required-field-error, .required-group-error');
            errorFields.forEach(field => {
                field.classList.remove('required-field-error');
                field.classList.remove('required-group-error');
            });

            const requiredFields = form.querySelectorAll('[required]');
            let formIsValid = true;
            const validatedRadioGroups = new Set();

            requiredFields.forEach(field => {
                if (field.type === 'text' || field.type === 'date' || field.type === 'textarea') {
                    if (!field.value.trim()) {
                        formIsValid = false;
                        field.classList.add('required-field-error');
                    }
                } else if (field.type === 'radio') {
                    const groupName = field.getAttribute('name');
                    if (!validatedRadioGroups.has(groupName)) {

                        const radioGroup = form.querySelector(`input[name="${groupName}"]:checked`);
                        if (!radioGroup) {
                            formIsValid = false;

                            const questionGroup = field.closest('.question-group');
                            if (questionGroup) {
                                questionGroup.classList.add('required-group-error');
                            }
                        }
                        validatedRadioGroups.add(groupName);
                    }
                }
            });

            if (!formIsValid) {
                alert('Por favor, preencha todos os campos obrigatórios e responda a todas as perguntas.');
                console.log('Validação falhou. Retornando para impedir o envio.');
                return;
            }

            console.log('Validação bem-sucedida. Preparando para enviar o formulário.');
            
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                if (key.endsWith('[]')) {
                    const existingValue = data[key] || [];
                    existingValue.push(value);
                    data[key] = existingValue;
                } else {
                    data[key] = value;
                }
            }

            try {
                console.log('Iniciando a requisição fetch...');
                const response = await fetch('/salvar-formulario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    console.log('Requisição bem-sucedida.');
                    alert('Formulário enviado com sucesso!');
                    window.location.reload();
                } else {
                    console.log('Erro na resposta do servidor.');
                    const errorData = await response.json();
                    alert(`Erro do servidor: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro. Verifique sua conexão e tente novamente.');
            }
        });
    } else {
        console.error('Erro: Formulário com ID "formulario-fonar" não foi encontrado no DOM.');
    }
});