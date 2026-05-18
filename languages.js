const languages = {
    language: '',
    pt: {
        lang: 'pt-BR',
        title: 'Caderno de Tarefas',
        notebook: {
            title: 'Caderno de Tarefas',
            controls: {
                archive: 'Arquivar',
                closed: 'Fechar Caderno',
                open: 'Abrir Caderno',
                next: 'Ir para próxima página >>',
                prev: '<< Voltar para página anterior'
            }
        },
    },
    es: {
        lang: 'es-ES',
        title: 'Cuaderno de Tareas',
        notebook: {
            title: 'Cuaderno de Tareas',
            controls: {
                archive: 'Cerrar',
                closed: 'Cerrar Cuaderno',
                open: 'Abrir Cuaderno',
                next: 'Ir a la siguiente página >>',
                prev: '<< Volver a la página anterior'
            }
        },
    },
    en: {
        lang: 'en-US',
        title: 'Task Notebook',
        notebook: {
            title: 'Task Notebook',
            controls: {
                archive: 'Archive',
                closed: 'Close Notebook',
                open: 'Open Notebook',
                next: 'Next page',
                prev: 'Previous page'
            }
        },
    },
    it: {
        lang: 'it-IT',
        title: 'Taccuino delle attività',
        notebook: {
            title: 'Taccuino delle attività',
            controls: {
                archive: 'Archivia',
                closed: 'Chiudi taccuino',
                open: 'Apri taccuino',
                next: 'Pagina successiva >>',
                prev: '<< Pagina precedente'
            }
        }
    },
    fr: {
        lang: 'fr-FR',
        title: 'Carnet de tâches',
        notebook: {
            title: 'Carnet de tâches',
            controls: {
                archive: 'Archiver',
                closed: 'Fermer le carnet',
                open: 'Ouvrir le carnet',
                next: 'Page suivante >>',
                prev: '<< Page précédente'
            }
        }
    }
};

// Função para alterar a linguagem e atualizar o conteúdo da página
function setLanguage(language) {
    if (!language) return;
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