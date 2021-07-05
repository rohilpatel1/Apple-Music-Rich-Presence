const applescript = require('applescript');
const Path = require('path');
const fs = require('fs');
const client = require('discord-rich-presence')('861702238472241162');
const { app, BrowserWindow } = require('electron');

let readData = fs.readFileSync(Path.join(__dirname, '.', 'main.applescript'), 'utf8');

console.log(Path.join(__dirname, 'main.applescript'));
let linesArr = readData.split(/\r?\n/);

function createWindow () {
  const win = new BrowserWindow({
    width: 0,
    height: 0,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile('index.html');
}

function setTime(sec) {
  var t = new Date();
  t.setSeconds(t.getSeconds() - sec);
  return t.getTime()
}

app.whenReady().then(createWindow);

let data = {
  song: "",
  album: "",
  artist: "",
  finish: "",
  pos: "",
  state: ""
}

function update() {

  applescript.execString(linesArr[0], (err, res) => {

    if (!res) return;

    applescript.execString(linesArr[1], (err, song) => {
      data.song = song;
    });

    applescript.execString(linesArr[2], (err, album) => {
      data.album = album;
    });

    applescript.execString(linesArr[3], (err, artist) => {
      data.artist = artist;
    });

    applescript.execString(linesArr[4], (err, finish) => {
      data.finish = finish;
    });

    applescript.execString(linesArr[5], (err, pos) => {
      data.pos = pos;
    });

    applescript.execString(linesArr[6], (err, state) => {
      data.state = state;
    });

    client.updatePresence({
      details: data.song ? data.song : undefined,
      state: data.artist ? `by ${data.artist}` : undefined,
      largeImageKey: 'applemusic',
      largeImageText: 'Listening to Apple Music',
      smallImageKey: data.state != "playing" ?  "play" : "pause",
      smallImageText: data.state != "playing" ?  "Playing" : "Paused",
      startTimestamp: data.state == "playing" ? setTime(parseInt(data.pos)) : undefined,
      buttons: [
        {label:"Search on Apple Music", url:`https://music.apple.com/us/search?term=${encodeURIComponent(data.song)}`},
        {label:"Search on Spotify",url:`https://open.spotify.com/search/${encodeURIComponent(data.song)}`}
      ],
      instance: true,
    });
  });
}

setInterval(update, 1000);