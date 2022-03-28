
interface configSetParamMessage {
    key:string,
    value:boolean|string|number|object|object[]
}
interface configStateType {
    langCode: String,
    colorMode: String,
    initialRows: {
        rowId:number,
        position:number,
        address:string,
        updateTime:number,
        name:string,
        pictureBase64:string,
        isPaused:boolean
    }[],
    defaultNewRow: {
        address:string,
        updateTime:number,
        name:string,
        pictureBase64:string,
        isPaused:boolean
    },
    newRowRule: 'copyPrev'|'default',
    timeToAlarmMS: number,//default: 10sec
    unmuteOnGettingOnline: boolean,// default true
    pingHistoryTimeLimitMINS: number,//default: 360>60*6
    miniGraphShowLimitMIMS: number,// default: 5,
    savePingHistoryToConfig:boolean,//default: false
    __keyForTesting?:number
}

const config:any = {}
const initConfig = ()=>{
    let state:configStateType = {
        langCode: 'ua',
        colorMode: 'dark',
        initialRows: [{
            rowId: 11111111,
            position: 0,
            address:'0.0.0.0',
            updateTime:10000,
            name:'New row',
            pictureBase64:'default',
            isPaused:true
        }],
        defaultNewRow: {
            address:'0.0.0.0',
            updateTime:10000,
            name:'New row',
            pictureBase64:'default',
            isPaused:true
        },
        newRowRule: 'copyPrev',
        timeToAlarmMS: 10000,
        unmuteOnGettingOnline: true,
        pingHistoryTimeLimitMINS: 360,
        miniGraphShowLimitMIMS: 5,
        savePingHistoryToConfig:false,
        __keyForTesting:0,
    }
    return state;
}
const updateState = async (message:configSetParamMessage)=>{
    let configState = await getState()
    let configFilePath = 'assets/config.json'
    let fileManager = require('./fileManager')
    try{
        configState = {...configState}
        configState[message.key] = message.value
        //triyng to save to the file
        const configSavingToFile = await fileManager.write({openDialog:false,path:configFilePath,content:JSON.stringify(configState)})
        if(!configSavingToFile.success){
            //console.log('Unable to save initial config to the file. Error:'+configSavingToFile.errorMessage)
            return false
        }else{
            return true;
        }
    
    }catch(e){
        //console.log(e)
        return false;
    }
}
const getState = async ()=>{
    let configFilePath = 'assets/config.json'
    let fileManager = require('./fileManager')
    let state = initConfig()
    try{
        //try to load from file
        const configFromFile = await fileManager.read({openDialog:false,path:configFilePath})
        const configFromFileStr = configFromFile.payload.content
        const configFromFileObj = JSON.parse(configFromFileStr)
        state = {...configFromFileObj}
    }catch(e){
        //console.error('Cant load config from file, so using initial')
        try{
            const configSavingToFile = await fileManager.write({openDialog:false,path:configFilePath,content:JSON.stringify(state)})
            if(configSavingToFile.success){
                //console.log('Saved to file successfuly')
            }else{
                //console.log('Unable to save initial config to file. Error:'+configSavingToFile.errorMessage)
            }
            
        }catch(e){
            //console.log('Unable to save initial config to file. Error:'+e)
        }
    }
    return state;
}
config.getParam = async (key:string)=>{
    let configState = await getState()
    if(typeof key == 'undefined'){
        loger.out('Expected to recive key:string')
        return {
            success:false,
            errorMessage:'Expected to recive key:string'
        }
    }
    //return undefined key
    if(typeof configState[key] == 'undefined'){
        loger.out(`Key does not exist: ${key}`)
        return {
            success:false,
            errorMessage:`Key does not exist: ${key}`
        }
    }
    //return from file
    //return from cash
    return {
        success:true,
        key:key,
        value:configState[key]
    }
}
config.setParam = async (message:configSetParamMessage)=>{
    let stateExmple:configStateType = initConfig()
    //lack of key or value
    if(typeof message.key == 'undefined' || typeof message.value == 'undefined'){
        loger.out('Expected to recive key and value')
        return {
            success:false,
            errorMessage:'Expected to recive key and value'
        }
    }
    //undefined key
    if(typeof stateExmple[message.key] == 'undefined'){
        loger.out('Key does not exist: '+message.key)
        return {
            success:false,
            errorMessage:'Key does not exist: '+message.key
        }
    }
    //return unvalid value format\type
    if(typeof stateExmple[message.key] !== typeof message.value){
        loger.out(`Wrong type of the value. Recived:${typeof message.value}. Expected:${typeof stateExmple[message.key]}`)
        return {
            success:false,
            errorMessage:`Wrong type of the value. Recived:${typeof message.value}. Expected:${typeof stateExmple[message.key]}`
        }
    }
    if(await updateState({key:message.key,value:message.value})){
        return {
            success:true
        }
    }else{
        loger.out(`Unable to set parameter for unknown reason.`)
        return {
            success:false,
            errorMessage:`Unable to set parameter for unknown reason.`
        }
    }
    //set to cash > try to save to file
}
module.exports = config