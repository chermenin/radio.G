const { app, BrowserWindow, Menu, screen } = require('electron')
const Config = require('electron-config')
const config = new Config();

const appWidth = 350, appHeight = 570, defaultOffset = 30;

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
    fullscreen: false,
    titleBarStyle: "hidden",
    icon: __dirname + "/icon.icns"
  })

  win.setMenu(null);

  // and load the app.
  win.loadURL('http://radio.garden')

  win.webContents.on('did-finish-load', ()=>{
    let code = `
      let appTopBar = document.createElement('div')
      appTopBar.style.width = "100%"
      appTopBar.style.height = "20px"
      appTopBar.style.position = "absolute"
      appTopBar.style.top = appTopBar.style.left = 0
      appTopBar.style.webkitAppRegion = "drag"
      document.body.appendChild(appTopBar)
    `;
    win.webContents.executeJavaScript(code);
  })

  win.on('close', () => {
    config.set('winBounds', win.getBounds())
  });
}

app.on('ready', () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize
  createWindow(width)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
