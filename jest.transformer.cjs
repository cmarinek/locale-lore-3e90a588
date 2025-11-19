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
      define: {
        'import.meta.env.DEV': 'false',
        'import.meta.env.PROD': 'true',
        'import.meta.env.MODE': '"test"',
        'import.meta.env.BASE_URL': '"/"',
        'import.meta.env.VITE_SUPABASE_URL': '"http://localhost"',
        'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': '"test-key"',
      },
    });

    return { code, map };
  },
};
