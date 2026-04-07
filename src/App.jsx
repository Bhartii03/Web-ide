// import { useState } from "react";
// import CodeEditor from "./CodeEditor";
// import "./App.css";

// const FileTreeNode = ({ node, onFileClick }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   if (node.kind === "file") {
//     return (
//       <div
//         onClick={() => onFileClick(node.handle)}
//         style={{
//           padding: "4px 0",
//           cursor: "pointer",
//           fontSize: "14px",
//           paddingLeft: "20px",
//         }}
//       >
//         📄 {node.name}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div
//         onClick={() => setIsOpen(!isOpen)}
//         style={{
//           padding: "4px 0",
//           cursor: "pointer",
//           fontSize: "14px",
//           fontWeight: "bold",
//         }}
//       >
//         {isOpen ? "📂" : "📁"} {node.name}
//       </div>
//       {isOpen && (
//         <div style={{ borderLeft: "1px solid #444", marginLeft: "8px" }}>
//           {node.children.map((childNode) => (
//             <FileTreeNode
//               key={childNode.handle.name}
//               node={childNode}
//               onFileClick={onFileClick}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// function App() {
//   const [fileTree, setFileTree] = useState([]);
//   const [openFiles, setOpenFiles] = useState([]);
//   const [activeTabIndex, setActiveTabIndex] = useState(-1);

//   // --- EXECUTION ENGINE STATE ---
//   const [previewDoc, setPreviewDoc] = useState("");

//   const readDirectory = async (dirHandle) => {
//     const entries = [];
//     for await (const entry of dirHandle.values()) {
//       if (entry.name === "node_modules" || entry.name === ".git") continue;

//       if (entry.kind === "file") {
//         entries.push({ name: entry.name, kind: "file", handle: entry });
//       } else if (entry.kind === "directory") {
//         entries.push({
//           name: entry.name,
//           kind: "directory",
//           handle: entry,
//           children: await readDirectory(entry),
//         });
//       }
//     }
//     return entries.sort((a, b) => {
//       if (a.kind === b.kind) return a.name.localeCompare(b.name);
//       return a.kind === "directory" ? -1 : 1;
//     });
//   };

//   const openFolder = async () => {
//     try {
//       const dirHandle = await window.showDirectoryPicker();
//       const tree = await readDirectory(dirHandle);
//       setFileTree(tree);
//     } catch (error) {
//       console.error("Access denied:", error);
//     }
//   };

//   const openFileInTab = async (fileHandle) => {
//     try {
//       const existingIndex = openFiles.findIndex(
//         (f) => f.name === fileHandle.name,
//       );
//       if (existingIndex !== -1) {
//         setActiveTabIndex(existingIndex);
//         return;
//       }

//       const file = await fileHandle.getFile();
//       const text = await file.text();

//       const newFile = {
//         handle: fileHandle,
//         name: fileHandle.name,
//         content: text,
//         savedContent: text,
//       };

//       const newOpenFiles = [...openFiles, newFile];
//       setOpenFiles(newOpenFiles);
//       setActiveTabIndex(newOpenFiles.length - 1);
//     } catch (error) {
//       console.error("Error reading file:", error);
//     }
//   };

//   const closeTab = (e, indexToClose) => {
//     e.stopPropagation();

//     const fileToClose = openFiles[indexToClose];
//     if (fileToClose.content !== fileToClose.savedContent) {
//       const confirmClose = window.confirm(
//         `${fileToClose.name} has unsaved changes. Are you sure you want to close it?`,
//       );
//       if (!confirmClose) return;
//     }

//     const updatedFiles = openFiles.filter((_, index) => index !== indexToClose);
//     setOpenFiles(updatedFiles);

//     if (updatedFiles.length === 0) {
//       setActiveTabIndex(-1);
//     } else if (indexToClose === activeTabIndex) {
//       setActiveTabIndex(Math.max(0, indexToClose - 1));
//     } else if (indexToClose < activeTabIndex) {
//       setActiveTabIndex(activeTabIndex - 1);
//     }
//   };

//   const updateActiveFileContent = (newContent) => {
//     if (activeTabIndex === -1) return;
//     const updatedFiles = [...openFiles];
//     updatedFiles[activeTabIndex].content = newContent;
//     setOpenFiles(updatedFiles);
//   };

//   const saveFile = async () => {
//     if (activeTabIndex === -1) return;

//     const activeFile = openFiles[activeTabIndex];
//     try {
//       const writable = await activeFile.handle.createWritable();
//       await writable.write(activeFile.content);
//       await writable.close();

//       const updatedFiles = [...openFiles];
//       updatedFiles[activeTabIndex].savedContent = activeFile.content;
//       setOpenFiles(updatedFiles);

//       console.log(`${activeFile.name} saved successfully!`);
//     } catch (error) {
//       console.error("Error saving file:", error);
//     }
//   };

//   const runCompiler = async () => {
//     // Helper to search the Tree structure
//     const findFileHandle = (tree, name) => {
//       for (const node of tree) {
//         if (node.kind === "file" && node.name === name) return node.handle;
//         if (node.kind === "directory" && node.children) {
//           const found = findFileHandle(node.children, name);
//           if (found) return found;
//         }
//       }
//       return null;
//     };

//     // Advanced Memory Resolution: Check open tabs first, then fallback to Disk
//     const getFileContent = async (fileName) => {
//       const openFile = openFiles.find((f) => f.name === fileName);
//       if (openFile) return openFile.content;

//       const handle = findFileHandle(fileTree, fileName);
//       if (!handle) return ""; // File not found

//       const file = await handle.getFile();
//       return await file.text();
//     };

//     // 1. Get the entry point (index.html is required)
//     let bundledHtml = await getFileContent("index.html");

//     if (!bundledHtml) {
//       setPreviewDoc(
//         '<h2 style="font-family: sans-serif; color: #555; text-align: center; margin-top: 20px;">Please create an index.html file to act as the entry point.</h2>',
//       );
//       return;
//     }

//     // 2. Parse and Inject CSS files
//     // Matches: <link rel="stylesheet" href="custom-name.css">
//     const cssRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
//     const cssMatches = [...bundledHtml.matchAll(cssRegex)];
//     for (const match of cssMatches) {
//       const fullTag = match[0];   
//       let fileName = match[1];  
      
//       // FIX: Clean relative paths (e.g., convert "./theme.css" to "theme.css")
//       if (fileName.startsWith('./')) fileName = fileName.substring(2);
      
//       if (fileName.endsWith('.css')) {
//         const cssContent = await getFileContent(fileName);
//         bundledHtml = bundledHtml.replace(fullTag, `<style>\n${cssContent}\n</style>`);
//       }
//     }

//     // 3. Parse and Inject JS files
//     // Matches: <script src="custom-name.js"></script>
//     const jsRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
//     const jsMatches = [...bundledHtml.matchAll(jsRegex)];
//     for (const match of jsMatches) {
//       const fullTag = match[0];   
//       let fileName = match[1];  
      
//       // FIX: Clean relative paths
//       if (fileName.startsWith('./')) fileName = fileName.substring(2);
      
//       const jsContent = await getFileContent(fileName);
//       bundledHtml = bundledHtml.replace(fullTag, `<script>\n${jsContent}\n</script>`);
//     }

//     // 4. Send the compiled, dependency-injected document to the iframe
//     setPreviewDoc(bundledHtml);
//   };

//   const activeFileContent =
//     activeTabIndex !== -1 ? openFiles[activeTabIndex].content : "";

//   return (
//     <div
//       style={{
//         display: "flex",
//         height: "100vh",
//         backgroundColor: "#1e1e1e",
//         color: "white",
//       }}
//     >
//       {/* SIDEBAR */}
//       <div
//         style={{
//           width: "250px",
//           borderRight: "1px solid #333",
//           padding: "1rem",
//           overflowY: "auto",
//         }}
//       >
//         <button
//           onClick={openFolder}
//           style={{
//             padding: "8px",
//             width: "100%",
//             marginBottom: "1rem",
//             cursor: "pointer",
//             backgroundColor: "#007acc",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//           }}
//         >
//           Open Workspace
//         </button>
//         <div style={{ display: "flex", flexDirection: "column" }}>
//           {fileTree.map((node) => (
//             <FileTreeNode
//               key={node.name}
//               node={node}
//               onFileClick={openFileInTab}
//             />
//           ))}
//         </div>
//       </div>

//       {/* SPLIT SCREEN CONTAINER */}
//       <div style={{ flex: 1, display: "flex" }}>
//         {/* LEFT PANE: Editor Area */}
//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//             borderRight: "1px solid #333",
//             minWidth: "40%",
//           }}
//         >
//           {/* TAB BAR */}
//           <div
//             style={{
//               display: "flex",
//               backgroundColor: "#252526",
//               overflowX: "auto",
//             }}
//           >
//             {openFiles.map((file, index) => {
//               const isDirty = file.content !== file.savedContent;
//               return (
//                 <div
//                   key={file.name}
//                   onClick={() => setActiveTabIndex(index)}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "8px 16px",
//                     backgroundColor:
//                       index === activeTabIndex ? "#1e1e1e" : "#2d2d2d",
//                     borderTop:
//                       index === activeTabIndex
//                         ? "2px solid #007acc"
//                         : "2px solid transparent",
//                     borderRight: "1px solid #333",
//                     cursor: "pointer",
//                     fontSize: "14px",
//                     minWidth: "120px",
//                     userSelect: "none",
//                   }}
//                 >
//                   <span
//                     style={{
//                       flex: 1,
//                       marginRight: "12px",
//                       display: "flex",
//                       alignItems: "center",
//                     }}
//                   >
//                     {file.name}
//                     {isDirty && (
//                       <span
//                         style={{
//                           marginLeft: "6px",
//                           color: "#e2c08d",
//                           fontSize: "18px",
//                           lineHeight: "0",
//                         }}
//                       >
//                         •
//                       </span>
//                     )}
//                   </span>
//                   <button
//                     onClick={(e) => closeTab(e, index)}
//                     style={{
//                       background: "transparent",
//                       border: "none",
//                       color: "#999",
//                       cursor: "pointer",
//                       fontSize: "16px",
//                       padding: 0,
//                     }}
//                   >
//                     ×
//                   </button>
//                 </div>
//               );
//             })}
//           </div>

//           {/* EDITOR */}
//           <div style={{ flex: 1, position: "relative" }}>
//             {activeTabIndex !== -1 ? (
//               <CodeEditor
//                 code={activeFileContent}
//                 onChange={updateActiveFileContent}
//                 onSave={saveFile}
//               />
//             ) : (
//               <div
//                 style={{
//                   display: "flex",
//                   height: "100%",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "#666",
//                 }}
//               >
//                 Select a file to start editing
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT PANE: Live Preview Execution Area */}
//         <div
//           style={{
//             width: "40%",
//             display: "flex",
//             flexDirection: "column",
//             backgroundColor: "#ffffff",
//           }}
//         >
//           {/* Action Bar */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               backgroundColor: "#f3f3f3",
//               padding: "8px 16px",
//               borderBottom: "1px solid #ccc",
//             }}
//           >
//             <span
//               style={{
//                 color: "#333",
//                 fontSize: "12px",
//                 fontWeight: "bold",
//                 textTransform: "uppercase",
//               }}
//             >
//               Live Preview
//             </span>
//             <button
//               onClick={runCompiler}
//               style={{
//                 padding: "6px 16px",
//                 backgroundColor: "#107c10",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "4px",
//                 cursor: "pointer",
//                 fontWeight: "bold",
//                 fontSize: "12px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//               }}
//             >
//               ▶ Run Code
//             </button>
//           </div>

//           <iframe
//             title="sandbox"
//             srcDoc={previewDoc}
//             sandbox="allow-scripts allow-modals" 
//             style={{
//               width: "100%",
//               height: "100%",
//               border: "none",
//               backgroundColor: "#ffffff",
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
import { useState } from 'react';
import CodeEditor from './CodeEditor';
import './App.css'; 

// Helper styles for our tiny buttons
const actionButtonStyle = {
  background: 'transparent', border: 'none', color: '#d4d4d4', 
  cursor: 'pointer', fontSize: '13px', padding: '2px 4px', marginLeft: '4px'
};

// --- UPGRADED RECURSIVE UI COMPONENT ---
const FileTreeNode = ({ node, onFileClick, onCreateFile, onCreateFolder }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (node.kind === 'file') {
    return (
      <div 
        onClick={() => onFileClick(node.handle)}
        style={{ padding: '6px 0', cursor: 'pointer', fontSize: '14px', paddingLeft: '20px' }}
      >
        📄 {node.name}
      </div>
    );
  }

  // If it's a directory, render the folder AND its own specific creation buttons!
  return (
    <div>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {isOpen ? '📂' : '📁'} {node.name}
        </span>
        
        {/* NEW: Inline action buttons that only appear when the folder is open */}
        {isOpen && (
          <div>
            <button 
              style={actionButtonStyle} title="New File Here"
              onClick={(e) => { e.stopPropagation(); onCreateFile(node.handle); }}
            >📄+</button>
            <button 
              style={actionButtonStyle} title="New Folder Here"
              onClick={(e) => { e.stopPropagation(); onCreateFolder(node.handle); }}
            >📁+</button>
          </div>
        )}
      </div>
      
      {isOpen && (
        <div style={{ borderLeft: '1px solid #444', marginLeft: '8px' }}>
          {node.children.map((childNode) => (
            <FileTreeNode 
              key={childNode.handle.name} 
              node={childNode} 
              onFileClick={onFileClick}
              onCreateFile={onCreateFile}     // Pass the functions down the tree
              onCreateFolder={onCreateFolder} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const [fileTree, setFileTree] = useState([]);
  const [rootHandle, setRootHandle] = useState(null); 
  const [openFiles, setOpenFiles] = useState([]); 
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [previewDoc, setPreviewDoc] = useState("");

  const readDirectory = async (dirHandle) => {
    const entries = [];
    for await (const entry of dirHandle.values()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (entry.kind === 'file') {
        entries.push({ name: entry.name, kind: 'file', handle: entry });
      } else if (entry.kind === 'directory') {
        entries.push({
          name: entry.name, kind: 'directory', handle: entry,
          children: await readDirectory(entry) 
        });
      }
    }
    return entries.sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === 'directory' ? -1 : 1;
    });
  };

  const openFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      setRootHandle(dirHandle); 
      const tree = await readDirectory(dirHandle);
      setFileTree(tree);
    } catch (error) {
      console.error("Access denied:", error);
    }
  };

  // ==========================================
  // UPGRADED FILE & FOLDER CREATION
  // Now accepts a specific target directory handle!
  // ==========================================
  const createNewFile = async (targetDirHandle = rootHandle) => {
    if (!targetDirHandle) return;
    const fileName = prompt("Enter new file name (e.g., component.js):");
    if (!fileName) return;

    try {
      // Create the file INSIDE the specific target directory
      const newFileHandle = await targetDirHandle.getFileHandle(fileName, { create: true });
      
      // Always refresh from the root so the whole sidebar updates correctly
      const tree = await readDirectory(rootHandle);
      setFileTree(tree);
      
      openFileInTab(newFileHandle);
    } catch (error) {
      console.error("Error creating file:", error);
      alert("Could not create file. Ensure the name is valid.");
    }
  };

  const createNewFolder = async (targetDirHandle = rootHandle) => {
    if (!targetDirHandle) return;
    const folderName = prompt("Enter new folder name:");
    if (!folderName) return;

    try {
      // Create the folder INSIDE the specific target directory
      await targetDirHandle.getDirectoryHandle(folderName, { create: true });
      
      const tree = await readDirectory(rootHandle);
      setFileTree(tree);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Could not create folder.");
    }
  };

  const openFileInTab = async (fileHandle) => {
    try {
      const existingIndex = openFiles.findIndex(f => f.name === fileHandle.name);
      if (existingIndex !== -1) {
        setActiveTabIndex(existingIndex);
        return;
      }
      const file = await fileHandle.getFile();
      const text = await file.text();
      
      const newFile = { handle: fileHandle, name: fileHandle.name, content: text, savedContent: text };
      const newOpenFiles = [...openFiles, newFile];
      setOpenFiles(newOpenFiles);
      setActiveTabIndex(newOpenFiles.length - 1); 
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const closeTab = (e, indexToClose) => {
    e.stopPropagation(); 
    const fileToClose = openFiles[indexToClose];
    if (fileToClose.content !== fileToClose.savedContent) {
      if (!window.confirm(`${fileToClose.name} has unsaved changes. Close anyway?`)) return;
    }
    const updatedFiles = openFiles.filter((_, index) => index !== indexToClose);
    setOpenFiles(updatedFiles);
    if (updatedFiles.length === 0) setActiveTabIndex(-1);
    else if (indexToClose <= activeTabIndex) setActiveTabIndex(Math.max(0, activeTabIndex - 1));
  };

  const updateActiveFileContent = (newContent) => {
    if (activeTabIndex === -1) return;
    const updatedFiles = [...openFiles];
    updatedFiles[activeTabIndex].content = newContent;
    setOpenFiles(updatedFiles);
  };

  const saveFile = async () => {
    if (activeTabIndex === -1) return; 
    const activeFile = openFiles[activeTabIndex];
    try {
      const writable = await activeFile.handle.createWritable();
      await writable.write(activeFile.content);
      await writable.close();
      const updatedFiles = [...openFiles];
      updatedFiles[activeTabIndex].savedContent = activeFile.content;
      setOpenFiles(updatedFiles);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const runCompiler = async () => {
    
    // ==========================================
    // NEW: ADVANCED PATH RESOLUTION
    // ==========================================
    const getFileContentByPath = async (filePath) => {
      // 1. Clean the path (remove leading './' or '/')
      let cleanPath = filePath.replace(/^(\.\/|\/)/, '');
      
      // 2. Split the path into an array (e.g., ['components', 'button.js'])
      const pathParts = cleanPath.split('/');
      const targetFileName = pathParts.pop(); // Plucks 'button.js' off the end

      // 3. First, check Memory (Open Tabs)
      // Note: For simplicity, we match by name. A production IDE would match by exact file handle!
      const openFile = openFiles.find(f => f.name === targetFileName);
      if (openFile) return openFile.content;

      // 4. If not in memory, traverse the File Tree (Disk)
      let currentLevel = fileTree;

      // Walk down the folder structure step-by-step
      for (const folderName of pathParts) {
        const folderNode = currentLevel.find(n => n.kind === 'directory' && n.name === folderName);
        if (!folderNode) return ""; // If a folder is missing, abort
        currentLevel = folderNode.children; // Move deeper into the tree
      }

      // Find the specific file in that final folder
      const fileNode = currentLevel.find(n => n.kind === 'file' && n.name === targetFileName);
      if (!fileNode) return ""; 

      // Extract the text
      const file = await fileNode.handle.getFile();
      return await file.text();
    };

    // ------------------------------------------
    // THE COMPILER LOGIC
    // ------------------------------------------
    let bundledHtml = await getFileContentByPath('index.html');
    
    if (!bundledHtml) {
      setPreviewDoc('<h2 style="font-family: sans-serif; color: #555; text-align: center; margin-top: 20px;">Please create an index.html file at the root.</h2>');
      return;
    }

    // Parse and Inject CSS files (Now supports nested paths!)
    const cssRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    for (const match of [...bundledHtml.matchAll(cssRegex)]) {
      const fullTag = match[0];
      const filePath = match[1];  
      
      if (filePath.endsWith('.css')) {
        const cssContent = await getFileContentByPath(filePath); // <-- Uses new path resolver
        bundledHtml = bundledHtml.replace(fullTag, `<style>\n${cssContent}\n</style>`);
      }
    }

    // Parse and Inject JS files (Now supports nested paths!)
    const jsRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
    for (const match of [...bundledHtml.matchAll(jsRegex)]) {
      const fullTag = match[0];
      const filePath = match[1];  
      
      const jsContent = await getFileContentByPath(filePath); // <-- Uses new path resolver
      bundledHtml = bundledHtml.replace(fullTag, `<script>\n${jsContent}\n</script>`);
    }

    setPreviewDoc(bundledHtml);
  };

  const activeFileContent = activeTabIndex !== -1 ? openFiles[activeTabIndex].content : "";

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: 'white' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', borderRight: '1px solid #333', padding: '1rem', overflowY: 'auto' }}>
        <button 
          onClick={openFolder} 
          style={{ padding: '8px', width: '100%', marginBottom: '1rem', cursor: 'pointer', backgroundColor: '#007acc', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Open Workspace
        </button>

        {rootHandle && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#858585', letterSpacing: '1px' }}>EXPLORER</span>
            <div>
              {/* These default to the rootHandle */}
              <button onClick={() => createNewFile(rootHandle)} style={actionButtonStyle} title="New File at Root">📄+</button>
              <button onClick={() => createNewFolder(rootHandle)} style={actionButtonStyle} title="New Folder at Root">📁+</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {fileTree.map((node) => (
            <FileTreeNode 
              key={node.name} 
              node={node} 
              onFileClick={openFileInTab} 
              onCreateFile={createNewFile}     // Pass functions to the tree
              onCreateFolder={createNewFolder} 
            />
          ))}
        </div>
      </div>

      {/* SPLIT SCREEN CONTAINER */}
      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* LEFT PANE: Editor Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333', minWidth: '40%' }}>
          <div style={{ display: 'flex', backgroundColor: '#252526', overflowX: 'auto' }}>
            {openFiles.map((file, index) => (
              <div 
                key={file.name}
                onClick={() => setActiveTabIndex(index)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 16px',
                  backgroundColor: index === activeTabIndex ? '#1e1e1e' : '#2d2d2d',
                  borderTop: index === activeTabIndex ? '2px solid #007acc' : '2px solid transparent',
                  borderRight: '1px solid #333', cursor: 'pointer', fontSize: '14px', minWidth: '120px', userSelect: 'none'
                }}
              >
                <span style={{ flex: 1, marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                  {file.name}
                  {file.content !== file.savedContent && <span style={{ marginLeft: '6px', color: '#e2c08d', fontSize: '18px', lineHeight: '0' }}>•</span>}
                </span>
                <button onClick={(e) => closeTab(e, index)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px', padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {activeTabIndex !== -1 ? (
              <CodeEditor code={activeFileContent} onChange={updateActiveFileContent} onSave={saveFile} />
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                Select a file to start editing
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Preview Execution Area */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f3f3', padding: '8px 16px', borderBottom: '1px solid #ccc' }}>
            <span style={{ color: '#333', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Live Preview</span>
            <button 
              onClick={runCompiler}
              style={{ padding: '6px 16px', backgroundColor: '#107c10', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ▶ Run Code
            </button>
          </div>
          <iframe 
            title="sandbox"
            srcDoc={previewDoc}
            sandbox="allow-scripts allow-modals"
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
          />
        </div>

      </div>
    </div>
  );
}

export default App;