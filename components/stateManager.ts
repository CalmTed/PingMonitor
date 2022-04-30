


interface rowState {
    rowId: number //monitorId.rowId
    position: number
    size: '1Little'|'2Small'|'4Middle'|'6Big'
    ipAddress: string
    updateTimeMS: number
    name: string
    imageLink: string
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
    isPausedGrouped:boolean
    isMuted:boolean
    isAlarmed:boolean
    isEditing:boolean
    fieldEditing:'name'|'address'|'updatetime'|'image'|'none'
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
    monitor:monitState//only one here just a copy from the list for Comunicator
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
            this.__langCode = config.getParam('langCode').value
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
    __getInitialRowState = ({_monitorId,_position=0})=>{
        let _ret:rowState = {
            rowId: Number(`${_monitorId}.${this.__genId('row')}`),//generate random
            position: _position,
            size: '4Middle',//default size
            ipAddress: '1.1.1.1',//default address
            updateTimeMS: 5000,//defaul time
            name: 'name',//defaultname
            imageLink: '0 PingMonitor.png',
            history: [],
            pingTimeStrategy: this.__getInitialPingTimeStrategy(),
            isBusy:false,
            isPaused:false,//initialPause
            isPausedGrouped:false,
            isMuted:false,
            isAlarmed:false,
            isEditing:false,
            fieldEditing:'none',
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
            isHidden: false,
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
        // let _initialMonitorId2 = this.__genId('monitor')

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
                // {
                //     monitorId:_initialMonitorId2,
                //     rows:[
                //         this.__getInitialRowState({_monitorId:_initialMonitorId2}),
                //     ]
                // }
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
        let __newRow = ({_monitorId,_position=0}/* MAY BE THERE SHOULD BE CUSTOM VALUES*/)=>{
            return this.__getInitialRowState({_monitorId:_monitorId,_position:_position})
        }
        let __newMonitor = ()=>{
            let _monitorId = this.__genId('monitor')
            return {monitorId:_monitorId,rows:[__newRow({_monitorId:_monitorId})]}
        }
        let __validateInputs = (_payload:string,_targetInputsArray:string[]):boolean=>{
            let _ret = true
            if(typeof action.payload != 'string'){
                console.log('Payload should be a JSON string')
                _ret = false
            }
            _targetInputsArray.forEach(_in=>{
                if(action.payload.indexOf(`"${_in}":`) == -1 ){
                    _ret = false
                }
            })
            return _ret
        }
        let __getRow = (_payloadStrJson:string,_monitors:monitState[])=>{
            let _plObj:{rowId:number,key:string,value:string} = JSON.parse(_payloadStrJson)
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
        let _neededMonitorIndex:number
        let _newWindowsStr:string[];
        let _newWindowsObj:any;
        let _neededWindowIndex:number;
        let _payloadObj:any;
        switch(action.action){
            case actionTypes.SET_PROPERTY_FOR_TESTING:
               _state = {..._state,propertyForTesting:action.payload}
               break
            /*MONITOR      MONITOR      MONITOR      MONITOR      MONITOR      MONITOR      MONITOR*/
            case actionTypes.ADD_NEW_MONITOR:
                _newMonitors = [..._state.monitors,__newMonitor()]
                _state = {..._state,monitors:_newMonitors}
                break
            case actionTypes.REMOVE_MONITOR_BY_ID:
                _newMonitors = [..._state.monitors.filter(_m=>_m.monitorId != action.payload)]
                _state = {..._state,monitors:_newMonitors}
                break
            /*WINDOW     WINDOW     WINDOW     WINDOW     WINDOW     WINDOW     WINDOW     WINDOW*/
            case actionTypes.ADD_NEW_WINDOW_BY_SUBKEY:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive subscriptionKey:string`)
                    break;
                }
                _newWindowsStr = [..._state.windows,this.__getInitialWindow(this.__getAppVersion(),this.__getLangCode(),{subscriptionKey:action.payload})]
                _state = {..._state,windows:_newWindowsStr}
                break;
            case actionTypes.REMOVE_WINDOW_BY_ID:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive winId:string`)
                    break;
                }
                //going lazy way without parsing json string
                _newWindowsStr = [..._state.windows.filter(_w=>_w.indexOf(`"winId":${action.payload}`)  == -1)]
                _state = {..._state,windows:_newWindowsStr}
                break;
            case actionTypes.WIN_SET_PROP:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive winId:string,key:string,value:string`)
                    break;
                }
                _newWindowsStr = [..._state.windows]
                _payloadObj = JSON.parse(action.payload)
                _neededWindowIndex = _newWindowsStr.map((_w)=>{
                    return _w.indexOf(`"winId":${_payloadObj.winId}`) >-1 
                }).indexOf(true)
                if(_neededWindowIndex == -1){
                    loger.out(`Reducer error:${action.action} window with entered winId is not found`)
                    break;
                }
                _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex])
                _newWindowsObj[_payloadObj.key] = _payloadObj.value;
                _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj)
                _state = {..._state,windows:_newWindowsStr}
                break;
            case actionTypes.WIN_TOGGLE_PROP:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive winId:string,key:string`)
                    break;
                }
                _newWindowsStr = [..._state.windows]
                _payloadObj = JSON.parse(action.payload)
                _neededWindowIndex = _newWindowsStr.map((_w)=>{
                    return _w.indexOf(`"winId":${_payloadObj.winId}`) >-1
                }).indexOf(true)
                _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex])
                _newWindowsObj[_payloadObj.key] = !_newWindowsObj[_payloadObj.key]
                _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj)
                _state = {..._state,windows:_newWindowsStr}
                break;
            /*ROW    ROW    ROW    ROW    ROW    ROW    ROW    ROW    ROW    ROW    ROW*/
            case actionTypes.ADD_ROW:
                if(!__validateInputs(action.payload,['monitorId'])){
                    loger.out(`ROW_SET_PROP Error: expected to recive monitorId`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                _newMonitors = [..._state.monitors]
                _neededMonitorIndex = _newMonitors.map((_m)=>{
                    return _m.monitorId == _payloadObj.monitorId
                }).indexOf(true)
                let _newRowElement = __newRow({_monitorId:_payloadObj.monitorId,_position:_newMonitors[_neededMonitorIndex].rows.length})
                _newMonitors[_neededMonitorIndex].rows.push(_newRowElement)
                _state = {..._state,monitors:_newMonitors}
                break;
            case actionTypes.REMOVE_ROW:
                console.log('TODO add remove row reducer')
                break;
            case actionTypes.ROW_SUBMIT_PING_PROBE:
                if(!__validateInputs(action.payload,['rowId','status','dellay','packetLoss','ttl','fullResponce'])){
                    loger.out(`ROW_SET_PROP Error: expected to recive rowId,status,dellay,packetLoss,ttl,fullResponce`)
                    break
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                _rowInfo.rowObj.isBusy = false
                _payloadObj = JSON.parse(action.payload)
                //TODO: limit history size
                _rowInfo.rowObj.history.push({
                    timestamp: new Date().getTime(),
                    time: new Date(),
                    status:_payloadObj.status,
                    dellayMS:_payloadObj.dellay,
                    ttl:_payloadObj.ttl,
                    fullResponce:_payloadObj.fillResponce
                })
                //TODO make it work for different conditions
                try{
                    if(_rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == _payloadObj.status).updateTimeMS != _rowInfo.rowObj.updateTimeMS){
                        _rowInfo.rowObj.updateTimeMS = _rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == _payloadObj.status).updateTimeMS
                    }
                }catch(e){
                    console.log('PTS ERROR',_rowInfo.rowObj.pingTimeStrategy,_rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == _payloadObj.status),_payloadObj.status)
                    //loger.out(`Reducer error: Unable to check update time conditions. Action: ${action.action}`)
                }
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
                    let timeToAlarmMS = await config.getParam('timeToAlarmMS')
                    if(new Date().getTime() - lastNotOnlineProbeTime >= timeToAlarmMS.value && _rowInfo.rowObj.history[_rowInfo.rowObj.history.length-1].status != 'online'){
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
                break;
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
                    loger.out(`ROW_SET_PROP warn value is already set. Key:${_rowInfo.payloadObj.key} Values:${_rowInfo.rowObj[_rowInfo.payloadObj.key]}>>${_rowInfo.payloadObj.value} RowId:${_rowInfo.payloadObj.rowId}`)
                    break;
                }
                if(['name','address','updateTimeMS'].includes(_rowInfo.payloadObj.key)){
                    if(_rowInfo.payloadObj.key == 'name'){
                        if(_rowInfo.payloadObj.value.length<1 || _rowInfo.payloadObj.value.length>20){
                            break;
                        } 
                    }
                    if(_rowInfo.payloadObj.key == 'address'){
                        if(_rowInfo.payloadObj.value.length<1 || _rowInfo.payloadObj.value.length>50){
                            break;
                        }
                    }
                    if(_rowInfo.payloadObj.key == 'updateTimeMS'){
                        if(_rowInfo.payloadObj.value<1000 || _rowInfo.payloadObj.value>300000){
                            break;
                        } 
                        try{
                            let _actualStatus = _rowInfo.rowObj.history[_rowInfo.rowObj.history.length-1].status
                            _rowInfo.rowObj.pingTimeStrategy.find(_pts=>{return _pts.conditions.status == _actualStatus}).updateTimeMS = _rowInfo.payloadObj.value
                        }catch(e){
                            loger.out(`ROW_SET_PROP unable to write PTS Key:${_rowInfo.payloadObj.key} Values:${_rowInfo.rowObj[_rowInfo.payloadObj.key]}>>${_rowInfo.payloadObj.value} RowId:${_rowInfo.payloadObj.rowId}`)
                        }
                    }
                }
                _rowInfo.rowObj[_rowInfo.payloadObj.key] = _rowInfo.payloadObj.value
                _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                _state = {..._state,monitors:_newMonitors}
                break;
            case actionTypes.ROW_TOGGLE_PROP:
                if(!__validateInputs(action.payload,['rowId','key'])){
                    loger.out(`ROW_TOGGLE_PROP Error: expected to recive rowId and key`)
                    break;
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                if(typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined'){
                    loger.out(`ROW_TOGGLE_PROP error unknown key of the row. Key:${_rowInfo.payloadObj.key} RowId:${_rowInfo.payloadObj.rowId}`)
                    break;
                }
                _rowInfo.rowObj[_rowInfo.payloadObj.key] = !_rowInfo.rowObj[_rowInfo.payloadObj.key]
                _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                _state = {..._state,monitors:_newMonitors}
            break;
            case actionTypes.ROW_EDIT_PROP_SET:
                if(!__validateInputs(action.payload,['rowId','key'])){
                    loger.out(`ROW_EDIT_PROP_SET Error: expected to recive rowId,key`)
                    break;
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                
                if(!['name','address','updatetime','image'].includes(_rowInfo.payloadObj.key)){
                    loger.out(`ROW_EDIT_PROP_SET error unknown key(${_rowInfo.payloadObj.key}). Key:${_rowInfo.payloadObj.key} RowId:${_rowInfo.payloadObj.rowId}`)
                    break;
                }
                if(!_rowInfo.rowObj['isEditing']){
                    _rowInfo.rowObj['isEditing'] = true
                    _rowInfo.rowObj['fieldEditing'] = _rowInfo.payloadObj.key
                    _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                    _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                    _state = {..._state,monitors:_newMonitors}
                }
                break;
            case actionTypes.ROW_EDIT_PROP_REMOVE:
                if(!__validateInputs(action.payload,['rowId','key'])){
                    loger.out(`ROW_EDIT_PROP_REMOVE Error: expected to recive rowId,key`)
                    break;
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                if(!['name','address','updatetime','image'].includes(_rowInfo.payloadObj.key)){
                    loger.out(`ROW_EDIT_PROP_REMOVE error unknown key(${_rowInfo.payloadObj.key}). Key:${_rowInfo.payloadObj.key} RowId:${_rowInfo.payloadObj.rowId}`)
                    break;
                }
                if(_rowInfo.rowObj['isEditing']){
                    _rowInfo.rowObj['isEditing'] = false
                    _rowInfo.rowObj['fieldEditing'] = 'none'
                    _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                    _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                    _state = {..._state,monitors:_newMonitors}
                }
                break;
            case actionTypes.ROW_PAUSE_ALL:
                if(!__validateInputs(action.payload,['monitorId'])){
                    loger.out(`ROW_PAUSE_ALL Error: expected to recive monitorId`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                _newMonitors = [..._state.monitors]
                _neededMonitorIndex = _newMonitors.map((_m)=>{
                    return _m.monitorId == _payloadObj.monitorId
                }).indexOf(true)
                //if some unpaused
                    //pause unpaused
                    //set grouppaused flag
                let _unpausedIndexes:number[] = []
                _newMonitors[_neededMonitorIndex].rows.forEach((_rowStr,_i)=>{
                    let _rowObj = JSON.parse(_rowStr)
                    if(_rowObj.isPaused !== true){
                        _unpausedIndexes.push(_i)
                        _rowObj.isPaused = true
                        _rowObj.isPausedGrouped = true
                        _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj)
                    }
                })
                //if all paused
                    //unpause all with grouppaused flag
                    //take off the flag
                if(_unpausedIndexes.length == 0){
                    _newMonitors[_neededMonitorIndex].rows.forEach((_rowStr,_i)=>{
                        let _rowObj = JSON.parse(_rowStr)
                        if(_rowObj.isPausedGrouped === true){
                            _rowObj.isPaused = false
                            _rowObj.isPausedGrouped = false                
                            _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj)
                        }
                    })
                }
                _state = {..._state,monitors:_newMonitors}
                break;
            case actionTypes.ROW_UNALARM_ALL:
                if(!__validateInputs(action.payload,['monitorId'])){
                    loger.out(`ROW_UNALARM_ALL Error: expected to recive monitorId`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                _newMonitors = [..._state.monitors]
                _neededMonitorIndex = _newMonitors.map((_m)=>{
                    return _m.monitorId == _payloadObj.monitorId
                }).indexOf(true)
                _newMonitors[_neededMonitorIndex].rows.forEach((_rowStr,_i)=>{
                    let _rowObj = JSON.parse(_rowStr)
                    if(_rowObj.isAlarmed == true){
                        _rowObj.isAlarmed = false
                        _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj)
                    }
                })
                _state = {..._state,monitors:_newMonitors}
                break;
            default:
                loger.out(`Reducer error: Unknown action type: ${action.action}`)
                console.error(`Reducer error: Unknown action type: ${action.action}`)
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