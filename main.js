const { app, BrowserWindow, Menu, screen, shell } = require('electron')
const Config = require('electron-config')
const config = new Config();

const appWidth = 320, appHeight = 520, defaultOffset = 30;

Menu.setApplicationMenu(false)

function createWindow (width) {

  let bounds = {
    x: width - appWidth - defaultOffset,
    y: defaultOffset
  }
  Object.assign(bounds, config.get('winBounds'));

  let win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: appWidth,
    height: appHeight,
    webPreferences: {
      nodeIntegration: false
    },
    resizable: false,
    maximizable: false,
    fullscreen: false
  })

  win.setMenu(null);
  win.loadURL(config.get('location', 'http://radio.garden'))

  let content = win.webContents

  content.on('did-finish-load', () => {
    let code = `
      let setVolumeInterval = setInterval(() => {
        if (__getState().player !== null) {
          clearInterval(setVolumeInterval)
          __getState().player.volume = localStorage.getItem('volume') || 0.8
          __getState().ui.channelLocked = localStorage.getItem('channelLocked') || false
        }
      }, 200)
    `;
    content.executeJavaScript(code);
  })

  content.on('new-window', function(event, url){
    event.preventDefault();
    shell.openExternal(url);
  });

  win.on('close', (e) => {
    e.preventDefault()
    content.executeJavaScript(`
      localStorage.setItem('volume', __getState().player.volume)
      localStorage.setItem('channelLocked', __getState().ui.channelLocked)
    `);
    config.set('winBounds', win.getBounds())
    config.set('location', content.getURL())
    setTimeout(() => app.exit(), 100)
  });

  win.on('page-title-updated', (e, v) => {
    e.preventDefault()
    win.setTitle(v.replace('Radio Garden', 'radio.G'))
  });
}

app.on('ready', () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize
  createWindow(width)
})
