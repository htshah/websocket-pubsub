import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: './dist/websocket-pubsub.js',
    format: 'umd',
    name: 'WebsocketPubSub'
  },
  plugins: [
    babel({
      presets: ['@babel/preset-env'],
      exclude: 'node_modules/**'
    })
  ]
};
