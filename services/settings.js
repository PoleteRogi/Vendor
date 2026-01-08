const fs = require('fs');
const path = require('path');

const data = {};

// Resolve MAIN process folder (entry file directory)
const MAIN_DIR = path.dirname(require.main.filename);
const SETTINGS_PATH = path.join(MAIN_DIR, '.settings');

function updateLocalData() {
    if (!fs.existsSync(SETTINGS_PATH)) {
        console.warn('.settings file not found');
        return;
    }

    const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');

    raw.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const [key, ...rest] = trimmed.split('=');
        data[key.trim()] = eval(rest.join('=').trim());
    });
}

function updateDataFile()
{
    fs.writeFileSync(SETTINGS_PATH, Object.entries(data).map(([key, value]) => `${key}=${value}`).join('\n'));
}

function get(value) {
    updateLocalData();
    return data[value];
}

function getAll() {
    updateLocalData();
    return data;
}

function set(key, value) {
    data[key] = value;
    updateDataFile();
}

module.exports = {
    get,
    getAll,
    set
};