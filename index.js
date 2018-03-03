#!/usr/bin/env node

var program = require('commander');
var chalk = require('chalk');
var prompt = require('prompt');

var eztv = require('./provider/eztv');


var Table = require('cli-table');
const Ora = require('ora');

var availableProviders = [
  eztv
]

program
  .option('-q, --query <query>', 'query', '')
  .option('-c, --category <category>', 'category', '')
  .option('-p, --provider <provider>', 'provider (available: ' + availableProviders.map(x => x.name) + ')', /^(eztv)$/i, 'eztv')
  .parse(process.argv);

provider = availableProviders.find(function(it) { return it.name == program.provider });

var loadingText = chalk.blue('Searching for ') + chalk.red('\"' + program.query + '\"') + chalk.blue(' on ') + chalk.red(provider.name);

const spinner = new Ora({
	text: loadingText
});
spinner.start()

provider
  .search(program.query, '', 100)
  .then(
        function (data) {

            spinner.succeed()
            console.log(chalk.green(data.length) + ' results:');

            if (data.length == 0) { return }

            var table = new Table({
                head: [
                  chalk.bold('#'),
                  chalk.bold.blue('Name'),
                  chalk.green('\u25B2'),
                  chalk.red('\u25BC')
                ]
              , colWidths: [4, 50, 5, 5 ]
            })

            data.forEach(function(torrent) {
              table.push([
                torrent.torrent_num,
                chalk.blue(torrent.title.substring(0, 48)),
                chalk.green(format(torrent.seeds)),
                chalk.red(format(torrent.leechs)),
              ])
            })

            console.log(table.toString());

            console.log('')

            var stdin = process.openStdin();

            prompt.message = 'select torrent(s) to download'

            prompt.start();

            prompt.get([{
                name: 'selection',
                type: 'string',
              }], function (err, result) {

              var selectedTorrents = result.selection.split(",")

              var selected = data
                .filter(torrent => {
                  return selectedTorrents.includes(String(torrent.torrent_num))
                })

              var selectedNames = selected
                .map(torrent => {
                   return '- ' + chalk.blue(torrent.title)
                })
                .join('\n')

                console.log('selected:');
                console.log(selectedNames);

                selected.forEach( torrent => {
                  openTorrent(torrent)
                })

            });

        },
        function (err) {
            console.log(err);
            spinner.fail()
        }
  );

  function format(val) {
  	if (val) {
    	return val
    } else {
    	return '-'
    }
  }

  const spawnSync = require("child_process").spawnSync;

  function openTorrent(torrent) {
    const result = spawnSync(
      "open",
      [torrent.torrent_link],
      {
        timeout: 60000
      }
    );

    if (result.error || result.status) {
      throw new Error(result.error || result.stderr.toString());
    }

    return result.stdout.toString();
  }
