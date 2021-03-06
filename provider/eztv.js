var Q = require("q");
var request = require("request");
var cheerio = require("cheerio");
var moment = require("moment");
var util = require("util");
var fs = require("fs");

module.exports = {
  name: "eztv",
  search: function(query, cat, page, limit) {
    var eztv_url = "https://www.eztv.ag";

    var torrent_search = query;
    var search_query = query.split(" ").join("-");
    var search_url = eztv_url + "/search/" + search_query;
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request({ url: search_url, headers: { "User-Agent": "request" } }, function(
      err,
      response,
      body
    ) {
      try {
        if (!err && response.statusCode === 200) {
          var eztv_link,
            torrent_title,
            torrent_size,
            torrent_seeds,
            torrent_leech,
            date_added;
          $ = cheerio.load(body);
          if ($("tr.forum_header_border").length > 0) {
            $("tr.forum_header_border").each((index, torrent) => {
              eztv_link = $(torrent)
                .find("a.magnet")
                .attr("href");
              torrent_title = $(torrent)
                .find("a.epinfo")
                .text();
              torrent_size = $(torrent)
                .find("a.epinfo")
                .attr("title")
                .match(/\([^)]+\)$/)[0]
                .slice(1, -1);
              torrent_seeds = $("td.forum_thread_post_end", torrent)
                .prev()
                .text();
              torrent_leech = "";
              date_added = $("td.forum_thread_post_end", torrent)
                .prev()
                .prev()
                .text();

              data_content = {
                torrent_num: count,
                title: torrent_title,
                category: "",
                seeds: torrent_seeds,
                leechs: torrent_leech,
                size: torrent_size,
                torrent_link: eztv_link,
                date_added: date_added
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);
              // like break
              if (++count > limit) {
                return false;
              }
            });
          } else {
            deferred.reject("No torrents found");
          }
        } else {
          deferred.reject("There was a problem loading Eztv");
        }
      } catch (e) {
        deferred.reject(e.toString());
      }
    });

    return deferred.promise;
  }
};
