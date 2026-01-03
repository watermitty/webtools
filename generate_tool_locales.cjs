
const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, 'src/components/Tools/tools.ts');
const content = fs.readFileSync(toolsPath, 'utf8');

// Regex to match tool objects
// This is a simple regex assumption that tools are defined in list: [...] 
// and have name, title, desc, title_en, desc_en keys.
const toolRegex = /\{\s*id:[\s\S]*?title:\s*'([^']*)'(?:(?!title:)[\s\S])*?desc:\s*'([^']*)'[\s\S]*?name:\s*'([^']*)'[\s\S]*?title_en:\s*'([^']*)'[\s\S]*?desc_en:\s*'([^']*)'[\s\S]*?\}/g;

const toolsZh = {};
const toolsEn = {};

let match;
while ((match = toolRegex.exec(content)) !== null) {
    // title, desc, name, title_en, desc_en
    const [_, title, desc, name, title_en, desc_en] = match;
    toolsZh[name] = {
        title: title,
        desc: desc
    };
    toolsEn[name] = {
        title: title_en,
        desc: desc_en
    };
}

// Write to temporary files
fs.writeFileSync('tools_zh_partial.json', JSON.stringify(toolsZh, null, 2));
fs.writeFileSync('tools_en_partial.json', JSON.stringify(toolsEn, null, 2));

console.log('Generated locale partials.');
console.log('Count:', Object.keys(toolsZh).length);
