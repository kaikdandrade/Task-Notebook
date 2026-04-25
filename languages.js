const languages = {
    language: '',
    pt: {
        lang: 'pt',
        title: 'Caderno de Tarefas',
        notebook: {
            title: {
                start: 'Caderno de Tarefas',
                end: 'Caderno de Tarefas'
            },
            controls: {
                btn: {
                    finally: 'Fechar Caderno',
                    toggle: 'Abrir Caderno',
                    next: 'Ir para próxima página >>',
                    prev: '<< Voltar para página anterior'
                }
            }
        },
    },
    es: {
        lang: 'es',
        title: 'Cuaderno de Tareas',
        notebook: {
            title: {
                start: 'Cuaderno de Tareas',
                end: 'Cuaderno de Tareas'
            },
            controls: {
                btn: {
                    finally: 'Cerrar Cuaderno',
                    toggle: 'Abrir Cuaderno',
                    next: 'Ir a la siguiente página >>',
                    prev: '<< Volver a la página anterior'
                }
            }
        },
    },
    en: {
        lang: 'en',
        title: 'Task Notebook',
        notebook: {
            title: {
                start: 'Task Notebook',
                end: 'Task Notebook'
            },
            controls: {
                btn: {
                    finally: 'Close Notebook',
                    toggle: 'Open Notebook',
                    next: 'Go to next page >>',
                    prev: '<< Go to previous page'
                }
            }
        },
    },
};

// Função para alterar a linguagem e atualizar o conteúdo da página
function setLanguage(language) {
    const html = document.documentElement;
    html.setAttribute('lang', languages[language].lang || 'en');
    languages.language = language;
    loadLanguage();
}

// Função para carregar o conteúdo da linguagem atual na página
function loadLanguage() {
    let elements = document.querySelectorAll('[data-lang]');
    elements.forEach((el) => {
        let dataset = el.dataset.lang.split('/');
        let text = languages[getLanguage()] || '';

        if (text)
            if (dataset.length < 2) text = text?.[dataset[0]];
            else
                for (let i = 0; i < dataset.length; i++) text = text?.[dataset[i]];

        if (!text) text = 'LanguageError';
        el.innerHTML = text;
    });
}

// Função para obter a linguagem atual
function getLanguage() {
    return languages.language;
}

// Função para obter o texto de uma chave de linguagem específica
function getTextLanguage(pathLang) {
    let dataLang = languages[getLanguage()];
    let path = pathLang.split('/');
    let text = '';

    if (path.length > 1) 
        for (let i = 0; i < path.length; i++)
            dataLang = dataLang?.[path[i]];
    else text = dataLang?.[path[0]];

    return (dataLang) ? dataLang : (text) ? text : 'LanguageError';
}