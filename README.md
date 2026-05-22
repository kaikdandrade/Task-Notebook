<h1 align="center">📓 Task Notebook 3D</h1>

<p align="center">
  <em>Transforme sua produtividade com um Caderno de Tarefas em 3D e uma experiência visual incrível!</em>
</p>

<p align="center">
  <a href="https://kaikdandrade.github.io/Task-Notebook/" target="_blank"><strong>🔗 Acesse a Demonstração ao Vivo no GitHub Pages</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vers%C3%A3o-1.7-blue" alt="Versão 1.7">
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-green" alt="Licença MIT">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-yellow" alt="Vanilla JS">
</p>

## 📖 Sobre o Projeto

O **Task Notebook** é uma aplicação web de gerenciamento de tarefas inovadora que simula um caderno físico em 3D. Desenvolvido inteiramente com tecnologias web nativas (Vanilla JS, HTML e CSS, sem uso de frameworks), ele oferece animações fluidas de virada de página, suporte robusto a múltiplos idiomas e armazenamento local.

## ✨ Funcionalidades

- **Experiência 3D Imersiva:** Animações realistas usando **CSS 3D transforms**, **perspective** e texturas geradas para simular a capa de couro no caderno.
- **Gestão de Tarefas Prática:** Adicione novas páginas, crie tarefas, marque-as como concluídas e arquive-as que já foram finalizadas.
- **Edição Inline Dinâmica:** Edite títulos e tarefas das páginas com um simples duplo clique direto no texto.
- **Persistência de Dados Offline:** Seus dados (páginas, tarefas e o estado em que o caderno foi fechado) são salvos automaticamente no `localStorage` do navegador.
- **Internacionalização (i18n):** Sistema de idiomas próprio com suporte completo a **9 idiomas** (*Português, Inglês, Espanhol, Francês, Italiano, Alemão, Japonês, Chinês e Russo*).
- **Responsivo:** Layout adaptável para desktops, tablets e smartphones (ajustando a visualização e escala baseado no tamanho e orientação da tela).

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e limpa.
- **CSS3:** Variáveis nativas, transformações 3D (`transform-style: preserve-3d`), flexbox, manipulação avançada de seletores e pseudo-classes.
- **JavaScript (ES6+):** - Programação Orientada a Objetos (Classes para os Controllers).
  - Manipulação avançada de DOM livre de vazamento de memória.
  - ES Modules para organização de arquitetura.

## 🚀 Como Executar o Projeto Localmente

1. Clone este repositório:
   ```bash
   git clone "https://github.com/kaikdandrade/Task-Notebook.git"
   ```

2. Acesse a pasta do projeto:
  ```bash
  cd Task-Notebook
  ```

3. Abra o projeto via servidor local:
Devido ao uso de ES Modules (`type="module"`), você precisará rodar o projeto através de um servidor HTTP local (como a extensão **Live Server** do **VSCode**) para evitar erros de CORS no navegador.

## 📁 Estrutura do Projeto

```text
📂 Task-Notebook
├── 📄 index.html             # Estrutura principal
├── 📄 style.css              # Estilos gerais e animações do Caderno 3D
├── 📂 js/
│   ├── 📄 main.js            # Arquivo de inicialização e eventos principais
│   ├── 📄 metadata.js        # Metadados e versão da aplicação
│   ├── 📂 controller/      
│   │   ├── 📄 NotebookController.js # Lógica de negócios e banco de dados local
│   │   └── 📄 LanguageController.js # Motor de internacionalização (i18n)
│   └── 📂 language/        
│       ├── 📄 language.js    # Implementação de UI para os idiomas
│       └── 📄 dictionary.js  # Dicionário central de traduções
└── 📂 public/                # Ícones e imagens da aplicação
```

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE). Veja o arquivo `LICENSE` para mais detalhes.

---
<p align="center">
  Desenvolvido com dedicação por <a href="[https://github.com/kaikdandrade](https://github.com/kaikdandrade)">Kaik D' Andrade</a>
</p>