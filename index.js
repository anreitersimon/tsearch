#!/usr/bin/env node

var program = require("commander");
var chalk = require("chalk");

var eztv = require("./provider/eztv");

var Ora = require("ora");
var UI = require("./ui");

var availableProviders = [eztv];

program
  .option("-q, --query <query>", "query", "")
  .option("-c, --category <category>", "category", "")
  .option(
    "-p, --provider <provider>",
    "provider (available: " + availableProviders.map(x => x.name) + ")",
    /^(eztv)$/i,
    "eztv"
  )
  .parse(process.argv);

provider = availableProviders.find(it => {
  return it.name == program.provider;
});

const spinner = new Ora({
  text: chalk`{blue Searching for} {red "${program.query}"} {blue on} {red ${
    provider.name
  }}`
});
spinner.start();

provider.search(program.query, "", 100).then(
  data => {
    spinner.succeed();
    UI.present(data, 20);
    UI.selectTorrents(data, selected => {
      selected.forEach(t => openTorrent(t));
    });
  },
  function(err) {
    console.log(err);
    spinner.fail();
  }
);

const spawnSync = require("child_process").spawnSync;

function openTorrent(torrent) {
  const result = spawnSync("open", [torrent.torrent_link], {
    timeout: 60000
  });

  if (result.error || result.status) {
    throw new Error(result.error || result.stderr.toString());
  }

  return result.stdout.toString();
}
