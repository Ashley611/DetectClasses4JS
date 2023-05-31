import { Command } from 'commander'

const pJson = require('../package.json');

const cli = new Command();

cli
  .description('An open source entities extractor for ECMAScript.')
  .version(pJson.version)
  .option('-l, --language <l>','the language of source code',".")
  .option('-i, --input <path>', 'specify the path to a file or directory',".")
  //.requiredOption('-g, --using-gui', 'launch a webpage to interact with the core', false)
  //.option('-F, --output-directory <path>', 'specify where to output the analyse results', '.')
  //.option('-G, --output-using-gui', 'launch a webpage to visualize the results', false)
  .option('-D, --include_dir [d]','github url,input null as value')
  .option('-P, --projectName<projectName>', 'specify the projectName', '.')
    //.option('-p, --projectName<projectName>','the short name of source code')
export default cli

