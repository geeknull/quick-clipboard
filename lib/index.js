const electron = require('electron');
const {BrowserWindow, clipboard, ipcMain} = electron;
const path = require('path');

// ready clipboard data
let clipBoardArr = [];
let watchClipboard = (cb=()=>{}, unique=true) => {
    let curText = clipboard.readText();
    if (curText !== clipBoardArr[clipBoardArr.length-1]) {
        clipBoardArr.push(curText);
        if (clipBoardArr.length > 50) {
            clipBoardArr = clipBoardArr.slice(clipBoardArr.length-50);
        }
        cb();
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
            w.blur();
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
    const modalPath = path.join('file://', __dirname, './renderer-process/clipboard.html')
    clipWin = new BrowserWindow({
        frame: false,
        width: size.width, height: 330,
        transparent: false,
        backgroundColor: '#fff',
        x: 0, y: size.height - 350,
    });
    // clipWin.openDevTools(); // for dev
    clipWin.loadURL(modalPath);

    clipWin.on('close', () => {clipWin = null;});
    clipWin.on('blur', () => {
        if (clipWin.webContents.isDevToolsOpened()) return;
        clipWin.hide();
        setAllWinByStatus();
    });
    clipWin.webContents.once('dom-ready', () => {
        clipWin.webContents.send('clipboard-data', clipBoardArr);
    });
};

module.exports = {
    init: () => {
        watchClipboard();
        ipcMain.on('clipboard-copy', () => {
            clipWin.hide();
            setAllWinByStatus();
        })
    },
    show: () => {
        createClipWindow();
    }
};
