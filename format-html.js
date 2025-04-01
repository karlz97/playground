const fs = require('fs');
const beautify = require('js-beautify').html;
const path = require('path');

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

try {
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Beautify the HTML
  const beautifiedHtml = beautify(fileContent, {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 1,
    preserve_newlines: true,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: 100,
    indent_inner_html: true,
    comma_first: false,
    e4x: false,
    indent_empty_lines: false
  });
  
  // Write the beautified HTML back to the file
  fs.writeFileSync(filePath, beautifiedHtml);
  
  console.log(`Successfully formatted ${path.basename(filePath)}`);
} catch (error) {
  console.error(`Error formatting file: ${error.message}`);
  process.exit(1);
} 