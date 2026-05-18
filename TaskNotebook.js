class TaskNotebook {
    /**
     * DATABASE 
     * TABLE `pages` (
     * uuid: VARCHAR(36) NOT NULL PRIMARY KEY,
     * title: VARCHAR(30) NOT NULL,
     * archived: BOOLEAN NOT NULL DEFAULT FALSE,
     * create_at: TIMESTAMP NOT NULL,
     * update_at: TIMESTAMP NOT NULL
     * );
     * TABLE `tasks` (
     * uuid: VARCHAR(36) NOT NULL PRIMARY KEY,
     * page_id: VARCHAR(36) NOT NULL FOREIGN KEY,
     * name: VARHCAR(45) NOT NULL,
     * completed: BOOLEAN NOT NULL DEFAULT FALSE,
     * archived: BOOLEAN NOT NULL DEFAULT FALSE,
     * create_at: TIMESTAMP NOT NULL,
     * update_at: TIMESTAMP NOT NULL
     * );
     */
    #database = { pages: [], tasks: [] };

    // ESTADOS DA INTERFACE UI
    #state = {
        name: 'OPEN',
        index: 0, // Refere-se sempre a página da esquerda, para direita (+1)
        // isAnimating: false
    };

    // Quantidade de tarefas aceitas por página. DEFAULT 18
    tasksPerPage = 20;

    // Apenas para fins de armazenamento direto na classe...
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
     * Função para ajudar na alteração dos dados no banco de dados local.
     * @param {String} table Nome da tabela.
     * @param {int} id Identificador do dado que sofrerá alteração.
     * @param {Array<String>} field Lista dos nomes dos campos a serem alterados.
     * @param {Array<String>} value Lista dos valores dos campos a serem alterados.
     * @returns Retorna os dados completos já alterados ao concluir, se der falha retorna um erro.
     */
    #updateData(table, id, field, value) {
        try {
            const timestamp = new Date().toISOString();
            const data = this.#database[table].filter(d => d.uuid === id)[0];
            if (!data) throw new Error(''); // Manda pro 'catch' caso data seja vazio.
            field.forEach((f, i) => data[f] = value[i]);
            data.update_at = timestamp;
            return data;
        } catch (error) {
            throw new Error(`TaskNotebook Error: Failed to update table ${table} data in the database.`);
        }
    }

    /**
     * Retorna todas os dados das páginas válidas que estão no banco de dados local.
     * @returns {Array<object>}
     */
    #getPagesData() {
        return this.#database.pages.filter(d => !d.archived);
    }

    /**
     * Altera o estado da classe de acordo com a ação de entrada.
     * @param {string} action: ['open_front', 'open_back', 'close_front', 'close_back'];
     * @returns Retorna a configuração da ação selecionada em caso de ação válida, senão erro.
     */
    changeState(action) {
        const config = {
            open_front: { side: 'pageLeft', method: 'remove', class: 'closed-front', newState: 'OPENED' },
            open_back: { side: 'pageRight', method: 'remove', class: 'closed-back', newState: 'OPENED' },
            close_front: { side: 'pageLeft', method: 'add', class: 'closed-front', newState: 'CLOSED_FRONT' },
            close_back: { side: 'pageRight', method: 'add', class: 'closed-back', newState: 'CLOSED_BACK' }
        }[action];

        // Se ação não encontrada dentro do escopo, emitir erro falta!
        if (!config) {
            console.error('changeState:', { validActions: ['open_front', 'open_back', 'close_front', 'close_back'] });
            throw new Error(`TaskNotebook Error: changeState('${action}') action '${action}' not is valid.`);
        } else {
            this.#state.name = config.newState;
            return config;
        }
    }

    /**
     * Essa função procura no banco de dados local todas as páginas válidas e retorna o objeto que contém 
     * os dados da página usando o indice desejado como critério.
     * @param {int} index Indice desejado na busca da página.
     * @returns {object | null} Retorna lista de objeto ou lista vazia caso não encontre nada.
     */
    getPageData(index) {
        const pages = this.#getPagesData();
        return pages[index] || null
    }

    /**
     * Essa função procura no banco de ddados local todas as páginas válidas e retorna a quantidade de páginas vindas do banco. 
     * @returns {int >= 0}
     */
    getPageCount() {
        return this.#getPagesData().length;
    }

    /**
     * Responsável por retornar todas as tarefas da página do indice desejado que está no banco de dados local.
     * @param {int} page_id Identificador da página onde está as tarefas.
     * @returns {Array<object>}
     */
    getTasksData(page_id) {
        return this.#database.tasks.filter(d => !d.archived && d.page_id === page_id);
    }

    /**
     * Retorna o estado do indice atual da página.
     * @returns {int}
     */
    getPageIndex() {
        return this.#state.index;
    }

    /**
     * Retorna o índice da última página válida do banco de dados local, isso é importante para controlar a navegação do caderno.
     * @returns {int}
     */
    getLastPageIndex() {
        const pageCount = this.getPageCount();
        let lastIndex = Math.max(0, Math.ceil(pageCount / 2) * 2 - 2);
        lastIndex = (pageCount % 2 === 0) ? lastIndex + 2 : lastIndex;
        return lastIndex;
    }

    /**
     * Retorna o nome do estado atual da classe.
     * @returns {string}
     */
    getState() {
        return this.#state.name;
    }

    /**
     * Retorna a quantidade de tarefas aceitas por página, isso é importante para ter um controle tanto no backend quanto no frontend.
     * @returns {int} Retorna a quantidade de tarefas por página.
     */
    getTasksPerPage() {
        return this.tasksPerPage;
    }

    /**
     * Retorna se a página do indice desejado é uma página de template ou não, isso é importante para controlar a renderização da página.
     * @param {int} index Indice da página a ser verificada.
     * @returns {boolean} Retorna true se for página de template ou false caso contrário.
     */
    isTemplatePage(index) {
        const pageCount = this.getPageCount();
        return (index >= pageCount);
    }

    /**
     * Adiciona uma nova página no banco de dados local.
     * @param {String} title Título da nova página.
     * @returns Retornar o Id da nova página ao concluir ou então falha.
     */
    newPage(title) {
        try {
            const timestamp = new Date().toISOString();
            const uuid = crypto.randomUUID();
            this.#database.pages.push({ uuid: uuid, title: title, archived: false, create_at: timestamp, update_at: timestamp });
            return uuid;
        } catch (error) {
            throw new Error('TaskNotebook Error: Failed to add new page in database.');
        }
    }

    /**
     * Adiciona uma nova tarefa destinada a uma página no banco de dados local.
     * @param {int} page_id Id da página que a tarefa é destinada.
     * @param {String} name Nome da nova tarefa.
     * @returns Retorna o Id da nova tarefa ao concluir ou então falha.
     */
    newTask(page_id, name) {
        // Melhorar o método e tbm adicionar a verificação de quantidade de tasks
        // tasksPerPage
        try {

            const timestamp = new Date().toISOString();
            const uuid = crypto.randomUUID();
            this.#database.tasks.push({ uuid: uuid, page_id: page_id, name: name, completed: false, archived: false, create_at: timestamp, update_at: timestamp });
            return uuid;
        } catch (error) {
            throw new Error('TaskNotebook Error: Failed to add new task in database.');
        }
    }

    /**
     * Altera o título da página no banco de dados local.
     * @param {int} page_id Identificador da página que terá o título alterado.
     * @param {String} title Novo título da página.
     * @returns {object} Retorna os dados completos já alterados ao concluir, se der falha retorna um erro.
     */
    updatePageTitle(page_id, title) {
        const data = this.#updateData('pages', page_id, ['title'], [title]);
        return data;
    }

    /**
     * Altera o nome da tarefa no banco de dados local.
     * @param {int} task_id Identificador da tarefa que terá o nome alterado.
     * @param {String} name Novo nome da tarefa.
     * @returns {object} Retorna os dados completos já alterados ao concluir, se der falha retorna um erro.
     */
    updateTaskName(task_id, name) {
        const data = this.#updateData('tasks', task_id, ['name'], [name]);
        return data;
    }

    /**
     * Alterna o estado de conclusão da tarefa entre concluido e inconcluido. 
     * @param {int} task_id Identificador da tarefa no bacno de dados local.
     * @param {boolean} task_completed Novo estado de conclusão da tarefa.
     * @return {object} Retorna os dados completos já alterados ao concluir, se der falha retorna um erro.
     */
    taskComplete(task_id, task_completed) {
        const data = this.#updateData('tasks', task_id, ['completed'], [task_completed]);
        return data;
    }

    /**
     * Deixa a página arquivada no banco de dados local.
     * @param {String} id - Identificador da página que será arquivada.
     */
    archivePage(id) {
        const data = this.#updateData('pages', id, ['archived'], [true]);

        // Adicionar aqui futuramente a lógica para arquivar todas as tarefas da página caso exista tarefas.
        /// [....]
    }

    /**
     * Deixa a tarefa arquivada no banco de dados local.
     * @param {string} uuid - identificador da tarefa que será arquivada.
     */
    archiveTask(uuid) {
        const data = this.#updateData('tasks', uuid, ['archived'], [true]);
    }

    /**
     * Altera o índice da página atual, isso é importante para manter o controle do estado e dos dados do caderno.
     * @param {int} index Novo índice da página atual.
     */
    setIndex(index) {
        this.#state.index = index;
    }

    /**
     * Altera a quantidade de tarefas aceitas por página, isso é importante para ter um controle tanto no backend quanto no frontend.
     * @param {int} count Nova quantidade de tarefas por página.
     * @returns {int} Retorna a nova quantidade de tarefas por página.
     */
    setTasksPerPage(count) {
        this.tasksPerPage = count;
        return this.tasksPerPage;
    }
}