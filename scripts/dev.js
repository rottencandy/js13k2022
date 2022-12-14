const glslPlugin = require('esbuild-plugin-spglsl');

require('esbuild').serve({
    servedir: 'app',
}, {
    entryPoints: ['src/main.ts', 'src/app.css'],
    bundle: true,
    sourcemap: 'inline',
    charset: 'utf8',
    target: 'es6',
    format: 'iife',
    outdir: 'app',
    plugins: [glslPlugin({
        minify: false,
        mangle: false
    })],
    loader: { '.png': 'dataurl' }
})
    .then(server => console.log(`Serving at: http://localhost:${server.port}`))
    .catch(() => process.exit(1));
