const electron = require('electron')
const {app, globalShortcut} = electron;

const quickClipboard = require('../lib');

app.on('ready', () => {
  quickClipboard.init();
  quickClipboard.show();
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    quickClipboard.show();
  })
});

// Hide dock icon for macOS
if (process.platform === 'darwin') app.dock.hide();

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
