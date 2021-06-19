const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '/assets/PM.ico',
    //skipTaskbar:true,
    title:'PingMonitor',
    autoHideMenuBar:true,
    devTools:true,
    scrollBounce:true,
    offscreen:true
  })
  win.webContents.openDevTools()
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
