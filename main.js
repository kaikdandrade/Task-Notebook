// --- DADOS ---
const pagesData = [
    { title: "Inside Cover", tasks: ["This is the left side", "of the cover."] },
    { title: "Market", tasks: ["Bread", "Milk", "Coffee"] },
    { title: "Notes", tasks: ["New app idea", "Call João"] },
    { title: "Work", tasks: ["Meeting at 2 PM", "Send report"] },
    { title: "More Tasks", tasks: ["Extra Page", "Study JavaScript"] },
    { title: "Conclusion", tasks: ["Last page before", "the back cover!"] }
];

// const tasks = [
//     { name: 'Comprar pão', completed: false },
//     { name: 'Tomar café', completed: false },
//     {name: 'Lavar louça', completed: false },
//     { name: 'Enviar relatório', completed: false },
//     { name: 'Estudar JavaScript', completed: false },
//     { name: 'Ligar para João', completed: false },
//     { name: 'Reunião às 14h', completed: false },
//     { name: 'Projetar app novo', completed: false }
// ]; 

let bookState = 'CLOSED_FRONT';
let currentLeftPageIndex = 0;
let isAnimating = false;

// DOM
const notebookEl = document.getElementById('notebook');
const leftSideEl = document.getElementById('page-left');
const rightSideEl = document.getElementById('page-right');
const htmlPageLeft = document.getElementById('sheet-left');
const htmlPageRight = document.getElementById('sheet-right');
const htmlAnimPage = document.getElementById('animated');
const htmlAnimFront = document.getElementById('anim-front');
const htmlAnimBack = document.getElementById('anim-back');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function generatePageHTML(data) {
    if (!data) return '<div class="page-content"></div>';
    let tasksHTML = data.tasks ? '<ul class="task-list">' + data.tasks.map(task => `<li>${task}</li>`).join('') + '</ul>' : '';
    return `<div class="page-content"><h2>${data.title}</h2>${tasksHTML}</div>`;
}

function updateUI() {
    htmlPageLeft.innerHTML = generatePageHTML(pagesData[currentLeftPageIndex]);
    htmlPageRight.innerHTML = generatePageHTML(pagesData[currentLeftPageIndex + 1]);

    if (bookState === 'CLOSED_FRONT') {
        prevBtn.disabled = true;
        prevBtn.innerText = "Anterior";
        nextBtn.disabled = false;
        nextBtn.innerText = "Abrir Caderno";
    } else if (bookState === 'CLOSED_BACK') {
        prevBtn.disabled = false;
        prevBtn.innerText = "Abrir Caderno";
        nextBtn.disabled = true;
        nextBtn.innerText = "Próximo";
    } else if (bookState === 'OPEN') {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        prevBtn.innerText = (currentLeftPageIndex <= 0) ? "Fechar (Frente)" : "Anterior";
        nextBtn.innerText = (currentLeftPageIndex >= pagesData.length - 2) ? "Fechar (Fundo)" : "Próximo";
    }
}

updateUI();

function handlePrev() {
    if (isAnimating) return;
    if (bookState === 'CLOSED_BACK') openFromBack();
    else if (bookState === 'OPEN' && currentLeftPageIndex <= 0) closeToFront();
    else if (bookState === 'OPEN') prevPage();
}

function handleNext() {
    if (isAnimating) return;
    if (bookState === 'CLOSED_FRONT') openFromFront();
    else if (bookState === 'OPEN' && currentLeftPageIndex >= pagesData.length - 2) closeToBack();
    else if (bookState === 'OPEN') nextPage();
}

function openFromFront() {
    isAnimating = true;
    leftSideEl.classList.remove('is-closed');
    notebookEl.classList.remove('closed-front');
    setTimeout(() => { bookState = 'OPEN'; updateUI(); isAnimating = false; }, 1000);
}

function closeToFront() {
    isAnimating = true;
    leftSideEl.classList.add('is-closed');
    notebookEl.classList.add('closed-front');
    setTimeout(() => { bookState = 'CLOSED_FRONT'; updateUI(); isAnimating = false; }, 1000);
}

function closeToBack() {
    isAnimating = true;
    rightSideEl.classList.add('is-closed');
    notebookEl.classList.add('closed-back');
    setTimeout(() => { bookState = 'CLOSED_BACK'; updateUI(); isAnimating = false; }, 1000);
}

function openFromBack() {
    isAnimating = true;
    rightSideEl.classList.remove('is-closed');
    notebookEl.classList.remove('closed-back');
    setTimeout(() => { bookState = 'OPEN'; updateUI(); isAnimating = false; }, 1000);
}

function nextPage() {
    isAnimating = true;
    const currentRightIndex = currentLeftPageIndex + 1;
    const newLeftIndex = currentLeftPageIndex + 2;
    const newRightIndex = currentLeftPageIndex + 3;

    htmlAnimFront.innerHTML = generatePageHTML(pagesData[currentRightIndex]);
    htmlAnimBack.innerHTML = generatePageHTML(pagesData[newLeftIndex]);
    htmlPageRight.innerHTML = generatePageHTML(pagesData[newRightIndex]);

    htmlAnimPage.style.display = 'block';
    void htmlAnimPage.offsetWidth;
    htmlAnimPage.classList.add('turn-next');

    htmlAnimPage.addEventListener('transitionend', function onNext() {
        htmlPageLeft.innerHTML = htmlAnimBack.innerHTML;
        htmlAnimPage.style.display = 'none';
        htmlAnimPage.classList.remove('turn-next');
        currentLeftPageIndex = newLeftIndex;
        updateUI();
        isAnimating = false;
        htmlAnimPage.removeEventListener('transitionend', onNext);
    });
}

function prevPage() {
    isAnimating = true;
    const newLeftIndex = currentLeftPageIndex - 2;
    const newRightIndex = currentLeftPageIndex - 1;

    htmlAnimBack.innerHTML = generatePageHTML(pagesData[currentLeftPageIndex]);
    htmlAnimFront.innerHTML = generatePageHTML(pagesData[newRightIndex]);

    htmlAnimPage.classList.add('start-flipped');
    htmlAnimPage.style.display = 'block';
    htmlPageLeft.innerHTML = generatePageHTML(pagesData[newLeftIndex]);

    void htmlAnimPage.offsetWidth;
    htmlAnimPage.classList.add('turn-prev');

    htmlAnimPage.addEventListener('transitionend', function onPrev() {
        htmlPageRight.innerHTML = htmlAnimFront.innerHTML;
        htmlAnimPage.style.display = 'none';
        htmlAnimPage.classList.remove('start-flipped', 'turn-prev');
        currentLeftPageIndex = newLeftIndex;
        updateUI();
        isAnimating = false;
        htmlAnimPage.removeEventListener('transitionend', onPrev);
    });
}