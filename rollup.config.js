import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
// import minify from 'rollup-plugin-babel-minify';

const fileName = `websocket-pubsub.js`;

export default {
  input: 'src/index.js',
  output: {
    file: `./dist/${fileName}`,
    format: 'iife',
    name: 'WebsocketPubSub'
  },
  plugins: [
    replace({
      PRODUCTION: process.env.NODE_ENV === 'production'
    }),
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: '> 0.14%, not ie <= 9'
            },
            loose: true
          }
        ]
      ],
      exclude: 'node_modules/**'
    })
    // minify()
  ]
};
