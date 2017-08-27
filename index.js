const fs = require('fs');
const path = require('path');

let mounted = false;

let STORAGE_PATH;
let STORAGE_FILE = 'settings.json';

let cache = {};

function save() {
  return fs.writeFileSync(STORAGE_FILE, JSON.stringify(cache));
}

function mount(name) {
  if (!mounted) {
    STORAGE_PATH = path.join(getOsStoragePath(), name);
    if (!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH);
    STORAGE_FILE = path.join(STORAGE_PATH, STORAGE_FILE);
    mounted = true;
  }
  try {
    cache = require(STORAGE_FILE);
  } catch (err) {} // eslint-disable-line no-empty

  return {
    get: (key) => cache[key],
    has: (key) => Reflect.has(cache, key),
    set: (key, value) => {
      const ret = cache[key] = value;
      save();
      return ret;
    },
    delete: (key) => {
      const ret = delete cache[key];
      save();
      return ret;
    },
  };
}

module.exports = mount;

function getOsStoragePath() {
  switch (process.platform) {
    case 'win32':
      return process.env.APPDATA;
    case 'darwin':
    case 'linux':
      return `${process.env.HOME}/.config`;
    default:
      return '.';
  }
}
