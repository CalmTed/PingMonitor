


interface rowState {
    rowId: number //monitorId.rowId
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
    isBusy:boolean
    isPaused:boolean
    isMuted:boolean
    isAlarmed:boolean
    isEditing:boolean
    filedEditing:'name'|'address'|'updatetime'|'image'|'none'
    isGraphSubscribed:boolean
    isSelected:boolean
}
interface monitState {
    monitorId:number
    rows: string[]
}
interface winState {
    readonly version: string
    langCode: string
    langWords: Object[]
    winId: number
    subscriptionKey: number//monitor id
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
    __appVersion:string
    __langCode:string
    __state:coreState
    __subscribers = []
    __history = []
    constructor(data:any){
        this.__appVersion = data.version
        this.__state = {...this.__stateNow()}

    }
    __genId(target:'monitor'|'window'|'row'){
        let _ret = -1;
        switch(target){
            case 'monitor':_ret = Math.round(Math.random()*9000+999);break;
            case 'window':_ret = Math.round(Math.random()*90000+9999);break;
            case 'row':_ret = Math.round(Math.random()*900000+99999);break;
            default: loger.out('Unknown genId target');break;
        }
        return _ret
    }
    __getAppVersion = ()=>{
        return this.__appVersion
    }
    __getLangCode = ()=>{
        if(typeof this.__langCode == 'undefined'){
            let config = require('./config')
            this.__langCode = config.getParam('langCode')
        }
        return this.__langCode
    }
    __getInitialPingTimeStrategy = ()=>{
        let _ret = [
            {
                conditions:{
                    status:'online'
                },
                updateTimeMS:2000
            },
            {
                conditions:{
                    status:'timeout'
                },
                updateTimeMS:10000
            }
        ]
        return _ret;
    }
    __getInitialRowState = ({_monitorId})=>{
        let _ret:rowState = {
            rowId: Number(`${_monitorId}.${this.__genId('row')}`),//generate random
            position: 0,
            size: '1Little',//default size
            ipAddress: '1.1.1.1',//default address
            updateTimeMS: 5000,//defaul time
            name: 'name',//defaultname
            imageBase64: '',//default picture
            history: [],
            pingTimeStrategy: this.__getInitialPingTimeStrategy(),
            isBusy:false,
            isPaused:false,//initialPause
            isMuted:false,
            isAlarmed:false,
            isEditing:false,
            filedEditing:'none',
            isGraphSubscribed:false,
            isSelected:false
        }
        return JSON.stringify(_ret)
    }
    __getInitialWindow = (_appVersion:string,_appLangCode:string,_parameters:object={})=>{
        let _winData = {
            version: _appVersion,
            langCode: _appLangCode,
            langWords: [{}],
            winId: this.__genId('window'),
            subscriptionKey: -1,
            title: 'Default window',
            isGraph: false,
            isHidden: true,
            isFullscreen: false,
            isMenuOpen:false,
            isSettingOpen:false,
            isImagePickerOpen:false,
            monitor:{} 
        }
        if(Object.entries(_parameters).length>0){
            Object.entries(_parameters).forEach(([_key,_value])=>{
                _winData[_key] = _value
            })
        }
        return JSON.stringify(_winData)
    }
    __getInitialCoreState = ()=>{
        let _appVersion = this.__getAppVersion()
        let _appLangCode = this.__getLangCode()

        let _initialMonitorId1 = this.__genId('monitor')
        let _initialMonitorId2 = this.__genId('monitor')

        return {
            version: _appVersion,//SHOULD BE SET AUTOMATICALY
            langCode: _appLangCode,
            langWords: [{}],
            colorMode: 'dark',
            monitors: [
                {
                    monitorId:_initialMonitorId1,
                    rows:[
                        this.__getInitialRowState({_monitorId:_initialMonitorId1}),
                    ]
                },
                {
                    monitorId:_initialMonitorId2,
                    rows:[
                        this.__getInitialRowState({_monitorId:_initialMonitorId2}),
                    ]
                }
            ],
            windows: [
                this.__getInitialWindow(_appVersion,_appLangCode,{subscriptionKey:'1232'})
            ],
            propertyForTesting:0
        }
    }
    __stateNow = ()=>{
        let _reply = JSON.stringify(this.__getInitialCoreState())
        if(typeof this.__state !== 'undefined'){
            _reply = JSON.stringify({...this.__state})
        }
        return JSON.parse(_reply)
    }
    __reduce = async (_state:coreState, action:actionType)=>{
        const actionTypes = require('./actionTypes')
        const config = require('./config')
        const loger = require('./loger')
        let __newRow = ({_monitorId}/* MAY BE THERE SHOULD BE CUSTOM VALUES*/)=>{
            return this.__getInitialRowState({_monitorId:_monitorId})
        }
        let __newMonitor = ()=>{
            let _monitorId = this.__genId('monitor')
            return {monitorId:_monitorId,rows:[__newRow({_monitorId:_monitorId})]}
        }
        let __validateInputs = (_payload:string,_targetInputsArray:string[]):boolean=>{
            let _ret = true
            _targetInputsArray.forEach(_in=>{
                if(action.payload.indexOf(`"${_in}":`) == -1 ){
                    _ret = false
                }
            })
            return _ret
        }
        let __getRow = (_payloadStr:string,_monitors:monitState[])=>{
            let _plObj:{rowId:number,key:string,value:string} = JSON.parse(_payloadStr)
            let _selMon:monitState = _monitors.find(_mon=>_mon.monitorId == Number(_plObj.rowId.toString().split('.')[0]))
            let _monInd:number = _monitors.indexOf(_selMon)
            let _rwStr = _selMon.rows.find(_row=>_row.indexOf(`"rowId":${_plObj.rowId}`) >-1)
            let _rwInd = _selMon.rows.indexOf(_rwStr)
            let _rwObj = JSON.parse(_rwStr)
            return {
                payloadObj:_plObj,
                monitorObj:_selMon,
                monitorIndex:_monInd,
                rowStr:_monInd,
                rowIndex:_rwInd,
                rowObj:_rwObj
            }
        }
        let _rowInfo:any;
        let _newMonitors:monitState[];
        let _newWIndowsStr:string[];
        switch(action.action){
            case actionTypes.SET_PROPERTY_FOR_TESTING:
               _state = {..._state,propertyForTesting:action.payload}
               break
            case actionTypes.ADD_NEW_MONITOR:
                _newMonitors = [..._state.monitors,__newMonitor()]
                _state = {..._state,monitors:_newMonitors}
                break
            case actionTypes.REMOVE_MONITOR_BY_ID:
                // _newMonitors = [..._state.monitors,__newMonitor()]
                _newMonitors = [..._state.monitors.filter(_m=>_m.monitorId != action.payload)]
                _state = {..._state,monitors:_newMonitors}
                break
            case actionTypes.ADD_NEW_WINDOW_BY_SUBKEY:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive subscriptionKey:string`)
                    break;
                }
                _newWIndowsStr = [..._state.windows,this.__getInitialWindow(this.__getAppVersion(),this.__getLangCode(),{subscriptionKey:action.payload})]
                _state = {..._state,windows:_newWIndowsStr}
                break;
            case actionTypes.REMOVE_WINDOW_BY_ID:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive winId:string`)
                    break;
                }
                //going lazy way without parsing json string
                _newWIndowsStr = [..._state.windows.filter(_w=>_w.indexOf(`"winId":${action.payload}`)  == -1)]
                _state = {..._state,windows:_newWIndowsStr}
                break;
            case actionTypes.ROW_SUBMIT_PING_PROBE:

                if(!__validateInputs(action.payload,['rowId','status','dellay','packetLoss','ttl','fullResponce'])){
                    loger.out(`ROW_SET_PROP Error: expected to recive rowId,key and value`)
                    break
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                _rowInfo.rowObj.isBusy = false
                //TODO: limit history size
                _rowInfo.rowObj.history.push({
                    timestamp: new Date().getTime(),
                    time: new Date(),
                    status:action.payload.status,
                    dellayMS:action.payload.dellay,
                    ttl:action.payload.ttl,
                    fullResponce:action.payload.fillResponce
                })
                //TODO make it work for different conditions
                try{
                    if(_rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == action.payload.status).updateTimeMS != _rowInfo.rowObj.updateTimeMS){
                        _rowInfo.rowObj.updateTimeMS = _rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == action.payload.status).updateTimeMS
                    }
                }catch(e){}
                //do we need to turn on alarm
                if(action.payload.status != 'online'){
                    let lastNotOnlineProbeTime:number
                    let i = _rowInfo.rowObj.history.length-1;
                    while(_rowInfo.rowObj.history[i] && i>-1){
                        if(_rowInfo.rowObj.history[i].status != 'online'){
                            lastNotOnlineProbeTime = _rowInfo.rowObj.history[i].timestamp
                        }
                        i--
                    }
                    let timeToAlarmMS = await config.getParam('timeToAlarmMS');
                    if(new Date().getTime() - lastNotOnlineProbeTime >= timeToAlarmMS.value){
                        _rowInfo.rowObj.isAlarmed = true
                    }
                }
                //do we need to unmute
                if(action.payload.status == 'online' && action.payload.history[action.payload.history.length-2].status != 'online'){
                    let unmuteOnGettingOnline = await config.getParam('unmuteOnGettingOnline')
                    if(unmuteOnGettingOnline.value){
                        _rowInfo.rowObj.isMuted = false
                    }
                }
                //save to state
                _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                _state = {..._state}
                break
            case actionTypes.ROW_SET_PROP:
                if(!__validateInputs(action.payload,['rowId','key','value'])){
                    loger.out(`ROW_SET_PROP Error: expected to recive rowId,key and value`)
                    break
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                if(typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined'){
                    loger.out(`ROW_SET_PROP error unknown key of the row. Key:${_rowInfo.payloadObj.key} RowId:${_rowInfo.payloadObj.rowId}`)
                    break;
                }
                if(_rowInfo.rowObj[_rowInfo.payloadObj.key] === _rowInfo.payloadObj.value){
                    loger.out(`ROW_SET_PROP warn value is already set. Key:${_rowInfo.payloadObj.key} RowId:${_rowInfo.payloadObj.rowId}`)
                    break;
                }
                _rowInfo.rowObj[_rowInfo.payloadObj.key] = _rowInfo.payloadObj.value
                _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                _state = {..._state,monitors:_newMonitors}
                break;
            default:
                loger.out(`Reducer error: Unknown action type: ${action.action}`)
                break;
        }

        return _state
    }
    __setState = (_state:coreState)=>{
        
        _state = {..._state}
        let _prevState = {...this.__state}
        this.__state = {..._state}

        let checkFullDifference = (_obj1:object,_obj2:object)=>{
            //TODO make this work properly
            let checkDiffStr = (_one,_two)=>{
              let _strdiffret = '';
              let aArr = _one.split('');
              let bArr = _two.split('');
              aArr.forEach((letter,i)=>{
                if(aArr[i] != bArr[i]){
                  _strdiffret += aArr[i]
                }
              })
              return _strdiffret
            }
            let _ret:any = {}
            //we expect two objects to have the same scheme to minimize computation time
            Object.entries(_obj1).forEach(([_k,_v])=>{
              if(typeof _obj1[_k] != 'object'){
                let strDiff = checkDiffStr(_obj1[_k].toString(),_obj2[_k].toString())
                if(strDiff.length > 0){
                  _ret[_k] = _v
                }
              }else{
                _ret[_k] = checkFullDifference(_obj1[_k],_obj2[_k])
              }
            })
            return _ret
          }
        if(typeof _state.monitors > 'undefined'){
            let _fullMonotorDifference = checkFullDifference(_state.monitors,_prevState.monitors)
        }
          


        //TODO we need to save history only on user inputs not background services like ping report
        // but how cat we get list of changed parameters?
        // if([].indexOf() != -1){
        // }
        //limit to 20 elements
        if(this.__history.length>=20){
            // removes first element of the array: [1,2,3] > [2,3]
            this.__history.shift()
        }
        this.__history.push(_state)
        return this.__notifySubscribers(_state,_prevState) ? true : false;
    }
    __notifySubscribers = (_state:coreState,_prevState:coreState)=>{
        try{
            this.__subscribers.forEach(_func => {
                _func(_state,_prevState)
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
            if(this.__setState(this.__history.pop())){//setts second instnce from the end
                _ret = true;
            }
        }
        return _ret;
    }
    dispach = async (action:actionType)=>{
        // let _oldState = {...this.__stateNow()}
        // let _oldState = JSON.stringify({...this.__stateNow()})
        let _newState = await this.__reduce(this.__stateNow(),action)

        return this.__setState(_newState) ? true : false;
    }
    subscribe = (_callback:any)=>{
        this.__subscribers.push(_callback)
    }
}
module.exports = stateManager