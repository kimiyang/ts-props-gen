#!/usr/bin/env node
const argv = require('yargs')
    .usage('Usage: $0 [input file] -o [output file]')
    .example('$0 ./src/*/*.tsx -o ./result.json')
    .help('h')
    .alias('h', 'help')
    .demandCommand(1)
    .demandOption(['o'])
    .argv;

const fs = require('fs');
const { genProps } = require('../src/index');
const results = genProps(argv._[0]);
const infoJson = JSON.stringify(results, null, 2);
fs.writeFile(argv.o, infoJson, err => {
  if (err) throw err;
});

