export const buildCompiledDocument = async (openFiles, fileTree) => {
  const getFileContentByPath = async (filePath) => {
    let cleanPath = filePath.replace(/^(\.\/|\/)/, '');
    const pathParts = cleanPath.split('/');
    const targetFileName = pathParts.pop();

    const openFile = openFiles.find(f => f.name === targetFileName);
    if (openFile) return openFile.content;

    let currentLevel = fileTree;
    for (const folderName of pathParts) {
      const folderNode = currentLevel.find(n => n.kind === 'directory' && n.name === folderName);
      if (!folderNode) return ""; 
      currentLevel = folderNode.children; 
    }

    const fileNode = currentLevel.find(n => n.kind === 'file' && n.name === targetFileName);
    if (!fileNode) return ""; 
    const file = await fileNode.handle.getFile();
    return await file.text();
  };

  let bundledHtml = await getFileContentByPath('index.html');
  if (!bundledHtml) {
    return '<h2 style="font-family: sans-serif; color: #555; text-align: center; margin-top: 20px;">Please create an index.html file.</h2>';
  }

  const reactScripts = `
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  `;
  
  if (bundledHtml.includes('<head>')) {
    bundledHtml = bundledHtml.replace('<head>', `<head>\n${reactScripts}`);
  } else {
    bundledHtml = `${reactScripts}\n${bundledHtml}`;
  }

  const cssRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  for (const match of [...bundledHtml.matchAll(cssRegex)]) {
    const filePath = match[1];  
    if (filePath.endsWith('.css')) {
      const cssContent = await getFileContentByPath(filePath); 
      bundledHtml = bundledHtml.replace(match[0], `<style>\n${cssContent}\n</style>`);
    }
  }

  const jsRegex = /<script\s+[^>]*src=["'](?!http)([^"']+)["'][^>]*><\/script>/gi;
  for (const match of [...bundledHtml.matchAll(jsRegex)]) {
    const filePath = match[1];  
    const jsContent = await getFileContentByPath(filePath); 
    bundledHtml = bundledHtml.replace(match[0], `<script type="text/babel">\n${jsContent}\n</script>`);
  }

  return bundledHtml;
};