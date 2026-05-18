/**
 * Controlador de internacionalização para gerenciar e aplicar
 * traduções dinâmicas na interface do usuário.
 */
export class LanguageController {
    /** @type {HTMLElement} Elemento raiz (HTML) do documento */
    #html;

    /** @type {string} Código da linguagem atualmente selecionada (ex: 'pt-BR', 'en-US') */
    #selectedLanguage;

    /** @type {Object} Dicionário contendo as traduções disponíveis */
    #data;

    /**
     * Cria uma instância do controlador de linguagem.
     * @param {Object} languages - Objeto contendo os dicionários de tradução separados por idioma.
     * Exemplo: { pt: { saudacao: "Olá" }, en: { saudacao: "Hello" } }
     */
    constructor(languages = {}) {
        this.#html = document.documentElement;
        this.#data = languages;
        this.#selectedLanguage = '';
    }

    /**
     * Altera a linguagem ativa, atualiza a tag <html> e recarrega os textos da interface.
     * @param {string} language - O código do idioma a ser definido.
     */
    setLanguage(language) {
        if (!language || typeof language !== 'string') {
            throw new Error("LanguageController Error: Language not defined in the scope.");
            return;
        }

        if (!this.#data[language]) {
            throw new Error(`LanguageController Error: The selected language '${language}' does not exists in the data.`);
            return;
        }

        this.#selectedLanguage = language;
        const dictionary = this.#data[this.#selectedLanguage];
        this.#html.setAttribute('lang', dictionary?.language || 'en-US');
        this.loadLanguage();
    }

    /**
     * Obtém qual linguagem atualmente em uso.
     * @returns {string}
     */
    getLanguage() {
        return this.#selectedLanguage;
    }

    /**
     * Varre o DOM em busca dos elementos com o atributo 'data-lang' e atualiza o conteúdo de cada um com o texto correspondente.
     */
    loadLanguage() {
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach((el) => {
            const pathLang = el.dataset.lang;
            if (!pathLang) return;

            const text = this.getTextLanguage(pathLang);
            el.innerHTML = text;
        });
    }

    /**
     * Obtém a lista de códigos de idiomas disponíveis no dicionário.
     * @returns {string[]} Array de códigos de idiomas (ex: ['pt-BR', 'en-US', 'es-ES'])
     */
    getAllLanguages() {
        const dictionary = this.#data;
        let langs = [];
        dictionary.forEach((dict) => {
            langs.push(dict.lang);
        });
        return langs;
    }

    /**
     * Navega pelos dados de traduções atual para encontrar o texto baseado no caminho definido no elemento.
     * @param {string} pathLang - O caminho para o texto no objeto. Ex: 'header/title/main'
     * @returns {string} - O texto traduzido ou 'LanguageError' se não for encontrado.
     */
    getTextLanguage(pathLang) {
        const textError = '<span style="color: #f00;">&tritime; LanguageError</span>';
        if (!this.#selectedLanguage) {
            console.error("LanguageController Error: Language not defined in the scope.");
            return textError;
        }

        const dictionary = this.#data[this.#selectedLanguage ?? 'en'];
        if (!dictionary) return textError;

        const keys = pathLang.split('/');

        // Reduz o array de chaves para navegar profundamente no objeto do dicionário
        const text = keys.reduce((currentObj, key) => {
            return (currentObj && currentObj[key] !== undefined) ? currentObj[key] : null;
        }, dictionary);

        return (typeof text === 'string' || typeof text === 'number')
            ? String(text)
            : textError;
    }
}