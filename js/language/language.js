import { LanguageController } from './../controller/LanguageController.js';
import { METADATA } from './../metadata.js';
import { DICTIONARY } from './dictionary.js';

const DEFAULT_LANGUAGE = 'en';

/** @type {LanguageController} */
const languageController = new LanguageController(DICTIONARY);
languageController.setDefaultLanguage(DEFAULT_LANGUAGE); // Define a linguagem padrão no controlador para fallback automático

/** @type {NodeListOf<HTMLElement>|null} Referência aos elementos seletores de idioma da interface */
let selectorLangEls = null;

// INICIALIZAÇÃO DO SISTEMA DE IDIOMAS
document.addEventListener('DOMContentLoaded', initializeLanguageSystem, { once: true });

/**
 * Inicializa o sistema de gerenciamento de idiomas ao carregar a página.
 * 
 * ETAPAS DE INICIALIZAÇÃO:
 * 1. Restaura o idioma salvo localmente ou usa o idioma padrão
 * 2. Ativa o idioma resgatado
 * 3. Busca todos os elementos seletores de idioma
 * 4. Adiciona listeners para alternancia de idioma
 * 5. Atualiza o display dos seletores com o idioma ativo
 * 
 * @returns {void}
 */
function initializeLanguageSystem() {
    // Adiciona o valor das variaveis necessárias na tradução
    const copyrightEl = document.querySelector('footer .copyright');
    copyrightEl.dataset.langVars = JSON.stringify({ year: new Date().getFullYear(), version: METADATA.version });
    const titleEl = document.querySelectorAll('.title');
    titleEl.forEach(el => {
        el.dataset.langVars = JSON.stringify({ version: METADATA.version });
    });

    // Resgata a linguagem guardada localmente, caso não haja ou seja inválida, o controlador usará a padrão
    const storageLang = localStorage.getItem('lang') ?? DEFAULT_LANGUAGE;
    setLanguageAndStore(storageLang);

    // Captura todos os elementos com a classe 'selector-lang' para serem usados como botões de alternância de idioma
    selectorLangEls = document.querySelectorAll('.selector-lang');
    selectorLangEls.forEach(el => el.addEventListener('click', toggleLanguage));

    // Atualiza o display inicial dos seletores
    updateLanguageSelectorDisplay();
}

// ============================================================================
// FUNÇÕES INTERNAS
// ============================================================================

/**
 * Atualiza o display de todos os elementos seletores de idioma.
 * Mostra o código do idioma ativo (ex: 'en-US', 'pt-BR') com ícone de globo.
 * 
 * @returns {void}
 */
function updateLanguageSelectorDisplay() {
    if (selectorLangEls) {
        const HTMLLang = languageController.getHTMLLanguage();
        selectorLangEls.forEach(el => el.innerHTML = `<span class="icon">🌐</span>${HTMLLang}`);
    }
}

/**
 * Alterna para o próximo idioma disponível e atualiza a interface e armazenamento local.
 * Cicla entre todos os idiomas registrados, voltando ao primeiro após o último.
 * 
 * Chamada quando o usuário clica em um elemento com classe 'selector-lang'.
 * @returns {void}
 */
function toggleLanguage() {
    const currentStorageLang = localStorage.getItem('lang') ?? DEFAULT_LANGUAGE;
    const availableLanguages = languageController.getAllLanguages();

    // Descobre o índice do idioma atual no array
    const currentIndex = availableLanguages.indexOf(currentStorageLang);

    // Calcula o próximo índice. O operador '%' garante que se for o último idioma, ele volte pro primeiro (índice 0)
    const nextIndex = (currentIndex + 1) % availableLanguages.length;

    // Atualiza o idioma ativo e persiste no armazenamento local
    const newLang = availableLanguages[nextIndex];
    setLanguageAndStore(newLang);

    // Atualiza o display dos seletores para refletir o novo idioma
    updateLanguageSelectorDisplay();
}

/**
 * Define o idioma ativo, recarrega as traduções da interface e salva no localStorage.
 * Se o idioma solicitado não existir, o controlador automaticamente usa o idioma padrão.
 * 
 * @param {string} lang - Código do idioma (ex: 'pt', 'en', 'es', 'fr')
 * @returns {void}
 */
function setLanguageAndStore(lang) {
    if (lang) {
        try {
            languageController.setLanguage(lang);
            localStorage.setItem('lang', lang);
        } catch (error) {
            console.error(error.message);
        }
    }
}

// ============================================================================
// FUNÇÕES EXPORTADAS
// ============================================================================


/**
 * Altera o idioma ativo da aplicação por meio de código externo.
 * Pode ser usada para mudar o idioma programaticamente (ex: botão de seleção de idioma customizado).
 * 
 * @param {string} lang - Código do idioma (ex: 'pt', 'en', 'es', 'fr')
 * @returns {void}
 * 
 * EXEMPLO:
 * setLanguage('pt'); // Altera para português
 * setLanguage('invalid'); // Usa idioma padrão automaticamente
 */
export function setLanguage(lang) {
    setLanguageAndStore(lang);
    updateLanguageSelectorDisplay();
}

/**
 * Exporta a função para capturar o texto da linguagem selecionada e do caminho especificado.
 * @param {string} pathLang - O caminho para o texto no objeto. Ex: 'controls/archive' ou 'buttons/save'
 * @returns {string} O texto traduzido ou 'LanguageError' se não for encontrado.
 */
export function getTextLanguage(pathLang) {
    return languageController.getTextLanguage(pathLang);
}

/**
 * Exporta a função de recarregar a linguagem do site, reapplicando traduções a todos os elementos com data-lang.
 * @returns {void}
 */
export function reloadLanguage() {
    languageController.loadLanguage();
}

/**
 * Retorna o código do idioma atualmente selecionado.
 * @returns {string} Código do idioma (ex: 'pt', 'en', 'es', 'fr')
 * 
 * EXEMPLO:
 * const currentLang = getCurrentLanguage(); // retorna 'pt'
 */
export function getCurrentLanguage() {
    return languageController.getCurrentLanguage();
}