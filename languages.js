const languages = {
    pt: {
        lang: 'pt',
        title: 'Caderno de Tarefas',
        notebook: {
            title: {
                start: 'Caderno de Tarefas',
                end: 'Caderno de Tarefas'
            }
        },
        controls: {
            btn: {
                open: 'Abrir Caderno',
                prev: 'Anterior',
                next: 'Próximo'
            }
        }
    },
    es: {
        lang: 'es',
        title: 'Cuaderno de Tareas',
        notebook: {
            title: {
                start: 'Cuaderno de Tareas',
                end: 'Cuaderno de Tareas'
            }
        },
        controls: {
            btn: {
                open: 'Abrir Cuaderno',
                prev: 'Anterior',
                next: 'Siguiente'
            }
        }
    },
    en: {
        lang: 'en',
        title: 'Task Notebook',
        notebook: {
            title: {
                start: 'Task Notebook',
                end: 'Task Notebook'
            }
        },
        controls: {
            btn: {
                open: 'Open Notebook',
                prev: 'Previous',
                next: 'Next'
            }
        }
    },
};

function setLanguage(language) {
    let elements = document.querySelectorAll('[data-lang]');
    let html = document.getElementsByTagName('html')[0];
    html.lang = languages[language].lang || 'en'

    elements.forEach((el) => {
        let dataset = el.dataset.lang.split('/');
        let text = languages[language] || '';

        if (dataset.length < 2) text = text?.[dataset[0]];
        else {
            for (let i = 0; i < dataset.length; i++) text = text?.[dataset[i]];
        }
        el.innerHTML = text ? text : 'LanguageError';
    });
}

setLanguage('en');