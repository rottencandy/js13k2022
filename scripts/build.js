const glslPlugin = require('esbuild-plugin-spglsl');

require('esbuild').build({
    entryPoints: ['src/main.ts', 'src/app.css'],
    bundle: true,
    minify: true,
    charset: 'utf8',
    target: 'es6',
    format: 'iife',
    outdir: 'app',
    mangleProps: /_$/,
    plugins: [glslPlugin({ minify: true, mangle: true })],
    loader: { '.png': 'dataurl' }
}).catch(() => process.exit(1))
