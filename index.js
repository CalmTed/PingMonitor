const { app, BrowserWindow,ipcMain } = require('electron')
var ping = require('ping');
var axios = require('http');
var os = require("os");
var networkInterfaces = os.networkInterfaces();

var myIp = networkInterfaces['Wi-Fi'][1].address

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
    offscreen:true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.webContents.openDevTools()
  win.loadFile('index.html')
  //win.webContents.on('did-navigate',(e)=>{console.log(e._getURL );});
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



ipcMain.handle('ping', async (event, ip, rowId) => {
  const res = await pinging(ip,rowId);
  var status = 'error';
  if(res.alive){
    status = 'online';
  }
  if(res.packetLoss == '100.000'){
    status = 'timeout';
  }
  var result = JSON.stringify({'status':status,'rowId':rowId,'pingDelay':res.avg,'packetLoss':res.packetLoss})
  return result;
})

async function pinging(ip,rowId){
  const result = await ping.promise.probe(ip, {timeout: 10})
  return result;
}
