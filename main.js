// 1. "Database" de páginas.
const pagesData = [
    { title: "Capa Interna", tasks: ["Este é o lado esquerdo", "da capa."] }, // Índice 0 (Esquerda)
    { title: "Mercado", tasks: ["Pão", "Leite", "Café"] }, // Índice 1 (Direita)
    { title: "Anotações", tasks: ["Idéia de app novo", "Ligar para João"] }, // Índice 2 (Esquerda)
    { title: "Fim", tasks: ["Última Página"] }, // Índice 3 (Direita)
    { title: "Mais Tarefas", tasks: ["Página Extra 1", "Estudar"] }, // Índice 4 (Esquerda)
    { title: "Conclusão", tasks: ["Acabou o caderno!"] } // Índice 5 (Direita)
];

// 2. Estado: Começamos mostrando o índice 0 na esquerda e 1 na direita.
let currentLeftPageIndex = 0;
let isAnimating = false;

// Referências DOM
const htmlPageLeft = document.getElementById('page-left');
const htmlPageRight = document.getElementById('page-right');
const htmlAnimPage = document.getElementById('animated-page');
const htmlAnimFront = document.getElementById('anim-front');
const htmlAnimBack = document.getElementById('anim-back');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Função utilitária para gerar o HTML do conteúdo
function generatePageHTML(data) {
    if (!data) return '<div class="page-content"></div>'; // Página em branco
    let tasksHTML = '';
    if (data.tasks) {
        tasksHTML = '<ul class="task-list">' + data.tasks.map(task => `<li>${task}</li>`).join('') + '</ul>';
    }
    return `
                <div class="page-content">
                    <h2>${data.title}</h2>
                    ${tasksHTML}
                </div>
            `;
}

// 3. Renderização Inicial
function updateStaticPages() {
    htmlPageLeft.innerHTML = generatePageHTML(pagesData[currentLeftPageIndex]);
    htmlPageRight.innerHTML = generatePageHTML(pagesData[currentLeftPageIndex + 1]);

    // Gerenciar estado dos botões (agora pulando de 2 em 2)
    prevBtn.disabled = currentLeftPageIndex <= 0;
    nextBtn.disabled = currentLeftPageIndex >= pagesData.length - 2;
}

updateStaticPages();

// =========================================
// 4. LÓGICA DE ANIMAÇÃO "NEXT" (Pular 2 páginas)
// =========================================
function nextPage() {
    if (isAnimating || currentLeftPageIndex >= pagesData.length - 2) return;
    isAnimating = true;

    const currentRightIndex = currentLeftPageIndex + 1;
    // O SEGREDO ESTÁ AQUI: Avançamos 2 índices para revelar um par novo!
    const newLeftIndex = currentLeftPageIndex + 2;
    const newRightIndex = currentLeftPageIndex + 3;

    // Frente da folha voando é a página direita atual
    htmlAnimFront.innerHTML = generatePageHTML(pagesData[currentRightIndex]);

    // Verso da folha voando é a NOVA página esquerda
    htmlAnimBack.innerHTML = generatePageHTML(pagesData[newLeftIndex]);

    // Página direita estática já recebe a NOVA página direita
    htmlPageRight.innerHTML = generatePageHTML(pagesData[newRightIndex]);

    htmlAnimPage.style.display = 'block';
    htmlAnimPage.style.zIndex = 20;

    void htmlAnimPage.offsetWidth;
    htmlAnimPage.classList.add('turn-next');

    htmlAnimPage.addEventListener('transitionend', function FunctionNextEnd() {
        // Ao final, a página esquerda fixa recebe o que estava no verso voando
        htmlPageLeft.innerHTML = htmlAnimBack.innerHTML;

        htmlAnimPage.style.display = 'none';
        htmlAnimPage.classList.remove('turn-next');
        htmlAnimPage.style.zIndex = 10;

        currentLeftPageIndex = newLeftIndex; // Atualiza o estado
        updateStaticPages();

        isAnimating = false;
        htmlAnimPage.removeEventListener('transitionend', FunctionNextEnd);
    });
}

// =========================================
// 5. LÓGICA DE ANIMAÇÃO "PREV" (Voltar 2 páginas)
// =========================================
function prevPage() {
    if (isAnimating || currentLeftPageIndex <= 0) return;
    isAnimating = true;

    const currentLeftIndex = currentLeftPageIndex;
    // O SEGREDO ESTÁ AQUI: Recuamos 2 índices para revelar o par anterior!
    const newLeftIndex = currentLeftPageIndex - 2;
    const newRightIndex = currentLeftPageIndex - 1;

    // O verso da folha voando é a página esquerda atual
    htmlAnimBack.innerHTML = generatePageHTML(pagesData[currentLeftIndex]);

    // A frente da folha voando é a NOVA página direita
    htmlAnimFront.innerHTML = generatePageHTML(pagesData[newRightIndex]);

    htmlAnimPage.classList.add('start-flipped');
    htmlAnimPage.style.display = 'block';
    htmlAnimPage.style.zIndex = 20;

    // Página esquerda estática já recebe a NOVA página esquerda
    htmlPageLeft.innerHTML = generatePageHTML(pagesData[newLeftIndex]);

    void htmlAnimPage.offsetWidth;

    htmlAnimPage.classList.add('turn-prev');

    htmlAnimPage.addEventListener('transitionend', function FunctionPrevEnd() {
        // Ao final, a página direita fixa recebe o que estava na frente voando
        htmlPageRight.innerHTML = htmlAnimFront.innerHTML;

        htmlAnimPage.style.display = 'none';
        htmlAnimPage.classList.remove('start-flipped', 'turn-prev');
        htmlAnimPage.style.zIndex = 10;

        currentLeftPageIndex = newLeftIndex; // Atualiza o estado
        updateStaticPages();

        isAnimating = false;
        htmlAnimPage.removeEventListener('transitionend', FunctionPrevEnd);
    });
}