const { src, dest } = require('gulp');

function buildIcons() {
    // Copy main icon to dist root (required for N8N package discovery)
    src('icons/pdf-accessibility.svg').pipe(dest('dist/'));
    
    // Also copy to icons directory for verification
    return src('icons/**/*').pipe(dest('dist/icons/'));
}

exports['build:icons'] = buildIcons;