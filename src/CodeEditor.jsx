import { useRef, useState, useEffect } from 'react';
import { Trie } from './Trie'; 
import './CodeEditor.css';

const highlightCode = (code) => {
  if (!code) return "";

  let safeCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'static', 'document', 'window'];
  
  const tokenizer = new RegExp(
    `(?<string>(["'])(?:(?!\\2)[^\\\\]|\\\\.)*\\2)|` + 
    `(?<comment>\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)|` +         
    `(?<htmlTag>&lt;\\/?\\w+.*?&gt;)|` +                      
    `(?<cssProp>\\b[a-zA-Z-]+(?=\\s*:))|` +               
    `(?<keyword>\\b(?:${keywords.join('|')})\\b)|` +  
    `(?<number>\\b\\d+px\\b|\\b\\d+rem\\b|\\b\\d+\\b|#(?:[0-9a-fA-F]{3}){1,2}\\b)`,
    'g'
  );

  return safeCode.replace(tokenizer, (match, ...args) => {
    const groups = args.pop(); 
    if (groups.string) return `<span class="token-string">${match}</span>`;
    if (groups.comment) return `<span class="token-comment">${match}</span>`;
    if (groups.htmlTag) return `<span style="color: #569cd6">${match}</span>`; 
    if (groups.cssProp) return `<span style="color: #9cdcfe">${match}</span>`; 
    if (groups.keyword) return `<span class="token-keyword">${match}</span>`;
    if (groups.number) return `<span class="token-number">${match}</span>`;
    return match; 
  });
};

export default function CodeEditor({ code, onChange, onSave }) {
  const preRef = useRef(null);
  const textareaRef = useRef(null);
  
  const trie = useRef(new Trie()); 
  const [suggestions, setSuggestions] = useState([]);
  const [activePrefix, setActivePrefix] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    trie.current.clear();
    
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'static', 'console', 'log'];
    keywords.forEach(kw => trie.current.insert(kw));

    const wordsInFile = code.match(/\b[a-zA-Z_]\w*\b/g) || [];
    wordsInFile.forEach(word => trie.current.insert(word));
  }, [code]);

  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPosition);
    
    const match = textBeforeCursor.match(/[a-zA-Z_]\w*$/); 

    if (match) {
      const prefix = match[0];
      setActivePrefix(prefix);
      
      const results = trie.current.searchPrefix(prefix);
      
      const filtered = results.filter(w => w !== prefix);
      
      setSuggestions(filtered.slice(0, 5));
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
      setActivePrefix("");
    }
  };

  const insertSuggestion = (suggestion) => {
    const cursorPosition = textareaRef.current.selectionStart;
    
    const beforePrefix = code.substring(0, cursorPosition - activePrefix.length);
    const afterPrefix = code.substring(cursorPosition);
    
    const newCode = beforePrefix + suggestion + afterPrefix;
    onChange(newCode);
    setSuggestions([]);
    
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = beforePrefix.length + suggestion.length;
    }, 0);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }

    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }

    if (e.key === 'Tab' && suggestions.length === 0) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="editor-container">
      
      {suggestions.length > 0 && (
        <div className="autocomplete-popup">
          <div className="autocomplete-header">Suggestions</div>
          {suggestions.map((suggestion, index) => (
            <div 
              key={suggestion}
              className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => insertSuggestion(suggestion)}
            >
              
              <span className="autocomplete-prefix">{activePrefix}</span>
              <span>{suggestion.substring(activePrefix.length)}</span>
            </div>
          ))}
        </div>
      )}

      <pre 
        ref={preRef} 
        className="editor-layer display-layer"
        dangerouslySetInnerHTML={{ __html: highlightCode(code) + '<br/>' }} 
        aria-hidden="true"
      />
      
      <textarea
        ref={textareaRef}
        className="editor-layer input-layer"
        value={code}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck="false"
      />
    </div>
  );
}