require("dotenv").config();
var util = require("util");
var keys = require('./keys.js');
var fs = require('fs')
var request = require('request-promise');


/* Create Objects */
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var Twitter = require('Twitter');
var client = new Twitter(keys.twitter);

var argumentOne = process.argv[2];
var argumentTwo = process.argv[3];

/* If it is "do-what-it-says", load that file as argv[2] and arg[3]  */
if (argumentOne === "do-what-it-says") {
    var fileContents = fs.readFileSync("./random.txt", "utf8");
    argumentOne = fileContents.substr(0, fileContents.indexOf(","));
    argumentTwo = fileContents.substr(fileContents.indexOf(",") + 1, fileContents.length - 1);
}

if (argumentOne === "spotify-this-song") {
    if (argumentTwo) {
        spotifyThatJawn(argumentTwo);
    }
    else {
        console.log("No song given.. you get the worst song ever.");
        spotifyThatJawn("The Sign");
    }
}
else if (argumentOne === "my-tweets") {
    tweetJawn();
}
else if (argumentOne === "movie-this") {
    if (argumentTwo) {
        movieJawn(argumentTwo);
    }
    else {
        console.log("No song given.. you get Mr. Nobody.");
        movieJawn("Mr. Nobody");
    }
}


/** Start Spotify Functions **/
function spotifyThatJawn(songName) {
    var songsInfo = "";
    spotify
        .search({ type: "track", query: '"' + songName + '"' })
        .then(function (response) {
            if (response.tracks.items === 1) {

            }
            else if (response.tracks.items === 0) {
                songsInfo = "Your request returned no songs.\n";
            }
            else {
                songsInfo = "Your request returned " + response.tracks.items.length + " songs.\n"

                var i = 1;
                response.tracks.items.forEach(function (element) {
                    songsInfo += "Song " + i + " information:\n";
                    songsInfo += printSpotifyTrack(element) + "\n";
                    i++;
                });
            }
            console.log(songsInfo);
            fs.appendFileSync("./log.txt", songsInfo);
        })
        .catch(function (err) {
            console.log(err);
        });
}

function printSpotifyTrack(track) {

    var spotifyInfo = "";
    // Format the artist(s) name(s)
    if (track.artists.length > 1) {
        var artistString = "";
        track.artists.forEach(function (element) {
            artistString += element.name + ", ";
        })
        artistInfo = "Artists: " + artistString.substring(0, artistString.length - 2) + "\n";
    }
    else {
        artistInfo = "Artist: " + track.artists[0].name + "\n";
    }
    spotifyInfo = artistInfo;
    // Format the song name
    spotifyInfo += "Song Name: " + track.name + "\n";
    // Format the URL, let user know if unavailalbe.
    if (track.preview_url !== null) {
        spotifyInfo += "Preview URL: " + track.preview_url + "\n";
    }
    else {
        spotifyInfo += "Preview URL unavailable.\n";
    }
    // Format the Album Name
    spotifyInfo += "Album: " + track.album.name + "\n";
    return spotifyInfo;
}
/** End Spotify Functions **/

/** Start Twitter Functions **/
function tweetJawn() {
    // Get the tweets
    var params = { screen_name: 'mmory' };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            tweets.forEach(function (uselessChatter) {
                var tweetString = "";
                var dateString = formatDate(uselessChatter.created_at);
                tweetString = "On " + dateString + " " + uselessChatter.user.name + "(@" + uselessChatter.user.screen_name + ") tweeted:\n";
                tweetString += uselessChatter.text + "\n\n";
                fs.appendFileSync("./log.txt", tweetString)
                console.log(tweetString);
            })
        }
        else {
            console.log(error);
        }
    });

}

function formatDate(dateString) {
    var toDate = new Date(dateString);
    dateString = toDate.toLocaleDateString("EN-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    dateString += " at " + toDate.toLocaleTimeString();
    return dateString;
}
/** End Twitter Functions **/

/** Start OMDB Functions **/

function movieJawn(movie) {
    request({
        "method": "GET",
        "uri": "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy",
        "json": true,
        "headers": {
            "User-Agent": "My little demo app"
        }
    })
        .then(function (result) {
            var movieString = "";
            movieString = result.Title + "(" + result.Year + ")\n";
            movieString += "IMDB Rating: " + result.imdbRating + "\n";
            movieString += "Rotten Tomatoes Rating: " + result.Ratings[1].Value + "\n";
            movieString += "Country of Productions: " + result.Country + "\n";
            movieString += "Language: " + result.Language + "\n";
            movieString += "Plot Summary: " + result.Plot + "\n";
            movieString += "Actors: " + result.Actors;
            fs.appendFileSync("./log.txt", movieString);
            console.log(movieString);
        })
        .catch(function (error) {
            console.log(error);
        })
}


/** End OMDB Functions **/