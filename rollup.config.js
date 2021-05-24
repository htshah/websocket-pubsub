import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const fileName = `websocket-pubsub`;
const inputFile = 'src/index.js';
const iifeName = 'WebsocketPubSub';
const isProduction = process.env.NODE_ENV === 'production';

const rollupPlugins = [
  replace({
    values: {
      PRODUCTION: isProduction,
    },
    preventAssignment: true,
  }),
  nodeResolve(),
  commonjs(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
];

export default {
  input: inputFile,
  plugins: rollupPlugins,
  output: [
    {
      file: `./dist/${fileName}.js`,
      format: 'iife',
      name: iifeName,
      sourcemap: true,
    },
    {
      file: `./dist/${fileName}.min.js`,
      format: 'iife',
      name: iifeName,
      plugins: [terser()],
    },
  ],
};
