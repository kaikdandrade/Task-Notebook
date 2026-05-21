import { NotebookController } from './controller/NotebookController.js';
import { getTextLanguage, reloadLanguage } from './language/language.js';
import { METADATA } from './metadata.js';

/**
 * @type {NotebookController} 
 */
const taskNote = new NotebookController();

/** @constant {number} Limite máximo de caracteres para evitar quebra do layout visual do caderno. */
const MAX_TEXT_LENGTH = 30;

/**
 * Função inicial, roda assim que o DOM é completamente carregado, responsável por:
 *  * Definir os elementos HTML essenciais
 *  * Definir quantidade de tarefas máxima p/página
 *  * Definir as funções de clique do mouse
 *  * Verifica possiveis erros
 */
function initialize() {
    // Busca o container principal. Sem ele, a aplicação não tem onde renderizar.
    const notebookContainer = document.querySelector('.notebook');
    if (!notebookContainer)
        throw new Error(`Initialize Error: The 'notebook container' not found in HTML.`);

    // Dicionário de elementos internos obrigatórios, usando os ids dos elementos
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

    // Itera sobre os elementos requeridos e os vincula ao controlador (taskNote).
    let domErrors = false;
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

    // Delegação de eventos estáticos: Estes botões não mudam estruturalmente, 
    // então podemos anexar os eventos uma única vez na inicialização.
    notebookContainer.querySelectorAll('.nav').forEach(btn => {
        btn.addEventListener('click', function () { handleBookInteraction(this); });
    });

    notebookContainer.querySelectorAll('.line.title .archive').forEach(btn => {
        btn.addEventListener('click', function () { archivePage(this); });
    });

    notebookContainer.querySelectorAll('.line.task .archive').forEach(btn => {
        btn.addEventListener('click', function () { archiveTask(this); });
    });

    // Código para voltar a página pro estado salvo no localstorage
    switch (taskNote.getState()) {
        case "OPENED": {
            if (!taskNote.getLastAction())
                changeState('close_front');
            else {
                populatePage(taskNote.dom.sheetLeft, taskNote.getPageIndex());
                populatePage(taskNote.dom.sheetRight, taskNote.getPageIndex() + 1);
            }
            break;
        }
        case "CLOSED_FRONT": {
            changeState('close_front');
            break;
        }
        case "CLOSED_BACK": {
            changeState('close_back');
            break;
        }
    }
}

/**
 * Atualiza metadados visuais na interface, lendo os dados do arquivo de metadata.
 * E tbm atualiza o sistema de internacionalização.
 */
function update() {
    reloadLanguage(); // Atualiza o idioma atual da interface.

    const metadataElements = document.querySelectorAll('[data-metadata]');
    metadataElements.forEach(el => {
        const key = el.dataset.metadata;
        let content = '';
        let shouldAppend = false;

        // ...
        switch (key) {
            case 'title':
            case 'description':
                content = getTextLanguage(key); // Captura o texto traduzido do sistema de internacionalização
                break;
            case 'version':
                content = ` v${METADATA.version}`;
                shouldAppend = true;
                break;
            case 'author':
                content = METADATA.author;
                break;
            default:
                return; // Chave desconhecida...
        }

        // Aplica o conteúdo no HTML. Se for uma tag <meta>, atualiza o atributo 'content'.
        // Se não atualiza o 'textContent'.
        if (el instanceof HTMLMetaElement)
            el.setAttribute('content', content);
        else
            if (shouldAppend)
                el.textContent += content;
            else
                el.textContent = content;
    });
}

/**
 * Função para controlar a mudança de estado do caderno, manipulando as classes HTML e populando as páginas conforme necessário.
 * @param {string} action - Um de: 'open_front', 'open_back', 'close_front', 'close_back'
 */
function changeState(action) {
    // Carrega a configuração da ação de mudança de estado, se ação for inválida emite um erro fatal.
    const config = taskNote.changeState(action);

    // Usando a configuração para manipular as classes CSS e engatilhar as animações visuais 
    taskNote.dom[config.side].classList[config.method]('closed');
    taskNote.dom.notebook.classList[config.method](config.class);

    // Popula a página com as informações 
    populatePage(taskNote.dom.sheetLeft, taskNote.getPageIndex());
    populatePage(taskNote.dom.sheetRight, taskNote.getPageIndex() + 1);
}

/**
 * Resolve vazamentos de memória (Memory Leaks) clonando nós do DOM.
 * Remover e re-inserir um elemento é a forma mais segura de
 * destruir todos os eventListeners antigos presos a ele.
 * @param {HTMLElement} element Elemento a ser "purificado".
 * @returns {HTMLElement} O novo clone limpo inserido no DOM.
 */
function replaceWithClone(element) {
    if (!element) return null;
    const clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
    return clone;
}

/**
 * Centraliza a mecânica de tornar um texto editável, removendo redundâncias de código.
 * Processa as lógicas de Enter, Escape e Blur.
 * 
 * @param {HTMLElement} element O elemento HTML
 * @param {string} placeholderText Texto placeholder de backup caso o usuário cancele a edição
 * @param {Function} onSave Callback executado com o 'sucesso' na edição
 * @param {boolean} [clearOnFocus=false] Se true, limpa o elemento ao entrar em edição
 * @returns {HTMLElement} O elemento DOM (clonado e seguro).
 */
function makeEditable(element, placeholderText, onSave, clearOnFocus = false) {
    // Clona para garantir que não existam EventListeners de renderizações passadas empilhados
    const el = replaceWithClone(element);

    // Variável para armazenar o "último texto salvo"
    // Inicialmente ela recebe o placeholderText passado como parâmetro.
    let currentSavedText = placeholderText;

    el.contentEditable = "false";
    el.spellcheck = false;
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocomplete', 'off');

    // Move o cursor (Caret) para o exato final do texto
    el.addEventListener('dblclick', (e) => {
        e.preventDefault();
        el.contentEditable = "true";
        if (clearOnFocus) el.innerHTML = '';
        el.focus();

        const range = document.createRange();
        const selecao = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        selecao.removeAllRanges();
        selecao.addRange(range);
    });

    // O blur atua como nosso "hub de salvamento". Se o foco sai, avaliamos o que sobrou no HTML.
    el.addEventListener('blur', (e) => {
        e.preventDefault();
        el.contentEditable = "false";

        // Se o texto mudou e não está vazio, disparamos a função de salvamento.
        const currentText = el.textContent.trim();
        if (currentText !== '' && currentText !== currentSavedText) {
            onSave(currentText);
            currentSavedText = currentText;
        } else
            // Se o texto estiver vazio ou inalterado, abortamos revertendo pro original.
            el.innerHTML = currentSavedText;
    });

    el.addEventListener('keydown', (e) => {
        const len = el.textContent.trim().length;

        if (e.key === 'Enter') {
            e.preventDefault(); // Impede criação de nova linha <br>
            // Forçamos o blur(). Isso acionará o listener de blur acima, que validará e salvará o texto.
            if (len > 0) el.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Para cancelar, injetamos o texto original de volta. 
            // Assim, quando o blur() acontecer, ele cairá no bloco 'else' de segurança e não salvará nada.
            el.innerHTML = currentSavedText;
            el.blur();
        } else if (len >= MAX_TEXT_LENGTH) {
            // Bloqueia teclas de adição se atingiu o limite, mas permite apagar e navegar
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        }
    });

    return el;
}

/**
 * Função de auxílio que avalia e aplica a interação de navegação
 * @param {HTMLElement} container Elemento HTML do DOM
 * @param {number} index Indice da página
 */
function configureNavigationInteraction(container, index) {
    const interaction = getNavInteraction(index, taskNote.getLastPageIndex());
    const lineNav = container.querySelector('.line .nav');

    if (lineNav) {
        // Se a interação for "fechar", checamos se estamos na capa da frente (par) ou de trás (ímpar)
        lineNav.dataset.interaction = (interaction === "closed")
            ? (index % 2 === 0 ? 'prev' : 'next')
            : interaction;
        lineNav.dataset.lang = `controls/${interaction}`;
    }
}

/**
 * Popula a página com as informações, controlando e manipulando tudo no HTML minuciosamente.
 * @param {HTMLDivElement} sheet O container DOM da folha (esquerda ou direita).
 * @param {number} index - Indice da página a ser populada.
 * @returns {void}
 */
function populatePage(sheet, index) {
    // Verifica se o usuário chegou a uma página nova/vazia
    if (taskNote.isTemplatePage(index)) {
        templatePage(sheet, index);
        return;
    }

    // Captura o container de conteúdo e faz uma limpeza antes de tudo
    const container = sheet.querySelector('.page-content');
    cleanPage(container);

    // Captura os dados da página
    const page = taskNote.getPageData(index);

    // Adiciona o número da página no elemento HTML
    const pageNum = container.querySelector('.page-number');
    if (pageNum) pageNum.innerHTML = index + 1;

    // Configuração e funcionalidade de edição inline do título da página
    let pageTitle = container.querySelector('.line.title .page-title');
    pageTitle.innerHTML = page.title;
    pageTitle = makeEditable(pageTitle, page.title, (newTitle) => {
        page.title = newTitle;
        taskNote.updatePageTitle(page.uuid, page.title);
    });

    // Captura os elementos necessários para popular a página
    const lineTasks = container.querySelectorAll('.line.task');
    const tasksName = container.querySelectorAll('.line.task .task-text');

    // Dados das tarefas da página
    const tasksData = taskNote.getTasksData(page.uuid);
    const currentTaskCount = tasksData ? tasksData.length : 0;
    const maxTasksPerPage = taskNote.getTasksPerPage();

    // Renderiza as tarefas existentes
    if (currentTaskCount > 0) {
        tasksData.forEach((data, i) => {
            let taskElement = tasksName[i];
            const lineElement = lineTasks[i];

            lineElement.dataset.uuid = data.uuid; // Vincula a linha física ao dado no banco
            taskElement.innerHTML = data.name;

            if (data.completed) taskElement.classList.add('task-completed');

            // Torna o texto da tarefa editável e lida com o duplo clique
            taskElement = makeEditable(taskElement, data.name, (newName) => {
                data.name = newName;
                taskNote.updateTaskName(data.uuid, data.name);
            });

            // Lida separadamente com o clique simples (concluir) usando setTimeout 
            // para não conflitar com o duplo clique da edição.
            let clickTimer = null;
            taskElement.addEventListener('click', (e) => {
                if (e.detail === 1)
                    clickTimer = setTimeout(() => {
                        e.preventDefault();
                        // Só conclui a tarefa se NÃO estivermos editando ela
                        if (taskElement.contentEditable === "false" || !taskElement.isContentEditable) {
                            window.getSelection().removeAllRanges();
                            data.completed = !data.completed;
                            taskElement.classList.toggle('task-completed', data.completed);
                            taskNote.taskComplete(data.uuid, data.completed);
                        }
                    }, 250);
            });

            // Aborta o clique simples se detectarmos um duplo clique em andamento
            taskElement.addEventListener('dblclick', () => clearTimeout(clickTimer));
        });
    }

    // Se ainda houver espaço na página, gera a linha de "Nova Tarefa" (Template)
    if (currentTaskCount < maxTasksPerPage && lineTasks[currentTaskCount]) {
        let templateTaskName = tasksName[currentTaskCount];
        const templateTaskLine = lineTasks[currentTaskCount];

        // Desativa o botão de lixeira visualmente para a linha em branco
        const archiveBtn = templateTaskLine.querySelector('.archive');
        if (archiveBtn) archiveBtn.classList.add('disabled');

        const templateName = getTextLanguage('controls/newTask');
        templateTaskName.innerHTML = templateName;
        templateTaskName.classList.add('task-template');

        // Configura o comportamento de adicionar nova tarefa ao salvar
        templateTaskName = makeEditable(templateTaskName, templateName, (newTaskName) => {
            taskNote.newTask(page.uuid, newTaskName);
            populatePage(sheet, index); // Repopula a página inteira para renderizar a nova tarefa e gerar o próximo template em branco
        }, true); // true = Limpa o texto placeholder ao clicar
    }

    configureNavigationInteraction(container, index);
    update();
}

/**
 * Configura o HTML para exibir uma tela padrão inicial de criação de uma nova página.
 * @param {HTMLDivElement} sheet O elemento DOM da folha
 * @param {number} index Indice da página a ser gerada como template
 */
function templatePage(sheet, index) {
    // Captura o container de conteúdo e faz uma limpeza antes de tudo
    const container = sheet.querySelector('.page-content');
    cleanPage(container);
    container.classList.add('template');

    // Termina de capturar os elementos após a limpeza e adiciona o enumerador da página
    const pageNum = container.querySelector('.page-number');
    pageNum.innerHTML = index + 1;

    let pageTitle = container.querySelector('.line.title .page-title');
    const templateTitle = getTextLanguage('controls/newPage');
    pageTitle.innerHTML = templateTitle;

    // Configura para criar a página nova assim que o usuário alterar o texto do template
    pageTitle = makeEditable(pageTitle, templateTitle, (titleText) => {
        pageTitle.title = titleText;
        taskNote.newPage(titleText);
        populatePage(sheet, index); // Atualiza visualmente trocando o modo template para modo de leitura/edição padrão
    }, true);

    configureNavigationInteraction(container, index);
    update();
}

/**
 * Limpa os dados da página, removendo títulos, tarefas, botões e 
 * resolvendo possíveis vazamentos de memória removendo eventListeners 
 * antigos além de evitar conflitos e bugs.
 * @param {HTMLDivElement} container O container da página a ser limpa 
 */
function cleanPage(container) {
    if (!container || !(container instanceof HTMLDivElement)) return;
    container.classList.remove('template');

    const pageNum = container.querySelector('.page-number');
    if (pageNum) pageNum.innerHTML = '';

    const lineTasks = container.querySelectorAll('.line.task');
    lineTasks.forEach(line => {
        delete line.dataset.uuid; // Remove identificadores passados
        line.classList.remove('task-archived');

        const archiveBtn = line.querySelector('.archive');
        if (archiveBtn) archiveBtn.classList.remove('disabled');
    });

    // Limpa textos. (Nota: os listeners agora são purgados ativamente na função makeEditable)
    const tasksName = container.querySelectorAll('.line.task .task-text');
    tasksName.forEach(task => {
        task.innerHTML = '';
        task.classList.remove('task-template', 'task-archived');
    });

    const lineNav = container.querySelector('.line .nav');
    if (lineNav) {
        lineNav.innerHTML = '';
        delete lineNav.dataset.interaction;
        delete lineNav.dataset.lang;
    }
}

/**
 * Determina logicamente qual será o comportamento de navegação (prev, next ou closed) na folha atual.
 * @param {number} index Indice da página atual
 * @param {number} lastIndex Indice máximo existente no caderno
 * @returns {string} Retorna a interação de navegação (prev, next ou closed)
 */
function getNavInteraction(index, lastIndex) {
    const pageCount = taskNote.getPageCount();
    let interaction = '';

    // Páginas pares estão na folha da esquerda, ímpares na folha da direita
    if (index % 2 === 0)
        interaction = (index === 0) ? 'closed' : 'prev';
    else
        interaction = (index === lastIndex + 1) ? 'closed' : 'next';

    // Se não houver páginas criadas e tentar avançar, apenas fecha o caderno.
    if (interaction === 'next' && pageCount === 0)
        interaction = 'closed';

    return interaction;
}

/**
 * Função para lidar com as interações de navegação do caderno, como abrir, fechar, 
 * ir para página anterior/próxima. Dependendo do botão clicado e da interação definida no dataset do botão.
 * @param {HTMLButtonElement} el Botão de navegação clicado. Deve conter um dataset 'interaction' definida 
 * @returns {void}
 */
function handleBookInteraction(el) {
    const interaction = el.dataset.interaction;
    if (!interaction) return;

    if (interaction === 'prev') prevPage();
    else if (interaction === 'next') nextPage();
    else throw new Error(`HandleBookInteraction Error: Unknown interaction: "${interaction}".`);
}

/**
 * Exucuta a lógica de navegar para a próxima página até fechar o caderno.
 * Trata animações e repopula o DOM de forma necessária.
 * @returns {void} 
 */
function nextPage() {
    let index = taskNote.getPageIndex();
    const lastIndex = taskNote.getLastPageIndex();
    const state = taskNote.getState();

    // Lida com fechamento/abertura do caderno fisicamente 
    if (state === 'CLOSED_FRONT') {
        changeState('open_front');
        return;
    } else if (index === lastIndex) {
        changeState('close_back');
        return;
    }

    index += 2; // Pula duas páginas (frente e verso)
    taskNote.setIndex(index);

    // Prepara as folhas fantasmas usadas apenas para a animação 3D de virada
    populatePage(taskNote.dom.animFront, index - 1);
    populatePage(taskNote.dom.animBack, index);
    populatePage(taskNote.dom.sheetRight, index + 1);

    taskNote.dom.animated.style.display = 'block';
    // O void abaixo força o navegador a recalcular o CSS (Reflow) antes de adicionar a classe,
    // garantindo que a animação (transition) ocorra fluida desde o inicio
    void taskNote.dom.animated.offsetWidth;
    taskNote.dom.animated.classList.add('turn-next');

    // Ao fim da animação, consolida os dados na página fixa e oculta a malha de animação
    taskNote.dom.animated.addEventListener('transitionend', () => {
        populatePage(taskNote.dom.sheetLeft, index);
        taskNote.dom.animated.style.display = 'none';
        taskNote.dom.animated.classList.remove('turn-next');
    }, { once: true });
}

/**
 * Exucuta a lógica de navegar para a página anterior até fechar o caderno.
 * Trata animações e repopula o DOM de forma necessária.
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

    index -= 2; // Volta duas páginas (frente e verso)
    populatePage(taskNote.dom.animBack, index + 2);
    populatePage(taskNote.dom.animFront, index + 1);
    populatePage(taskNote.dom.sheetLeft, index);

    // Prepara animação engatilhando de forma reversa
    taskNote.dom.animated.classList.add('start-flipped');
    taskNote.dom.animated.style.display = 'block';
    // O void abaixo força o navegador a recalcular o CSS (Reflow) antes de adicionar a classe,
    // garantindo que a animação (transition) ocorra fluida desde o inicio
    void taskNote.dom.animated.offsetWidth;
    taskNote.dom.animated.classList.add('turn-prev');

    // Ao fim da animação, consolida os dados na página fixa e oculta a malha de animação
    taskNote.dom.animated.addEventListener('transitionend', () => {
        populatePage(taskNote.dom.sheetRight, index + 1);
        taskNote.setIndex(index);
        taskNote.dom.animated.style.display = 'none';
        taskNote.dom.animated.classList.remove('start-flipped', 'turn-prev');
    }, { once: true });
}

/**
 * Procesa o arquivamento de uma tarefa especificada.
 * @param {HTMLButtonElement} buttonArchive Elemento clicado contendo referência da linha de tarefa
 * @returns {void}
 * @throws {Error} Lança um erro se o UUID da tarefa não for encontrado no dataset da linha
 */
function archiveTask(buttonArchive) {
    const line = buttonArchive.parentNode;
    const uuid = line.dataset.uuid;

    if (!uuid) {
        console.error(`ArchiveTask Error: Task UUID not found in dataset.`);
        return; // Usa early return e evita quebrar o sistema inteiro se houver falha de DOM
    }

    taskNote.archiveTask(uuid);

    // Descobre em qual lado do caderno estamos clicando para re-renderizar apenas o lado certo
    const sheet = line.closest('.sheet');
    if (sheet?.id === 'sheet-left')
        populatePage(taskNote.dom.sheetLeft, taskNote.getPageIndex());
    else if (sheet?.id === 'sheet-right')
        populatePage(taskNote.dom.sheetRight, taskNote.getPageIndex() + 1);
}

/**
 * Processa o arquivamento de uma página inteira. Em cascata as tarefas da página também são arquivadas.
 * @param {HTMLButtonElement} el Elemento clicado contendo referência da linha de título da página
 * @return {void}
 * @throws {Error} Lança um erro se a folha da página não for encontrada ou se os dados da página não forem encontrados
 */
function archivePage(el) {
    const sheet = el.closest('.sheet');
    if (!sheet) {
        console.error(`ArchivePage Error: Sheet container not found.`);
        return;
    }

    // Se for a folha esquerda o índice é o atual, se for direita, atual + 1.
    const index = (sheet.id === 'sheet-left') ? taskNote.getPageIndex() : taskNote.getPageIndex() + 1;
    const page = taskNote.getPageData(index);

    if (!page) {
        console.error(`ArchivePage Error: Data for index ${index} not found.`);
        return;
    }

    taskNote.archivePage(page.uuid);
    const state = taskNote.getState();

    // Recalcula visualmente as folhas dependendo de como o livro está fisicamente aberto.
    if (state === 'OPENED') {
        if (index % 2 === 0) {
            populatePage(taskNote.dom.sheetLeft, index);
            populatePage(taskNote.dom.sheetRight, index + 1);
        } else {
            populatePage(taskNote.dom.sheetLeft, index - 1);
            populatePage(taskNote.dom.sheetRight, index);
        }
    } else if (state === 'CLOSED_FRONT')
        populatePage(taskNote.dom.sheetLeft, index);
    else if (state === 'CLOSED_BACK')
        populatePage(taskNote.dom.sheetRight, index);
}

// Inicia o app garantindo que execute apenas uma vez após o DOM carregar.
document.addEventListener('DOMContentLoaded', initialize, { once: true });