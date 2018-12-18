let mix = require('laravel-mix');

mix.webpackConfig({output: {
        library: 'morpherjs',
        libraryTarget: 'umd',
        umdNamedDefine: true
    }})
    .options({uglify: {
        uglifyOptions: { mangle: { keep_fnames: true } }
    }})
    .js('src/morpher.js', 'dist/morpher.min.js');