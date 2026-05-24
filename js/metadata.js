// metadata.js

/**
 * @type {Object} metadata - Armazena os metadados do site
 * @type {string} metadata.version - Versão da aplicação
 * @type {string} metadata.author - Autor da aplicação
 * @type {string} metadata.authorUrl - URL do perfil do autor
 */
const METADATA = {
    version: '1.8',
    author: "Kaik D' Andrade",
    authorUrl: 'https://github.com/kaikdandrade'
};

// Chama a função de inicialização quando evento de carregamento da página é emitido 
// Adiciona o valor das variaveis necessárias na tradução
const copyrightEl = document.querySelector('footer .copyright');
copyrightEl.dataset.langVars = JSON.stringify({ year: new Date().getFullYear(), version: METADATA.version });
const titleEl = document.querySelectorAll('.title');
titleEl.forEach(el => {
    el.dataset.langVars = JSON.stringify({ version: METADATA.version });
});

const metadataElements = document.querySelectorAll('[data-metadata]');
metadataElements.forEach(el => {
    const key = el.dataset.metadata;
    let content = '';
    let shouldAppend = false;

    // Adiciona o valor das variaveis necessárias na tradução
    const copyrightEl = document.querySelector('footer .copyright');
    copyrightEl.dataset.langVars = JSON.stringify({ year: new Date().getFullYear(), version: METADATA.version });
    const titleEl = document.querySelectorAll('.title');
    titleEl.forEach(el => {
        el.dataset.langVars = JSON.stringify({ version: METADATA.version });
    });

    switch (key) {
        case 'title':
        case 'description':
            content = language.getTextLanguage(key); // Captura o texto traduzido do sistema de internacionalização
            break;
        case 'author':
            content = METADATA.author;
            break;
        default:
            return; // Chave desconhecida...
    }

    // Aplica o conteúdo no HTML. Se for uma tag <meta>, atualiza o atributo 'content'.
    // Se não atualiza o 'textContent'.
    if (el instanceof HTMLMetaElement)
        el.setAttribute('content', content);
    else
        if (shouldAppend)
            el.textContent += content;
        else
            el.textContent = content;
});