import { TaskNotebook } from './TaskNotebook.js';
import { LanguageController } from './LanguageController.js';
import { DICTIONARY } from './dictionary.js';

const metadata = { language: 'en', version: '1.6', debug: true, author: "Kaik D' Andrade", authorUrl: 'https://github.com/kaikdandrade' };
const taskNote = new TaskNotebook();
const languageController = new LanguageController(DICTIONARY);

/**
 * @param {boolean} debug 
 */
function initialize(debug) {
    // Configura a linguagem do caderno de tarefas usando o controlador de linguagem
    languageController.setLanguage(metadata.language);

    // VERIFICAÇÃO CRÍTICA: O container principal do caderno existe no HTML?
    const notebookContainer = document.querySelector('.notebook');
    if (!notebookContainer)
        throw new Error(`Initialize Error: The 'notebook container' not found in HTML.`);

    // Dicionário de elementos internos obrigatórios, usando id dos elementos do HTML
    const requiredElements = {
        pageLeft: '#page-left',
        pageRight: '#page-right',
        sheetLeft: '#sheet-left',
        sheetRight: '#sheet-right',
        animFront: '#anim-front',
        animBack: '#anim-back',
        animated: '#animated'
    };

    taskNote.dom.notebook = notebookContainer;
    taskNote.setTasksPerPage(18); // Configura a quantidade de tarefas por página.
    let domErrors = false;

    // VERIFICAÇÃO CRÍTICA: Os elementos internos existem?
    for (const [key, id] of Object.entries(requiredElements)) {
        const el = notebookContainer.querySelector(id);
        if (!el) {
            console.error(`Initialize Error: The inner element '${id}' is required, but it was not found in the HTML.`);
            domErrors = true;
            break;
        }
        taskNote.dom[key] = el;
    }

    // Se faltar qualquer elemento no HTML, abortar!
    if (domErrors)
        throw new Error('Initialize Error: Initialization aborted, incomplete HTML structure.');

    // Chama Handleinteraction ao clicar em qualquer um dos botões de navegação.
    notebookContainer.querySelectorAll('.nav').forEach(btn => {
        btn.addEventListener('click', function () {
            handleBookInteraction(this);
        });
    });

    notebookContainer.querySelectorAll('.line.title .archive').forEach(btn => {
        btn.addEventListener('click', function () {
            archivePage(this);
        });
    });

    notebookContainer.querySelectorAll('.line.task .archive').forEach(btn => {
        btn.addEventListener('click', function () {
            archiveTask(this);
        });
    });

    notebookContainer.querySelector('.selector-lang').addEventListener('click', function () {
        const availableLanguages = LanguageController.getAllLanguages();

        // Descobre o índice do idioma atual no array
        const currentIndex = availableLanguages.indexOf(metadata.language);

        // Calcula o próximo índice. O operador '%' garante que se for o último idioma, ele volte pro primeiro (índice 0)
        const nextIndex = (currentIndex + 1) % availableLanguages.length;

        // Atualiza os metadados e avisa o controlador para mudar o texto das tarefas/títulos
        metadata.language = availableLanguages[nextIndex];
        languageController.setLanguage(metadata.language);
        this.innerHTML = `<span class="icon">🌐</span> ${metadata.language}`;
    });

    // Se não estiver em debug o caderno começa fechado, senão começa aberto
    if (debug) {
        // Adiciona dados de exemplo
        for (let i = 1; i < 2; i++) {
            let page_id = taskNote.newPage(`Lorem ipsum dolor 0${i}!`);
            // console.log(page_id)
            if (page_id)
                for (let j = 1; j < Math.floor(Math.random() * (18 - 4 + 1)) + 4; j++)
                    taskNote.newTask(page_id, `Ipsum dolor ${i}.${j}`);
        }
        changeState('open_front');
    } else
        changeState('close_front');
}

/**
 * @param {object} data 
 */
function update(data = {}) {
    languageController.loadLanguage();

    const metadataElement = document.querySelectorAll('[data-metadata]');
    metadataElement.forEach(el => {
        const value = el.dataset.metadata;
        switch (value) {
            case 'title':
                if (el instanceof HTMLMetaElement)
                    el.setAttribute('content', languageController.getTextLanguage('title'));
                break;
            case 'version':
                el.innerHTML += ' v' + metadata.version;
                break;
            case 'author':
                if (el instanceof HTMLMetaElement) el.setAttribute('content', metadata.author);
                else el.innerHTML = metadata.author;
                break;
            case 'description':
                if (el instanceof HTMLMetaElement) el.setAttribute('content', languageController.getTextLanguage('description'));
                else el.innerHTML = languageController.getTextLanguage('description');
                break;
            default:
                break;
        }
    });
}

/**
 * Função para controlar a mudança de estado do caderno, manipulando as classes HTML e populando as páginas conforme necessário.
 * @param {TaskNotebook} note
 * @param {string} action: ['open_front', 'open_back', 'close_front', 'close_back']
 */
function changeState(action) {
    // Carrega a configuração da ação de mudança de estado, se ação for invalid emite um erro fatal.
    const config = taskNote.changeState(action);

    // Usando a configuração, realiza o controle das classes HTML para manipulação via CSS
    taskNote.dom[config.side].classList[config.method]('closed');
    taskNote.dom.notebook.classList[config.method](config.class);

    // Popula a página com as informações 
    populatePage(taskNote.dom.sheetLeft, taskNote.getPageIndex());
    populatePage(taskNote.dom.sheetRight, taskNote.getPageIndex() + 1);
}

/**
 * Popula a página com as informações, controlando e manipulando tudo no HTML minuciosamente.
 * @param {HTMLDivElement} sheet - O elemento HTML da página a ser populada, que pode ser a folha esquerda ou direita do caderno.
 * @param {int} index - O índice da página a ser populada.
 */
function populatePage(sheet, index) {
    // Se a página for template, isso significa que o usuário navegou para uma página nova que ainda não existe, 
    // então gera uma página template, onde o usuário pode adicionar um titulo e criar a página.
    if (taskNote.isTemplatePage(index)) {
        templatePage(sheet, index);
        return;
    }

    // Captura o container de conteúdo e faz uma limpeza antes de tudo
    const container = sheet.querySelector('.page-content');
    cleanPage(container);

    // Captura os dados da página vindos do banco de dados local
    const page = taskNote.getPageData(index);

    // Adiciona o número da página no elemento HTML
    const pageNum = container.querySelector('.page-number');
    if (pageNum) pageNum.innerHTML = index + 1;

    // Captura os elementos necessários para popular a página, como título e tarefas
    const pageTitle = container.querySelector('.line.title .page-title');
    const lineTasks = container.querySelectorAll('.line.task');
    const tasksName = container.querySelectorAll('.line.task .task-text');

    // Adiciona o título da página no elemento HTML,configura as funções e desativa as "ajudas" do navegador no elemento HTML
    pageTitle.innerHTML = page.title; // Adiciona o título da página
    pageTitle.spellcheck = false; // Remove as linhas vermelhas (PC e Mobile)
    pageTitle.setAttribute('autocorrect', 'off'); // Específico para Safari/iOS
    pageTitle.setAttribute('autocomplete', 'off'); // Evita sugestões de preenchimento

    pageTitle.addEventListener('dblclick', (e) => {
        e.preventDefault();
        pageTitle.contentEditable = "true";
        pageTitle.focus();

        // Abaixo usando range & selection, sempre que clicar para editar o ponteiro vai pro final da frase
        const range = document.createRange();
        const selecao = window.getSelection();
        range.selectNodeContents(pageTitle);
        range.collapse(false);
        selecao.removeAllRanges();
        selecao.addRange(range);
    });

    // O blur agora age de forma inteligente, seja disparado pelo mouse (clique fora) ou pelo Enter/Esc no keydown
    pageTitle.addEventListener('blur', (e) => {
        e.preventDefault();
        pageTitle.contentEditable = "false";

        // Se o texto for diferente e não for vazio, salva.
        // Se clicarem fora com o texto vazio, cai no 'else' e restaura o nome original.
        const titleText = pageTitle.innerHTML.trim();
        if (titleText !== page.title && titleText.length > 0) {
            page.title = titleText;
            taskNote.updatePageTitle(page.uuid, page.title);
        } else
            pageTitle.innerHTML = page.title;
    });

    pageTitle.addEventListener('keydown', (e) => {
        // Usar textContent é mais seguro que innerHTML para contar caracteres reais
        const textContent = pageTitle.textContent.trim();
        const len = textContent.length;

        if (e.key === 'Enter') {
            e.preventDefault(); // Sempre evita que o Enter crie uma quebra de linha visual (<br>)
            if (len > 0)
                pageTitle.blur(); // Se passou no requisito (maior que 0), aciona o blur para salvar e sair
            // Se len for 0, o código não faz NADA. A edição continua travada ali até digitar algo ou apertar Esc/clicar fora.

        } else if (e.key === 'Escape') {
            e.preventDefault();
            pageTitle.innerHTML = page.title; // Restaura o original imediatamente
            pageTitle.blur(); // Sai da edição (vai passar pelo blur, mas não salvará nada por cima)

        } else if (len >= 30) {
            // Lista de teclas que devem SEMPRE funcionar
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
            ];
            if (!allowedKeys.includes(e.key))
                e.preventDefault();
        }
    });

    // Captura os dados das tarefas destinadas a essa página.
    const tasksData = taskNote.getTasksData(page.uuid);
    const currentTaskCount = tasksData ? tasksData.length : 0;
    const maxTasksPerPage = taskNote.getTasksPerPage();
    let clickTimer = null;

    // Adiciona as tarefas no elemento HTML, configura as funções e desativa as "ajudas" do navegador no elemento HTML.
    if (currentTaskCount > 0) {
        tasksData.forEach((data, i) => {
            const taskName = tasksName[i];
            lineTasks[i].dataset.uuid = data.uuid; // Adiciona o uuid da tarefa no dataset do elemento HTML
            taskName.innerHTML = data.name; // Adiciona o nome da tarefa
            if (data.completed) taskName.classList.add('task-completed');

            // Desativa as "ajudas" do navegador
            taskName.spellcheck = false;
            taskName.setAttribute('autocorrect', 'off');
            taskName.setAttribute('autocomplete', 'off');

            taskName.addEventListener('dblclick', (e) => {
                e.preventDefault();
                clearTimeout(clickTimer);
                taskName.contentEditable = "true";
                taskName.focus();

                const range = document.createRange();
                const selecao = window.getSelection();
                range.selectNodeContents(taskName);
                range.collapse(false);
                selecao.removeAllRanges();
                selecao.addRange(range);
            });

            taskName.addEventListener('click', (e) => {
                if (e.detail === 1) {
                    clickTimer = setTimeout(() => {
                        e.preventDefault();
                        if (!taskName.contentEditable || taskName.contentEditable === "false") {
                            window.getSelection().removeAllRanges();
                            taskName.innerHTML = data.name;
                            data.completed = !data.completed;
                            taskName.classList[(data.completed) ? 'add' : 'remove']('task-completed');
                            taskNote.taskComplete(data.uuid, data.completed);
                        }
                    }, 250);
                }
            });

            // O blur agora age de forma inteligente, seja disparado pelo mouse (clique fora) ou pelo Enter no keydown
            taskName.addEventListener('blur', (e) => {
                e.preventDefault();
                taskName.contentEditable = "false";

                // Se o texto for diferente e não for vazio, salva.
                // Se clicarem fora com o texto vazio, ele cai no 'else' e restaura o nome original.
                const taskText = taskName.innerHTML.trim();
                if (taskText !== data.name && taskText.length > 0) {
                    data.name = taskText;
                    taskNote.updateTaskName(data.uuid, data.name);
                } else
                    taskName.innerHTML = data.name;
            });

            taskName.addEventListener('keydown', (e) => {
                const textContent = taskName.textContent.trim();
                const len = textContent.length;

                if (e.key === 'Enter') {
                    e.preventDefault(); // Sempre evita que o Enter crie uma quebra de linha visual (<br>)
                    if (len > 0)
                        taskName.blur(); // Se passou no requisito (maior que 0), aciona o blur para salvar e sair
                    // Se len for 0, o código não faz NADA. A edição continua travada ali até ele digitar ou apertar Esc/clicar fora.

                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    taskName.innerHTML = data.name; // Restaura o original imediatamente
                    taskName.blur(); // Sai da edição (vai passar pelo blur, mas como o texto agora é igual ao data.name, não salvará nada por cima)

                } else if (len >= 30) {
                    const allowedKeys = [
                        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
                    ];
                    if (!allowedKeys.includes(e.key))
                        e.preventDefault();
                }
            });
        });
    };

    let keydownTemplate = 0;
    if (currentTaskCount < maxTasksPerPage) {
        // Verifica se os elementos HTML da próxima linha realmente existem
        if (lineTasks[currentTaskCount] && tasksName[currentTaskCount]) {
            const templateTaskName = tasksName[currentTaskCount];
            const templateTaskLine = lineTasks[currentTaskCount];

            // Desativar botão de arquivar tarefa
            const archiveButton = templateTaskLine.querySelector('.archive');
            if (archiveButton) archiveButton.classList.add('disabled');

            // Configura o placeholfer visual
            const templateName = languageController.getTextLanguage('controls/newTask'); // Texto template para o nome da tarefa
            templateTaskName.innerHTML = templateName; // Texto template para o nome da tarefa
            templateTaskName.classList.add('task-template');

            // Tirar as "ajudas" do navegador do campo de nova tarefa
            templateTaskName.spellcheck = false; // Remove as linhas vermelhas (PC e Mobile)
            templateTaskName.setAttribute('autocorrect', 'off');
            templateTaskName.setAttribute('autocomplete', 'off'); // Evita sugestões de preenchimento

            templateTaskName.addEventListener('dblclick', (e) => {
                e.preventDefault();
                templateTaskName.contentEditable = "true";
                templateTaskName.innerHTML = ""; // Limpa o texto "+ Adicionar nova tarefa..." ao entrar no modo editável
                templateTaskName.focus();
            });
            templateTaskName.addEventListener('blur', (e) => {
                e.preventDefault();
                templateTaskName.contentEditable = "false";
                if (keydownTemplate === 'Enter') {
                    const newTaskName = templateTaskName.innerHTML.trim();
                    if (newTaskName !== '' && newTaskName.length > 0) { // Se o nome da tarefa foi alterado, salva a alteração, caso contrário, apenas sai do modo editável sem salvar
                        taskNote.newTask(page.uuid, newTaskName);
                        populatePage(sheet, index);
                    }
                } else
                    templateTaskName.innerHTML = templateName; // Se não for 'enter', cancela a edição e mantém o nome original
            });
            templateTaskName.addEventListener('keydown', (e) => {
                // Mantendo sua variável caso seja usada em outro lugar (recomendado usar e.key)
                keydownTemplate = e.key;

                // Usar textContent é mais seguro que innerHTML para contar caracteres reais
                const len = templateTaskName.textContent.trim().length;

                if (e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault();
                    templateTaskName.blur();
                } else if (len >= 30) {
                    // Lista de teclas que devem SEMPRE funcionar
                    const allowedKeys = [
                        'Backspace',
                        'Delete',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown'
                    ];
                    if (!allowedKeys.includes(e.key))
                        e.preventDefault();
                }
            });
        }
    }

    // Configura os botões de navegação, definindo a interação correta (prev, next ou closed) no dataset do botão para ser usada na função de handleBookInteraction, e também definindo o texto do tooltip do botão de acordo com a interação e a linguagem atual.
    const interaction = getNavInteraction(index, taskNote.getLastPageIndex());
    const lineNav = container.querySelector('.line .nav');
    lineNav.dataset.interaction = (interaction === "closed") ? (index % 2 === 0) ? 'prev' : 'next' : interaction; // Se a interação for 'closed', defina como 'prev' para páginas pares e 'next' para páginas ímpares, caso contrário, mantenha a interação original (prev ou next)
    lineNav.dataset.lang = `controls/${interaction}`;

    update();
}

/**
 * Função para gerar uma página template, que é uma página com os campos vazios e funções de adicionar título e tarefas, usada quando o usuário navega para um índice de página que ainda não existe.
 * @param {HTMLDivElement} sheet - O elemento HTML da página a ser gerada como template.
 * @param {int} index Índice da página a ser gerada como template.
 */
function templatePage(sheet, index) {
    // Captura o container de conteúdo e faz uma limpeza antes de tudo
    const container = sheet.querySelector('.page-content');
    cleanPage(container);
    container.classList.add('template');

    // Termina de capturar os elementos após a limpeza
    const pageNum = container.querySelector('.page-number');
    pageNum.innerHTML = index + 1;

    // Adiciona o template de título da página no elemento HTML, configura as funções e desativa as "ajudas" do navegador no elemento HTML
    const pageTitle = container.querySelector('.line.title .page-title');
    const templateTitle = languageController.getTextLanguage('controls/newPage'); // Texto template para o título da página
    pageTitle.innerHTML = templateTitle; // Texto template para o título da página
    pageTitle.spellcheck = false; // Remove as linhas vermelhas (PC e Mobile)
    pageTitle.setAttribute('autocorrect', 'off'); // Específico para Safari/iOS
    pageTitle.setAttribute('autocomplete', 'off'); // Evita sugestões de preenchimento

    pageTitle.addEventListener('dblclick', (e) => {
        e.preventDefault();
        pageTitle.contentEditable = "true";
        pageTitle.focus();

        // Abaixo usando range & selection, sempre que clicar para editar o ponteiro vai pro final da frase
        const range = document.createRange();
        const selecao = window.getSelection();
        range.selectNodeContents(pageTitle);
        range.collapse(false);
        selecao.removeAllRanges();
        selecao.addRange(range);
    });

    // O blur agora age de forma inteligente, seja disparado pelo mouse (clique fora) ou pelo Enter/Esc no keydown
    pageTitle.addEventListener('blur', (e) => {
        e.preventDefault();
        pageTitle.contentEditable = "false";

        const titleText = pageTitle.innerHTML.trim();

        // Se o texto for diferente e não for vazio, salva.
        // Se clicarem fora com o texto vazio, cai no 'else' e restaura o nome original.
        if (titleText !== page.title && titleText.length > 0) {
            page.title = titleText;
            taskNote.updatePageTitle(page.uuid, page.title);
        } else
            pageTitle.innerHTML = page.title;
    });

    pageTitle.addEventListener('keydown', (e) => {
        // Usar textContent é mais seguro que innerHTML para contar caracteres reais
        const textContent = pageTitle.textContent.trim();
        const len = textContent.length;

        if (e.key === 'Enter') {
            e.preventDefault(); // Sempre evita que o Enter crie uma quebra de linha visual (<br>)
            if (len > 0)
                pageTitle.blur(); // Se passou no requisito (maior que 0), aciona o blur para salvar e sair
            // Se len for 0, o código não faz NADA. A edição continua travada ali até digitar algo ou apertar Esc/clicar fora.

        } else if (e.key === 'Escape') {
            e.preventDefault();
            pageTitle.innerHTML = page.title; // Restaura o original imediatamente
            pageTitle.blur(); // Sai da edição (vai passar pelo blur, mas não salvará nada por cima)

        } else if (len >= 30) {
            // Lista de teclas que devem SEMPRE funcionar
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
            ];
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        }
    });

    // Configura os botões de navegação, definindo a interação correta (prev, next ou closed) no dataset do botão para ser usada na função de handleBookInteraction, e também definindo o texto do tooltip do botão de acordo com a interação e a linguagem atual.
    const interaction = getNavInteraction(index, taskNote.getLastPageIndex());
    const lineNav = container.querySelector('.line .nav');
    lineNav.dataset.interaction = (interaction === "closed") ? (index % 2 === 0) ? 'prev' : 'next' : interaction; // Se a interação for 'closed', defina como 'prev' para páginas pares e 'next' para páginas ímpares, caso contrário, mantenha a interação original (prev ou next)
    lineNav.dataset.lang = `controls/${interaction}`;

    update();
}

/**
 * Função para limpar os dados da página, removendo títulos, tarefas, botões e eventListeners antigos para evitar conflitos e bugs.
 * @param {HTMLDivElement} container - O container da página a ser limpa 
 */
function cleanPage(container) {
    if (!container || !(container instanceof HTMLElement)) return;

    container.classList.remove('template');

    const resetTextElement = (element) => {
        if (!element) return null;
        const clone = element.cloneNode(true);
        clone.innerHTML = '';
        clone.classList.remove('task-template', 'task-archived');
        clone.contentEditable = false;
        clone.removeAttribute('spellcheck');
        clone.removeAttribute('autocorrect');
        clone.removeAttribute('autocomplete');
        element.parentNode.replaceChild(clone, element);
        return clone;
    };

    resetTextElement(container.querySelector('.page-title'));

    const pageNum = container.querySelector('.page-number');
    if (pageNum) pageNum.innerHTML = '';

    const lineTasks = container.querySelectorAll('.line.task');
    lineTasks.forEach(line => {
        delete line.dataset.uuid;
        line.classList.remove('task-archived');

        const archiveButton = line.querySelector('.archive');
        if (archiveButton) archiveButton.classList.remove('disabled');
    });

    const tasksName = container.querySelectorAll('.line.task .task-text');
    tasksName.forEach(taskName => resetTextElement(taskName));

    const titlePage = container.querySelector('.line.title .page-title');
    if (titlePage) resetTextElement(titlePage);

    const lineNav = container.querySelector('.line .nav');
    if (lineNav) {
        lineNav.innerHTML = '';
        delete lineNav.dataset.interaction;
        delete lineNav.dataset.lang;
    }
}

/**
 * Função para determinar a interação de navegação (prev, next ou closed) com base no índice da página atual e o último índice de página.
 * @param {int} index Índice da página atual.
 * @param {int} lastIndex Último índice de página.
 * @returns {string} Retorna a interação de navegação.
 */
function getNavInteraction(index, lastIndex) {
    const pageCount = taskNote.getPageCount();
    let interaction = '';
    if (index % 2 === 0)
        if (index === 0)
            interaction = 'closed';
        else interaction = 'prev';
    else
        if (index === lastIndex + 1) interaction = 'closed';
        else interaction = 'next';
    if (interaction === 'next' && pageCount === 0)
        interaction = 'closed';
    return interaction;
}

/**
 * Função para lidar com as interações de navegação do caderno, como abrir, fechar, ir para a próxima página ou voltar para a página anterior, dependendo do botão clicado e da interação definida no dataset do botão.
 * @param {HTMLButtonElement} el - O elemento do botão que foi clicado para acionar a interação. Deve conter um dataset com a propriedade 'interaction' definida como 'prev', 'next' para determinar a ação a ser tomada. 
 * @returns {void}
 */
function handleBookInteraction(el) {
    const interaction = el.dataset.interaction;
    if (!interaction) return;
    else if (interaction === 'prev') prevPage();
    else if (interaction === 'next') nextPage();
    else
        console.error(`HandleBookInteraction: Interação desconhecida: "${interaction}".`);
}

/**
 * Função para ir para a próxima página, controlando as classes HTML para manipular a animação de virar a página e populando as páginas conforme necessário.
 * @returns {void} 
 */
function nextPage() {
    let index = taskNote.getPageIndex();
    const lastIndex = taskNote.getLastPageIndex();
    const state = taskNote.getState();
    if (state === 'CLOSED_FRONT') {
        changeState('open_front');
        return;
    } else if (index === lastIndex) {
        changeState('close_back');
        return;
    }

    index += 2;
    taskNote.setIndex(index);
    populatePage(taskNote.dom.animFront, index - 1);
    populatePage(taskNote.dom.animBack, index);
    populatePage(taskNote.dom.sheetRight, index + 1);

    taskNote.dom.animated.style.display = 'block';
    void taskNote.dom.animated.offsetWidth;
    taskNote.dom.animated.classList.add('turn-next');

    taskNote.dom.animated.addEventListener('transitionend', () => {
        populatePage(taskNote.dom.sheetLeft, index);
        taskNote.dom.animated.style.display = 'none';
        taskNote.dom.animated.classList.remove('turn-next');
    }, { once: true });
}

/**
 * Função para voltar para a página anterior, controlando as classes HTML para manipular a animação de virar a página e populando as páginas conforme necessário.
 * @returns {void}
 */
function prevPage() {
    let index = taskNote.getPageIndex();
    const state = taskNote.getState();
    if (index === 0 && state === 'OPENED') {
        changeState('close_front');
        return;
    } else if (state === 'CLOSED_BACK') {
        changeState('open_back');
        return;
    }

    index -= 2;
    populatePage(taskNote.dom.animBack, index + 2);
    populatePage(taskNote.dom.animFront, index + 1);
    populatePage(taskNote.dom.sheetLeft, index);

    taskNote.dom.animated.classList.add('start-flipped');
    taskNote.dom.animated.style.display = 'block';
    void taskNote.dom.animated.offsetWidth;
    taskNote.dom.animated.classList.add('turn-prev');

    taskNote.dom.animated.addEventListener('transitionend', () => {
        populatePage(taskNote.dom.sheetRight, index + 1);
        taskNote.setIndex(index);
        taskNote.dom.animated.style.display = 'none';
        taskNote.dom.animated.classList.remove('start-flipped', 'turn-prev');
    }, { once: true });
}

/**
 * Função para arquivar uma tarefa, removendo-a da visualização e marcando-a como arquivada no banco de dados local.
 * @param {HTMLButtonElement} buttonArchive - O botão de arquivar que foi clicado, usado para identificar qual tarefa deve ser arquivada através do dataset da linha da tarefa.
 * @returns {void}
 * @throws {Error} Lança um erro se o UUID da tarefa não for encontrado no dataset da linha.
 */
function archiveTask(buttonArchive) {
    const line = buttonArchive.parentNode;
    const uuid = line.dataset.uuid;
    if (uuid) {
        taskNote.archiveTask(uuid);
        const sheet = line.closest('.sheet');
        if (sheet && sheet.id === 'sheet-left')
            populatePage(taskNote.dom.sheetLeft, taskNote.getPageIndex());
        else if (sheet && sheet.id === 'sheet-right')
            populatePage(taskNote.dom.sheetRight, taskNote.getPageIndex() + 1);
    } else
        throw new Error(`ArchiveTask Error: Task UUID not found for the selected task.`);
}

/**
 * Função para arquivar uma página, removendo-a da visualização e marcando-a como arquivada no banco de dados local.
 * @param {HTMLButtonElement} el - O elemento do botão de arquivar que foi clicado, usado para identificar qual página deve ser arquivada através do dataset da folha da página.
 * @return {void}
 * @throws {Error} Lança um erro se a folha da página não for encontrada ou se os dados da página não forem encontrados para o índice da página atual.
 */
function archivePage(el) {
    const sheet = el.closest('.sheet');
    if (!sheet) throw new Error(`ArchivePage Error: Sheet not found for the selected page.`);
    const index = (sheet.id === 'sheet-left') ? taskNote.getPageIndex() : taskNote.getPageIndex() + 1;
    const page = taskNote.getPageData(index);

    if (page) {
        taskNote.archivePage(page.uuid);
        const state = taskNote.getState();
        if (state === 'OPENED')
            if (index % 2 === 0) {
                populatePage(taskNote.dom.sheetLeft, index);
                populatePage(taskNote.dom.sheetRight, index + 1);
            } else {
                populatePage(taskNote.dom.sheetLeft, index - 1);
                populatePage(taskNote.dom.sheetRight, index);
            }
        else if (state === 'CLOSED_FRONT')
            populatePage(taskNote.dom.sheetLeft, index);
        else if (state === 'CLOSED_BACK')
            populatePage(taskNote.dom.sheetRight, index);

    } else
        throw new Error(`ArchivePage Error: Page data not found for the current page index.`);
}

document.addEventListener('DOMContentLoaded', () => {
    initialize(metadata.debug);
});