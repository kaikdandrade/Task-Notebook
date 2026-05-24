const DICTIONARY = {
    languages: {
        en: { // Inglês
            lang: 'en-US',
            description: 'Transform your productivity with our 3D Task Notebook! Organize your ideas, archive projects, and achieve your goals through an amazing visual experience.', // 156 caracteres
            title: 'Task Notebook v{version}',
            controls: {
                newPage: 'Add Page..',
                newTask: 'Add Task..',
                archive: 'Archive',
                closed: 'Close Notebook',
                open: 'Open Notebook',
                next: 'Next page',
                prev: 'Previous page'
            },
            copyright: '© {nowYear} Task Notebook. All rights reserved. v{version}'
        },
        pt: { // Português
            lang: 'pt-BR',
            description: 'Transforme sua produtividade com nosso Caderno de Tarefas 3D! Organize ideias, arquive projetos e alcance seus objetivos com uma experiência visual incrível.', // 159 caracteres
            title: 'Caderno de Tarefas v{version}',
            controls: {
                newPage: 'Adicionar página..',
                newTask: 'Adicionar tarefa..',
                archive: 'Arquivar',
                closed: 'Fechar Caderno',
                open: 'Abrir Caderno',
                next: 'Próxima página',
                prev: 'Página anterior'
            },
            copyright: '© {date} Caderno de Tarefas. Todos os direitos reservados. v{version}'
        },
        es: { // Espanhol
            lang: 'es-ES',
            description: '¡Transforma tu productividad con nuestro Cuaderno de Tareas 3D! Organiza ideas, archiva proyectos y alcanza tus metas con una increíble experiencia visual.', // 157 caracteres
            title: 'Cuaderno de Tareas v{version}',
            controls: {
                newPage: 'Agregar Página..',
                newTask: 'Agregar Tarea..',
                archive: 'Archivar',
                closed: 'Cerrar Cuaderno',
                open: 'Abrir Cuaderno',
                next: 'Página siguiente',
                prev: 'Página anterior'
            },
            copyright: '© {nowYear} Cuaderno de Tareas. Todos los derechos reservados. v{version}'
        },
        fr: { // Francês
            lang: 'fr-FR',
            description: 'Transformez votre productivité avec notre Cahier de Tâches 3D ! Organisez vos idées, archivez des projets et atteignez vos objectifs avec une vue incroyable.', // 159 caracteres
            title: 'Cahier de Tâches v{version}',
            controls: {
                newPage: 'Ajouter une page..',
                newTask: 'Ajouter une tâche..',
                archive: 'Archiver',
                closed: 'Fermer le cahier',
                open: 'Ouvrir le cahier',
                next: 'Page suivante',
                prev: 'Page précédente'
            },
            copyright: '© {nowYear} Cahier de Tâches. Tous droits réservés. v{version}'
        },
        it: { // Italiano
            lang: 'it-IT',
            description: 'Trasforma la tua produttività con il nostro Quaderno delle Attività 3D! Organizza le idee, archivia i progetti e raggiungi i tuoi obiettivi con stile unico.', // 158 caracteres
            title: 'Quaderno delle Attività v{version}',
            controls: {
                newPage: 'Aggiungi pagina..',
                newTask: 'Aggiungi attività..',
                archive: 'Archivia',
                closed: 'Chiudi Quaderno',
                open: 'Apri Quaderno',
                next: 'Pagina successiva',
                prev: 'Pagina precedente'
            },
            copyright: '© {nowYear} Quaderno delle Attività. Tutti i diritti riservati. v{version}'
        },
        de: { // Alemão
            lang: 'de-DE',
            description: 'Verwandeln Sie Ihre Produktivität mit unserem 3D-Aufgabenheft! Organisieren Sie Ideen, archivieren Sie Projekte und erreichen Sie Ihre Ziele visuell stark.', // 157 caracteres
            title: 'Aufgabenheft v{version}',
            controls: {
                newPage: 'Seite hinzufügen..',
                newTask: 'Aufgabe hinzufügen..',
                archive: 'Archivieren',
                closed: 'Heft schließen',
                open: 'Heft öffnen',
                next: 'Nächste Seite',
                prev: 'Vorherige Seite'
            },
            copyright: '© {nowYear} Aufgabenheft. Alle Rechte vorbehalten. v{version}'
        },
        ja: { // Japonês
            lang: 'ja-JP',
            description: '当社の画期的な3Dタスクノートで日々の生産性を劇的に向上させましょう！直感的で美しい視覚的体験を通じて、溢れるアイデアを整理し、過去のプロジェクトをアーカイブし、あなたの重要な目標達成を強力にサポートします。全く新しいタスク管理の世界を今すぐ体験し、あなたの仕事の効率を最大化してください。', // 145 caracteres (Ideal para o peso semântico do idioma)
            title: 'タスクノート v{version}',
            controls: {
                newPage: 'ページを追加..',
                newTask: 'タスクを追加..',
                archive: 'アーカイブ',
                closed: 'ノートを閉じる',
                open: 'ノートを開く',
                next: '次のページ',
                prev: '前のページ'
            },
            copyright: '© {nowYear} タスクノート. All rights reserved. v{version}'
        },
        zh: { // Chinês 
            lang: 'zh-CN',
            description: '准备好提升效率了吗？使用我们创新的3D任务笔记本，彻底改变您的生产力！通过直观且令人惊叹的视觉体验，轻松整理您的各种想法，安全归档重要项目，并强有力地支持您实现所有核心目标。立即体验这种全新的任务管理方式，告别日常混乱，让您的工作和生活变得更加高效、井井有条，随时激发无限创造力！', // 143 caracteres (Ideal para o peso semântico do idioma)
            title: '任务笔记本 v{version}',
            controls: {
                newPage: '添加页面..',
                newTask: '添加任务..',
                archive: '归档',
                closed: '关闭笔记本',
                open: '打开笔记本',
                next: '下一页',
                prev: '上一页'
            },
            copyright: '© {nowYear} 任务笔记本. All rights reserved. v{version}'
        },
        ru: { // Russo
            lang: 'ru-RU',
            description: 'Преобразите свою продуктивность с нашей 3D-тетрадью задач! Организуйте идеи, архивируйте проекты и достигайте целей с потрясающим визуальным опытом.', // 151 caracteres
            title: 'Тетрадь задач v{version}',
            controls: {
                newPage: 'Добавить страницу..',
                newTask: 'Добавить задачу..',
                archive: 'Архивировать',
                closed: 'Закрыть тетрадь',
                open: 'Открыть тетрадь',
                next: 'Следующая страница',
                prev: 'Предыдущая страница'
            },
            copyright: '© {nowYear} блокнот с задачами. All rights reserved v{version}.'
        }
    }
};

/** @type {LanguageController} */
const language = new LanguageController(DICTIONARY);

/** @type {HTMLElement[]|null} Referência aos botões de alterar idioma */
let buttonLangs = null;

// Chama a função de inicialização quando evento de carregamento da página é emitido 
document.addEventListener('DOMContentLoaded', initializeLanguageSystem, { once: true });

/**
 * Verifica qual idioma vai ser usado, define ele e atualiza as informações
 */
function initializeLanguageSystem() {
    // Resgata no localStorage idioma salvo, se não há padrão 'en' 
    const storageLang = localStorage.getItem('lang') ?? 'en';
    setLanguageAndStore(storageLang);

    // Captura todas os botões de alteração de idiomas no HTML
    buttonLangs = document.querySelectorAll('.button-lang');
    buttonLangs.forEach(el => el.addEventListener('click', toggleLanguage));

    // Atualiza o display inicial dos seletores
    updateLanguageSelectorDisplay();
}

/**
 * Atualiza o display de todos os botões de alterar idioma
 * Mostra o código do idioma ativo (ex: 'en-US', 'pt-BR')
 */
function updateLanguageSelectorDisplay() {
    if (buttonLangs) {
        buttonLangs.forEach(el => el.innerHTML = `<span class="icon">🌐</span>${language.getCurrentLanguageHTML()}`);
    }
}

/**
 * Alterna para o próximo idioma disponível e atualiza a interface e armazenamento local.
 * Cicla entre todos os idiomas registrados, voltando ao primeiro após o último.
 */
function toggleLanguage() {
    const currentStorageLang = localStorage.getItem('lang') ?? 'en';
    const availableLanguages = language.getLanguages();

    // Descobre o índice do idioma atual no array
    const currentIndex = availableLanguages.indexOf(currentStorageLang);

    // Calcula o próximo índice. O operador '%' garante que se for o último idioma, ele volte pro primeiro (índice 0)
    const nextIndex = (currentIndex + 1) % availableLanguages.length;

    // Atualiza o display dos botões de idioma e o idioma ativo salva-o no localStorage
    const newLang = availableLanguages[nextIndex];
    setLanguageAndStore(newLang);
}

/**
 * Define o idioma ativo, recarrega as traduções da interface e salva no localStorage
 * Atualiza o display dos botões de alterar idioma. 
 * Se o idioma solicitado não existir, o controlador automaticamente usa o idioma padrão 'en' 
 * @param {string} lang - Código do idioma (ex: 'pt', 'en', 'es', 'fr')
 */
function setLanguageAndStore(lang) {
    if (language.isValidLanguage(lang)) {
        language.setLanguage(lang);
        localStorage.setItem('lang', lang);
        updateLanguageSelectorDisplay();
    }
}

/**
 * Recarrega/atualiza a página com os dados das traduções
 */
function reloadLanguage() {
    language.setLanguage(localStorage.getItem('lang') ?? 'en');
}