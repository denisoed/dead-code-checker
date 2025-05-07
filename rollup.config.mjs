import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: 'json' };

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const external = [
  Object.keys(pkg.dependencies || {}),
  Object.keys(pkg.peerDependencies || {})
].flat();
const globals = {
  fs: 'fs',
  path: 'path',
  colors: 'colors',
  cfonts: 'cfonts'
};

const plugins = [
  json(),
  nodeResolve({ extensions }),
  commonjs(),
  babel({
    extensions,
    babelHelpers: 'bundled'
  }),
  terser()
];

export default [
  {
    input: 'src/index.ts',
    external,
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
        globals,
        exports: 'auto'
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        globals,
        exports: 'auto',
        interop: 'auto'
      },
      {
        name: pkg.name.replace(/-/g, ''),
        file: pkg.browser,
        format: 'umd',
        globals,
        exports: 'auto'
      }
    ],
    plugins
  }
];
