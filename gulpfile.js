const { src, dest } = require('gulp');

function buildIcons() {
    // Copy main icon to dist root (like Google PageSpeed)
    src('icons/pdf-accessibility.svg').pipe(dest('dist/'));
    
    // Copy operation icons to dist/icons (for future use)
    return src('icons/**/*').pipe(dest('dist/icons/'));
}

exports['build:icons'] = buildIcons;