const { build, serve } = require('esbuild');
const esbuildVue  = require('esbuild-vue');
const esbuildEnv  = require('esbuild-envfile-plugin');
const dotenv      = require('dotenv');
const path        = require('path');

const args        = process.argv.slice(2)
const watch       = args.includes('--watch');
const server      = args.includes('--serve');
const env         = dotenv.config().parsed;

const builder = {
  entryPoints: [path.resolve('./source/index.js')],
  bundle: true,
  minify: true,
  outfile: __dirname + '/dist/app.min.js',
  plugins: [esbuildVue(), esbuildEnv],
  drop: ['console', 'debugger'],
  define: {
    'process.env': JSON.stringify(env),
    'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
  },
  watch: !watch ? false : {
    onRebuild (error, result) {
      if (error) console.error( 'watch build failed:', error)
      else console.log( 'updated', result)
    },
  },
}
console.log('🔨 building  ===================')
if (server) {
  serve({
    servedir: 'dist'
  }, builder)
} else {
  build(builder).then(result => {
    if (watch) console .log( '監視中...' )
  });
}