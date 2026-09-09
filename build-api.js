import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Clean api/*.js
if (!fs.existsSync('src/api')) {
  fs.mkdirSync('src/api', { recursive: true });
}

// Copy api/*.ts to src/api/*.ts if needed
const apiFiles = fs.readdirSync('api').filter(f => f.endsWith('.ts'));
for (const file of apiFiles) {
  const content = fs.readFileSync(path.join('api', file), 'utf-8');
  // Normalize import paths from ../src/core/... to ../core/...
  const normalized = content.replace(/from '\.\.\/src\/core\//g, "from '../core/");
  fs.writeFileSync(path.join('src/api', file), normalized, 'utf-8');
  // Remove api/*.ts so only bundled .js will live in api/
  fs.unlinkSync(path.join('api', file));
}

// Bundle each src/api/*.ts into api/*.js
const srcApiFiles = fs.readdirSync('src/api').filter(f => f.endsWith('.ts'));
console.log('Bundling serverless endpoints:', srcApiFiles);

for (const file of srcApiFiles) {
  const entryPoint = path.join('src/api', file);
  const outFile = path.join('api', file.replace(/\.ts$/, '.js'));

  esbuild.buildSync({
    entryPoints: [entryPoint],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  });
}

console.log('Successfully bundled all standalone serverless endpoints into api/*.js');
