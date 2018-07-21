require("dotenv").config();
var keys = require('./keys.js');
var fs = require('fs');

/* Create Objects */
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
//var client = new Twitter(keys.twitter);

/* Open Random.txt and read default search options */
fs.open('./random.txt', 'r', (err, fd) => {
    if (err) throw err;
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });



if (process.argv[2] === "spotify-this-song") {
    if(process.argv[3].length > 1)
    {
    spotifyThatJawn(process.argv[3]);}
    else {
        console.log("No song given.. you get the worst song ever.");
        spotifyThatJawn("The Sign");
    }
}


/** Start Spotify Functions **/
function spotifyThatJawn(songName) {
    var songs
    spotify
        .search({ type: "track", query: '"'+songName+'"' })
        .then(function (response) {
            if (response.tracks.items === 1) {

            }
            else if (response.tracks.items === 0) {
                console.log("Your request returned no songs.");
            }
            else {
                console.log("Your request returned " + response.tracks.items.length + " songs.");
                var i = 1;
                response.tracks.items.forEach(function (element) {
                    console.log("Song " + i + " information:");
                    printSpotifyTrack(element);
                    i++;
                });
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}

function printSpotifyTrack(track) {
    // Print the artist(s) name(s)
    if (track.artists.length > 1) {
        var artistString = "";
        track.artists.forEach(function (element) {
            artistString += element.name + ", ";
        })
        console.log("Artists: " + artistString.substring(0, artistString.length - 2));
    }
    else {
        console.log("Artist: " + track.artists[0].name);
    }
    // Print the song name
    console.log("Song Name: " + track.name);
    // Print the URL, let user know if unavailalbe.
    if (track.preview_url !== null) {
        console.log("Preview URL: " + track.preview_url);
    }
    else {
        console.log("Preview URL unavailable.");
    }
    // Print the Album Name
    console.log("Album: " + track.album.name);
    console.log("\n");
}
/** End Spotify Functions **/