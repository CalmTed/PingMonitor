const { app, BrowserWindow,ipcMain,dialog,Notification,Menu } = require('electron')
var ping = require('ping');
const fs = require("fs");
var os = require("os");
var networkInterfaces = os.networkInterfaces();
async function saveAs(){}
async function openConfig(){}
const template = [
    {
    label: "Edit",
    submenu: [
      {
        label: 'Save Config',
        click: async () => {
          win.webContents.send('asynchronous-message', {'call': 'saveAs'});
        },
        accelerator:'Ctrl+S'
      },
      {
        label: 'Open Config',
        click: async () => {
          win.webContents.send('asynchronous-message', {'call': 'openConfig'});
        },
        accelerator:'Ctrl+O'
      },
      { type: 'separator' },
      {
        label: 'About',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        },
        accelerator:'Ctrl+O'
      },
      { role: 'quit' }
    ]
  },{
    label: "View",
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'toggleDevTools' }
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' }
    ]
  }
  ]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

try {
   var myIp = networkInterfaces['Wi-Fi'][1].address
} catch(e){
  console.log('Network error no wifi connections');
}
var win
function createWindow () {
   win = new BrowserWindow({
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
    },
    // fullscreen:true,
    // skipTaskbar:true,
    devTools:false,
  })
//  win.webContents.openDevTools()
  win.loadFile('index.html');
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

  // console.log('-------');
  // console.log(new Date());
  // console.log(res);
  var result = JSON.stringify({'status':status,'rowId':rowId,'pingDelay':pingDelay,'packetLoss':res.packetLoss,'output':res.output,'full':JSON.stringify(res)})
  return result;
})

async function pinging(ip,rowId){
  const result = await ping.promise.probe(ip, {timeout: 10})
  return result;
}
//networkInterfaces['Loopback Pseudo-Interface 1'][1].address = '127.0.0.2';
//console.log(JSON.stringify(networkInterfaces));

ipcMain.handle('saveFile', async (e,name,text,winName) => {
  text = JSON.parse(text);
  let rowsToSave = JSON.stringify(text.rows)
  // console.log();
  text.hash = cyrb53(rowsToSave)
  text = JSON.stringify(text,undefined,4);
  dialog.showSaveDialog({
    filters: [{
      name: 'JSON file',
      extensions: ['json']
    }],
    title: winName,
    defaultPath: name
    // properties: ['saveFile']
  }).then(fileName => {
    fs.writeFile(fileName.filePath, text, function(err) {
        if (err) return console.log(err);
        // let not = new Notification({
        //   title:'Saved',
        //   body:'Config saved'
        //
        // })
        // not.show()
    });
  }).catch(err => {
    console.log(err)
  });
})

ipcMain.handle('openFile', async (e,winName) => {
  ret = await dialog.showOpenDialog({
    filters: [{
      name: 'JSON file',
      extensions: ['json']
    }],
    title: winName,
    properties: ['openFile']
  }).then((result) => {
    if(!result.canceled){
      let filepath = result.filePaths[0];
      let data = {};
      //clearing name
      //async didnt want to work
      data.text = fs.readFileSync(filepath, 'utf-8', (err, d) => {
        return d;
      });
      if(JSON.parse(data.text).progName == 'PingMonitor'){
        if(JSON.parse(data.text).hash != cyrb53(JSON.stringify(JSON.parse(data.text).rows))){
          let n = new Notification({
            title:'Зверни увагу',
            subtitle:'Attention',
            body:'Конфіг був змінений вручну\n (Attention: config has beed edited manualy)'
          })
          n.show();
        }
        return data;
      }else{
        let n = new Notification({
          title:'Помилка відкриття',
          subtitle:'Opening error',
          body:'Цей файл не підходить для конфігурації PingMonitor (Opening error: file isn`t PM Config )'
        })
        n.show();
        return 'canceled';
      }
    }else{
      return 'canceled'
    }
  }).catch(err => {
    console.log(err)
  });

  return ret;
})

const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};
