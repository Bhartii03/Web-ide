# ⚡ LiteStudio: Zero-Backend Web IDE & Compiler

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Babel](https://img.shields.io/badge/Babel-F9DC3E?style=for-the-badge&logo=babel&logoColor=black)

LiteStudio is a professional-grade, zero-backend Integrated Development Environment (IDE) built entirely in the browser. 

Unlike traditional web editors that rely on heavy backend servers to compile code, LiteStudio utilizes an **in-memory document compiler**, live **Babel transpilation**, and the **Web File System Access API** to provide a secure, zero-latency local development experience natively within the client.

## 🚀 Architectural Highlights

### 1. Live React & JSX Transpilation
Built a custom client-side web bundler that dynamically resolves nested file paths and injects dependencies. The compiler automatically detects JavaScript files, injects the React & ReactDOM CDNs, and utilizes **Babel Standalone** to transpile JSX into pure JavaScript in real-time inside a secure iframe sandbox.

### 2. Resizable Split-Pane UI & Iframe Sandboxing
Engineered a custom, draggable split-screen interface allowing users to dynamically scale the editor and live preview panes. Implemented an "iframe mouse-trap" bypass using pointer-event state management to ensure flawless dragging across cross-origin boundaries.

### 3. Recursive Virtual File System
Integrated the native browser Web File System Access API to allow users to read, create, update, and delete files directly on their local hard drives. 
* Implemented recursive React components to render deeply nested folder structures.
* Built a custom multi-tab state manager that tracks file snapshots to provide real-time unsaved change indicators (`•`).

### 4. Modular, Enterprise-Grade Architecture
Refactored a monolithic application into a highly modular React architecture, strictly separating UI Components (`/components`), Compiler utilities (`/utils`), and State Management orchestrators to ensure scalable and maintainable code.

## 🛠️ Technologies & Capabilities

* **Core Stack:** React.js, Vite, JavaScript (ES6+), HTML5, CSS3
* **Compilers & Parsers:** Babel (JSX Transpilation), Regular Expressions (AST Parsing)
* **Browser APIs:** Web File System Access API, HTML5 `<iframe>` Sandboxing
* **Supported Environments:** Vanilla JS, React, Vue, Tailwind CSS, Three.js (WebGL)

## 💻 Running Locally

To run LiteStudio on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Bhartii03/Web-ide.git](https://github.com/Bhartii03/Web-ide.git)

 2. **Navigate to the directory:**
    ```bash
    cd web-ide

3. **Install dependencies**
    ```bash
    npm install

4. **Start the development**
    ```bash
    npm run dev  

***

Note: For the Web File System Access API to function properly, the application must be run in a secure context (localhost or HTTPS) on a Chromium-based browser (Chrome, Edge, Brave).
