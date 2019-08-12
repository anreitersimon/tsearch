var chalk = require("chalk");
var prompt = require("prompt");
var List = require("term-list");

var columnWidths = [
  3,
  50,
  8,
  8,
  12,
];

module.exports = {
  present: function(data, selected) {
    if (data.length == 0) {
      return;
    }

    console.log(chalk`{green ${data.length}} results:`);

    console.log(
      formatRow(
        [
          chalk.bold(r_pad("#", columnWidths[0])),
          chalk.bold.blue(r_pad("Name", columnWidths[1])),
          chalk.green(r_pad("\u25B2", columnWidths[2])),
          chalk.red(r_pad("\u25BC", columnWidths[3])),
          chalk.bold(r_pad("Added", columnWidths[4])),
        ]
      )
    );

    var list = new List({ marker: "\033[36m› \033[0m", markerLength: 2 });

    data.slice(0, 40).forEach(torrent => {
      var text = formatRow(
        [
          l_pad(torrent.torrent_num, columnWidths[0]),
          chalk.blue(r_pad(torrent.title, columnWidths[1])),
          chalk.green(l_pad(format(torrent.seeds), columnWidths[2])),
          chalk.red(l_pad(format(torrent.leechs), columnWidths[3])),
          chalk.bold(r_pad(format(torrent.date_added), columnWidths[4]))
        ]
      );
      list.add(torrent, text);
    });

    list.start();
    list.on("keypress", function(key, item) {
      switch (key.name) {
        case "return":
          selected(item);
          break;
        case "escape":
          list.stop();
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

function formatRow(data) {
  return data.join(" | ");
}

function r_pad(str, width) {
  var paddingValue = Array(width).join(" ")

  return String(str + paddingValue).substring(0, paddingValue.length);
};

function l_pad(str, width) {
  var paddingValue = Array(width).join(" ")

  return String(paddingValue + str).slice(-paddingValue.length);
};

