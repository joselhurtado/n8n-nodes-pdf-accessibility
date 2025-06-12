const { src, dest } = require('gulp');

function buildIcons() {
    // Copy main icon to dist root
    src('icons/pdf-accessibility.svg').pipe(dest('dist/'));
    
    // Copy main icon to nodes directory (like Google PageSpeed)  
    src('icons/pdf-accessibility.svg').pipe(dest('dist/nodes/PdfAccessibility/'));
    
    // Copy operation icons to icons folder
    return src('icons/**/*').pipe(dest('dist/icons/'));
}

exports['build:icons'] = buildIcons;