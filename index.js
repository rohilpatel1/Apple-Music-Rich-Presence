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

    if (!res) return console.log('Music is not open');

    applescript.execString(linesArr[1], (err, song) => {
      data.song = song;
      console.log(song);
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
      state: config.showState ? !res ? undefined : state : undefined,
      details: config.showDetails ? !workspace ? 'Idling' : details : undefined,
      startTimestamp: !res ? undefined : startTime,
      largeImageKey: 'xcode',
      largeImageText: 'Editing in Xcode',
      smallImageKey: fileExtension ? fileExtension === '.swift' ? 'swift' : fileExtension === '.plist' ? 'plist' : 'unknown' : undefined,
      smallImageText: fileExtension ? `Editing a ${fileExtension} file` : undefined,
      instance: true,
    });
  });
}

setInterval(update, 1000);