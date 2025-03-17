import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

// Comprehensive build configuration
const createConfig = (format) => ({
  input: 'src/index.js',
  output: {
    file: 
      format === 'esm' ? pkg.module : 
      format === 'cjs' ? pkg.main : 
      `dist/index.${format}.js`,
    format,
    sourcemap: true,
    name: 'FetchMCP',
    exports: 'named',
    interop: 'auto',
    strict: true
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    // Resolve and bundle node_modules dependencies
    resolve({
      preferBuiltins: true,
      mainFields: ['module', 'main']
    }),

    // Convert CommonJS modules to ES6
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true
    }),

    // Babel transpilation for broad compatibility
    babel({
      exclude: /node_modules/,
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: '16',
            browsers: '> 0.25%, not dead'
          },
          useBuiltIns: 'usage',
          corejs: 3,
          modules: false
        }]
      ],
      plugins: [
        '@babel/plugin-transform-runtime'
      ]
    }),

    // Production optimization
    ...(process.env.NODE_ENV === 'production' 
      ? [terser({
          compress: {
            drop_console: true,
            dead_code: true,
            conditionals: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            hoist_funs: true,
            keep_fargs: false,
            hoist_vars: true,
            if_return: true,
            join_vars: true,
            cascade: true,
            side_effects: true,
            warnings: false
          },
          mangle: {
            toplevel: true,
            reserved: ['FetchMCP']
          }
        })]
      : []
    )
  ],
  // Comprehensive error handling
  onwarn: (warning, warn) => {
    // Ignore specific warning types
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    
    // Default warning logging
    warn(warning);
  }
});

// Multi-format builds
export default [
  createConfig('esm'),  // ES Module
  createConfig('cjs'),  // CommonJS
  createConfig('umd')   // Universal Module Definition
];