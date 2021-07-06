const { execSync, exec } = require("child_process");
const Path = require("path");
const applescript = require("applescript");
const fs = require("fs");
const os = require("os");

const version = os.platform();

const DEVMODE = process.env.DEV === 'true';

const LIBPATH = (
  version == "darwin"
    ? (
      DEVMODE 
        ? Path.resolve("./app/bridge/OSABridge.js")
        : Path.join(process.resourcesPath, "./app/bridge/OSABridge.js")
    )
    : (
      DEVMODE ? Path.resolve("./bridge/WSBridge.js") : Path.join(process.resourcesPath, "./app/bridge/WSBridge.js")
    )
);

function childprocessExec(str, options = { encoding: "utf8" }) {
  return new Promise((resolve, reject) => {
    exec(str, options, (err, stdout, stderr) => {
      if (err) return reject(err);

      resolve(stdout);
    });
  });
}

class iTunes {
  constructor() {
    this.data = {};
    this.currentSong = {};

    this.setup();
  }
  
  /*name: currentTrack.name,
  artist: currentTrack.artist,
  album: currentTrack.album,
  kind: currentTrack.kind,
  duration: currentTrack.duration,
  genre: currentTrack.genre,
  year: currentTrack.year,
  elapsed: iTunesApp.PlayerPosition,
  state: getPlayerState()*/

  async setup() {
    try {
      if (version == "win32") {
        this.currentSong = JSON.parse(await childprocessExec(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
      } else if (version == "darwin") {
        this.currentSong = JSON.parse(await childprocessExec(`osascript "${LIBPATH}" currentTrack`), { encoding: "utf8" })
      }
    } catch (e) {
      this.currentSong = {
        "state": "Loading/Not playing"
      };
    }
  }

  async exec(option) {
    if (version == "win32") {
      return await childprocessExec(`cscript //Nologo "${LIBPATH}" "${option}"`, { encoding: "utf8" });
    } else if (version == "darwin") {
      return await childprocessExec(`osascript "${LIBPATH}" "${option}"`, { encoding: "utf8" });
    }
  }

  async getCurrentSong() {
    if (version == "win32")
      this.currentSong = JSON.parse(await childprocessExec(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
    else if (version == "darwin") {
      this.currentSong = JSON.parse(await childprocessExec(`osascript "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
    }
    
    return this.currentSong;
  }

  async getState() {
    this.data.state = (await this.exec("playerState")).trim();
    this.currentSong.state = this.data.state;
    return this.data.state;
  }
}

module.exports = iTunes;