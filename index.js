const version = '1.3.1';

const { app, BrowserWindow,ipcMain,dialog,Notification,Menu } = require('electron')
var ping = require('ping');
const fs = require("fs");
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
        // const {dialog } = require('electron')
        dialog.showMessageBox({
          title:'About',
          message:'About PingMonitor',
          detail:'PingMonitor is a free app to automatically ping and show status of network devices.\nVersion: '+version+'\n©Made by Fedir Moroz for Ukrainian Military Forces in Sep 2021 for no commercial use only.\nFor more info contact him at github.com/calmted',
          type:'none',
          icon:'assets/icons/PM_nofill.ico'
        }).catch(err => {
          console.log(err)
        });
      }
    },
      { role: 'quit' }
    ]
  },{
    label: "View",
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' }
    ]
  }
  ]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

var win
function createWindow () {
   win = new BrowserWindow({
    width: 1280,
    height: 750,
    icon: __dirname + '/assets/PM.ico',
    title:'PingMonitor',
    autoHideMenuBar:true,
    scrollBounce:true,
    offscreen:false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // fullscreen:true,
    // skipTaskbar:true,
    devTools:false,
  })
// win.webContents.openDevTools()
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  try {
    createWindow()
  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t creating window\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('ping', async (event, ip, rowId) => {
  try {
    const res = await pinging(ip,rowId);
    var status = 'error';
    let pingDellay = 0;
    if(res.avg == 'undefined' || res.avg == 'unknown' ){
      //get index of 'ms'
      let endOfDellayWord = -1;
      let lineO = res.output;
      if(lineO.indexOf('ms') > -1){
        endOfDellayWord = lineO.indexOf('ms');
      }
      if(lineO.indexOf('мс') > -1){
        endOfDellayWord = lineO.indexOf('мс');
      }
      if(endOfDellayWord == -1){
        pingDellay = -1;
      }else{
        //if multiple we ignore it (we need firder one or any one t all)
        //get all numbers before it (loop going backwards)
        let startI = lineO.length - endOfDellayWord
        pingDellayArray = [];
        lineO.split('').reverse().forEach((l,i)=>{
          if(i >= startI && i < startI+5 && ['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){
            pingDellayArray.push(l);
          }
        })
        pingDellay = Number(pingDellayArray.reverse().join(''));
      }
    }else{
      pingDellay = res.avg;
    }
    //TTL
    res.ttl = -1;
    if(res.output.indexOf('TTL=')!=-1){
      ttlArray = [];
      startTTL = res.output.indexOf('TTL=');
      lineTTL = res.output;
      lineTTL.split('').forEach((l,i)=>{
        if(i >= startTTL && i < startTTL+7 && ['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){
          ttlArray.push(l);
        }
      })
      res.ttl = Number(ttlArray.join(''));
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
    var result = JSON.stringify({'status':status,'rowId':rowId,'pingDellay':pingDellay*1,'packetLoss':res.packetLoss,'output':res.output,'ttl':res.ttl,'numericHost':res.numericHost,'full':JSON.stringify(res)})
    return result;

  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle ping ipcMain process\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
})

async function pinging(ip,rowId){
  try{
    const result = await ping.promise.probe(ip, {timeout: 10})
    return result;
  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle ping function\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
}

ipcMain.handle('saveFile', async (e,name,text,winName) => {
  try{
    text = JSON.parse(text);
    let rowsToSave = JSON.stringify(text.rows);
    text.hash = cyrb53(rowsToSave)
    text = JSON.stringify(text,undefined,4);
    dialog.showSaveDialog({
      filters: [{
        name: 'JSON file',
        extensions: ['json']
      }],
      title: winName,
      defaultPath: name
    }).then(fileName => {
      fs.writeFile(fileName.filePath, text, function(err) {
          if (err) return console.log(err);
      });
    }).catch(err => {
      console.log(err)
    });
  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle saveFile ipcMain process\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
})

ipcMain.handle('openFile', async (e,winName) => {
  try{
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
        try{
          data.text = fs.readFileSync(filepath, 'utf-8', (err, d) => {
            return d;
          });
        } catch(e){
          dialog.showMessageBox({
            title:'Error',
            message:'Program error',
            detail:'Can`t open file inside openFIle handle\n'+e,
            type:'error'
          }).catch(err => {
            console.log(err)
          });
        }
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
            body:'Цей файл не підходить для конфігурації PingMonitor (Opening error: file isn`t PM Config)'
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
  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle openFile ipcMain process\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
})

const cyrb53 = function(str, seed = 0) {
  try{
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle cyrb53 method\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
};
