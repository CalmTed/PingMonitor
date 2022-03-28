const pingMonitor = ()=>{
  const version = '1.4'
  const dev = true

  const fileManager = require('./components/fileManager')
  const config = require('./components/config')
  const loger = require('./components/loger')
  const pinger = require('./components/pinger')
  const stateManager = require('./components/stateManager')
  const store = new stateManager()
  const comunicatorCore = require('./components/comunicatorCore')

  const pingCheck = (_coreState)=>{
    return true
  }
  const monitorCheck = (_coreState)=>{
    return true
  }
  const windowCheck = (_coreState)=>{
    return true
  }
  const compute = (_coreState: coreState)=>{
    if(!pingCheck(_coreState)){

    }
    if(!monitorCheck(_coreState)){

    }
    if(!windowCheck(_coreState)){

    }
    //sconsole.log('computing finished')
  }
  store.subscribe(compute)//execute compute on any state change

  const { app } = require('electron');
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
  store.dispach({action:'setPropertyForTesting',payload:valueForTesting})
  store.dispach({action:'setPropertyForTesting',payload:42})
  let undo = store.undo()
  if(undo){
    if(store.__stateNow().propertyForTesting == valueForTesting){
      stateManagerTestResult = true
    }
  }
  if(stateManagerTestResult){
    console.log('[PASS] test 5 stateManager!')
  }else{
    console.log('[FAIL] test 5 stateManager!')
    console.log(`Expected:${valueForTesting} Recived:${store.__stateNow().propertyForTesting}`)
  }

  //communicatorCore

}