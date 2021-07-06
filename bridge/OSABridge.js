const APP = Application.currentApplication();
const iTunesApp = Application('Music');

APP.includeStandardAdditions = true;

ObjC.import('Foundation');

function getPlayerState() {
  if (!iTunesApp) return "Not Opened";

  switch (iTunesApp.playerState()) {
    case "playing":
      return "Playing";
    case "stopped":
      return "Stopped";
    case "paused":
      return "Paused";
    default:
      return "Stopped";
  }
}

function getCurrentTrack() {
  var data = {};
  try {
    var currentTrack = iTunesApp.currentTrack;
    data = {
      name: currentTrack.name(),
      artist: currentTrack.artist(),
      album: currentTrack.album(),
      kind: currentTrack.kind(),
      duration: currentTrack.duration(),
      genre: currentTrack.genre(),
      year: currentTrack.year(),
      elapsed: iTunesApp.playerPosition(),
      state: getPlayerState()
    };
  } catch (e) {
    data = {
      state: getPlayerState()
    };
  }

  return JSON.stringify(data);
}

function run(argv) {
  switch(argv[0]) {
    case "currentTrack":
    case "currenttrack":
    case "current":
      return getCurrentTrack();
    case "playerState":
    case "playerstate":
    case "state":
      return getPlayerState();
    case "play":
      iTunesApp.play();
      break;
  }
}