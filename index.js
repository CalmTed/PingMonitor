const { app, BrowserWindow,ipcMain } = require('electron')
var network = require('network-config');
var ping = require('ping');
var os = require("os");
var networkInterfaces = os.networkInterfaces();

try {
   var myIp = networkInterfaces['Wi-Fi'][1].address
} catch(e){
  console.log('Network error no wifi connections');
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
    icon: __dirname + '/assets/PM.ico',
    title:'PingMonitor',
    autoHideMenuBar:true,
    scrollBounce:true,
    offscreen:true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
    // fullscreen:true,
    // skipTaskbar:true,
    // devTools:true,
  })
//  win.webContents.openDevTools()
  win.loadFile('index.html');
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
  let pingDelay = 0;
  if(res.avg == 'undefined' || res.avg == 'unknown' ){
    //get index of 'ms'
    let endOfDelayWord = -1;
    let lineO = res.output;
    if(lineO.indexOf('ms') > -1){
      endOfDelayWord = lineO.indexOf('ms');
    }
    if(lineO.indexOf('мс') > -1){
      endOfDelayWord = lineO.indexOf('мс');
    }
    if(endOfDelayWord == -1){
      pingDelay = -1;
    }else{
      //if multiple we ignore it (we need firder one or any one t all)
      //get all numbers before it (loop going backwards)
      let startI = lineO.length - endOfDelayWord
      pingDelayArray = [];
      lineO.split('').reverse().forEach((l,i)=>{
        if(i >= startI && i < startI+5 && ['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){
          pingDelayArray.push(l);
        }
      })
      pingDelay = Number(pingDelayArray.reverse().join(''));
    }


  }else{
    pingDelay = res.avg;
  }
  if(res.alive){
    status = 'online';
  }
  if(res.packetLoss == '100.000'){
    status = 'timeout';
  }
  if(!res.alive && res.packetLoss == '0.000'){
    status = 'offline';
  }
  if(res.pingIP == '10.0.0.0'){
    status = 'online';
  }

  console.log('-------');
  console.log(new Date());
  console.log(res);
  var result = JSON.stringify({'status':status,'rowId':rowId,'pingDelay':pingDelay,'packetLoss':res.packetLoss,'output':res.output,'full':JSON.stringify(res)})
  return result;
})

async function pinging(ip,rowId){
  const result = await ping.promise.probe(ip, {timeout: 10})
  return result;
}
//networkInterfaces['Loopback Pseudo-Interface 1'][1].address = '127.0.0.2';
//console.log(JSON.stringify(networkInterfaces));

ipcMain.handle('checkNetwork', async (event) => {
  var ret = {};
  network.interfaces(function(err, interfaces){
      ret = interfaces;
  });
  return JSON.stringify(ret);
})

ipcMain.handle('changeNetwork', async (event , name , mode , ip , netmask , broadcast , gateway) => {
  if(mode = 'dhcp'){
    network.configure(name, {
        ip: ip,
        netmask:netmask,
        broadcast: broadcast,
        gateway: gateway,
        restart: true
    }, function(err){
      console.log(err);
      var result = 'maybe it changed';
      return result;
    })
  }else if(mode == 'dhcp'){
    network.configure(name, {
        dhcp: true,
        restart: false
    }, function(err){
      console.log(err);
      var result = 'maybe it changed';
      return result;
    });
  }

})
