/**
 * @typedef {Object} LanguageData
 * @property {string} lang - [OBRIGATÓRIO] Código do idioma no formato locale (ex: 'en-US', 'pt-BR', 'es-ES', 'fr-FR'). Usado na tag <html lang="..."> para melhor acessibilidade e SEO.
 * @property {any} [*] - Propriedades customizadas (opcionais)
 * 
 * Você pode adicionar QUALQUER propriedade além de 'lang' conforme sua aplicação necessitar.
 * 
 * TIPOS DE PROPRIEDADES SUPORTADAS:
 * • string: Traduções simples (ex: title, description, copyright)
 * • number: Números multilíngues se necessário
 * • Object: Agrupamentos lógicos de traduções (ex: buttons, messages, controls)
 * 
 * EXEMPLOS DE PROPRIEDADES CUSTOMIZADAS:
 * • title: 'Meu App' (string simples)
 * • buttons: { save: 'Salvar', cancel: 'Cancelar' } (objeto com sub-propriedades)
 * • messages: { welcome: 'Bem-vindo', error: 'Erro' } (objeto agrupando mensagens)
 * • footer: { copyright: '© 2026', contact: 'Contato' } (seção específica)
 * • meta: { ogTitle: 'Título OG', description: 'Descrição Meta' } (metadados)
 * 
 * ESTRUTURA DINÂMICA: Você pode adicionar ou remover propriedades conforme necessário.
 * Exemplo customizado:
 * {
 *   lang: 'pt-BR',
 *   title: 'Meu App',
 *   buttons: { save: 'Salvar', cancel: 'Cancelar' },
 *   messages: { success: 'Operação bem-sucedida' },
 *   footer: { contact: 'Contato', privacy: 'Privacidade' }
 * }
 */

/**
 * @typedef {Object.<string, LanguageData>} LanguageDictionary
 * Dicionário global de idiomas onde cada chave é um código de idioma único.
 * 
 * Exemplo:
 * {
 *   en: { lang: 'en-US', title: 'My App', ... },
 *   pt: { lang: 'pt-BR', title: 'Meu App', ... },
 *   es: { lang: 'es-ES', title: 'Mi App', ... }
 * }
 * 
 * REGRAS IMPORTANTES:
 * 1. Cada objeto de idioma DEVE ter a propriedade 'lang' obrigatoriamente
 * 2. Use nomes simples como chaves (en, pt, es, fr) para fácil acesso
 * 3. As demais propriedades são completamente flexíveis e podem variar entre idiomas
 * 4. Matenha a mesma estrutura para todos os idiomas por consistência
 */

/**
 * Controlador de internacionalização (i18n) para gerenciar e aplicar
 * traduções dinâmicas na interface do usuário.
 * 
 * OBJETIVO: Facilitar a implementação de suporte a múltiplos idiomas em aplicações web.
 * 
 * FLUXO DE USO RECOMENDADO:
 * 1. Defina seus dicionários em um arquivo separado (ex: dictionary.js)
 * 2. Instancie: const controller = new LanguageController(DICTIONARY)
 * 3. Configure padrão: controller.setDefaultLanguage('en')
 * 4. Ative idioma: controller.setLanguage('pt')
 * 5. Use no HTML: <h1 data-lang="title">...</h1>
 * 
 * RECURSOS PRINCIPAIS:
 * ✓ Fallback automático para idioma padrão
 * ✓ Navegação em objetos aninhados com notação '/'
 * ✓ Atualização dinâmica de todos os elementos com data-lang
 * ✓ Suporte a objetos de tradução completamente flexíveis
 * ✓ Gerenciamento automático do atributo lang na tag <html>
 * 
 * EXEMPLO COMPLETO:
 * 
 * // dictionary.js
 * export const DICTIONARY = {
 *   en: {
 *     lang: 'en-US',
 *     title: 'My App',
 *     buttons: { save: 'Save', cancel: 'Cancel' }
 *   },
 *   pt: {
 *     lang: 'pt-BR',
 *     title: 'Meu App',
 *     buttons: { save: 'Salvar', cancel: 'Cancelar' }
 *   }
 * };
 * 
 * // Seu código
 * const controller = new LanguageController(DICTIONARY);
 * controller.setDefaultLanguage('en');
 * controller.setLanguage('pt'); // Ativa português
 * 
 * // No HTML
 * <h1 data-lang="title">...</h1>  <!-- Mostra "Meu App" -->
 * <button data-lang="buttons/save">...</button>  <!-- Mostra "Salvar" -->
 * 
 * DICAS IMPORTANTES:
 * • Mantenha a mesma estrutura para todos os idiomas por consistência
 * • Use 'lang' obrigatoriamente em cada objeto de idioma
 * • Organize traduções em arquivo separado para facilitar manutenção
 * • Use nomes descritivos para as chaves (ex: 'controls', 'messages', 'buttons')
 * • Teste o fallback para garantir que o idioma padrão cobre todos os casos
 * * Organize suas traduções em um arquivo separado (ex: dictionary.js) para manter o código limpo e facilitar manutenção.
 */
export class LanguageController {
    /** @type {HTMLElement} Elemento raiz (HTML) do documento */
    #html = document.documentElement;

    /** @type {LanguageDictionary} Dicionário contendo as traduções disponíveis */
    #data;

    /** @type {string} Código da linguagem atualmente selecionada (ex: 'pt-BR', 'en-US') */
    #selectedLanguage = '';

    /** @type {string} Linguagem padrão */
    #defaultLang = '';

    /** 
     * @type {object} config - Configurações internas
     * @type {string} config.separator - Separação usada no pathLang de data-lang para encontrar o caminho de tradução dentro do dicionário.
     * @type {string} config.errorPlaceholder - Texto padão exibido ao não encontrar a tradução no dicionário com o caminho especificado.
     * @type {string} config.attribute - Regra usada para buscar os elementos que precisam de tradução e o valor é o caminho da tradução do dicionário.
     */
    #config = {
        separator: '/',
        errorPlaceholder: '<span style="color: red;">&tritime; [Translation missing]</span>',
        attribute: 'data-lang'
    };

    /**
     * Cria uma instância do controlador de linguagem.
     * @param {LanguageDictionary} languages - Dicionário contendo todos os idiomas suportados
     */
    constructor(languages = {}) {
        this.#data = languages;
    }

    /**
     * Valida internamente se o código do idioma existe no dicionário.
     * @param {string} lang 
     */
    #isValidLanguage(lang) {
        return lang && typeof lang === 'string' && !!this.#data[lang];
    }

    /**
     * Define a linguagem padrão que será usada como fallback quando um idioma solicitado não existir.
     * 
     * DEVE ser chamado APÓS a instanciação e ANTES de usar setLanguage().
     * Recomendado: Execute logo após criar a instância do controlador.
     * 
     * @param {string} defaultLanguage - Código do idioma padrão (ex: 'en', 'pt')
     * @throws {Error} Se a linguagem padrão não existir no dicionário
     * 
     * EXEMPLO:
     * const controller = new LanguageController(DICTIONARY);
     * controller.setDefaultLanguage('en'); // 'en' é agora o idioma de fallback
     * controller.setLanguage('xyz'); // Não existe, então usa 'en' automaticamente
     */
    setDefaultLanguage(langCode) {
        if (!this.#isValidLanguage(langCode)) {
            throw new Error(`LanguageController: Default language '${langCode}' not found in dictionary.`);
        }
        this.#defaultLang = langCode;
    }

    /**
     * Altera a linguagem ativa, atualiza o atributo 'lang' na tag <html> e recarrega todos os textos da interface.
     * 
     * COMPORTAMENTO COM FALLBACK:
     * - Se o idioma existe: Ativa esse idioma
     * - Se não existe e há padrão: Ativa o idioma padrão (com aviso no console)
     * - Se não existe e sem padrão: Lança erro
     * 
     * @param {string} language - Código do idioma a ativar (ex: 'en', 'pt', 'es')
     * @throws {Error} Se nenhuma linguagem padrão foi definida e a linguagem solicitada não existe
     * 
     * EXEMPLO:
     * controller.setLanguage('pt'); // Ativa português
     * controller.setLanguage('invalid'); // Ativa padrão com warning
     */
    setLanguage(langCode) {
        if (this.#isValidLanguage(langCode))
            this.#selectedLanguage = langCode;
        else if (this.#defaultLang) {
            console.warn(`Language '${langCode}' not found. Falling back to '${this.#defaultLang}'.`);
            this.#selectedLanguage = this.#defaultLang;
        } else
            throw new Error(`LanguageController: Language '${langCode}' invalid and no fallback set.`);

        const locale = this.#data[this.#selectedLanguage].lang || this.#data[this.#defaultLang].lang || 'en-US';
        this.#html.setAttribute('lang', locale);
        this.loadLanguage();
    }

    /**
     * Varre o DOM em busca dos elementos com o atributo 'data-lang' e atualiza o conteúdo de cada um com o texto correspondente.
     * 
     * USO NO HTML:
     * <h1 data-lang="title">Placeholder</h1>
     * <button data-lang="controls.save">Placeholder</button>
     * <span data-lang="messages.welcome">Placeholder</span>
     * 
     * O conteúdo do placeholder é automaticamente substituído pelo texto traduzido.
     */
    loadLanguage(container = document) {
        const selector = `[${this.#config.attribute}]`;
        const elements = container.querySelectorAll(selector);

        elements.forEach((el) => {
            const path = el.getAttribute(this.#config.attribute);
            if (!path) return;

            // Suporte para passar dados via atributo extra (opcional)
            // Ex: <span data-lang="welcome" data-lang-vars='{"name": "User"}'></span>
            const vars = el.getAttribute('data-lang-vars') 
                ? JSON.parse(el.getAttribute('data-lang-vars')) 
                : {};

            el.innerHTML = this.getTextLanguage(path, vars);
        });
    }

    /**
     * Navega pelos dados de tradução atual para encontrar o texto baseado no caminho especificado.
     * Utiliza notação com / (barras) para acessar propriedades aninhadas no dicionário.
     * 
     * @param {string} pathLang - Caminho para acessar o texto no objeto de idioma.
     * Usa '/' como separador para navegar em objetos aninhados.
     * Exemplo de notações: 'title', 'controls/save', 'messages/welcome', etc.
     * 
     * @returns {string} O texto traduzido ou mensagem de erro se não encontrado.
     * 
     * EXEMPLO DE ESTRUTURA:
     * {
     *   en: {
     *     lang: 'en-US',
     *     title: 'My App',
     *     controls: { save: 'Save', cancel: 'Cancel' },
     *     messages: { welcome: 'Welcome' }
     *   }
     * }
     * 
     * EXEMPLOS DE ACESSO:
     * getTextLanguage('title') // retorna "My App"
     * getTextLanguage('controls/save') // retorna "Save"
     * getTextLanguage('messages/welcome') // retorna "Welcome"
     * getTextLanguage('invalid/path') // retorna erro visual no HTML
     * 
     * AGORA METODO FAZ INTERPOLAÇÃO DE VARIÁVEIS
     * getTextLanguage('controls/save', [[Date.YEAR]) // "Save in {year}" retorna "Save in 2026"
     * getTextLanguage('messages/welcome', [User.name]) // "Welcome {name}" retorna "Welcome Fulano"
     */
    getTextLanguage(path, params = {}) {
        if (!this.#selectedLanguage) return this.#config.errorPlaceholder;

        const keys = path.split(this.#config.separator);
        let result = this.#data[this.#selectedLanguage];

        for (const key of keys)
            if (result && Object.prototype.hasOwnProperty.call(result, key))
                result = result[key];
            else
                return this.#config.errorPlaceholder;

        if (typeof result !== 'string' && typeof result !== 'number')
            return this.#config.errorPlaceholder;

        return this.#interpolate(String(result), params);
    }

    /**
     * Responsável por interpolar variaveis dentro do texto de tradução. 
     * Ao encontrar {chave} tenta interpolar com os valores passados em {params} 
     * e depois retorna a variável interpolada.
     * 
     * @param {string} text Texto de tradução a ser interpolado.
     * @param {Object|Array} params Variaveis a ser interpolada dentro do texto de tradução. Os dados, ex: { nome: "João", status: "bem", year: "2026", old: 25 }
     * @returns {string} Retorna o texto de tradução interpolada com a variavel. 
     */
    #interpolate(text, params) {
        // Trasnforma os valores de 'params' em uma lista sequencial (Array)
        const values = Object.values(params);
        let index = 0; // Posição inicial da lista

        // O replace vai encontrar cada ocorrência de {algo}
        return text.replace(/{(\w+)}/g, (match) => {
            // Pegar o valor na posição atual do contador
            const replacement = values[index];
            index++; // Proximo..

            // Se o valor existir, usamos ele. 
            // Se houver mais chaves no texto do que dados no params, mantém a {chave} original.
            return replacement !== undefined ? String(replacement) : match;
        });
    }

    /**
     * Obtém o código da linguagem atualmente selecionada.
     * @returns {string} Código da linguagem (ex: 'pt', 'en', 'es')
     */
    getCurrentLanguage() {
        return this.#selectedLanguage;
    }

    /**
     * Obtém qual linguagem atualmente em uso e retorna a lang de HTML. Exemplo: ['en-US', 'pt-BR'].
     * @returns {string} Exemplo: ['en-US', 'pt-BR'].
     */
    getHTMLLanguage() {
        return this.#data[this.#selectedLanguage]?.lang ?? '';
    }

    /**
     * Obtém a lista de códigos de idiomas disponíveis no dicionário.
     * @returns {string[]} Array de códigos de idiomas (ex: ['pt', 'en', 'es'])
     */
    getAllLanguages() {
        return Object.keys(this.#data);
    }
}