import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
  babel({
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          modules: false,
        },
      ],
    ],
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
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
