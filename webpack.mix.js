let mix = require('laravel-mix');

mix.webpackConfig({
    resolve: {
        modules: [
            path.resolve( __dirname, 'resources/assets/js/modules' )
        ]
    },
    output: {
        path: path.resolve( __dirname, 'public' ),
        publicPath: '/',
        chunkFilename: 'js/[id].chunk.js'
    }
});

mix.js( 'resources/assets/js/main.js', 'public/js' )
    .sass( 'resources/assets/sass/main.sass', 'public/css' )
