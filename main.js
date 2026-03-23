let tasks = JSON.parse(localStorage.getItem('tasks_v7')) || [];
let currentSpread = 0;
const tasksPerPage = 13; // Cabe perfeitamente na grade

function render() {
    const leftContent = document.getElementById('leftContent');
    const rightContent = document.getElementById('rightContent');

    // Página Esquerda
    if (currentSpread === 0) {
        document.getElementById('leftTitle').innerText = "Dashboard";
        leftContent.innerHTML = `
                    <div style="padding: 20px 20px 20px 65px; color: #555; font-size: 0.9rem;">
                        <h2 style="color:#222; margin:0;">Meu Diário</h2>
                        <p>Bem-vindo ao seu sistema de gestão. Use o campo acima para adicionar novas obrigações.</p>
                        <p>O alinhamento agora é pixel-perfect.</p>
                    </div>
                `;
    } else {
        document.getElementById('leftTitle').innerText = `Lado A - Pág ${currentSpread * 2}`;
        const start = (currentSpread - 1) * (tasksPerPage * 2) + tasksPerPage;
        leftContent.innerHTML = generateListHtml(start, start + tasksPerPage) +
            `<div class="nav-line" onclick="turnPage(-1)">« Voltar Anterior</div>`;
    }

    // Página Direita
    const rightStart = currentSpread === 0 ? 0 : (currentSpread - 1) * (tasksPerPage * 2) + (tasksPerPage * 2);
    document.getElementById('rightTitle').innerText = `Lado B - Pág ${currentSpread * 2 + 1}`;

    let html = generateListHtml(rightStart, rightStart + tasksPerPage);
    if (tasks.length > rightStart + tasksPerPage) {
        html += `<div class="nav-line" onclick="turnPage(1)">Ver Próximas Páginas »</div>`;
    }
    rightContent.innerHTML = html;
}

function generateListHtml(start, end) {
    const slice = tasks.slice(start, end);
    return `<div class="task-list">` + slice.map((t, i) => `
                <div class="task-item ${t.completed ? 'done' : ''}">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onclick="toggleTask(${start + i})">
                    <span>${t.text}</span>
                    <span class="del-icon" onclick="deleteTask(${start + i})">×</span>
                </div>
            `).join('') + `</div>`;
}

function turnPage(dir) {
    const sheet = document.getElementById('flipSheet');
    sheet.classList.add('active');

    // Força o reflow para a animação funcionar
    sheet.offsetHeight;

    if (dir === 1) {
        sheet.classList.add('animate');
    } else {
        // Se estiver voltando, começa virada e desvira
        sheet.classList.add('animate');
        sheet.offsetHeight;
        sheet.classList.remove('animate');
    }

    // No meio da animação (0.4s), troca o conteúdo embaixo
    setTimeout(() => {
        currentSpread += dir;
        render();
    }, 400);

    // Reseta a folha após a animação
    setTimeout(() => {
        sheet.classList.remove('active', 'animate');
    }, 800);
}

function addTask() {
    const input = document.getElementById('taskInput');
    if (input.value.trim()) {
        tasks.push({ text: input.value, completed: false });
        localStorage.setItem('tasks_v7', JSON.stringify(tasks));
        input.value = '';
        render();
    }
}

function toggleTask(i) { tasks[i].completed = !tasks[i].completed; save(); render(); }
function deleteTask(i) { tasks.splice(i, 1); save(); render(); }
function save() { localStorage.setItem('tasks_v7', JSON.stringify(tasks)); }

render();