import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'

export default {
  input: 'lib/boxes.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [nodeResolve(), commonjs()]
}
