const pingMonitor = ()=>{
  const version = '1.4'
  const dev = false
  
  const actionTypes = require('./components/actionTypes')
  const fileManager = require('./components/fileManager')
  const config = require('./components/config')
  const loger = require('./components/loger')
  const pinger = require('./components/pinger')
  const stateManager = require('./components/stateManager')
  const store = new stateManager()
  const comunicatorCore = require('./components/comunicatorCore')
  const { app } = require('electron')

  const pingCheck = (_coreState:coreState,_resolve:any)=>{
    _coreState.monitors.forEach(_mon=>{
      // for(every monitor & every row)
      //ITS MIGHT BE QUITE EXPENCIVE!!
      _mon.rows.forEach(_rowStr=>{
        if(_rowStr.indexOf(`"isBusy":false`)>-1 && _rowStr.indexOf(`"isPaused":false`)>-1){
          let _rowObj = JSON.parse(_rowStr)
          // if(not paused and not busy) then timeout pingProbe(monitor,row,ip)
          setTimeout(async ({_store,_actionTypes})=>{
            let pingResult = await pinger.probe({address:_rowObj.ipAddress,rowId:_rowObj.rowId})
            if(pingResult.success){
              // dispach(rowId,pingReport)
              await _store.dispach({
                action:_actionTypes.ROW_SUBMIT_PING_PROBE,
                payload:JSON.stringify(pingResult.payload)
              })
            }else{
              loger.out(`Unsuccessfull ping probe! Error: ${pingResult.errorMessage}. Row:id:${_rowObj.rowId} ip:${_rowObj.ipAddress}`)
            }
          },_rowObj.updateTimeMS,{_store:store,_actionTypes:actionTypes})
          
          _resolve.set === false? _resolve = {set:true, action:actionTypes.ROW_SET_PROP,payload:JSON.stringify(
            {
              rowId:_rowObj.rowId,
              key:'isBusy',
              value:true
            })
          }:0;
        }
      })
    })
    return _resolve;
  }
  const monitorCheck = async (_coreState:coreState,_resolve:any)=>{
    //if(no monitor) reduce(add default Monitor with initial Rows)
    if(_coreState.monitors.length<1){
      _resolve = {
        set:true,
        action:actionTypes.ADD_NEW_MONITOR
      }
    }
    return _resolve
  }
  const windowCheck = (_coreState:coreState,_prevState:coreState,_resolve:any)=>{
    
    let checkFullDifference = (_obj1:object,_obj2:object)=>{
      let _ret:any = {}
      //we expect two objects to have the same scheme to minimize computation time
      Object.entries(_obj1).forEach(([_k,_v])=>{
        if(typeof _obj1[_k] != 'object'){
          if(_obj1[_k] !== _obj2[_k]){
            _ret._k = _v
          }
        }else{
          // _ret._k = checkFullDifference(_obj1[_k],_obj2[_k])
        }
      })
      return _ret
    }
    // let differenceObject:any = checkFullDifference(_coreState.monitors,_prevState.monitors)
    // console.log(differenceObject)

    //checkDifference of monitorStates
    // if(number on wins not the same)  addWindow|removeWindow
    // for(windows where subscribiptionKey in the list of changed monitors)
      // updateWindow(winState) > communicatorCore
    return _resolve
  }
  const compute = async (_coreState: coreState,_prevState: coreState)=>{
    let _resolve:{set:boolean,action:actionType,payload?:any} = {
      set:false,
      action:{
        action:''
      }
    }
    _resolve = pingCheck(_coreState,_resolve)
    if(!_resolve.set){
      _resolve = await monitorCheck(_coreState,_resolve)
    }
    if(!_resolve.set){
      _resolve = windowCheck(_coreState,_prevState,_resolve)
    }
    if(!_resolve.set){
    }else{
      console.log(`computing resolved with ${_resolve.action} ${ _resolve.payload}`)
      await store.dispach({action:_resolve.action,payload:_resolve.payload})
    }
  }
  store.subscribe(compute)//execute compute on any state change


  app.whenReady().then( async function(){
    if(dev){
      
      testComponents(fileManager,config,loger,pinger,store)
    }

  })
}
pingMonitor()
const testComponents = async (fileManager: any,config:any,loger:any,pinger:any,store:any)=>{
  
  //fileManager
  const testFileName = '__test.txt';
  await fileManager.write({openDialog:false,path:testFileName,content:testFileName})
  const fileContent = await fileManager.read({openDialog:false,path:testFileName})
  const wasDeleted = await fileManager.remove({openDialog:false,path:testFileName})
  if(fileContent.success && wasDeleted.success){
    console.log('[PASS] test 1 fileManager!')
  }else{
    console.log('[FAIL] test 1 fileManager!')
    console.log(`${!fileContent.success?fileContent.errorMessage:''}`);
    console.log(`${!wasDeleted.success?wasDeleted.errorMessage:''}`);
  }

  //config
  const testConfigValue = Math.round((Math.random()*1000)*1000)
  const setResult = await config.setParam({key:'__keyForTesting',value:testConfigValue})
  const testValueResult = await config.getParam('__keyForTesting')
  if(setResult.success&&testValueResult.value == testConfigValue){
    console.log('[PASS] test 2 config!')
  }else{
    console.log('[FAIL] test 2 config!')
    typeof setResult.errorMessage!='undefined'?console.log(setResult.errorMessage):0
    console.log(`Recived: ${testValueResult.value} Expected:${testConfigValue}`)
  }

  //logger
  if(loger.out('Initial test')){
    console.log('[PASS] test 3 loger!')    
  }else{
    console.log('[FAIL] test 3 loger!')
  }

  //pinger  
  let pingResult = await pinger.probe({address:'localhost',rowId:0})
  if(pingResult.success){
    console.log('[PASS] test 4 pinger!')
    // console.log(pingResult)
  }else{
    console.log('[FAIL] test 4 pinger!:')
    console.log(pingResult.errorMessage)
  }

  let valueForTesting = Math.round((Math.random()*1000)*1000)
  let stateManagerTestResult = false
  await store.dispach({action:'setPropertyForTesting',payload:valueForTesting})
  await store.dispach({action:'setPropertyForTesting',payload:42})
  let undo = store.undo()
  let recivedValue = store.__stateNow().propertyForTesting;
  console.log(`${recivedValue} ${valueForTesting}`)
  if(undo){
    if(recivedValue == valueForTesting){
      stateManagerTestResult = true
    }
  }
  if(stateManagerTestResult){
    console.log('[PASS] test 5 stateManager!')
  }else{
    console.log('[FAIL] test 5 stateManager!')
    console.log(`Expected:${valueForTesting} Recived:${recivedValue}`)
  }

  //communicatorCore

}