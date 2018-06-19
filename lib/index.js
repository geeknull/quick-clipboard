const electron = require('electron');
const {BrowserWindow, clipboard, ipcMain} = electron;
const path = require('path');

// ready clipboard data
let clipBoardArr = [];
let watchClipboard = (cb = () => {}, unique = true) => {
  let {currentTickLog} = global.quickClipboardOptions;
  let curText = clipboard.readText();
  currentTickLog && console.log('readText', curText, typeof curText);
  if (curText.length > 0 && curText !== clipBoardArr[0]) {
    clipBoardArr.unshift(curText);
    if (clipBoardArr.length > 50) {
      clipBoardArr = clipBoardArr.slice(0, 50);
    }
    cb(clipBoardArr);
  }
  setTimeout(() => {
    watchClipboard(cb, unique);
  }, 500);
};

// window status
let allWinStatus = [];
let getAllWinStatus = () => {
  let allWindows = BrowserWindow.getAllWindows();
  let winArr = allWindows.map(w => ({
    id: w.id,
    isFocused: w.isFocused(),
    isVisible: w.isVisible(),
  }));
  allWinStatus = winArr;
  return winArr;
};
let setAllWinByStatus = (allWinArr = allWinStatus) => {
  allWinArr.map(wInfo => {
    let w = BrowserWindow.fromId(wInfo.id);
    if (wInfo.isVisible === true && wInfo.isFocused === false) {
      w && w.blur();
    }
  });
};

// create clipboard window
let clipWin = null;
let createClipWindow = () => {
  getAllWinStatus();
  if (clipWin) {
    clipWin.close();
    clipWin = null;
  }
  const size = electron.screen.getPrimaryDisplay().size;
  const modalPath = path.join('file://', __dirname, './renderer-process/clipboard.html');
  const height = 330;
  clipWin = new BrowserWindow({
    frame: false,
    width: size.width, height: height,
    transparent: false,
    backgroundColor: '#fff',
    x: 0, y: size.height - height,
    show: false,
  });
  // clipWin.openDevTools(); // for dev
  clipWin.loadURL(modalPath);

  clipWin.on('close', () => {
    clipWin.removeAllListeners();
    clipWin = null;
  });
  clipWin.on('blur', () => {
    if (clipWin.webContents.isDevToolsOpened()) return;
    clipWin.close();
    setAllWinByStatus();
  });
  clipWin.webContents.once('dom-ready', () => {
    clipWin.webContents.send('clipboard-data', clipBoardArr);
  });
  clipWin.once('ready-to-show', () => {
    clipWin.show();
  });
};

let defaultOptions = {
  showNotification: false,
  currentTickLog: false,
};

module.exports = {
  init: (options = {}) => {
    global.quickClipboardOptions = Object.assign(defaultOptions, options);
    watchClipboard();
    ipcMain.on('clipboard-copy', (e, clipText, index) => {
      clipBoardArr.splice(index, 1);
      clipWin.webContents.send('clipboard-data', clipBoardArr);
      clipWin.close();
      setAllWinByStatus();
    })
  },
  show: () => {
    if (clipWin) {
      clipWin.webContents.send('clipboard-data', clipBoardArr);
      return void 0;
    }
    createClipWindow();
  }
};
