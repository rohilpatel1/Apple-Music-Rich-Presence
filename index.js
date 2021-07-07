const client = require('discord-rich-presence')('861702238472241162');
const { app, Tray, Menu } = require('electron');
require("dotenv").config();

const iTunes = require("./bridge/iTunesBridge.js");
const iTunesApp = new iTunes();

let RPCInterval = 0;
let state = "Not Opened";
let currentSong = {};
let startDate = new Date();
let pauseDate = new Date();
let lastSong = "";

let tray = null;
let contextMenu = null;
let countdown = true;


// function createWindow() {
//   const win = new BrowserWindow({
//     width: 0,
//     height: 0,
//     webPreferences: {
//       nodeIntegration: true
//     }
//   });
//   win.loadFile('index.html');
// }

function closeRPC() {
  iTunesApp.close();
  client.disconnect();
  app.quit();
}

/**
 * 
 * @param {Electron.MenuItem} e 
 */
function changeTimer(e) {
  if (!e.checked) {
    countdown = false;
  } else {
    countdown = true;
  }
}

function createTray() {
  tray = new Tray('icons/applemusic.png');
  contextMenu = Menu.buildFromTemplate([
    { label: "Timer Countdown?", type: "checkbox", click: changeTimer, checked: true },
    { label: "Quit RPC and iTunes", type: "normal", click: closeRPC },
  ]);

  tray.setToolTip("AppleMusic RPC");
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(createTray);

async function update() {
  state = await iTunesApp.getState()
  currentSong = await iTunesApp.getCurrentSong();

  if (currentSong.name && currentSong.name.includes(" - ")) {
    const split = currentSong.name.split(/\s*\-\s*/);
    const artist = split.length > 1 ? split[0] : null
    const songname = split.length > 1 ? split[1] : currentSong.name;
    currentSong.artist = artist;
    currentSong.name = songname;
  }

  let fullTitle = currentSong ? `${currentSong.artist || "Unknown Artist"} - ${currentSong.name}` : "No Song";

  if (state == "Playing" && (fullTitle !== lastSong || !lastSong)) {
    startDate = new Date();
    lastSong = `${currentSong.artist || "Unknown Artist"} - ${currentSong.name}`;
    startDate.setSeconds(new Date().getSeconds() - parseInt(currentSong.elapsed) - 1);
  }

  if (state === "Playing") {
    pauseDate = new Date();
  }

  startDate = new Date();
  startDate.setSeconds(startDate.getSeconds() - (currentSong.duration + parseInt(currentSong.elapsed)) + currentSong.duration);

  let endDate = new Date();
  endDate.setSeconds(endDate.getSeconds() + (currentSong.duration - currentSong.elapsed));

  client.updatePresence({
    state: (state == "Playing") ? `by ${currentSong.artist || "Unknown"}` : state,
    details: currentSong.name || "None",
    startTimestamp: (state == "Playing") ? startDate.getTime() : pauseDate.getTime(),
    endTimestamp: (state === "Playing" && countdown) ? endDate.getTime() : undefined,
    largeImageKey: 'applemusic',
    smallImageKey: (state == "Playing") ? "pause" : "play",
    smallImageText: state,
    largeImageText: (state == "Playing") ? `${fullTitle}` : "Idling",
    buttons: [
      { label: "Search on Apple Music", url: `https://music.apple.com/us/search?term=${encodeURIComponent(currentSong.artist ? fullTitle : currentSong.name)}`},
      { label: "Search on Spotify", url: `https://open.spotify.com/search/${encodeURIComponent(currentSong.artist ? fullTitle : currentSong.name)}`}
    ],
    instance: true,
  });
}

RPCInterval = setInterval(update, 300);