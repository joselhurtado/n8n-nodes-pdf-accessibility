const { src, dest } = require('gulp');

function buildIcons() {
    // Copy main icon to dist root (required for N8N package discovery)
    return src('icons/pdf-accessibility.svg').pipe(dest('dist/'));
}

exports['build:icons'] = buildIcons;