var Table = require("cli-table");
var chalk = require("chalk");
var prompt = require("prompt");

module.exports = {
  present: function(data, limit) {
    if (data.length == 0) {
      return;
    }

    console.log(chalk`{green ${data.length}} results:`);

    var table = new Table({
      head: [
        chalk.bold("#"),
        chalk.bold.blue("Name"),
        chalk.green("\u25B2"),
        chalk.red("\u25BC"),
        chalk.blue("Added")
      ],
      colWidths: [6, 50, 8, 8, 12]
    });

    data.slice(0, limit).forEach(torrent => {
      table.push([
        torrent.torrent_num,
        chalk.blue(torrent.title.substring(0, 48)),
        chalk.green(format(torrent.seeds)),
        chalk.red(format(torrent.leechs)),
        chalk.bold(format(torrent.date_added)),
      ]);
    });

    console.log(table.toString());

    console.log("");
  },
  selectTorrents: function(data, callback) {
    var stdin = process.openStdin();

    prompt.message = "select torrent(s) to download";

    prompt.start();

    prompt.get(
      [
        {
          name: "selection",
          type: "string"
        }
      ],
      (err, result) => {
        var selectedTorrents = result.selection.split(",");

        var selected = data.filter(torrent => {
          return selectedTorrents.includes(String(torrent.torrent_num));
        });

        var selectedNames = selected
          .map(torrent => {
            return "- " + chalk.blue(torrent.title);
          })
          .join("\n");

        console.log("selected:");
        console.log(selectedNames);

        callback(selected);
      }
    );
  }
};

function format(val) {
  if (val) {
    return val;
  } else {
    return "-";
  }
}
