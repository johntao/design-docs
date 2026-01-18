/**
 * Utility functions for Card Peeker
 */
const Utils = {
  /**
   * Parse namespace from full path
   * @param {string} fullPath - e.g., "user-type/dev"
   * @returns {string} - e.g., "user-type"
   */
  parseNamespace(fullPath) {
    const idx = fullPath.indexOf('/');
    return idx === -1 ? fullPath : fullPath.substring(0, idx);
  },

  /**
   * Parse title from full path
   * @param {string} fullPath - e.g., "user-type/dev"
   * @returns {string} - e.g., "dev"
   */
  parseTitle(fullPath) {
    const idx = fullPath.indexOf('/');
    return idx === -1 ? fullPath : fullPath.substring(idx + 1);
  },

  /**
   * Check if path has namespace
   * @param {string} fullPath
   * @returns {boolean}
   */
  hasNamespace(fullPath) {
    return fullPath.includes('/');
  },

  /**
   * Convert string to slug (ID-safe)
   * @param {string} str
   * @returns {string}
   */
  slugify(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  },

  /**
   * Create DOM element with classes and attributes
   * @param {string} tag
   * @param {string[]} classes
   * @param {Object} attrs
   * @returns {HTMLElement}
   */
  createElement(tag, classes = [], attrs = {}) {
    const el = document.createElement(tag);
    if (classes.length) {
      el.classList.add(...classes);
    }
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  },

  /**
   * Debounce function calls
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Set data attribute on element
   * @param {HTMLElement} el
   * @param {string} key
   * @param {string} value
   */
  setData(el, key, value) {
    el.dataset[key] = value;
  },

  /**
   * Get data attribute from element
   * @param {HTMLElement} el
   * @param {string} key
   * @returns {string}
   */
  getData(el, key) {
    return el.dataset[key];
  }
};
