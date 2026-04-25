// --- META DADOS ---
const metadata = {
    language: 'en',
    version: '1.3',
    debug: true,
    notebook: {
        height: 600,
        lines: 22
    }
};

const pagesData = [
    { title: "Inside Cover", tasks: ["This is the left side", "of the cover.", "Meeting at 2 PM", "Send report", "Extra Page", "Study JavaScript", "Last page before", "the back cover!", "of the cover.", "Meeting at 2 PM", "Send report", "This is the left side", "of the cover.", "Bread", "Milk", "Coffe"] },
    { title: "Market", tasks: ["Bread", "Milk", "Coffee"] },
    { title: "Notes 1", tasks: ["New app idea", "Call João"] },
    // Removendo ou adicionando páginas aqui fará o sistema renderizar páginas em branco caso seja ímpar
    // { title: "Notes 2", tasks: ["New app idea", "Call João"] }
];

// --- Variáveis de controle ---
let noteState = 'CLOSED_FRONT';
let currentPageIndex = 0;
let isAnimating = false;

// --- Manipulação de CSS ---
const html = document.documentElement;
html.style.setProperty('--notebook-height', `${metadata.notebook.height}px`);
html.style.setProperty('--notebook-line-height', `${metadata.notebook.height / (metadata.notebook.lines + 1)}px`);

// --- DOM ---
const notebook = {
    el: document.getElementsByClassName('notebook')[0],
    page: {
        left: document.getElementById('page-left'),
        right: document.getElementById('page-right')
    },
    sheet: {
        left: document.getElementById('sheet-left'),
        right: document.getElementById('sheet-right')
    },
    anim: {
        animated: document.getElementById('animated'),
        front: document.getElementById('anim-front'),
        back: document.getElementById('anim-back')
    },
    btn: {
        open: document.getElementById('openBtn'),
        prev: document.getElementById('prevBtn'),
        next: document.getElementById('nextBtn')
    }
};

// --- Antigo DOM (apagar futuramente) ---
const notebookEl = document.getElementsByClassName('notebook')[0];
const leftSideEl = document.getElementById('page-left');
const rightSideEl = document.getElementById('page-right');
const htmlPageLeft = document.getElementById('sheet-left');
const htmlPageRight = document.getElementById('sheet-right');
const htmlAnimPage = document.getElementById('animated');
const htmlAnimFront = document.getElementById('anim-front');
const htmlAnimBack = document.getElementById('anim-back');
const btn = {
    open: document.getElementById('openBtn'),
    prev: document.getElementById('prevBtn'),
    next: document.getElementById('nextBtn')
}

function setInit() {
    // Se a função de setLanguage existir (ela é criada em languages.js)...
    // Conforme o metadata, define a linguagem e carrega os textos
    if (typeof setLanguage === 'function') setLanguage(metadata.language);

    // Pegando nativamente do navegador
    const userLanguage = window.navigator.language;
    console.log(userLanguage);

    const dataVersion = document.querySelectorAll('[data-version]');
    for (let version of dataVersion) {
        version.innerHTML += ` v${metadata.version}`;
    }

    if (metadata.debug) {
        noteState = 'OPEN';
        currentPageIndex = 0;
        notebook.el.classList.remove('closed-front');
        notebook.page.left.classList.remove('closed');
    } else {
        noteState = 'CLOSED_FRONT';
        notebook.el.classList.add('closed-front');
        notebook.page.left.classList.add('closed');
        currentPageIndex = 0;
    }

    updateUI();
}
setInit();

/*
    <div class="page-content">
        <ul class="lines">
            <li class="line disabled"><h2 class="page-title">Page Title</h2><span class="page-number">1</span></li>
            <li class="line"><input type="checkbox" /><p>Task</p></li>  ***
            
        </ul>
    </div>
*/
function generatePage(data, pageNum) {
    const linesCount = metadata.notebook.lines;
    let container = document.createElement('div');
    container.classList.add('page-content');

    let lines = document.createElement('ul');
    lines.classList.add('lines');
    let taskLine = linesCount - 7; // Linhas disponíveis para tarefas (descontando título, numeração e link)

    for (let l = 0; l < linesCount; l++) {
        let line = document.createElement('li');
        line.classList.add('line');

        if (l < 3) line.classList.add('disabled');

        // Se a página possuir dados
        if (data) {
            if (l === 1) {
                line.innerHTML = `<h2 class="page-title">${data.title || ''}</h2><span class="page-number">${pageNum}</span>`;
            }
            if (l > 2 && taskLine > 0 && data.tasks && data.tasks[l - 3]) {
                line.innerHTML = `<input type="checkbox" /><p>${data.tasks[l - 3]}</p>`;
                taskLine--;
            }
        } else {
            // Página em branco (apenas numeração)
            if (l === 1) {
                line.innerHTML = `<span class="page-number">${pageNum}</span>`;
            }
        }

        if (l === linesCount - 3 && data) {
            action = pageNum % 2 === 0 ? 'next' : 'prev'; // Página par (direita) tem botão de "next", ímpar (esquerda) tem botão de "prev"   
            line.innerHTML = `<div class="line-nav" onclick="handleBookInteraction('${action}')"><p>${getTextLanguage(`notebook/controls/btn/${action}`)}</p></div>`;
        }

        lines.appendChild(line);
    }

    container.append(lines);
    return container;
}

function updateUI() {
    notebook.sheet.left.innerHTML = '';
    notebook.sheet.right.innerHTML = '';

    // Passamos o dado (que pode ser undefined se passar do tamanho do array) e o número visual da página
    notebook.sheet.left.appendChild(generatePage(pagesData[currentPageIndex], currentPageIndex + 1));
    notebook.sheet.right.appendChild(generatePage(pagesData[currentPageIndex + 1], currentPageIndex + 2));
}

function handleBookInteraction(action) {
    if (isAnimating) return;

    // Garante que o total seja sempre um número par
    const totalPages = Math.ceil(pagesData.length / 2) * 2;

    const actions = {
        toggle: () => {
            if (noteState === 'CLOSED_BACK') changeNotebookState('openFromBack');
            else if (noteState === 'CLOSED_FRONT') changeNotebookState('openFromFront');
        },
        prev: () => {
            if (noteState !== 'OPEN') return;
            if (currentPageIndex === 0) {
                changeNotebookState('closeToFront');
            } else {
                prevPage();
            }
        },
        next: () => {
            if (noteState !== 'OPEN') return;
            if (currentPageIndex + 2 >= totalPages) {
                changeNotebookState('closeToBack');
            } else {
                nextPage();
            }
        },
        default: () => {
            console.warn(`Ação "${action}" não reconhecida.`);
            console.log('Ações disponíveis: ["toggle", "prev", "next"]');
        }
    };

    if (actions[action]) actions[action]();
}

function changeNotebookState(action) {
    isAnimating = true;

    // 1. Mapeamos as diferenças de cada ação em um objeto
    const config = {
        openFromFront: { side: 'left', method: 'remove', elClass: 'closed-front', newState: 'OPEN' },
        openFromBack: { side: 'right', method: 'remove', elClass: 'closed-back', newState: 'OPEN' },
        closeToFront: { side: 'left', method: 'add', elClass: 'closed-front', newState: 'CLOSED_FRONT' },
        closeToBack: { side: 'right', method: 'add', elClass: 'closed-back', newState: 'CLOSED_BACK' }
    }[action];

    // 2. Atualizamos o índice da página apenas se for uma ação de abertura
    if (action === 'openFromFront') {
        currentPageIndex = 0;
    } else if (action === 'openFromBack') {
        const totalPages = Math.ceil(pagesData.length / 2) * 2;
        currentPageIndex = totalPages - 2;
    }

    // 3. Aplicamos as classes dinamicamente baseadas no objeto config
    notebook.page[config.side].classList[config.method]('closed');
    notebook.el.classList[config.method](config.elClass);

    // 4. Finalizamos a animação definindo o novo estado
    setTimeout(() => {
        noteState = config.newState;
        updateUI();
        isAnimating = false;
    }, 1000);
}

function nextPage() {
    isAnimating = true;
    const currentRightIndex = currentPageIndex + 1;
    const newLeftIndex = currentPageIndex + 2;
    const newRightIndex = currentPageIndex + 3;

    notebook.anim.front.innerHTML = '';
    notebook.anim.back.innerHTML = '';
    notebook.sheet.right.innerHTML = '';

    // Utilizando appendChild pois generatePage retorna um node do DOM
    notebook.anim.front.appendChild(generatePage(pagesData[currentRightIndex], currentRightIndex + 1));
    notebook.anim.back.appendChild(generatePage(pagesData[newLeftIndex], newLeftIndex + 1));
    notebook.sheet.right.appendChild(generatePage(pagesData[newRightIndex], newRightIndex + 1));

    notebook.anim.animated.style.display = 'block';
    void notebook.anim.animated.offsetWidth; // Reflow forçado para CSS
    notebook.anim.animated.classList.add('turn-next');

    notebook.anim.animated.addEventListener('transitionend', function onNext() {
        notebook.sheet.left.innerHTML = '';
        notebook.sheet.left.appendChild(generatePage(pagesData[newLeftIndex], newLeftIndex + 1));

        notebook.anim.animated.style.display = 'none';
        notebook.anim.animated.classList.remove('turn-next');

        currentPageIndex = newLeftIndex;
        updateUI();
        isAnimating = false;
        notebook.anim.animated.removeEventListener('transitionend', onNext);
    });
}

function prevPage() {
    isAnimating = true;
    const newLeftIndex = currentPageIndex - 2;
    const newRightIndex = currentPageIndex - 1;

    notebook.anim.back.innerHTML = '';
    notebook.anim.front.innerHTML = '';
    notebook.sheet.left.innerHTML = '';

    notebook.anim.back.appendChild(generatePage(pagesData[currentPageIndex], currentPageIndex + 1));
    notebook.anim.front.appendChild(generatePage(pagesData[newRightIndex], newRightIndex + 1));
    notebook.sheet.left.appendChild(generatePage(pagesData[newLeftIndex], newLeftIndex + 1));

    notebook.anim.animated.classList.add('start-flipped');
    notebook.anim.animated.style.display = 'block';

    void notebook.anim.animated.offsetWidth; // Reflow forçado para CSS
    notebook.anim.animated.classList.add('turn-prev');

    notebook.anim.animated.addEventListener('transitionend', function onPrev() {
        notebook.sheet.right.innerHTML = '';
        notebook.sheet.right.appendChild(generatePage(pagesData[newRightIndex], newRightIndex + 1));

        notebook.anim.animated.style.display = 'none';
        notebook.anim.animated.classList.remove('start-flipped', 'turn-prev');

        currentPageIndex = newLeftIndex;
        updateUI();
        isAnimating = false;
        notebook.anim.animated.removeEventListener('transitionend', onPrev);
    });
}