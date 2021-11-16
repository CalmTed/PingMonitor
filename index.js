const version = '1.3.1';
//============
//  DEFINING
//============
const { app, BrowserWindow,ipcMain,dialog,Notification,Menu } = require('electron')
const Storage = require('storage')
const storage = new Storage();
const fs = require("fs");
const ping = require('ping');
async function saveAs(){}
async function openConfig(){}
const menuTemplate = [
    {
    label: "Edit",
    submenu: [
      {
        label: 'Save Config',
        click: () => {
          saveDataFromAllWindows()
          //win.webContents.send('asynchronous-message', {'call': 'saveAs'});
        },
        accelerator:'Ctrl+S'
      },
      {
        label: 'Open Config',
        click: async () => {
          //win.webContents.send('asynchronous-message', {'call': 'openConfig'});
        },
        accelerator:'Ctrl+O'
      },
      { type: 'separator' },
    {
      label: 'About',
      click: async () => {
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
var wins = [];

//=============
//  APP:EVENTS
//=============
app.whenReady().then( async function(){
  try {
    start();
  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t start program\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

//===========
//  TALKING
//===========
/*
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
ipcMain.handle('showStats', async (e,winName) => {
  try{

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
*/
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
ipcMain.handle('sendDataToMain', async(e,data)=>{
  if(data.call == 'saveRowsToFile'){
    if(data.rowsData&&data.winId){
      //if valid rows(kind of)
      rowsDataText = data.rowsData;
      rowsDataObj = JSON.parse(rowsDataText);
      if(rowsDataObj.rows){
        //save to storage by id
        let storageObj;
        if(storage.get('PMData')){
          storageObj = JSON.parse(storage.get('PMData'))
        }else{
          storageObj = {};
        }
        storageObj[data.winId] = {}
        storageObj[data.winId] = rowsDataText;
        storage.set(JSON.stringify(storageObj))
        //if last window
        console.log(((data.winId*1)+1)+'/'+wins.length);
        if(((data.winId*1)+1) == wins.length){
          //write to file
          let time = new Date();
          let fileName = 'PMConfig_'+time.getFullYear()+(time.getMonth()+1)+time.getDate()+time.getHours()+time.getMinutes()+time.getSeconds();
          writeFile({
            name:fileName,
            text:JSON.stringify(storageObj),
            extention:'pm'
          })
        }

      }else{
        console.log('There are no rows in rowsData-_-');
      }
    }else{
      console.log("Expect to resive 'rowsData' and 'winId' parameters");
    }
  }else if(data.call == 'saveRowsToStorage'){
    console.log('TO DO');
  }else{
      console.log("Expect to resive 'saveRowsToStorage' or 'saveRowsToFile' call parameters");
  }
})
//===========
//  MUTATING
//===========
const start = ()=>{
  //set menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
  //what if there are some stored info
  storedInfoString = storage.get('PMData')
  let newWin;
  newWin = createWindow()
  newWin.loadFile('index.html')
  newWin.setTitle('#'+wins.length)
  wins.push(newWin)
  newWin.on('ready-to-show',()=>{
    wins.forEach(nw=>{
      let title = nw.getTitle();
      if(title.indexOf('#') >-1){
        let id = title.replace('#','')
        let win = wins[id]
        win.setTitle('PingMonitor '+((id*1)+1))
        win.webContents.send('asynchronous-message', {call:'sendDataToWin',id:id})
        if(storedInfoString){
          storedInfoObj = JSON.parse(storedInfoString)
          if(storedInfoObj[id]){
            win.webContents.send('asynchronous-message', {call:'sendDataToWin',rowsData: storedInfoObj[id]})
          }else{
            win.webContents.send('asynchronous-message', {call:'sendDataToWin',rowsData:'useLocal'})
          }
        }else{
          win.webContents.send('asynchronous-message', {call:'sendDataToWin',rowsData:'useLocal'})
        }
        nw.show()
      }
    })
  })
  newWin.on('closed',()=>{
    console.log("TO DO");
    //sort all windows id's
  })
}
function createWindow () {
   return new BrowserWindow({
    width: 1280,
    height: 750,
    icon: __dirname + '/assets/PM.ico',
    // title:'PingMonitor',
    autoHideMenuBar:true,
    scrollBounce:true,
    offscreen:false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    devTools:false,
    show:false,
  })
  //win.loadFile('index.html');
}
function saveDataFromAllWindows (){
  wins.forEach(win=>{
    win.webContents.send('asynchronous-message', {call: 'requestInfo',info:'rowsData'});
  })
}
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
function writeFile (data){
  if(data.name&&data.text&&data.extention){
    try{
      text = JSON.parse(data.text);
      if(typeof text.rows == 'string'){
        text.hash = text.rows
      }else{
        text.hash = JSON.stringify(text.rows)
      }
      text = JSON.stringify(text,undefined,4);
      dialog.showSaveDialog({
        filters: [{
          name: (data.extention.toUpperCase())+' file',
          extensions: [data.extention]
        }],
        title: 'Saving config',
        defaultPath: data.name
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
        detail:'Can`t handle writeFile\n'+e,
        type:'error'
      }).catch(err => {
        console.log(err)
      });
    }
  }else{
    console.log("Expect to resive 'name','text' and 'extention' parameters");
  }
}
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
