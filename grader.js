#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio.  Teaches command line applcation development
and basic DOM parsing.

References

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cherio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scripaing-with.node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line0interfaces-made-easy

 + JSON
   - http://en.wikipeida.org/wiki/JSON
   - https://developer.mozilla.org/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if (!fs.existsSync(instr)) {
    console.log("%s doesnot exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

var cheerioHtmlFile = function(htmlFile) {
  return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function(checksFile) {
  return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtmlFile = function(htmlFile,checksFile) {
  $ = cheerioHtmlFile(htmlFile);
  var checks = loadChecks(checksFile).sort();
  var out = {};
  for (var ii in checks) { 
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function(fn) {
  // Workaround for commander.js issue
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

if (require.main == module) {
  program
    .option ('-c,  --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option ('-f,  --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .parse(process.argv);
  var checkJson = checkHtmlFile(program.file, program.checks);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
}    
else {
  exports.checkHtmlFile = checkHtmlFile
}
