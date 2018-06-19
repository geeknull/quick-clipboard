const GAP = 10;
const WIDTH = 280;
const SIDE_LEN = WIDTH + GAP;

const electron = require('electron');
const {ipcRenderer, clipboard} = electron;
let options = require('electron').remote.getGlobal('quickClipboardOptions');
console.log(options);

let app = new Vue({
  el: '#clip-wrap',
  data: {
    activeIndex: 0,
    clipboardArr: []
  },
  computed: {
    clipListWidth: function () {
      return this.clipboardArr.length * SIDE_LEN;
    }
  },
  methods: {
    sendText (clipText, index) {
      if (clipText !== null) {
        let res = clipboard.writeText(clipText);
        console.log('writeText', clipText, res);
        if (options.showNotification === true) {
          new Notification('复制成功', {body: clipText});
        }
      }
      ipcRenderer.send('clipboard-copy', clipText, index);
    },
    itemClick (clipText, index) {
      this.activeIndex = index;
      this.resetPos();
    },
    doubleClick (clipText, index) {
      this.sendText(clipText, index);
    },
    resetPos () {
      let docEle = document.documentElement;

      let docWidth = docEle.clientWidth;
      let scrollLeft = docEle.scrollLeft;
      let rightWidth = (this.activeIndex+1) * SIDE_LEN;
      let leftWidth = (this.activeIndex) * SIDE_LEN;

      if (rightWidth > scrollLeft + docWidth) {
        let scrollLeft = rightWidth - docWidth + GAP
        docEle.scrollLeft = scrollLeft;
        document.body.scrollLeft = scrollLeft;
        return void 0;
      }

      if (leftWidth < scrollLeft) {
        docEle.scrollLeft = leftWidth;
        document.body.scrollLeft = leftWidth;
        return void 0
      }
    }
  },
  beforeCreate () {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 39) { // right
        this.activeIndex = this.activeIndex + 1 >= this.clipboardArr.length ? this.clipboardArr.length-1 : this.activeIndex + 1;
        e.preventDefault();
        this.resetPos();
      } else if (e.keyCode === 37) { // left
        this.activeIndex = this.activeIndex - 1 <= 0 ? 0 : this.activeIndex - 1;
        e.preventDefault();
        this.resetPos();
      } else if (e.keyCode === 13) { // enter
        this.sendText(this.clipboardArr[this.activeIndex], this.activeIndex);
      }
    }, false);
  }
});

ipcRenderer.on('clipboard-data', (event, message) => {
  app.clipboardArr = message;
});
