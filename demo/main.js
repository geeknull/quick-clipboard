const electron = require('electron')
const {app, BrowserWindow, globalShortcut, ipcMain} = electron;

const path = require('path');
const url = require('url');

const quickClipboard = require('../lib');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.on('closed', function () {
    mainWindow = null
  });
  ipcMain.on('invoke-app', () => {
    quickClipboard.show();
  })
}

app.on('ready', () => {
  createWindow();
  quickClipboard.init();
  quickClipboard.show();
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    quickClipboard.show();
  })
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});
