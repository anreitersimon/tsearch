#!/usr/bin/env node

var program = require("commander");
var chalk = require("chalk");

var eztv = require("./provider/eztv");

var Ora = require("ora");
var UI = require("./ui");

var availableProviders = [eztv];
var query = "";

program
  .arguments("<query>")
  .option("-c, --category <category>", "category", "")
  .option("-l, --limit <limit>", "limit", 20)
  .option(
    "-p, --provider <provider>",
    "provider (available: " + availableProviders.map(x => x.name) + ")",
    /^(eztv)$/i,
    "eztv"
  )
  .action(function(cmd) {
    query = cmd;
  });

program.parse(process.argv);

provider = availableProviders.find(it => {
  return it.name == program.provider;
});

const spinner = new Ora({
  text: chalk`{blue Searching for} {red "${query}"} {blue on} {red ${
    provider.name
  }}`
});
spinner.start();

provider.search(query, "", 100).then(
  data => {
    spinner.succeed();
    UI.present(data, selected => {
      openTorrent(selected);
    });
  },
  function(err) {
    console.log(err);
    spinner.fail();
  }
);

const spawnSync = require("child_process").spawnSync;

function openTorrent(torrent) {
  const result = spawnSync("open", ["-g", torrent.torrent_link], {
    timeout: 60000
  });

  if (result.error || result.status) {
    throw new Error(result.error || result.stderr.toString());
  }

  return result.stdout.toString();
}
