import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

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
  });
}

console.log('Successfully bundled all standalone serverless endpoints into api/*.js');
