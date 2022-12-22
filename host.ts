import { BrowserWindow,dialog } from "electron"

const pingMonitor = ()=>{
  const version = process.env.npm_package_version?process.env.npm_package_version:'1.4.2'
  const lang = process.env.LANG
  const dev = (process.env.npm_lifecycle_event === 'tstart')
  const prefix = process.env.npm_lifecycle_event !== 'tstart'?'../../':'./'
  const { app,dialog } = require('electron')
  const actionTypes = require(prefix+'components/actionTypes')
  const fileManager = require(prefix+'components/fileManager')
  const config = require(prefix+'components/config')
  const loger = require(prefix+'components/loger')
  const pinger = require(prefix+'components/pinger')
  const stateManager = require(prefix+'components/stateManager')
  const store = new stateManager({
    version:version,
    dialog:dialog,
    fileManager,
    actionTypes,
    loger,
    config,
    pinger
  })
  const comunicatorCore = require(prefix+'components/comunicatorCore')
  const comunicator = new comunicatorCore()

  var windows:object = {}
  var dontQuitApp = false
  var lastAutosave = new Date().getTime()

  const pingCheck = async (_coreState:any,_resolve:any)=>{
    const timeNow = new Date().getTime()
    _coreState.monitors.forEach(async (_mon) => {
      // for(every mo nitor & every row)
      //ITS MIGHT BE QUITE EXPENCIVE!!

      //if not busy
          //if not paused
            //set busy and mark timer
        //if busy
          //if not paused
            //if time has passed < do it with stringify, not json.parse
            //await probe
            //query probe result
          //else if paused < even if time is not passed 
            //cancel busy
      _mon.rows.forEach( async (_rowStr) => {
        if(!_resolve.set){
          const isPaused = _rowStr.includes(`"isPaused":true`)
          if(!_rowStr.includes(`"isBusy":true`)){
            if(!isPaused){
              const _rowObj = JSON.parse(_rowStr)
              _resolve = {
                set:true,
                action:actionTypes.ROW_SET_PROP,
                payload:`{"rowId":${_rowObj.rowId},"key":"isBusy","value":true}`
              }
            }//end is paused
          }else{//it is busy
            const _rowObj = JSON.parse(_rowStr)
            if(!isPaused){
              //check time
              if(_rowObj.lastPinged +  _rowObj.updateTimeMS < timeNow){
                _resolve = {
                  set:true,
                  action:actionTypes.ROW_SUBMIT_PING_PROBE,
                  payload:JSON.stringify({rowId: _rowObj.rowId})
                }
              }
            }else{
              _resolve = {
                set:true,
                action:actionTypes.ROW_SET_PROP,
                payload:`{"rowId":${_rowObj.rowId},"key":"isBusy","value":false}`
              }
            }
          }
        }//end is resolve.set
      })
    })
    return _resolve;
  }
  const monitorCheck = (_coreState:any,_prevState:any,_resolve:any)=>{
    // if number on wins is not the same then  addWindow|removeWindow
    let monitorsIds = (_state)=>{
      let _monsArrNum:number[] = [];
      _monsArrNum = _state.monitors.map(_mon=>Number(_mon.monitorId));
      return _monsArrNum;
    }
    let uniqueWinSubs = (_state)=>{
      let _numOfWins:number[] = [];
      _state.windows.forEach(_window=>{
        let subKey = Number(JSON.parse(_window).subscriptionKey)
        if(_numOfWins.indexOf(subKey) == -1){
          _numOfWins.push(subKey)
        }
      })
      return _numOfWins;
    }
    let findAllExtraWindowsStr = (_state,_monIds:number[],_subKeys:number[])=>{
      let _winArr  = []
      _subKeys.forEach(_subKey=>{
        if(!_monIds.includes(_subKey)){
          _state.windows.forEach(_win=>{
            if(_win.includes(`"subscriptionKey":"${_subKey}"`)){
              _winArr.push(_win)
            }
          })
        }
      })
      return _winArr
    }
    let findAllUnwindowedMonitors = (_state,_monIds:number[],_subKeys:number[])=>{
      let _monitArr = []
      _state.monitors.forEach(_mon=>{
        if(!_subKeys.includes(_mon.monitorId)){
          _monitArr.push(_mon)
        }
      })
      return _monitArr
    }
    let _uniqueWinSubsArr:number[] = uniqueWinSubs(_coreState);
    let _monitorsIdsArr:number[] = monitorsIds(_coreState);
    let _extraWindowsStrArr:string[] = findAllExtraWindowsStr(_coreState,_monitorsIdsArr,_uniqueWinSubsArr)
    let _unwindowedMonitors = findAllUnwindowedMonitors(_coreState,_monitorsIdsArr,_uniqueWinSubsArr)
    if(_unwindowedMonitors.length>0){//add window
      _resolve = {
        set:true,
        action:actionTypes.ADD_NEW_WINDOW_BY_SUBKEY,
        //we can't loop throght full list, so lets choose just first one for this iteration
        payload:_unwindowedMonitors[0].monitorId.toString()
      }
    }else if (_extraWindowsStrArr.length>0){//remove window with unused monitor id
      _resolve = {
        set:true,
        action:actionTypes.REMOVE_WINDOW_BY_ID,
        //selecting only first element in case if difference is more then one window
        payload:JSON.parse(_extraWindowsStrArr[0]).winId.toString()
      }
    }
    if(!monitorsIds.length){
      _resolve = {
        set:true,
        action:actionTypes.ADD_NEW_MONITOR,
        payload:''
      }
    }

    return _resolve
  }
  const windowCheck = async (_coreState:any,_prevState:any,_resolve:any)=>{//this function depends on global variable: windows
    let getNormalWindow =  async (winData = {width:700,height:400,top:0,left:0,show:false})=>{
      let _aot = false
      let _aotC = await config.getParam('alwaysShowOnTop')
      _aotC.success?_aot=_aotC.value:0
      let _htb = true
      let _htbC = await config.getParam('hideTitleBar')
      _aotC.success?_htb=!_htbC.value:0
      let _ret = new BrowserWindow({
        width: winData.width,
        height: winData.height,
        x: winData.left,
        y: winData.top,
        icon: __dirname + '/assets/PM.ico',
        autoHideMenuBar:true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        },
        alwaysOnTop:_aot,
        frame:_htb,
        // titleBarStyle:_htb?'default':'hidden',
        transparent:!_htb,
        // resizable:true,
        // devTools:true,
        show:winData.show,
      })
      return _ret
    }
    // do we need to add new browser window
    let uncreatedBrowserWindowsF = (_state)=>{
      let _ret:{
        winId:string
        width:number
        height:number
        top:number
        left:number
      }[] = []
      _state.windows.forEach(_wStr=>{
        let _wObj = JSON.parse(_wStr)
        if(windows[_wObj.winId] == undefined){
          _ret.push({
            winId:_wObj.winId,
            width: _wObj.width,
            height: _wObj.height,
            top: _wObj.top,
            left: _wObj.left
          })
        }
      })
      return _ret
    }
    // do we need to remove some browser windows
    let undelitedBrowserWindowsF = (_state)=>{
      let _ret:string[] = []
      Object.keys(windows).forEach(_wId=>{
        if(_state.windows.filter(_wStr=>{return _wStr.indexOf(`"winId":${_wId}`)>-1}).length == 0){
          _ret.push(_wId)
        }
      })
      return _ret
    }
    let uncreatedBrowserWIndows = uncreatedBrowserWindowsF(_coreState)
    let undelitedBrowserWindows = undelitedBrowserWindowsF(_coreState)
    if(uncreatedBrowserWIndows.length){
      let _configData = await config.getState()
      uncreatedBrowserWIndows.forEach(async ({winId,width,height,top,left}) => {
        windows[winId] = await getNormalWindow({width,height,top,left,show:false})
        windows[winId].loadFile('pm.html');
        // windows[winId].removeMenu();
        windows[winId].setBackgroundColor('#222222');
        //this event is not async!
        windows[winId].on('close', (e)=>{
          store.queue({action: actionTypes.MONITOR_AUTOSAVE, payload:''})
          store.queue({
            action:actionTypes.REMOVE_WINDOW_BY_ID,
            payload:JSON.stringify({winId:winId})
          })
        })
        windows[winId].on('resized', (e)=>{
          const [win_w, win_h] = windows[winId].getSize()
          store.queue({
            action:actionTypes.WIN_SET_PROP,
            payload:JSON.stringify({
              winId:winId,
              key:'width',
              value:win_w
            })
          })
          store.queue({
            action:actionTypes.WIN_SET_PROP,
            payload:JSON.stringify({
              winId:winId,
              key:'height',
              value:win_h
            })
          })
        })
        windows[winId].on('moved', (e)=>{
          const [win_x, win_y] = windows[winId].getPosition()
          store.queue({
            action:actionTypes.WIN_SET_PROP,
            payload:JSON.stringify({
              winId:winId,
              key:'left',
              value:win_x
            })
          })
          store.queue({
            action:actionTypes.WIN_SET_PROP,
            payload:JSON.stringify({
              winId:winId,
              key:'top',
              value:win_y
            })
          })
        })

        windows[winId].on('ready-to-show',async ()=>{
          await comunicator.send({
            window:windows[winId],
            command:'sendInitData',
            payload:JSON.stringify({winId:winId,configData:_configData,isProduction:process.env.npm_lifecycle_event !== 'tstart'})
          })
          windows[winId].show()
          if(dontQuitApp){
            dontQuitApp = false
          }
        })
        
      });
    }
    if(undelitedBrowserWindows.length){
      if (store.__lastSave + 60 * 1000 < new Date().getTime()) {
       return _resolve = {
         action: actionTypes.MONITOR_AUTOSAVE,
         payload:''
       }
      }
      undelitedBrowserWindows.forEach(_winId => {
        windows[_winId].destroy()
        delete windows[_winId]
      })
    }
    
    if(_resolve.set){
      return _resolve
    }
    let checkFullDifference = (_obj1:object,_obj2:object)=>{
      let checkDiffStr = (_one:string,_two:string) => {
        if(!_two){
          return true
        }
        return _one !== _two
      }
      let _ret:any = {}

      //we expect two objects to have the same scheme to minimize computation time
      Object.entries(_obj1).forEach(([_k,_v])=>{
        if(typeof _obj1[_k] != 'object'){//its a string or a number
          if(typeof _obj2 != 'undefined'){
            if(typeof _obj2[_k] != 'undefined'){
              let strDiff = checkDiffStr(_obj1[_k].toString(),_obj2[_k].toString())
              if(strDiff){
                _ret[_k] = _obj1[_k]
              }
            }else{
              _ret[_k] = _obj1[_k]//added new element
            }
          }else{
            _ret = _obj1//added new element
          }
        }else{//its an object
          if(typeof _obj2[_k] != 'undefined'){//prev obj have it, so its not new
            if(Array.isArray(_obj1[_k])){//its an array
              _obj1[_k].forEach((_obj1El,__obj1ElIndex) => {//for each element in array
                if(checkDiffStr(_obj1El.toString(), _obj2[_k]?.[__obj1ElIndex]?.toString())){
                  if(!_ret[_k]){
                    _ret[_k] = []
                  }
                  _ret[_k].push(_obj1El)
                }
              })
            }else{//its an object
              _ret[_k] = checkFullDifference(_obj1[_k],_obj2[_k])
            }
          }else{//its new, add it
            _ret[_k] = _obj1[_k]
          }
        }
      })
      return _ret
    }
    if(typeof _coreState.monitors != 'undefined'){
      let differenceObject:any = checkFullDifference(_coreState.monitors,_prevState.monitors)
      Object.entries(differenceObject).forEach(async ([_monInd,_monVal]) => {
        const targetId = _coreState.monitors[_monInd].monitorId
        _coreState.windows.forEach(async _winStr => {
          //for ease window where subscriptionKey in the list of changed monitors
          if(_winStr.includes(`"subscriptionKey":"${targetId}"`)){
            let _winObj:any = JSON.parse(_winStr)
            //copying monitor state to send row data to the window
            _winObj.monitor = _coreState.monitors[_monInd]
            // update window with communicatorCore
            await comunicator.send({
              window:windows[_winObj.winId],
              command:'sendWinState',
              payload:JSON.stringify(_winObj)
            })
          }
        })
      }) 
    }
    return _resolve
  }
  const compute = async (_coreState:any,_prevState:any)=>{
    let _resolve:{set:boolean,action,payload?:any} = {
      set:false,
      action:{
        action:''
      }
    }
    try{
      if(!_resolve.set){
        _resolve = await pingCheck(_coreState,_resolve)
      }
      if(!_resolve.set){
        _resolve = await windowCheck(_coreState,_prevState,_resolve)
      }
      if(!_resolve.set){
        _resolve = monitorCheck(_coreState,_prevState,_resolve)
      }
      if(!_resolve.set){
        const time = new Date().getTime()
        if(lastAutosave + (60 * 1000) < time){
          lastAutosave = time
          _resolve = {
            set: true,
            action:actionTypes.MONITOR_AUTOSAVE,
            payload:''
          }
        }
      }
      if(_resolve.set){
        dev?console.debug('Computed with action:',_resolve.action,_resolve.payload):0
        store.queue({action:_resolve.action,payload:_resolve.payload})
      }else{//if no resolve
        let busyRows = 0
        _coreState.monitors.forEach(_monitor => {
          _monitor.rows.forEach(_rowStr => {
            if(_rowStr.includes(`"isBusy":true`)){
              busyRows++
            }
          })
        }) 
        if(busyRows){
          setTimeout(()=>{
            store.queue({action:actionTypes.SET_PROPERTY_FOR_TESTING,payload:Math.round((Math.random()*1000)*1000)})
          },500)
        }
      }
    }catch(err){
      dialog.showErrorBox('Error',`Unable to compute\nError:${err}`)
    }
  }
  const renderConfig = (_newConfigObj,_windows)=>{
    //render always on top for all windows
    let _needToChangeAOT = _newConfigObj.alwaysShowOnTop != Object.entries(windows)[0][1].isAlwaysOnTop()
    if(_needToChangeAOT){
      Object.entries(windows).forEach(([_wk,_wv])=>{
        _wv.setAlwaysOnTop(_newConfigObj.alwaysShowOnTop,'screen-saver')
        _wv.setOpacity(_newConfigObj.alwaysShowOnTop?0.9:1)
      })
    }
  }
  store.subscribe(compute)//execute compute on any state change
  comunicator.subscribe({
    channel:'window',
    commandListString:'dispachAction, getConfigData, configSetProp, configRestoreDefaults',
    callback: async ({command, payload})=>{
      const dispachAction = async (payload) => {
        dev?console.debug('resived action',payload):null
        let _plObj = JSON.parse(payload)
        if(_plObj.action == 'monitorImportConfig'){
          dontQuitApp = true
        }
        let startTime = new Date().getTime()
        let actionResult = store.queue({action:_plObj.action,payload:_plObj.payload})
        let endTime = new Date().getTime()
        dev?console.debug(`Time to queue user action ${endTime - startTime}ms`):0
        if(actionResult && _plObj.action == 'monitorImportConfig'){
          setTimeout(()=>{
            if(dontQuitApp){
              dontQuitApp = false
            }
          },12000)
        }
      }
      const getConfigData = async (payload) => {
        dev?console.debug('resived request for config',payload):0
        let _plObj = JSON.parse(payload)
        let _configData = await config.getState()
        await comunicator.send({
          window:windows[_plObj],
          command:'sendConfig',
          payload:_configData
        })
      }
      const configSetProp = async (payload) => {
        dev?console.debug('resived request to change config',payload):0
        let _plObj = JSON.parse(payload)
        let _configSetResult = await config.setParam({key:_plObj.key,value:_plObj.value})
        if(_configSetResult.success == false){
          return 0;
        }
        let _configData = await config.getState()
        renderConfig(_configData,windows)//updating window visibility
        //sending new config
        Object.entries(windows).forEach(async ([_winId,_winObj])=>{
          await comunicator.send({
              window:_winObj,
              command:'sendConfig',
              payload:_configData
          })
        })
        if(_plObj.key == 'langCode'){
          await store.queue({action:actionTypes.WIN_WRITE_NEW_LANG_WORDS,payload:_plObj.value})
        }
      }
      const configRestoreDefaults = async (payload) => {
        dev?console.debug('resived request to restore defaults of config',payload):0
        let _configSetResult = await config.restoreDefault()
        if(_configSetResult.success == false){
          return 0;
        }
        let _configData = await config.getState()
        renderConfig(_configData,windows)
        Object.entries(windows).forEach(async ([_winId,_winObj])=>{
          await comunicator.send({
              window:_winObj,
              command:'sendConfig',
              payload:_configData
            })
        })
      }
      switch(command){
        case 'dispachAction':
          try{
            await dispachAction(payload)
          }catch(err){
            dialog.showErrorBox('Error',`Unable to dispach action that was recived from a window\nPayload:${payload}\nError:${err}`)
          }
        break;
        case 'getConfigData':
          try{
            await getConfigData(payload)
          }catch(err){
            dialog.showErrorBox('Error',`Unable to get config data that was requested by a window\nPayload:${payload}\nError:${err}`)
          }
        break;
        case 'configSetProp':
          try{
            await configSetProp(payload)
          }catch(err){
            dialog.showErrorBox('Error',`Unable to set config prop that was requested by window\nPayload:${payload}\nError:${err}`)
          }
        break;
        case 'configRestoreDefaults':
          try{
            await configRestoreDefaults(payload)
          }catch(err){
            dialog.showErrorBox('Error',`Unable to set config defaults that was requested by window\nPayload:${payload}\nError:${err}`)
          }
        break;
      }
    }
  })
  
  app.whenReady().then( async function(){
    try{
      //execute compute on any state change
      //await store.dispach({action:actionTypes.SET_PROPERTY_FOR_TESTING,payload:42})//to create initial window
      await store.queue({action: actionTypes.MONITOR_AUTOOPEN, payload:''})//to load last autosaved state
    }catch(err){
      dialog.showErrorBox('Error',`Unable to start Ping Monitor\nError:${err}`)
    }
    // if(dev){
    //   testComponents(fileManager,config,loger,pinger,store)
    // }
    
  })
  app.on('second-instance', async (event, commandLine, workingDirectory) => {
    await store.queue({
      action:actionTypes.ADD_NEW_MONITOR,
      payload:''
    })
  })
  app.on('window-all-closed', () => {
    if(!dontQuitApp){
      //this horrable timeout os for autosave to be able to save in time
      //because close event is not async and will not wait for fileSystem
      dev?console.debug('waiting to close app'):0
      setTimeout(()=>{
        if (process.platform !== 'darwin') app.quit()
      }, 4000)
    }else{
      console.debug('will not close all windows')
    }
  })
}
try{
  pingMonitor()
}catch(err){
  dialog.showErrorBox('Error',`cant start an app\n${err}`)
}
const testComponents = async (fileManager: any,config:any,loger:any,pinger:any,store:any)=>{
  
  //fileManager
  const testFileName = '__test.txt';
  await fileManager.write({openDialog:false,path:testFileName,content:testFileName})
  const fileContent = await fileManager.read({openDialog:false,path:testFileName})
  const wasDeleted = await fileManager.remove({openDialog:false,path:testFileName})
  if(fileContent.success && wasDeleted.success){
    console.debug('[PASS] test 1 fileManager!')
  }else{
    console.debug('[FAIL] test 1 fileManager!')
    console.debug(`${!fileContent.success?fileContent.errorMessage:''}`)
    console.debug(`${!wasDeleted.success?wasDeleted.errorMessage:''}`)
  }

  //config
  const testConfigValue = Math.round((Math.random()*1000)*1000)
  const setResult = await config.setParam({key:'__keyForTesting',value:testConfigValue})
  const testValueResult = await config.getParam('__keyForTesting')
  if(setResult.success&&testValueResult.value == testConfigValue){
    console.debug('[PASS] test 2 config!')
  }else{
    console.debug('[FAIL] test 2 config!')
    typeof setResult.errorMessage!='undefined'?console.debug(setResult.errorMessage):0
    console.debug(`Recived: ${testValueResult.value} Expected:${testConfigValue}`)
  }

  //logger
  if(loger.out('Initial test')){
    console.debug('[PASS] test 3 loger!')    
  }else{
    console.debug('[FAIL] test 3 loger!')
  }

  //pinger  
  let pingResult = await pinger.probe({address:'localhost',rowId:0})
  if(pingResult.success){
    console.debug('[PASS] test 4 pinger!')
    // console.debug(pingResult)
  }else{
    console.debug('[FAIL] test 4 pinger!:')
    console.debug(pingResult.errorMessage)
  }

  let valueForTesting = Math.round((Math.random()*1000)*1000)
  let stateManagerTestResult = false
  store.queue({action:actionTypes.SET_PROPERTY_FOR_TESTING,payload:valueForTesting})
  store.queue({action:actionTypes.SET_PROPERTY_FOR_TESTING,payload:42})
  // let undo = await store.undo()
  let recivedQuery = await store.__stateNow();
  let recivedValue = recivedQuery.propertyForTesting;
  if(stateManagerTestResult){
    console.debug('[PASS] test 5 stateManager!')
  }else{
    console.debug('[FAIL] test 5 stateManager!')
    console.debug(`Expected:${valueForTesting} Recived:${recivedValue}`)
  }

}