
interface configSetParamMessage {
    key:string,
    value:boolean|string|number|object|object[]
}
interface configStateType {
    langCode: String,
    colorMode: String,
    alwaysShowOnTop: boolean,
    hideTitleBar: boolean,
    initialRows: {
        address:string,
        updateTimeMS:number,
        size:string,
        name:string,
        pictureLink:string,
        isPaused:boolean,
        isMuted:boolean
    }[],
    defaultNewRow: {
        address:string,
        updateTimeMS:number,
        size:string,
        name:string,
        pictureLink:string,
        isPaused:boolean,
        isMuted:boolean
    },
    defaultPingTimeStrategy:any,
    newRowRule: 'copyPrev'|'default',
    timeToAlarmMS: number,//default: 10sec
    unmuteOnGettingOnline: boolean,// default true
    pingHistoryTimeLimitMINS: number,//default: 360>60*6
    miniGraphShowLimitMINS: number,// default: 5,
    savePingHistoryToConfig:boolean,//default: false
    logSettings:{
        logChanges: boolean,
        defaultLogName: string,
        newLogNameEveryday: boolean,
        timeToLogStatusChangeMS: number,
    }
    __keyForTesting?:number
}

const config:any = {}
const initConfig = ()=>{
    let state:configStateType = {
        langCode: "ua",
        colorMode: "dark",
        alwaysShowOnTop: false,
        hideTitleBar: false,
        initialRows: [
            {
                address: "localhost",
                updateTimeMS: 10000,
                size:'2Small',
                name: "Initial row 1",
                pictureLink: "0 PingMonitor.png",
                isPaused: true,
                isMuted:false
            }
        ],
        defaultNewRow: {
            address: "localhost",
            size:'2Small',
            updateTimeMS: 10000,
            name: "Default row",
            pictureLink: "0 PingMonitor.png",
            isPaused: true,
            isMuted:false
        },
        defaultPingTimeStrategy:{
            online:10000,
            error:2000,
            timeout:2000
        },
        newRowRule: "copyPrev",
        timeToAlarmMS: 10000,
        unmuteOnGettingOnline: true,
        pingHistoryTimeLimitMINS: 360,
        miniGraphShowLimitMINS: 5,
        savePingHistoryToConfig: false,
        logSettings: {
            logChanges: false,
            defaultLogName: "",
            newLogNameEveryday: true,
            timeToLogStatusChangeMS: 10000
        },
        "__keyForTesting": 169346
    }
    return state;
}
const updateState = async ({newState})=>{
    let configState = await config.getState()
    let configFilePath = 'assets/config.json'
    let fileManager = require('./fileManager')
    try{
        //triyng to save to the file
        const configSavingToFile = await fileManager.write({openDialog:false,path:configFilePath,content:JSON.stringify(newState,undefined,4)})
        if(!configSavingToFile.success){
            return false
        }else{
            return true;
        }
    
    }catch(e){
        //console.log(e)
        return false;
    }
}

config.getState = async ()=>{
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
            const configSavingToFile = await fileManager.write({openDialog:false,path:configFilePath,content:JSON.stringify(state,undefined,4)})
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
    let configState = await config.getState()
    if(typeof key == 'undefined'){
        // loger.out('Expected to recive key:string')
        return {
            success:false,
            errorMessage:'Expected to recive key:string'
        }
    }
    let keyPath = []
    let neededValue
    if(key.substring(0,2) != '__'){
        keyPath = key.split('_')
    }else{
        keyPath = [key]
    }
    if(keyPath.length>1){
        try{
            switch(keyPath.length){
                case 2:neededValue = configState[keyPath[0]][keyPath[1]];break;
                case 3:neededValue = configState[keyPath[0]][keyPath[1]][keyPath[2]];break;
                case 4:neededValue = configState[keyPath[0]][keyPath[1]][keyPath[2]][keyPath[3]];break;
            }
        }catch(err){
            return {
                success:false,
                errorMessage:'Key does not exist: '+keyPath.join('_')
            }
        }
    }else{
        try{
            neededValue = configState[keyPath[0]]
        }catch(err){
            return {
                success:false,
                errorMessage:'Key does not exist: '+keyPath.join('_')
            }
        }
    }
    //return undefined key
    if(typeof neededValue == 'undefined'){
        // loger.out(`Key does not exist: ${key}`)
        return {
            success:false,
            errorMessage:`Key does not exist: ${key}`
        }
    }
    
    return {
        success:true,
        key:key,
        value:neededValue
    }
}
config.setParam = async (message:configSetParamMessage)=>{
    let stateExample:configStateType = await config.getState()
    //lack of key or value
    if(typeof message.key == 'undefined' || typeof message.value == 'undefined'){
        // loger.out('Expected to recive key and value')
        return {
            success:false,
            errorMessage:'Expected to recive key and value'
        }
    }
    let keyPath = []
    let neededValue
    if(message.key.substring(0,2) != '__'){
        keyPath = message.key.split('_')
    }else{
        keyPath = [message.key]
    }
    if(keyPath.length>1){
        try{
            switch(keyPath.length){
                case 2:neededValue = stateExample[keyPath[0]][keyPath[1]];break;
                case 3:neededValue = stateExample[keyPath[0]][keyPath[1]][keyPath[2]];break;
                case 4:neededValue = stateExample[keyPath[0]][keyPath[1]][keyPath[2]][keyPath[3]];break;
            }
        }catch(err){
            return {
                success:false,
                errorMessage:'Key does not exist: '+keyPath.join('_')
            }
        }
    }else{
        try{
            neededValue = stateExample[keyPath[0]]
        }catch(err){
            return {
                success:false,
                errorMessage:'Key does not exist: '+keyPath.join('_')
            }
        }
    }
    
    if(typeof neededValue == 'number'){
        message.value = Number(parseInt(message.value.toString()))
        message.value == null||isNaN(message.value)?message.value = 0:0
    }
    if(typeof neededValue !== typeof message.value && ![''].includes(typeof neededValue)){
        console.log(`Wrong type of the value. Recived:${typeof message.value}. Expected:${typeof neededValue}`)
        return {
            success:false,
            errorMessage:`Wrong type of the value. Recived:${typeof message.value}. Expected:${typeof neededValue}`
        }
    }
    if(neededValue === message.value){
        return {
            success:false,
            errorMessage:`No need to change config. Recived:${typeof message.value}. Expected:${typeof neededValue}`
        }
    }
    if(keyPath.length<2){
        stateExample[keyPath[0]] = message.value
    }else{
        switch(keyPath.length){
            case 2:stateExample[keyPath[0]][keyPath[1]] = message.value;break;
            case 3:stateExample[keyPath[0]][keyPath[1]][keyPath[2]] = message.value;break;
            case 4:stateExample[keyPath[0]][keyPath[1]][keyPath[2]][keyPath[3]] = message.value;break;
        }
    }
    if(await updateState({newState:stateExample})){
        return {
            success:true
        }
    }else{
        console.log(`Unable to set parameter for unknown reason.`)
        return {
            success:false,
            errorMessage:`Unable to set parameter for unknown reason.`
        }
    }
    //set to cash > try to save to file
}
config.restoreDefault = async ()=>{
    let newState:configStateType = initConfig()
    if(await updateState({newState:newState})){
        return {
            success:true
        }
    }else{
        console.log(`Unable to set parameter for unknown reason.`)
        return {
            success:false,
            errorMessage:`Unable to set parameter for unknown reason.`
        }
    }
}
module.exports = config