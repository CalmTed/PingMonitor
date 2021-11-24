const version = '1.3.3';
//============
//  DEFINING
//============
const { app, BrowserWindow,ipcMain,dialog,Notification,Menu } = require('electron')
const storage = require('local-storage');
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
          saveDataFromAllWindows();
        },
        accelerator:'Ctrl+S'
      },
      {
        label: 'Open Config',
        click: async () => {
          openConfig()
        },
        accelerator:'Ctrl+O'
      },
      {
        label: 'New window',
        click: async () => {
          createWindow()
        },
        accelerator:'Ctrl+Shift+N'
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
      { role: 'toggleDevTools' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' }
    ]
  }
  ]
var wins = [];
var resivedWinData;
var dontQuitApp = false;
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
app.on('second-instance', (event, commandLine, workingDirectory) => {
  createWindow();
})
app.on('window-all-closed', function () {
  if(!dontQuitApp){
    if (process.platform !== 'darwin') app.quit()
  }
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
    if(res.avg == 'undefined' || res.avg == 'unknown' ||2==2){
      //get index of 'ms'
      let endOfDellayWord = -1;
      let lineO = res.output;
      // if(lineO.indexOf('ms') > -1){
      //   endOfDellayWord = lineO.indexOf('ms');
      // }
      // if(lineO.indexOf('мс') > -1){
      //   endOfDellayWord = lineO.indexOf('мс');
      // }
      let aline = lineO.split('TTL=')[0].split('=32')[1];
      if(aline){
        pingDellayArray = aline.split('').filter((l)=>{
          if(['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){return true}
        })
        pingDellay = Number(pingDellayArray.reverse().join(''));
      }else{
        pingDellay = -1;
      }
        // lineO.split('').reverse().forEach((l,i)=>{
        //   if(i >= startI && i < startI+5 && ['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){
        //     pingDellayArray.push(l);
        //   }
        // })
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
  console.log('main recived data:',data);
  if(data.call == 'saveRowsToFile'){
    if(data.rowsData&&data.winId){
      //if valid rows(kind of)
      rowsDataText = data.rowsData;
      rowsDataObj = JSON.parse(rowsDataText);
      if(rowsDataObj.rows){
        //save to storage by id
        let storageObj;
        if(storage.get('PMDataStr')){
          storageObj = JSON.parse(storage.get('PMDataStr'))
        }else{
          storageObj = {};
        }
        storageObj[data.winId] = {...rowsDataObj};
        storage.set('PMDataStr',JSON.stringify(storageObj))
        //if last window
        resivedWinData ++;
        if(resivedWinData == wins.length){
          resivedWinData = 0;
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
  }
  //else if(data.call == 'saveRowsToStorage'){
    // if(data.rowsData&&data.winId){
    //   rowsDataText = data.rowsData;
    //   rowsDataObj = JSON.parse(rowsDataText);
    //   console.log(storage.get('PMDataStr'));
    //   if(storage.get('PMDataStr')){
    //     storageObj = JSON.parse(storage.get('PMDataStr'))
    //   }else{
    //     storageObj = {};
    //   }
    //   storageObj[data.winId] = {...rowsDataObj};
    //   console.log(storageObj);
    //
    //   storage.set('PMDataStr',JSON.stringify(storageObj))
    // }
    //storage.set('PMDataStr',)
  //  console.log('TO DO');
  //}
  else{
      console.log("Expect to resive 'saveRowsToStorage' or 'saveRowsToFile' call parameters");
  }
})
//===========
//  MUTATING
//===========
const start = ()=>{
  //set menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu);
  createWindows()
}
function createWindows(dataObj){
  try{
    if(dataObj){
      if(dataObj.progName){//if its an old json save
        //we dont need to remove old ones
        if(storage.get('PMDataStr')){
          storedInfoObj = JSON.parse(storage.get('PMDataStr'));
        }else{
          storedInfoObj = {}
        }
        storedInfoObj[Object.keys(storedInfoObj).length] = dataObj;
        storage.set('PMDataStr',JSON.stringify(storedInfoObj));
        createWindow();
      }else{
        //remove old windows
        dontQuitApp = true;
        wins.forEach(w=>{
          w.destroy();
        })
        wins = [];
        dontQuitApp = false;
        storedInfoStr = storage.get('PMDataStr');
        if(storedInfoStr == null){
          storedInfoObj = {}
        }else{
          storedInfoObj = JSON.parse(storedInfoStr);
        }
        Object.entries(dataObj).forEach(winDataObj=>{
          // console.log(winDataObj);
          storedInfoObj[Object.keys(wins).length] = winDataObj[1];
          storage.set('PMDataStr',JSON.stringify(storedInfoObj));
          createWindow()
        })
      }
    }else{
      createWindow();
    }
  }catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle createWindows function\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
  }
}
function createWindow(){
  storedInfoString = storage.get('PMDataStr');
  let newWin;
  newWin = newWindow()
  newWin.loadFile('index.html')
  newWin.setTitle('#'+wins.length)
  wins.push(newWin)
  // newWin.onbeforeunload=(e)=>{
  //   //return false;
  //   console.log('closing');
  //   e.returnValue = false
  //   // if(dialog.showMessageBoxSync({
  //   //   message:'Закрити вікно?',
  //   //   type:'question',
  //   //   // buttons:['Закрити','Залишити'],
  //   //   cancelId:0,
  //   //   noLink:true
  //   // }) != ''){
  //   // }
  // }
  newWin.on('ready-to-show',()=>{
    wins.forEach(nw=>{
      let title = nw.getTitle()
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
  newWin.on('closed',(e)=>{
    wins.forEach((win,i)=>{
      if (win == e.sender){
        wins.splice(i,1);
      }
    })
    //sort all windows id's
    newId = 1;
    wins.forEach(win=>{
      win.setTitle('PingMonitor '+newId);
      win.webContents.send('asynchronous-message', {call:'sendDataToWin',id:(newId-1)})
      win.webContents.send('asynchronous-message', {call:'sendDataToWin',rowsData: 'relocateRows'})
      newId++;
    })
  })
}
function newWindow () {
   return new BrowserWindow({
    width: 1280,
    height: 700,
    icon: __dirname + '/assets/PM.ico',
    // title:'PingMonitor',
    autoHideMenuBar:true,
    scrollBounce:true,
    offscreen:false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    devTools:true,
    show:false,
  })
  //win.loadFile('index.html');
}
function saveDataFromAllWindows (){
  resivedWinData = 0;
  wins.forEach(win=>{
    win.webContents.send('asynchronous-message', {call: 'requestInfo',info:'rowsData'});
  })
}
function openConfig(){
  openFile({
    filters:[
      {
        name: 'PM file',
        extensions: ['pm']
      },
      {
        name: 'JSON file',
        extensions: ['json']
      }
    ]
  },function(dataStr){
    if(dataStr){
      //let storData = JSON.parse(storage.get('PMDataStr'));
      // if(storData == null){
      //   storData  = {};
      // }
      let dataObj = JSON.parse(dataStr);
      if(dataObj.progName){//if old .json one
        createWindows(dataObj);
      }else if(dataObj[0].progName){
        createWindows(dataObj);
        //change ids of newWinData
        //console.log(dataObj);
        // Object.keys(dataObj).forEach((obj)=>{
        //   console.log(storData)
        //   console.log(Object.keys(dataObj).length)
        //   storData[Object.keys(dataObj).length] = {};
        //   storData[Object.keys(dataObj).length] = dataObj[obj];
        // });
        //console.log(dataObj);
        //storage.set('PMDataStr',JSON.stringify(storData))
      }else{
        dialog.showMessageBox({
          title:'Error',
          message:'Program error',
          detail:'Can`t handle openConfig function\n Not a PingMonitor config file',
          type:'error'
        }).catch(err => {
          console.log(err)
        });
      }
      //console.log('file opened. Data:',data)
    }
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
function openFile(data,callback){
  try{
    if(!data.filters){
      data.filters = [{
        name: 'JSON file',
        extensions: ['json']
      }]
    }
    let filepath = dialog.showOpenDialogSync({
      filters: [...data.filters],
      title: 'Open config...',
      properties: ['openFile']
    })
    if(filepath){
      filepath = filepath[0];
      let text = fs.readFileSync(filepath, 'utf-8', (err, d) => {
        if(!err){
          return d;
        }else{
          return false;
        }
      });
      if(text){
        callback(text);
      }else{
        callback(false);
      }
    }else{
      callback(false);
    }
  }catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle openFile function\n'+e,
      type:'error'
    }).catch(err => {
      console.log(err)
    });
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
