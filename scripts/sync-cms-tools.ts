import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../src/data/tools.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../public/admin/config.yml');

if (!fs.existsSync(configPath)) {
  console.warn('[sync-cms-tools] config.yml not found at:', configPath);
  process.exit(0);
}

const content = fs.readFileSync(configPath, 'utf8');

// Build the options YAML block
const optionsLines = [
  '          - { label: "কোনোটি নয়", value: "" }',
  ...TOOLS.map((tool) => `          - { label: "${tool.title} (${tool.link})", value: "${tool.link}" }`),
];

const newOptionsYaml = `options:\n${optionsLines.join('\n')}\n        required: false`;

// Regex to match the options block under name: "relatedTool"
const regex = /(name:\s*["']relatedTool["'][\s\S]*?widget:\s*["']select["'][\s\S]*?)options:[\s\S]*?required:\s*false/;

if (!regex.test(content)) {
  console.warn('[sync-cms-tools] Could not find relatedTool select widget pattern in config.yml');
  process.exit(0);
}

const updatedContent = content.replace(regex, `$1${newOptionsYaml}`);

if (updatedContent !== content) {
  fs.writeFileSync(configPath, updatedContent, 'utf8');
  console.log(`[sync-cms-tools] Successfully synced ${TOOLS.length} tools to public/admin/config.yml`);
} else {
  console.log(`[sync-cms-tools] config.yml already up to date with ${TOOLS.length} tools.`);
}
