import {
  RESERVED_WORDS,
  FUTURE_RESERVED_WORDS,
  STRICT_MODE_RESERVED_WORDS,
  VUE_RESERVED_WORDS,
  REACT_RESERVED_WORDS
} from './reserved';

export const IGNORED_NAMES = [
  ...RESERVED_WORDS,
  ...FUTURE_RESERVED_WORDS,
  ...STRICT_MODE_RESERVED_WORDS,
  ...VUE_RESERVED_WORDS,
  ...REACT_RESERVED_WORDS
];

export const DEFAULT_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.vue',
  '.svelte',
  '.astro',
  '.html'
];
export const IGNORE_FOLDERS = ['node_modules', 'dist', 'build', /^\./];
export const START_TEXT = {
  font: 'tiny', // define the font face
  align: 'left', // define text alignment
  colors: ['red'], // define all colors
  background: 'transparent', // define the background color, you can also use `backgroundColor` here as key
  letterSpacing: 1, // define letter spacing
  lineHeight: 1, // define the line height
  space: true, // define if the output text should have empty lines on top and on the bottom
  maxLength: '0', // define how many character can be on one line
  gradient: false, // define your two gradient colors
  independentGradient: false, // define if you want to recalculate the gradient for each new line
  transitionGradient: false, // define if this is a transition between colors directly
  env: 'node' // define the environment cfonts is being executed in
};

// Function and variable declarations
export const REGEX = {
  // Regular function declarations
  FUNCTION: /\bfunction\s+([a-zA-Z0-9_$]+)\s*\(/g,

  // Function expressions
  FUNCTION_EXPRESSION:
    /\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*function\s*\(/g,

  // Arrow functions
  ARROW_FUNCTION:
    /\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/g,

  // Class methods
  CLASS_METHOD:
    /(?:^\s*|\s+)(?:async\s+)?([a-zA-Z0-9_$]+)\s*(?:\([^)]*\)\s*{|\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/gm,

  // Object methods
  OBJECT_METHOD:
    /(?:^\s*|\s+)(?:async\s+)?([a-zA-Z0-9_$]+)\s*(?:\([^)]*\)\s*{|:\s*function\s*\(|:\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/g,

  // Variable declarations
  VARIABLE: /\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*(?:=|;|\r?\n|$)/g,

  // ES Module exports
  ES_MODULE_EXPORT:
    /\bexport\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g,
  EXPORT_DEFAULT:
    /\bexport\s+default\s+(?:function|class)?\s*([a-zA-Z0-9_$]+)/g,
  ES_OBJECT_EXPORT: /\bexport\s*{([^}]*)}/g,

  // CommonJS exports
  MODULE_EXPORTS: /\bmodule\.exports\s*=\s*{([^}]*)}/g,
  EXPORTS_PROPERTY: /\bexports\.([a-zA-Z0-9_$]+)\s*=/g,

  // CommonJS imports
  REQUIRE_DESTRUCTURING:
    /\bconst\s*{([^}]*)}\s*=\s*require\s*\(['"](.*?)['"]\)/g,
  REQUIRE_DIRECT:
    /\bconst\s+([a-zA-Z0-9_$]+)\s*=\s*require\s*\(['"](.*?)['"]\)(?:\.([a-zA-Z0-9_$]+))?/g,

  // ES Module imports
  IMPORT_NAMED: /\bimport\s*{([^}]*)}\s*from\s*['"](.*?)['"];?/g,
  IMPORT_DEFAULT: /\bimport\s+([a-zA-Z0-9_$]+)\s+from\s*['"](.*?)['"];?/g,

  // Return statements with objects
  RETURN_OBJECT: /\breturn\s*{([^}]*)}/g,

  // Comments
  COMMENTS: /\/\*[\s\S]*?\*\/|\/\/.*/g
};
