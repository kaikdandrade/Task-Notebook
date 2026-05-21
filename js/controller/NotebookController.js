/**
 * @typedef {Object} Page
 * @property {string} uuid - Identificador único da página
 * @property {string} title - Título da página
 * @property {boolean} archived - Se a página está arquivada
 * @property {string} created_at - Data de criação (ISO 8601)
 * @property {string} updated_at - Data de atualização (ISO 8601)
 */

/**
 * @typedef {Object} Task
 * @property {string} uuid - Identificador único da tarefa
 * @property {string} page_id - ID da página à qual pertence
 * @property {string} name - Nome da tarefa
 * @property {boolean} completed - Se a tarefa foi completada
 * @property {boolean} archived - Se a tarefa está arquivada
 * @property {string} created_at - Data de criação (ISO 8601)
 * @property {string} updated_at - Data de atualização (ISO 8601)
 */

/**
 * @typedef {Object} StateConfig
 * @property {('pageLeft'|'pageRight')} side - Lado da página
 * @property {('add'|'remove')} method - Método CSS a aplicar
 * @property {string} class - Classe CSS a manipular
 * @property {string} newState - Novo estado
 */

/**
 * @typedef {Object} NotebookDOM
 * @property {HTMLElement|null} notebook - Container principal do caderno
 * @property {HTMLElement|null} pageLeft - Elemento da página esquerda
 * @property {HTMLElement|null} pageRight - Elemento da página direita
 * @property {HTMLElement|null} sheetLeft - Folha esquerda do caderno
 * @property {HTMLElement|null} sheetRight - Folha direita do caderno
 * @property {HTMLElement|null} animFront - Elemento de animação frontal
 * @property {HTMLElement|null} animBack - Elemento de animação traseira
 * @property {HTMLElement|null} animated - Elemento animado
 */

/**
 * Representação do banco de dados em memória.
 * @typedef {Object} Database
 * @property {Page[]} pages - Lista de páginas
 * @property {Task[]} tasks - Lista de tarefas
 */

/**
 * Controlador principal do Caderno de Tarefas (Notebook).
 * 
 * Esta classe é responsável por gerenciar a lógica de negócios, o estado da interface (UI) 
 * e simular um banco de dados relacional em memória para `pages` e `tasks`. 
 * Ela atua como a ponte entre o armazenamento de dados e a manipulação do DOM.
 * 
 * **Responsabilidades principais:**
 * - **Gerenciamento de Dados:** Criação, edição, listagem e arquivamento (exclusão lógica em cascata) de páginas e tarefas.
 * - **Gerenciamento de Estado:** Controle do estado de animação e disposição estrutural do caderno (ex: `OPENED`, `CLOSED_FRONT`).
 * - **Paginação:** Controle de índice para navegação entre as páginas espelhadas (esquerda/direita).
 * - **Regras de Negócio:** Aplicação de limites do sistema, como a quantidade máxima de tarefas por página (`tasksPerPage`).
 * 
 * @class
 * @example
 * const notebook = new NotebookController();
 * notebook.dom.notebook = document.querySelector('.notebook');
 * 
 * const pageId = notebook.newPage('Planejamento Semanal');
 * notebook.newTask(pageId, 'Finalizar relatório');
 */
export class NotebookController {
    /**
     * DATABASE SCHEMA SIMULATION
     * 
     * TABLE `pages` (
     *   uuid: VARCHAR NOT NULL PRIMARY KEY,
     *   title: VARCHAR NOT NULL,
     *   archived: BOOLEAN NOT NULL DEFAULT FALSE,
     *   created_at: TIMESTAMP NOT NULL,
     *   updated_at: TIMESTAMP NOT NULL
     * );
     * 
     * TABLE `tasks` (
     *   uuid: VARCHAR NOT NULL PRIMARY KEY,
     *   page_id: VARCHAR NOT NULL FOREIGN KEY REFERENCES pages(uuid),
     *   name: VARCHAR NOT NULL,
     *   completed: BOOLEAN NOT NULL DEFAULT FALSE,
     *   archived: BOOLEAN NOT NULL DEFAULT FALSE,
     *   created_at: TIMESTAMP NOT NULL,
     *   updated_at: TIMESTAMP NOT NULL
     * );
     * 
     * @type {Database}
     */
    #database = { pages: [], tasks: [] };

    // ESTADOS DA INTERFACE UI
    #state = {
        name: 'OPENED', // DEFAULT OPENED
        action: '', // Armazena a ultima ação de estado usado
        index: 0, // Refere-se sempre a página da esquerda, para direita (+1)
        // isAnimating: false
    };

    // Configurações de estado de interface estáticas para evitar recriação em cada chamada
    static #STATE_CONFIGS = {
        open_front: { side: 'pageLeft', method: 'remove', class: 'closed-front', newState: 'OPENED' },
        open_back: { side: 'pageRight', method: 'remove', class: 'closed-back', newState: 'OPENED' },
        close_front: { side: 'pageLeft', method: 'add', class: 'closed-front', newState: 'CLOSED_FRONT' },
        close_back: { side: 'pageRight', method: 'add', class: 'closed-back', newState: 'CLOSED_BACK' }
    };

    // Quantidade de tarefas aceitas por página. DEFAULT 20
    tasksPerPage = 20;

    /** @type {NotebookDOM} Apenas para fins de armazenamento direto na classe... */
    dom = {
        notebook: null,
        pageLeft: null,
        pageRight: null,
        sheetLeft: null,
        sheetRight: null,
        animFront: null,
        animBack: null,
        animated: null
    };

    /**
     * Chave do localStorage para salvar os dados persistentes.
     * @type {string}
     */
    #STORAGE_KEY = 'notebook_data_web';

    /**
     * Construtor da classe.
     * Inicia carregando os dados do localStorage.
     */
    constructor() {
        this.#loadWebData();
    }

    /**
     * Carrega os dados da web (localStorage).
     * Recupera as páginas, tarefas, estado do caderno, ultima ação e índice da página.
     * Valida o índice para garantir que a página exista e reseta se o caderno estiver fechado.
     */
    #loadWebData() {
        try {
            const storedData = localStorage.getItem(this.#STORAGE_KEY);
            if (storedData) { // Data existindo...
                const parsedData = JSON.parse(storedData);

                // Pegando os dados de página e tarefas
                this.#database = {
                    pages: parsedData.pages || [],
                    tasks: parsedData.tasks || []
                };

                // Recupera o estado se ele existir no objeto salvo
                if (parsedData.state)
                    this.#state.name = parsedData.state;

                // Recupera a ultima ação de estado no objeto salvo 
                if (parsedData.action)
                    this.#state.action = parsedData.action;

                // Recupera o índice se ele existir no objeto salvo
                if (parsedData.index !== undefined)
                    this.#state.index = parsedData.index;

                if (this.#state.name === 'CLOSED_FRONT')
                    this.#state.index = 0;
                else if (this.#state.name === 'CLOSED_BACK')
                    this.#state.index = this.getLastPageIndex();
            }
        } catch (error) {
            throw new Error('NotebookController Error: Failed for load data from localStorage.', error);
        }
    }

    /**
     * Salva os dados ativos no localStorage.
     * e também: o estado, a ultimação de estado e o índice atual.
     */
    #saveWebData() {
        try {
            // Filtra o banco de dados atual para não salvar dados arquivados
            // e adiciona os dados de estado e indice
            const dataToSave = {
                pages: this.#database.pages.filter(page => !page.archived),
                tasks: this.#database.tasks.filter(task => !task.archived),
                state: this.#state.name,
                action: this.#state.action,
                index: this.#state.index
            };

            localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            throw new Error('NotebookCOntroller Error: Failed to save data to localStorage.', error);
        }
    }

    /**
     * Função para ajudar na alteração dos dados no banco de dados local.
     * @param {string} table Nome da tabela.
     * @param {string} id Identificador do dado que sofrerá alteração.
     * @param {Array<string>} field Lista dos nomes dos campos a serem alterados.
     * @param {Array<any>} value Lista dos valores dos campos a serem alterados.
     * @returns {Page|Task} Retorna os dados completos já alterados ao concluir, se der falha retorna um erro.
     */
    #updateData(table, id, fields, values) {
        try {
            const data = this.#database[table].find(d => d.uuid === id);
            if (!data) throw new Error(`Record with id '${id}' not found in table '${table}'.`);

            fields.forEach((field, i) => {
                data[field] = values[i];
            });

            data.update_at = new Date().toISOString();
            this.#saveWebData(); // Salva no localStorage

            return data;
        } catch (error) {
            throw new Error(`NotebookController Error: Failed to update table ${table}. Details: ${error.message}`);
        }
    }

    /**
     * Retorna todos os dados das páginas ativas (não arquivadas).
     * @returns {Array<Page>}
     */
    #getPagesData() {
        return this.#database.pages.filter(d => !d.archived);
    }

    /**
     * Altera o estado da classe de acordo com a ação de entrada.
     * @param {string} action options_valid: ['open_front', 'open_back', 'close_front', 'close_back']
     * @returns {StateConfig} Configuração da ação selecionada.
     * @throws {Error} Se a ação for inválida
     */
    changeState(action) {
        const config = NotebookController.#STATE_CONFIGS[action];

        if (!config) {
            const validActions = Object.keys(NotebookController.#STATE_CONFIGS).join(', ');
            console.error('changeState: Invalid action.', { validActions });
            throw new Error(`NotebookController Error: changeState action '${action}' is not valid.`);
        }

        this.#state.name = config.newState;
        this.#state.action = action;
        this.#saveWebData(); // Salva no localStorage

        return config;
    }

    /**
     * Retorna os dados da página ativa pelo índice.
     * @param {number} index Indice desejado.
     * @returns {Page|null}
     */
    getPageData(index) {
        const pages = this.#getPagesData();
        return pages[index] || null;
    }

    /**
     * Retorna a quantidade de páginas ativas.
     * @returns {number} Número de páginas (>= 0)
     */
    getPageCount() {
        return this.#getPagesData().length;
    }

    /**
     * Retorna todas as tarefas ativas de uma página específica.
     * @param {string} page_id - UUID da página.
     * @returns {Array<Task>}
     */
    getTasksData(page_id) {
        return this.#database.tasks.filter(d => !d.archived && d.page_id === page_id);
    }

    /**
     * Retorna o estado do indice atual da página.
     * @returns {number}
     */
    getPageIndex() {
        return this.#state.index;
    }

    /**
     * Retorna o índice da última página válida para controlar a navegação.
     * @returns {number}
     */
    getLastPageIndex() {
        const pageCount = this.getPageCount();
        if (pageCount === 0) return 0;

        const lastIndex = Math.max(0, Math.ceil(pageCount / 2) * 2 - 2);
        return (pageCount % 2 === 0) ? lastIndex + 2 : lastIndex;
    }

    /**
     * Retorna o nome do estado atual.
     * @returns {string}
     */
    getState() {
        return this.#state.name;
    }

    /**
     * Retorna a última ação de estado executada.
     * @returns {string} ex: 'open_front', 'close_back'
     */
    getLastAction() {
        return this.#state.action;
    }

    /**
     * Retorna a quantidade de tarefas aceitas por página. DEFAULT 20
     * @returns {number}
     */
    getTasksPerPage() {
        return this.tasksPerPage;
    }

    /**
     * Verifica se a página do indice atual é uma página de template.
     * @param {number} index
     * @returns {boolean}
     */
    isTemplatePage(index) {
        return index >= this.getPageCount();
    }

    /**
     * Adiciona uma nova página.
     * @param {string} title Título da nova página.
     * @returns {string} UUID da página criada.
     */
    newPage(title) {
        try {
            const timestamp = new Date().toISOString();
            const uuid = crypto.randomUUID();
            this.#database.pages.push({
                uuid,
                title,
                archived: false,
                create_at: timestamp,
                update_at: timestamp
            });
            this.#saveWebData(); // Salva no localStorage

            return uuid;
        } catch (error) {
            throw new Error(`NotebookController Error: Failed to add new page. ${error.message}`);
        }
    }

    /**
     * Adiciona uma nova tarefa destinada a uma página.
     * @param {string} page_id UUID da página.
     * @param {string} name Nome da nova tarefa.
     * @returns {string} UUID da tarefa criada.
     * @throws {Error} Se atingir o limite de tarefas por página.
     */
    newTask(page_id, name) {
        const activeTasks = this.getTasksData(page_id);

        if (activeTasks.length >= this.tasksPerPage) {
            throw new Error(`NotebookController Error: Task limit (${this.tasksPerPage}) reached for page ${page_id}.`);
        }

        try {
            const timestamp = new Date().toISOString();
            const uuid = crypto.randomUUID();
            this.#database.tasks.push({
                uuid,
                page_id,
                name,
                completed: false,
                archived: false,
                create_at: timestamp,
                update_at: timestamp
            });
            this.#saveWebData(); // Salva no localStorage

            return uuid;
        } catch (error) {
            throw new Error(`NotebookController Error: Failed to add new task. ${error.message}`);
        }
    }

    /**
     * Altera o título da página.
     * @param {string} page_id UUID da página.
     * @param {string} title Novo título.
     * @returns {Page}
     */
    updatePageTitle(page_id, title) {
        return this.#updateData('pages', page_id, ['title'], [title]);
    }

    /**
     * Altera o nome da tarefa.
     * @param {string} task_id UUID da tarefa.
     * @param {string} name Novo nome.
     * @returns {Task}
     */
    updateTaskName(task_id, name) {
        return this.#updateData('tasks', task_id, ['name'], [name]);
    }

    /**
     * Alterna o estado de conclusão da tarefa.
     * @param {string} task_id UUID da tarefa.
     * @param {boolean} task_completed Novo estado.
     * @returns {Task}
     */
    taskComplete(task_id, task_completed) {
        return this.#updateData('tasks', task_id, ['completed'], [task_completed]);
    }

    /**
     * Arquiva uma página e todas as suas tarefas ativas (efeito cascata).
     * @param {string} id UUID da página.
     */
    archivePage(id) {
        // Arquiva a página
        this.#updateData('pages', id, ['archived'], [true]);

        // Arquiva tarefas vinculadas à página (Cascade)
        const tasksToArchive = this.#database.tasks.filter(t => t.page_id === id && !t.archived);
        tasksToArchive.forEach(task => {
            this.archiveTask(task.uuid);
        });
    }

    /**
     * Arquiva uma tarefa.
     * @param {string} uuid UUID da tarefa.
     */
    archiveTask(uuid) {
        this.#updateData('tasks', uuid, ['archived'], [true]);
    }

    /**
     * Altera o índice da página atual.
     * @param {number} index Novo índice.
     */
    setIndex(index) {
        this.#state.index = index;
        this.#saveWebData(); // Salva no localStorage
    }

    /**
     * Altera o limite de tarefas por página.
     * @param {number} count Novo limite.
     * @returns {number}
     */
    setTasksPerPage(count) {
        this.tasksPerPage = count;
        return this.tasksPerPage;
    }
}