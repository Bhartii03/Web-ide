# ⚡ LiteStudio: Zero-Backend Web IDE & Document Compiler

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

LiteStudio is a professional-grade, zero-backend Integrated Development Environment (IDE) built entirely in the browser. 

Unlike traditional web editors that rely on heavy backend servers or Docker containers to compile and execute code, LiteStudio utilizes an **in-memory document compiler** and the **Web File System Access API** to provide a secure, zero-latency local development experience natively within the client.

## 🚀 Architectural Highlights

### 1. Zero-Backend Document Compiler
Built a custom client-side web bundler utilizing Regular Expressions for AST (Abstract Syntax Tree) parsing. The compiler dynamically resolves nested file paths (e.g., `scripts/app.js`), extracts raw text from the virtual file system, and injects CSS/JS dependencies into a highly secure, sandboxed `<iframe>` for real-time execution.

### 2. $O(L)$ Trie-Based Auto-Complete Engine
Replaced standard linear array filtering with a custom **Trie (Prefix Tree)** data structure. As the user types, the engine traverses the Trie in $O(L)$ time (where $L$ is the length of the current prefix), yielding highly efficient, real-time keyword and variable suggestions regardless of file size.

### 3. Single-Pass Lexical Analyzer
Engineered a custom syntax highlighting engine from scratch without relying on heavyweight libraries like Monaco or CodeMirror. Utilized Regex named capture groups to guarantee mutual exclusivity of tokens, parsing HTML, CSS, and JavaScript in a single, highly performant pass.

### 4. Recursive Virtual File System
Integrated the native browser Web File System Access API to allow users to read, create, update, and delete files directly on their local hard drives through the browser. 
* Implemented recursive React components to render nested folder structures.
* Built a custom multi-tab state manager that tracks file snapshots to provide real-time unsaved change indicators (`•`).

## 🛠️ Technologies Used

* **Frontend Framework:** React.js, Vite
* **Core Languages:** JavaScript (ES6+), HTML5, CSS3
* **Browser APIs:** Web File System Access API, HTML5 `<iframe>` Sandboxing (`allow-scripts`, `allow-modals`)
* **Algorithms & Data Structures:** Trie (Prefix Tree), Regular Expressions (Lexing & AST Parsing)
* **Deployment & CI/CD:** Vercel

## 💻 Running Locally

To run LiteStudio on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/LiteStudio.git](https://github.com/your-username/LiteStudio.git)

 2. **Navigate to the directory:**
    cd web-ide

3. **Install dependencies**
    npm install

4. **Start the development**
    npm run dev
