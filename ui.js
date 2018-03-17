var chalk = require("chalk");
var prompt = require("prompt");
var List = require("term-list");

module.exports = {
  present: function(data, selected) {
    if (data.length == 0) {
      return;
    }

    console.log(chalk`{green ${data.length}} results:`);

    console.log(
      formatRow(
        [
          chalk.bold("#"),
          chalk.bold.blue("Name"),
          chalk.green("\u25B2"),
          chalk.red("\u25BC"),
          chalk.blue("Added")
        ],
        []
      )
    );

    var list = new List({ marker: "\033[36m› \033[0m", markerLength: 2 });

    data.forEach(torrent => {
      var text = formatRow(
        [
          torrent.torrent_num,
          chalk.blue(torrent.title.substring(0, 48)),
          chalk.green(format(torrent.seeds)),
          chalk.red(format(torrent.leechs)),
          chalk.bold(format(torrent.date_added))
        ],
        []
      );
      list.add(torrent, text);
    });

    list.start();
    list.on("keypress", function(key, item) {
      switch (key.name) {
        case "return":
          selected(item);
          break;
        case "backspace":
          list.remove(list.selected);
          break;
      }
    });

    list.on("empty", function() {
      list.stop();
    });
  }
};

function format(val) {
  if (val) {
    return val;
  } else {
    return "-";
  }
}

function formatRow(data, colWidths) {
  var result = "";
  console.log('dsads')

  return data.join(" | ");
}
