

interface rowState {
    rowId: number
    position: number
    size: '1Little'|'2Small'|'4Middle'|'6Big'
    ipAddress: string
    updateTimeMS: number
    name: string
    imageBase64: string
    history: {
        timestamp:number
        time:Date
        status:string
        dellayMS:number
        ttl:number
        fullResponce:string
    }[]
    pingTimeStrategy: {
        updateTimeMS:number
        conditions:object
    }[]
    hasStarted:boolean
    isPused:boolean
    isMuted:boolean
    isAlarmed:boolean
    isEditing:boolean
    filedEditing:'name'|'address'|'updatetime'|'image'|''
    isGraphSubscribed:boolean
    isSelected:boolean
}
interface monitState {
    monitId:number
    rows: string[]
}
interface winState {
    readonly version: string
    langCode: string
    langWords: Object[]
    winId: number
    subscriptionKey: number
    title: string
    isGraph: boolean
    isHidden: boolean
    isFullscreen: boolean
    isMenuOpen:boolean
    isSettingOpen:boolean
    isImagePickerOpen:boolean
    monitor:monitState//only one here just a copy from the list
}
interface coreState {
    readonly version: string
    langCode: string
    langWords: Object[]
    colorMode: string
    monitors: monitState[]
    windows: string[]
    propertyForTesting:any
}
interface actionType {
    action:string
    payload?:any
}


class stateManager {
    __state:coreState
    __subscribers = []
    __history = []
    constructor(){
        this.__state = this.__stateNow()
    }
    __getInitialCoreState = ()=>{
        let appVersion = '1.4'
        let getInitialPingTimeStrategy = ()=>{
            return {
                conditions:{
                    status:'any'
                },
                time:10000
            }
        }
        let getInitialRowState = ()=>{
            return JSON.stringify({
                rowId: -1,//generate random
                position: 0,
                size: '1Little',//default size
                ipAddress: 'localhost',//default address
                updateTimeMS: 10000,//defaul time
                name: 'name',//defaultname
                imageBase64: '',//default picture
                history: [],
                pingTimeStrategy: [
                    getInitialPingTimeStrategy()
                ],
                hasStarted:false,
                isPused:true,//initialPause
                isMuted:false,
                isAlarmed:false,
                isEditing:false,
                filedEditing:'',
                isGraphSubscribed:false,
                isSelected:false
            })
        }
        let getInitialWindow = ()=>{
            return JSON.stringify({
                version: appVersion,
                langCode: 'ua',
                langWords: [{}],
                winId: -1,
                subscriptionKey: -1,
                title: 'Default window',
                isGraph: false,
                isHidden: true,
                isFullscreen: false,
                isMenuOpen:false,
                isSettingOpen:false,
                isImagePickerOpen:false,
                monitor:{} 
            })
        }
        return {
            version:'1.4',//SHOULD SET IT AUTOMATICLY
            langCode: 'ua',
            langWords: [{}],
            colorMode: 'dark',
            monitors: [
                {
                    monitId:0,
                    rows:[
                        getInitialRowState()
                    ]
                }
            ],
            windows: [
                getInitialWindow()
            ],
            propertyForTesting:0
        }
    }
    __stateNow = ()=>{
        let _reply = this.__getInitialCoreState()
        if(typeof this.__state !== 'undefined'){
            _reply = this.__state
        }
        return _reply
    }
    __reduce = (_state:coreState, action:actionType)=>{
        if(action.action == 'setPropertyForTesting'){
            _state = {..._state,propertyForTesting:action.payload}
        }
        return _state
    }
    __setState = (_state:coreState)=>{
        this.__state = {..._state}
        //limit to 20 elements
        if(this.__history.length>20){
            // removes first element of the array: [1,2,3] > [2,3]
            this.__history.shift()
        }
        this.__history.push(_state)
        return this.__notifySubscribers(_state) ? true : false;
    }
    __notifySubscribers = (_state:coreState)=>{
        try{
            this.__subscribers.forEach(_func => {
                _func(_state)
            })
            return true
        }catch(e){
            return false
        }
    }

    //PUBLIC METHODS
    undo = ()=>{
        let _ret = false
        if(this.__history.length>0){
            this.__history.pop()//removes current
            if(this.__setState(this.__history.pop())){//setts second from the end
                _ret = true;
            }
        }
        return _ret;
    }
    dispach = (action:actionType)=>{
        let _newState = this.__reduce(this.__state,action)
        return this.__setState(_newState) ? true : false;
    }
    subscribe = (_callback:any)=>{
        this.__subscribers.push(_callback)
    }
}
module.exports = stateManager