let tasks = JSON.parse(localStorage.getItem('tasks_v3')) || [];
let currentPage = -1; // -1 é fechado
const limit = 13; // Tarefas por página

function renderPages() {
    const container = document.getElementById('pages-container');
    container.innerHTML = '';
    const total = Math.max(1, Math.ceil(tasks.length / limit));

    for (let i = 0; i < total; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.id = `page-${i}`;
        page.style.zIndex = total - i;

        const start = i * limit;
        const pageTasks = tasks.slice(start, start + limit);

        page.innerHTML = `
                    <div class="page-face front paper">
                        <ul class="task-list">
                            ${pageTasks.map((t, idx) => `
                                <li class="task-item ${t.completed ? 'done' : ''}">
                                    <input type="checkbox" ${t.completed ? 'checked' : ''} 
                                        onclick="toggleTask(${start + idx})">
                                    <span>${t.text}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="page-face back paper" style="background-image: none; background-color: #f9f9f9;">
                        <div style="padding: 60px; opacity: 0.2; font-size: 0.8rem;">Verso da página ${i + 1}</div>
                    </div>
                `;
        container.appendChild(page);
    }
    updateControls();
}

function toggleCover() {
    const cover = document.getElementById('cover');
    if (currentPage === -1) {
        cover.classList.add('flipped');
        currentPage = 0;
    } else if (currentPage === 0) {
        // Se estiver na primeira página e clicar na capa (que está virada), ele fecha
        // Mas vamos deixar os botões controlarem isso para evitar confusão
    }
    updateControls();
}

function nextPage() {
    const total = Math.ceil(tasks.length / limit) || 1;
    if (currentPage < total - 1) {
        document.getElementById(`page-${currentPage}`).classList.add('flipped');
        currentPage++;
    }
    updateControls();
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        document.getElementById(`page-${currentPage}`).classList.remove('flipped');
    } else if (currentPage === 0) {
        document.getElementById('cover').classList.remove('flipped');
        currentPage = -1;
    }
    updateControls();
}

function addTask() {
    const val = document.getElementById('taskInput').value.trim();
    if (val) {
        tasks.push({ text: val, completed: false });
        localStorage.setItem('tasks_v3', JSON.stringify(tasks));
        document.getElementById('taskInput').value = '';
        renderPages();
        if (currentPage === -1) toggleCover();
    }
}

function toggleTask(idx) {
    tasks[idx].completed = !tasks[idx].completed;
    localStorage.setItem('tasks_v3', JSON.stringify(tasks));
    renderPages();
}

function updateControls() {
    const total = Math.ceil(tasks.length / limit) || 1;
    document.getElementById('prevBtn').disabled = (currentPage === -1);
    document.getElementById('nextBtn').disabled = (currentPage >= total - 1 || currentPage === -1);
}

renderPages();