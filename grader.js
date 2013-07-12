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

y + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line0interfaces-made-easy

 + JSON
   - http://en.wikipeida.org/wiki/JSON
   - https://developer.mozilla.org/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/

var fs = require('fs');
var rest = require('restler');
var sys = require('sys');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var HTML_TMP = "html.tmp";
var OUTFILE = "graderOutput.json";

var assertLocExists = function(infile) {
  // Don't need to do much here, but need commander seems to need a function to call for some reason
  var instr = infile.toString();
  return instr;
};

var assertCheckExists = function(infile) {
  var instr = infile.toString();
    if (!fs.existsSync(instr)) {
      console.log("%s does not exist. Exiting.", instr);
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
    .option ('-c, --checks <check_file>', 'Path to checks.json', clone(assertCheckExists), CHECKSFILE_DEFAULT)
    .option ('-d, --html-doc <html_location>', 'Path to HTML document to check (either a file or a URL)', clone(assertLocExists), HTMLFILE_DEFAULT )
    .parse(process.argv);

  // Looks like the call to restler is asynchronous, so the only way to trap its output is to wait for it and write
  // its results to a file synchronously.  Then do all the other related call. (Don't completely understand this)
  if (program.htmlDoc.toLowerCase().substr(0,4) == "http") {
    rest.get(program.htmlDoc).on('success',function(result) {
      fs.writeFileSync(HTML_TMP,result);
      if (fs.existsSync(HTML_TMP) && fs.statSync(HTML_TMP).size > 0) {
        var checkJson = checkHtmlFile(HTML_TMP, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson); 
        fs.writeFileSync(OUTFILE,outJson);
        fs.unlinkSync(HTML_TMP); }
      else {
        console.log( '%s is not a valid URL. Exiting.', program.htmlDoc); };
    });
  }
  else { 
    if (fs.existsSync(program.htmlDoc) && fs.statSync(program.htmlDoc).size > 0) {
      var checkJson = checkHtmlFile(program.htmlDoc, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      fs.writeFileSync(OUTFILE,outJson);
      console.log(outJson); }
    else {
        console.log( '%s does not exist. Exiting.', program.htmlDoc); };
  };
}    
else {
  exports.checkHtmlFile = checkHtmlFile
}


