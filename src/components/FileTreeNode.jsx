import { useState } from 'react';

const actionButtonStyle = {
  background: 'transparent', border: 'none', color: '#d4d4d4', 
  cursor: 'pointer', fontSize: '13px', padding: '2px 4px', marginLeft: '4px'
};

export const FileTreeNode = ({ node, onFileClick, onCreateFile, onCreateFolder }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (node.kind === 'file') {
    return (
      <div 
        onClick={() => onFileClick(node.handle)}
        style={{ padding: '6px 0', cursor: 'pointer', fontSize: '14px', paddingLeft: '20px', color: '#cccccc' }}
      >
        📄 {node.name}
      </div>
    );
  }

  return (
    <div>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer', color: '#e8e8e8' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {isOpen ? '📂' : '📁'} {node.name}
        </span>
        {isOpen && (
          <div>
            <button style={actionButtonStyle} title="New File Here" onClick={(e) => { e.stopPropagation(); onCreateFile(node.handle); }}>📄+</button>
            <button style={actionButtonStyle} title="New Folder Here" onClick={(e) => { e.stopPropagation(); onCreateFolder(node.handle); }}>📁+</button>
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
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder} 
            />
          ))}
        </div>
      )}
    </div>
  );
};