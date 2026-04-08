class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    if (!word) return;
    let current = this.root;
    for (let char of word) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
  }

  clear() {
    this.root = new TrieNode();
  }

  searchPrefix(prefix) {
    if (!prefix) return [];
    
    let current = this.root;
    for (let char of prefix) {
      if (!current.children[char]) return [];
      current = current.children[char];
    }
    
    return this._getWordsFromNode(current, prefix);
  }

  _getWordsFromNode(node, currentWord) {
    let words = [];
    if (node.isEndOfWord) {
      words.push(currentWord);
    }
    
    for (let char in node.children) {
      words.push(...this._getWordsFromNode(node.children[char], currentWord + char));
    }
    
    return words;
  }
}