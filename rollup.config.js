import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'boxes.js',
  dest: 'dist/boxes.umd.js',
  moduleName: 'boxes',
  format: 'umd',
  plugins: [ nodeResolve(), commonjs() ]
}
