import { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { LiteStudioLogo } from './components/LiteStudioLogo';
import { FileTreeNode } from './components/FileTreeNode';
import { buildCompiledDocument } from './utils/compiler';
import './App.css'; 

function App() {
  const [fileTree, setFileTree] = useState([]);
  const [rootHandle, setRootHandle] = useState(null); 
  const [openFiles, setOpenFiles] = useState([]); 
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [previewDoc, setPreviewDoc] = useState("");
  
  const [previewWidth, setPreviewWidth] = useState(40); 
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const sidebarWidth = 250;
      const containerWidth = window.innerWidth - sidebarWidth;
      const newPreviewWidth = ((window.innerWidth - e.clientX) / containerWidth) * 100;
      if (newPreviewWidth > 15 && newPreviewWidth < 85) setPreviewWidth(newPreviewWidth);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize'; 
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
      setFileTree(await readDirectory(dirHandle));
      setOpenFiles([]);
      setActiveTabIndex(-1);
      setPreviewDoc("");
    } catch (error) { console.error("Access denied:", error); }
  };

  const createNewFile = async (targetDirHandle = rootHandle) => {
    if (!targetDirHandle) return;
    const fileName = prompt("Enter new file name (e.g., component.js):");
    if (!fileName) return;
    try {
      const newFileHandle = await targetDirHandle.getFileHandle(fileName, { create: true });
      setFileTree(await readDirectory(rootHandle));
      openFileInTab(newFileHandle);
    } catch (error) { alert("Could not create file."); }
  };

  const createNewFolder = async (targetDirHandle = rootHandle) => {
    if (!targetDirHandle) return;
    const folderName = prompt("Enter new folder name:");
    if (!folderName) return;
    try {
      await targetDirHandle.getDirectoryHandle(folderName, { create: true });
      setFileTree(await readDirectory(rootHandle));
    } catch (error) { alert("Could not create folder."); }
  };

  const openFileInTab = async (fileHandle) => {
    try {
      const existingIndex = openFiles.findIndex(f => f.name === fileHandle.name);
      if (existingIndex !== -1) return setActiveTabIndex(existingIndex);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const newOpenFiles = [...openFiles, { handle: fileHandle, name: fileHandle.name, content: text, savedContent: text }];
      setOpenFiles(newOpenFiles);
      setActiveTabIndex(newOpenFiles.length - 1); 
    } catch (error) { console.error("Error reading file:", error); }
  };

  const closeTab = (e, indexToClose) => {
    e.stopPropagation(); 
    const file = openFiles[indexToClose];
    if (file.content !== file.savedContent && !window.confirm(`${file.name} has unsaved changes. Close anyway?`)) return;
    const updated = openFiles.filter((_, idx) => idx !== indexToClose);
    setOpenFiles(updated);
    if (updated.length === 0) setActiveTabIndex(-1);
    else if (indexToClose <= activeTabIndex) setActiveTabIndex(Math.max(0, activeTabIndex - 1));
  };

  const updateActiveFileContent = (newContent) => {
    if (activeTabIndex === -1) return;
    const updated = [...openFiles];
    updated[activeTabIndex].content = newContent;
    setOpenFiles(updated);
  };

  const saveFile = async () => {
    if (activeTabIndex === -1) return; 
    const file = openFiles[activeTabIndex];
    try {
      const writable = await file.handle.createWritable();
      await writable.write(file.content);
      await writable.close();
      const updated = [...openFiles];
      updated[activeTabIndex].savedContent = file.content;
      setOpenFiles(updated);
    } catch (error) { console.error("Error saving:", error); }
  };


  const runCompiler = async () => {
    const finalHtml = await buildCompiledDocument(openFiles, fileTree);
    setPreviewDoc(finalHtml);
  };

  const activeFileContent = activeTabIndex !== -1 ? openFiles[activeTabIndex].content : "";
  const actionBtnStyle = { background: 'transparent', border: 'none', color: '#d4d4d4', cursor: 'pointer', fontSize: '13px', padding: '2px 4px', marginLeft: '4px' };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: 'white', overflow: 'hidden' }}>
      
      <div style={{ width: '250px', borderRight: '1px solid #333', padding: '1.5rem 1rem', overflowY: 'auto', backgroundColor: '#181818' }}>
        <LiteStudioLogo />
        <button 
          onClick={openFolder} 
          style={{ padding: '10px', width: '100%', marginBottom: '1.5rem', cursor: 'pointer', backgroundColor: '#007acc', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', transition: '0.2s' }}
        >
          {rootHandle ? 'Switch Workspace' : 'Open Workspace'}
        </button>

        {rootHandle && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#858585', letterSpacing: '1px' }}>EXPLORER</span>
            <div>
              <button onClick={() => createNewFile(rootHandle)} style={actionBtnStyle}>📄+</button>
              <button onClick={() => createNewFolder(rootHandle)} style={actionBtnStyle}>📁+</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {fileTree.map((node) => (
            <FileTreeNode key={node.name} node={node} onFileClick={openFileInTab} onCreateFile={createNewFile} onCreateFolder={createNewFolder} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '15%' }}>
          <div style={{ display: 'flex', backgroundColor: '#252526', overflowX: 'auto' }}>
            {openFiles.map((file, index) => (
              <div 
                key={file.name} onClick={() => setActiveTabIndex(index)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: index === activeTabIndex ? '#1e1e1e' : '#2d2d2d',
                  borderTop: index === activeTabIndex ? '2px solid #007acc' : '2px solid transparent', borderRight: '1px solid #333', cursor: 'pointer', fontSize: '14px', minWidth: '120px', userSelect: 'none'
                }}
              >
                <span style={{ flex: 1, marginRight: '12px', display: 'flex', alignItems: 'center', color: index === activeTabIndex ? '#ffffff' : '#969696' }}>
                  {file.name} {file.content !== file.savedContent && <span style={{ marginLeft: '6px', color: '#e2c08d', fontSize: '18px', lineHeight: '0' }}>•</span>}
                </span>
                <button onClick={(e) => closeTab(e, index)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px', padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {activeTabIndex !== -1 ? <CodeEditor code={activeFileContent} onChange={updateActiveFileContent} onSave={saveFile} /> : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Select a file to start editing</div>}
          </div>
        </div>

        <div 
          onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
          style={{ width: '4px', backgroundColor: isDragging ? '#007acc' : '#333', cursor: 'col-resize', zIndex: 50, transition: 'background-color 0.2s ease' }}
          onMouseOver={(e) => !isDragging && (e.target.style.backgroundColor = '#555')}
          onMouseOut={(e) => !isDragging && (e.target.style.backgroundColor = '#333')}
        />

        <div style={{ width: `${previewWidth}%`, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', minWidth: '15%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f3f3', padding: '8px 16px', borderBottom: '1px solid #ccc' }}>
            <span style={{ color: '#333', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Live Preview</span>
            <button onClick={runCompiler} style={{ padding: '6px 16px', backgroundColor: '#107c10', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>▶ Run Code</button>
          </div>
          <iframe title="sandbox" srcDoc={previewDoc} sandbox="allow-scripts allow-modals" style={{ flex: 1, display: 'block', width: '100%', border: 'none', backgroundColor: '#ffffff', pointerEvents: isDragging ? 'none' : 'auto' }} />
        </div>

      </div>
    </div>
  );
}

export default App;