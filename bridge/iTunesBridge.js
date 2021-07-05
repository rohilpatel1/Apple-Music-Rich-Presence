const { execSync, exec } = require("child_process");
const Path = require("path");
const applescript = require("applescript");
const fs = require("fs");
const os = require("os");

const version = os.platform();

const DEVMODE = true;

const LIBPATH = (
  version == "darwin" ? (DEVMODE ? Path.resolve("./bridge/main.applescript") : Path.join(process.resourcesPath, "./app/bridge/main.applescript")) : (DEVMODE ? Path.resolve("./bridge/WSBridge.js") : Path.join(process.resourcesPath, "./app/bridge/WSBridge.js"))
)

function ASexecString(str) {
  return new Promise((resolve, reject) => {
    applescript.execString(str, (err, data) => {
      if (err) return reject(err);

      resolve(data);
    })
  });
}

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

    this.readData = ""; // for applescript
    this.lines = []; // for applescript

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
    if (version == "darwin") {
      this.readData = fs.readFileSync(LIBPATH, "utf8");
      this.lines = this.readData.split(/\r?\n/);
    }

    try {
      if (version == "win32") {
        this.currentSong = JSON.parse(await childprocessExec(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
      } else if (version == "darwin") {

        const res = await ASexecString(this.lines[0])

        if (!res) return this.currentSong.state = "Not Opened";
        
        this.currentSong.name = await ASexecString(this.lines[1]);
        this.currentSong.album = await ASexecString(this.lines[2]);
        this.currentSong.artist = await ASexecString(this.lines[3]);
        this.currentSong.duration = await ASexecString(this.lines[4]);
        this.currentSong.elapsed = await ASexecString(this.lines[5]);

        let state = await ASexecString(this.lines[6]);
        let firstLetter = state[0].toUpperCase();
        state = firstLetter + state.substring(1);
        this.currentSong.state = state;
        this.data.state = state;
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
      return await ASexecString(option);
    }
  }

  async getCurrentSong() {
    if (version == "win32")
      this.currentSong = JSON.parse(await childprocessExec(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
    else if (version == "darwin") {
      if (this.data.state === "Not Opened") return {};

      this.currentSong.name = await ASexecString(this.lines[1]);
      this.currentSong.album = await ASexecString(this.lines[2]);
      this.currentSong.artist = await ASexecString(this.lines[3]);
      this.currentSong.duration = await ASexecString(this.lines[4]);
      this.currentSong.elapsed = await ASexecString(this.lines[5]);

      let state = await ASexecString(this.lines[6]);
      let firstLetter = state[0].toUpperCase();
      state = firstLetter + state.substring(1);
      this.currentSong.state = state;
      this.data.state = state;
    }
    
    return this.currentSong;
  }

  async getState() {
    if (version == "darwin") {
      let state = await ASexecString(this.lines[6]);
      let firstLetter = state[0].toUpperCase();
      state = firstLetter + state.substring(1);
      this.currentSong.state = state;
      this.data.state = state;

      return this.data.state;
    } else if (version == "win32") {
      this.data.state = (await this.exec("playerState")).trim();
      this.currentSong.state = this.data.state;
      return this.data.state;
    }
  }
}

module.exports = iTunes;