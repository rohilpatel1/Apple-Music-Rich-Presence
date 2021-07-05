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

  setup() {
    if (version == "darwin") {
      this.readData = fs.readFileSync(LIBPATH, "utf8");
      this.lines = this.readData.split(/\r?\n/);
    }

    try {
      if (version == "win32") {
        this.currentSong = JSON.parse(execSync(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
      } else if (version == "darwin") {

        applescript.execString(this.lines[0], (err, res) => {
          if (!res) return this.data.state = "Not Opened";
          
          applescript.execString(this.lines[1], (err, song) => {
            this.currentSong.name = song;
          });
        
          applescript.execString(this.lines[2], (err, album) => {
            this.currentSong.album = album;
          });
        
          applescript.execString(this.lines[3], (err, artist) => {
            this.currentSong.artist = artist;
          });
        
          applescript.execString(this.lines[4], (err, duration) => {
            this.currentSong.duration = duration;
          });
        
          applescript.execString(this.lines[5], (err, elapsed) => {
            this.currentSong.elapsed = elapsed;
          });
        
          applescript.execString(this.lines[6], (err, state) => {
            let firstLetter = state[0].toUpperCase();
            state = firstLetter + state.substring(1);
            this.currentSong.state = state;
            this.data.state = state;
          });
        });
        
      }
    } catch (e) {
      this.currentSong = {
        "state": "Loading/Not playing"
      };
    }
  }

  exec(option, cb) {
    if (version == "win32") {
      return execSync(`cscript //Nologo "${LIBPATH}" "${option}"`, { encoding: "utf8" });
    } else if (version == "darwin") {
      applescript.execString(option, cb);
    }
  }

  getCurrentSong() {
    if (version == "win32")
      this.currentSong = JSON.parse(execSync(`cscript //Nologo "${LIBPATH}" currentTrack`, { encoding: "utf8" }));
    else if (version == "darwin") {
      if (this.data.state === "Not Opened") return {};

      applescript.execString(this.lines[1], (err, song) => {
        this.currentSong.name = song;
      });
    
      applescript.execString(this.lines[2], (err, album) => {
        this.currentSong.album = album;
      });
    
      applescript.execString(this.lines[3], (err, artist) => {
        this.currentSong.artist = artist;
      });
    
      applescript.execString(this.lines[4], (err, duration) => {
        this.currentSong.duration = duration;
      });
    
      applescript.execString(this.lines[5], (err, elapsed) => {
        this.currentSong.elapsed = elapsed;
      });
    
      applescript.execString(this.lines[6], (err, state) => {
        let firstLetter = state[0].toUpperCase();
        state = firstLetter + state.substring(1);
        this.currentSong.state = state;
        this.data.state = state;
      });
    }
    
    return this.currentSong;
  }

  getState() {
    if (version == "darwin") {
      applescript.execString(this.lines[6], (err, state) => {
        let firstLetter = state[0].toUpperCase();
        state = firstLetter + state.substring(1);
        this.currentSong.state = state.trim();
        this.data.state = state.trim();
      });

      return this.data.state;
    } else if (version == "win32") {
      this.data.state = this.exec("playerState").trim();
      this.currentSong.state = this.data.state;
      return this.data.state;
    }
  }
}

module.exports = iTunes;