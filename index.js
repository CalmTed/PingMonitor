const version = '1.3.5';
//============
//  DEFINING
//============
const { app, BrowserWindow,ipcMain,dialog,Notification,Menu } = require('electron');
const storage = require('local-storage');
const fs = require("fs");
const ping = require('ping');
async function saveAs(){};
async function openConfig(){};
var langCode = 'ua';
var lang = {};
const menuTemplate = [
    {
    label: tr('Edit'),
    submenu: [
      {
        label: tr('Save Config'),
        click: () => {
          saveDataFromAllWindows();
        },
        accelerator:'Ctrl+S'
      },
      {
        label: tr('Open Config'),
        click: async () => {
          openConfig()
        },
        accelerator:'Ctrl+O'
      },
      {
        label: tr('New window'),
        click: async () => {
          createWindow()
        },
        accelerator:'Ctrl+Shift+N'
      },
      { type: 'separator' },
    {
      label: tr('About'),
      click: async () => {
        dialog.showMessageBox({
          title:tr('About'),
          message:tr('About PingMonitor'),
          detail:tr('PingMonitor is a free app to automatically ping and show status of network devices.')+'\n'+tr('Version')+': '+version+'\n'+tr('©Made by Fedir Moroz for Ukrainian Military Forces in Sep 2021 for no commercial use only.')+'\n'+tr('For more info contact him at github.com/calmted'),
          type:'none',
          icon:'assets/icons/PM_nofill.ico'
        }).catch(err => {
          console.error(err)
        });
      }
    },
      { role: 'quit' }
    ]
  },{
    label: tr("View"),
    submenu: [
      {
        label: tr('Toggle Dark Mode'),
        click: async () => {
          // toggleDarkMode()
        },
        enabled:false,
        accelerator:'Ctrl+Shift+D'
      },
      { role: 'toggleDevTools' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' }
    ]
  }
  ]
var wins = [];
var graphWin;
var resivedWinData;
var dontQuitApp = false;//for reopening app with new data
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
      console.error(err)
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
ipcMain.handle('ping', async (event, ip, rowId) => {
  try {
    const res = await pinging(ip,rowId);
    var status = 'error';
    let pingDellay = 0;
    if(res.avg == 'undefined' || res.avg == 'unknown' ||2==2){
      //get index of 'ms'
      let endOfDellayWord = -1;
      let lineO = res.output;
      let aline = lineO.split('TTL=')[0].split('=32')[1];
      if(aline){
        pingDellayArray = aline.split('').filter((l)=>{
          if(['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){return true}
        })
        pingDellay = Number(pingDellayArray.reverse().join(''));
      }else{
        pingDellay = -1;
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
    var result = JSON.stringify({'status':status,'rowId':rowId,'pingDellay':pingDellay*1,'packetLoss':res.packetLoss,'output':res.output,'ttl':res.ttl,'numericHost':res.numericHost,'full':JSON.stringify(res)})
    return result;

  } catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle ping ipcMain process\n'+e,
      type:'error'
    }).catch(err => {
      console.error(err)
    })
  }
})

ipcMain.handle('sendDataToMain', async (e,data)=>{
  try{
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
          console.error('There are no rows in rowsData-_-');
        }
      }else{
        console.error("Expect to resive 'rowsData' and 'winId' parameters");
      }
    }else if(data.call == 'openGraphWin' || data.call == 'subscription_deliver'){
      // console.log(data)
      if(data.pingHist&&data.winId&&data.rowUid){
        if(typeof graphWin == 'undefined'){
            graphWin = getWindow({w:700,h:400,show:false});
            graphWin.loadFile('graph.html');
            graphWin.setTitle('Graph');
            graphWin.on('ready-to-show',()=>{
              graphWin.webContents.send('graphChannel', {
                call: 'deliver_data',
                data:{
                  pingHist:data.pingHist,
                  winId:data.winId
                },
              });
              graphWin.show();
            })
            graphWin.on('close',(event)=>{
              event.preventDefault();
              graphWin.hide();
              //TODO unsubscibe
            })
        }else{
          if(data.call == 'openGraphWin'){
            //subscribing for this address
            graphWin.webContents.send('graphChannel', {
              call: 'subsciption_set',
              data:{
                address:{w:data.winId,r:data.rowUid}
              },
            });
            if(!graphWin.isVisible()){
              graphWin.show()
            }else{
              graphWin.focus()
            }
          }else{
            //sening data
            graphWin.webContents.send('graphChannel', {
            call: 'deliver_data',
            data:{
              pingHist:data.pingHist,
              //for validating
              winId:data.winId,
              rowUid:data.rowUid,
            },
          });
          }
        }
        //change targeted row if needed
      }else{
        console.error("Expect to resive 'pingHist' and 'winId' and 'rowUid' parameters\nResived:\n",data);
      }
    }else{
        console.error("Expect to resive call parameter");
    }
  }catch(e){
      dialog.showMessageBox({
        title:'Error',
        message:'Program error',
        detail:'Can`t handle sendDataToMain ipcMain process\n'+e,
        type:'error'
      }).catch(err => {
        console.error(err)
      });
    }
})

ipcMain.handle('graphChannel', async (e,data)=>{
  try{
    if(data.call == 'data_request'){
      wins[data.winId].webContents.send('asynchronous-message', {call:'data_graph_request',rowUid:data.rowUid})
    }else if (data.call == 'subsciption_remove'){
      if(typeof data.winId != 'undefined' && typeof data.rowUid != 'undefined'){
        wins[data.winId].webContents.send('asynchronous-message', {call:'subsciption_remove',rowUid:data.rowUid})
      }else{
        console.warn('subsciption_remove require data to have winId and rowUid')
        console.warn('data:',data);
      }
    }
  }catch(e){
      dialog.showMessageBox({
        title:'Error',
        message:'Program error',
        detail:'Can`t handle graphChannel ipcMain process\n'+e,
        type:'error'
      }).catch(err => {
        console.error(err)
      });
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
      console.error(err)
    });
  }
}
function createWindow(){
  try{
    if(wins.length < 9){
      storedInfoString = storage.get('PMDataStr');
      let newWin;
      newWin = newWindow()
      newWin.loadFile('index.html')
      newWin.setTitle('#'+wins.length)
      wins.push(newWin)
      newWin.on('ready-to-show',()=>{
        wins.forEach(nw=>{
          let title = nw.getTitle()
          if(title.indexOf('#') >-1){
            let id = title.replace('#','')
            let win = wins[id]
            win.setTitle('PingMonitor '+((id*1)+1))
            win.webContents.send('asynchronous-message', {call:'sendDataToWin',id:id,langCode:langCode})
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
    }else{
      dialog.showMessageBox({
        title:'Info',
        message:'Maximum amount of windows',
        type:'info'
      }).catch(err => {
        console.error(err)
      });
    }
  }catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle createWindow function\n'+e,
      type:'error'
    }).catch(err => {
      console.error(err)
    });
  }
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
    // devTools:true,
    show:false,
  })
}
function saveDataFromAllWindows (){
  try{
    resivedWinData = 0;
    wins.forEach(win=>{
      win.webContents.send('asynchronous-message', {call: 'requestInfo',info:'rowsData'});
    })
  }catch(e){
      dialog.showMessageBox({
        title:'Error',
        message:'Program error',
        detail:'Can`t handle saveDataFromAllWindows function\n'+e,
        type:'error'
      }).catch(err => {
        console.error(err)
      });
    }
}
function openConfig(){
  try{
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
        let dataObj = JSON.parse(dataStr);
        try{
          if(typeof dataObj.progName != 'undefined'){//if old .json one
            createWindows(dataObj);
          }else if(dataObj[0].progName){
            createWindows(dataObj);
          }
        }catch(e){
          dialog.showMessageBox({
            title:'Error',
            message:'Program error',
            detail:'Not PingMonitor config file',
            type:'error'
          }).catch(err => {
            console.error(err)
          });
        }
      }
    })
  }catch(e){
    dialog.showMessageBox({
      title:'Error',
      message:'Program error',
      detail:'Can`t handle openConfig function\n'+e,
      type:'error'
    }).catch(err => {
      console.error(err)
    });
  }
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
      console.error(err)
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
        if(fileName.filePath){
          fs.writeFile(fileName.filePath, text, function(err) {
            if (err) return console.error(err);
          });
        }
      }).catch(err => {
        console.error(err)
      });
    } catch(e){
      dialog.showMessageBox({
        title:'Error',
        message:'Program error',
        detail:'Can`t handle writeFile\n'+e,
        type:'error'
      }).catch(err => {
        console.error(err)
      });
    }
  }else{
    console.error("Expect to resive 'name','text' and 'extention' parameters");
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
      if(typeof filepath == 'object'){
        filepath = filepath[0];
      }
      let text = false;
      if(filepath.substr(-3,4) == '.pm' || filepath.substr(-5,5) == '.json'){
        text = fs.readFileSync(filepath, 'utf-8', (err, d) => {
          if(!err){
            return d;
          }else{
            return false;
          }
        });
      }else{
        dialog.showMessageBox({
          title:'Error',
          message:'Program error',
          detail:'Wrong file type...',
          type:'error'
        }).catch(err => {
          console.error(err)
        });
        return false;
      }
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
      console.error(err)
    });
  }
}
function toggleDarkMode(){
  wins.forEach(nw=>{
    nw.webContents.send('asynchronous-message', {call:'toggleDarkMode'})
  })
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
      console.error(err)
    });
  }
};
function tr(w){
  let ret = false;
  if(langCode == lang.langCode){
    if(lang[w]){
      ret = lang[w];
    }else{
      console.log('there is not word for "'+w+'"');
    }
  }else{
    //load new lang file
    let filepath = 'assets/config/'+langCode+'.lang';
    let text = fs.readFileSync(filepath, 'utf-8', (err, d) => {if(!err){return d;}else{return false;}});
    if(!text){
      langCode = 'en'
      filepath = 'assets/config/'+langCode+'.lang';
      text = fs.readFileSync(filepath, 'utf-8', (err, d) => {if(!err){return d;}else{return false;}})
    }
    if(JSON.parse(text)){
      if(JSON.parse(text).langCode){
        lang = JSON.parse(text)
        if(lang[w]){
          ret = lang[w];
        }else{
          console.log('getting from backup langCode but still not word for '+w);
        }
      }
    }else{
      //show exeption
      console.log('tr() exeption');
    }
  }
  if(!ret){
    return w;
  }else{
    return ret;
  }
}
const getWindow = ({w,h,show})=>{
  return new BrowserWindow({
   width: w,
   height: h,
   icon: __dirname + '/assets/PM.ico',
   // title:'PingMonitor',
   autoHideMenuBar:true,
   scrollBounce:true,
   offscreen:false,
   webPreferences: {
     nodeIntegration: true,
     contextIsolation: false
   },
   // devTools:true,
   show:show,
 })
}
