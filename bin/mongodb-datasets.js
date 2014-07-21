#!/usr/bin/env node

var datasets = require('../');
var es = require('event-stream');
var fs = require('fs');
var yargs = require('yargs')
      .usage('MongoDB-Datasets version 0.0.0')
      .example('$0 schema.json -n 10 -o dump.out', '')
      .example('cat schema.json | $0 -n 10 -o -', '')
      .describe(0, 'Path to a template schema file')
      .options('n', {
        demand: true,
        alias: 'size',
        describe: 'Number of documents to generate'
      })
      .options('o', {
        demand: true,
        alias: 'out',
        string: true,
        describe: 'Path to output file. Use "-" for stdout'
      })
      .options('pretty', {
        boolean: true,
        describe: 'Whether to format results'
      })
      .options('h', {
        alias: 'help',
        boolean: true,
        describe: 'Show help message'
      })
      .check(function (argv) {
        if (argv._.length > 1)
          throw 'Too many arguments!';
        var _0 = argv._[0];
        if (_0 && _0 !== 'help' && !fs.existsSync(_0))
          throw 'Schema file does not exist!';
      });
var argv = yargs.argv;

if (argv.h || argv._[0] === 'help') return yargs.showHelp();

(argv._[0] ? fs.createReadStream(argv._[0]) : process.stdin)
  .pipe(datasets.createGeneratorStream({size: argv.size}))
  .pipe(es.map(function (data, callback) {
    if (argv.pretty) {
      callback(null, JSON.stringify(data, null, 2) + '\n');
    } else {
      callback(null, JSON.stringify(data));
    }
  }))
  .pipe((argv.out === '-') ? process.stdout : fs.createWriteStream(argv.out));
