const { transformSync } = require('esbuild');

module.exports = {
  process(source, filename) {
    const loader = filename.endsWith('.tsx') ? 'tsx' : 'ts';
    const { code, map } = transformSync(source, {
      loader,
      sourcemap: 'inline',
      target: 'es2020',
      jsx: 'automatic',
      format: 'cjs',
    });

    return { code, map };
  },
};
