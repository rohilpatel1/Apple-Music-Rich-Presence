const { execSync, exec, spawn } = require("child_process");
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
        ? Path.resolve("./bridge/OSABridge.js")
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

    this.opened = false;

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
    await this.getState();

    try {
      if (!this.opened) return this.currentSong = { "state": "Not Opened" };
      if (version == "win32") {
        this.currentSong = JSON.parse(await childprocessExec(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
      } else if (version == "darwin") {
        this.currentSong = JSON.parse(await childprocessExec(`osascript "${LIBPATH}" currentTrack`), { encoding: "utf8" })
      }
    } catch (e) {
      this.currentSong = {
        "state": "Not Opened"
      };
    }
  }

  async close() {
    await this.exec("close");
    this.opened = false;
    this.data.state = "Not Opened";
    this.currentSong.state = "Not Opened";
    return "Not Opened";
  }

  async open() {
    await this.exec("open");
    let state = await this.getState();

    if (state != "Not Opened") this.opened = true;
    else if (state === "Not Opened") this.opened = false;
  }

  async exec(option) {
    if (version == "win32") {
      return await childprocessExec(`cscript //Nologo "${LIBPATH}" "${option}"`, { encoding: "utf8" });
    } else if (version == "darwin") {
      return await childprocessExec(`osascript "${LIBPATH}" "${option}"`, { encoding: "utf8" });
    }

    return "";
  }

  async getCurrentSong() {
    if (!this.opened) return this.currentSong;

    if (version == "win32")
      this.currentSong = JSON.parse(await childprocessExec(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
    else if (version == "darwin") {
      this.currentSong = JSON.parse(await childprocessExec(`osascript "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
    }
    
    return this.currentSong;
  }

  async getState() {
    this.data.state = (await this.exec("state")).trim();
    this.currentSong.state = this.data.state;

    if (this.data.state != "Not Opened") this.opened = true;
    else if (this.data.state === "Not Opened") this.opened = false;

    return this.data.state;
  }
}

module.exports = iTunes;