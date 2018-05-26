# Quick Clipboard

> Inspired by flexible(https://pasteapp.me/).

It's a shortcut for manage your clipboard history.

You can custom your invoke way to show a floating window what has your clipboard history card.

eg use `CommandOrControl+Shift+V`.

Double click the text card, it will write the card content into your clipboard.

```javascript
const quickClipboard = require('quick-clipboard');

app.on('ready', () => {
  // do your things
  quickClipboard.init();
  quickClipboard.show();
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    quickClipboard.show();
  })
});
```
