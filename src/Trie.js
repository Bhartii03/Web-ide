// src/Trie.js

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

  // 1. Insert a word into the dictionary
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

  // 2. Clear the dictionary (useful when switching files)
  clear() {
    this.root = new TrieNode();
  }

  // 3. Find all words that start with a specific prefix
  searchPrefix(prefix) {
    if (!prefix) return [];
    
    let current = this.root;
    // Walk down the tree to the end of the prefix
    for (let char of prefix) {
      if (!current.children[char]) return []; // Prefix doesn't exist
      current = current.children[char];
    }
    
    // We found the prefix node, now grab all complete words branching from here
    return this._getWordsFromNode(current, prefix);
  }

  // Helper: Recursively traverse the tree to collect words
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