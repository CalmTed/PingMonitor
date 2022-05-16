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
    imagesList: string[]
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
    requestedUpdate:boolean
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
    constructor (data:any){
        this.__appVersion = data.version
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
    __getLangCode = async ()=>{
        //TODO make it async
        if(typeof this.__langCode == 'undefined'){
            let config = require('./config')
            let _LCRequest = await config.getParam('langCode')
            this.__langCode = _LCRequest.value
        }
        return this.__langCode
    }
    __getImagesList = async ()=>{
        let _imgNames:any
        let fileManager = require('./fileManager')
        _imgNames = await fileManager.getNames({path:'assets/icons',typeFilter:[{name:'*',extensions:['.png']}]})
        if(_imgNames.success){
            return _imgNames.payload.content
        }else{
            return []
        }
    }
    __getInitialPingTimeStrategy = async ()=>{
        let _ret = []
        let config = require('./config')
        let _defaultPTS = await config.getParam('defaultPingTimeStrategy')
        if(_defaultPTS.success){
            Object.entries(_defaultPTS.value).forEach(([_k,_v])=>{
                _ret.push({
                    conditions:{
                        status:_k
                    },
                    updateTimeMS:_v
                })
            })
        }

        return _ret;
    }
    __getInitialRowState = async ({_monitorId,_position=0,_name,_updateTimeMS,_ipAddress,_size,_imageLink,_isPaused,_isMuted})=>{
        let _ret:rowState = {
            rowId: Number(`${_monitorId}.${this.__genId('row')}`),//generate random
            position: _position,
            size: _size,
            ipAddress: _ipAddress,
            updateTimeMS: _updateTimeMS,
            name: _name,
            imageLink: _imageLink,
            history: [],
            pingTimeStrategy: await this.__getInitialPingTimeStrategy(),
            isBusy:false,
            isPaused: _isPaused,
            isPausedGrouped:false,
            isMuted: _isMuted,
            isAlarmed:false,
            isEditing:false,
            fieldEditing:'none',
            isGraphSubscribed:false,
            isSelected:false
        }
        return JSON.stringify(_ret)
    
    }
    __getAllWords = async (_code)=>{
        let fileManager = require('./fileManager')
        let _wordsList:any
        _wordsList = await fileManager.read({path:`assets/local/${_code}.json`,openDialog:false})
        if(_wordsList.success){
            try{
                return JSON.parse(_wordsList.payload.content)
            }catch(er){}
        }
        return {}
    }
    __getInitialWindow =  async (_appVersion:string,_appLangCode:string,_parameters:object={})=>{
        let _winData = {
            version: _appVersion,
            langCode: _appLangCode,
            langWords: await this.__getAllWords(_appLangCode),
            imagesList: await this.__getImagesList(),
            winId: this.__genId('window'),
            subscriptionKey: -1,
            title: `Ping monitor ${_appVersion}`,
            isGraph: false,
            isHidden: false,
            isFullscreen: false,
            isMenuOpen:false,
            isSettingOpen:false,
            isImagePickerOpen:false,
            requestedUpdate:false,
            monitor:{} 
        }
        if(Object.entries(_parameters).length>0){
            Object.entries(_parameters).forEach(([_key,_value])=>{
                _winData[_key] = _value
            })
        
        }
        return JSON.stringify(_winData)
    }
    __getInitialCoreState = async ()=>{
        let config = require('./config')
        let _appVersion = this.__getAppVersion()
        let _appLangCode = await this.__getLangCode()

        let _initialMonitorId1 = this.__genId('monitor')
        
        let _initValues:any = {
            _monitorId:_initialMonitorId1
        }
        let _initialColorMode = 'dark'
        let _initialColorModeRequest = await config.getParam('colorMode')
        _initialColorModeRequest.success?_initialColorMode = _initialColorModeRequest.value:0;
        let _initialValuesRequest = await config.getParam('initialRows')
        if(_initialValuesRequest.success){
            _initValues = {
                _monitorId:_initialMonitorId1,
                _name:_initialValuesRequest.value[0].name,
                _updateTimeMS:_initialValuesRequest.value[0].updateTimeMS,
                _ipAddress:_initialValuesRequest.value[0].address,
                _size:_initialValuesRequest.value[0].size,
                _imageLink:_initialValuesRequest.value[0].pictureLink,
                _isPaused:_initialValuesRequest.value[0].isPaused,
                _isMuted:_initialValuesRequest.value[0].isMuted
            }
        }
        return {
            version: _appVersion,
            langCode: _appLangCode,
            langWords: [{}],
            colorMode: _initialColorMode,
            monitors: [
                {
                    monitorId:_initialMonitorId1,
                    rows:[
                        await this.__getInitialRowState(_initValues),
                    ]
                },
            ],
            windows: [],
            propertyForTesting:0
        }
    }
    __stateNow = async ()=>{
        let _reply = JSON.stringify(await this.__getInitialCoreState())
        if(typeof this.__state !== 'undefined'){
            _reply = JSON.stringify({...this.__state})
        }
        return JSON.parse(_reply)
    }
    __userLogger = async ({name,text,indent})=>{
        let _indent = (_len = 0)=>{
            let _ret = '                '
            let _ind = ''
            let _step = ' '
            for(let _j=0;_j<40;_j++){
                _ind+=_step
            }
            for(let _k=0;_k<_len;_k++){
                _ret+=_ind
            }
            return _ret
        }
        let _addZero = (_num)=>{
            return Number(parseInt(_num))<10?`0${_num}`:`${_num}`
        }
        let _dateNow = new Date()
        let fileManager = require('./fileManager')
        let _exportResult = await fileManager.write({
            openDialog:false,
            path:`${name}.txt`,
            content:`${_dateNow.getFullYear()}-${_addZero(_dateNow.getMonth()+1)}-${_addZero(_dateNow.getDate())} ${_addZero(_dateNow.getHours())}-${_addZero(_dateNow.getMinutes())}-${_addZero(_dateNow.getSeconds())}${_indent(indent)}${text}\n`,
            append:true
        })
    }
    __reduce = async (_state:coreState, action:actionType)=>{
        let actionTypes = require('./actionTypes')
        let fileManager = require('./fileManager')
        let loger = require('./loger')
        let config = require('./config')
        let __newRow = async ({_state,_monitorId,_position=0}/* MAY BE THERE SHOULD BE CUSTOM VALUES*/)=>{
            let _newRowRuleRequest = await config.getParam('newRowRule')
            let _name,_updateTimeMS,_ipAddress,_size,_imageLink,_isPaused,_isMuted
            switch(_newRowRuleRequest.value){
                case 'copyPrev':
                    let _lastRowDataArr = _state.monitors.find(_m=>{return _m.monitorId = _monitorId}).rows.filter((_r,_i,_a)=>{return _i==_a.length-1})
                    if( _lastRowDataArr.length > 0){
                        let _lastRowDataObj = JSON.parse(_lastRowDataArr)
                        _name = _lastRowDataObj.name
                        _updateTimeMS = _lastRowDataObj.updateTimeMS
                        _ipAddress = _lastRowDataObj.ipAddress
                        _size = _lastRowDataObj.size
                        _imageLink = _lastRowDataObj.imageLink
                        _isPaused = _lastRowDataObj.isPaused
                        _isMuted = _lastRowDataObj.isMuted
                        break;
                    }
                default:
                    //getting from config
                    let _defaultRowDataRwquest = await config.getParam('defaultNewRow')
                    _name = _defaultRowDataRwquest.value.name
                    _updateTimeMS = _defaultRowDataRwquest.value.updateTimeMS
                    _ipAddress = _defaultRowDataRwquest.value.address
                    _size = _defaultRowDataRwquest.value.size
                    _imageLink = _defaultRowDataRwquest.value.pictureLink
                    _isPaused = _defaultRowDataRwquest.value.isPaused
                    _isMuted = _defaultRowDataRwquest.value.isMuted
                    break;
            }
            return this.__getInitialRowState({
                _monitorId:_monitorId,
                _position:_position,
                _name:_name,
                _updateTimeMS:_updateTimeMS,
                _ipAddress:_ipAddress,
                _size:_size,
                _imageLink:_imageLink,
                _isMuted:_isMuted,
                _isPaused:_isPaused
            })
        }
        let __newMonitor =  async ()=>{
            let _monitorId = this.__genId('monitor')
            return {monitorId:_monitorId,rows:[await __newRow({_state:_state,_monitorId:_monitorId})]}
        }
        let __validateInputs = (_payload:string,_targetInputsArray:string[]):boolean=>{
            let _ret = true
            if(typeof action.payload != 'string'){
                console.error('Payload should be a JSON string')
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
            if(typeof _selMon == 'undefined'){
                return {
                    success:false
                }
            }
            let _monInd:number = _monitors.indexOf(_selMon)
            let _rwStr = _selMon.rows.find(_row=>_row.indexOf(`"rowId":${_plObj.rowId}`) >-1)
            if(typeof _rwStr == 'undefined'){
                return {
                    success:false
                }
            }
            let _rwInd = _selMon.rows.indexOf(_rwStr)
            let _rwObj = JSON.parse(_rwStr)
            return {
                success:true,
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
                _newMonitors = [..._state.monitors,await __newMonitor()]
                _state = {..._state,monitors:_newMonitors}
                break
            case actionTypes.REMOVE_MONITOR_BY_ID:
                _newMonitors = [..._state.monitors.filter(_m=>_m.monitorId != action.payload)]
                _state = {..._state,monitors:_newMonitors}
                break
            case actionTypes.MONITOR_EXPORT_CONFIG:
                let _dateNow = new Date();
                let _exportTimeStamp = `${_dateNow.getFullYear()}-${_dateNow.getMonth()+1}-${_dateNow.getDate()} ${_dateNow.getHours()+1}-${_dateNow.getMinutes()}-${_dateNow.getSeconds()}`;
                let _initialState = {..._state}
                let _modifiedState = JSON.parse(JSON.stringify(_initialState))
                let _savePingHistory = false
                let _savePingHistoryRequest = await config.getParam('savePingHistoryToConfig')
                _savePingHistoryRequest.success?_savePingHistory = _savePingHistoryRequest.value:0;
                _initialState.monitors.forEach((_monit,_monitIndex)=>{
                    _monit.rows.forEach((_rowStr,_rowIndex)=>{
                        let _rowObg = JSON.parse(_rowStr)
                        let _modRowObg = {}
                        Object.entries(_rowObg).forEach(([_rok,_rov])=>{
                            if(!_savePingHistory && _rok=='history'){
                                _modRowObg[_rok] = []
                            }else{
                                _modRowObg[_rok] = _rov
                            }
                        })
                        _modifiedState.monitors[_monitIndex].rows[_rowIndex] = JSON.stringify(_modRowObg)
                    })
                })
                let _exportContent = JSON.stringify(_modifiedState,undefined,4);
                let _exportResult = await fileManager.write({
                    openDialog:true,
                    path:`PM Config ${_exportTimeStamp}.pm`,
                    dialogTile:`Save config`,
                    content:_exportContent
                })
                if(_exportResult.success){
                    //do nothing or show little message
                }else{
                    loger.out(`Reducer error:MONITOR_EXPORT_CONFIG unable to write config ${_exportResult}`)
                }
                break;
            case actionTypes.MONITOR_IMPORT_CONFIG:
                _newMonitors = [..._state.monitors.filter(_m=>_m.monitorId != action.payload)]
                let _importContent = ``;
                let _importResult = await fileManager.read({
                    openDialog:true,
                    dialogTile:`Save config`,
                    content:_importContent
                })
                if(_importResult.success){
                    let _openedStateStr = _importResult.payload.content
                    let _openedStateObj = JSON.parse(_openedStateStr)
                    if(_openedStateObj.version == _state.version){
                        _state = {..._openedStateObj}
                    }
                }else{
                    loger.out(`Reducer error:MONITOR_IMPORT_CONFIG unable to read config ${_importResult}`)
                }
                break;
            /*WINDOW     WINDOW     WINDOW     WINDOW     WINDOW     WINDOW     WINDOW     WINDOW*/
            case actionTypes.ADD_NEW_WINDOW_BY_SUBKEY:
                if(typeof action.payload != 'string'){
                    loger.out(`Reducer error:${action.action} expected to recive subscriptionKey:string`)
                    break;
                }
                let _langCode = await this.__getLangCode()
                let _oneNewWindowStr = await this.__getInitialWindow(this.__getAppVersion(), _langCode,{subscriptionKey:action.payload})
                _newWindowsStr = [..._state.windows,_oneNewWindowStr]
                
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
                if(_newWindowsObj[_payloadObj.key] != _payloadObj.value){// limits at least some duplicates
                    _newWindowsObj[_payloadObj.key] = _payloadObj.value;
                }
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
            case actionTypes.WIN_SET_IMAGE_PICKER_OPEN:
                if(!__validateInputs(action.payload,['rowId','winId','value'])){
                    loger.out(`WIN_SET_IMAGE_PICKER_OPEN Error: expected to recive rowId,winId,value`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                //get window
                _newWindowsStr = [..._state.windows]
                _neededWindowIndex = _newWindowsStr.map((_w)=>{
                    return _w.indexOf(`"winId":${_payloadObj.winId}`) >-1
                }).indexOf(true)
                _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex])
                //get row
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                //set win.isIPOpen
                _newWindowsObj.isImagePickerOpen = _payloadObj.value
                //set row.isEditing
                //set row.editing field
                _rowInfo.rowObj['isEditing'] = _rowInfo.payloadObj.value
                _rowInfo.rowObj['fieldEditing'] = _payloadObj.value?'image':'none'
                //save new state
                _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj)
                _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr
                _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj)
                _state = {..._state,monitors:_newMonitors,windows:_newWindowsStr}
                break;
            case actionTypes.WIN_REQUEST_STATE:
                if(!__validateInputs(action.payload,['winId'])){
                    loger.out(`WIN_SET_IMAGE_PICKER_OPEN Error: expected to recive winId`)
                    break;
                }
                break;
            case actionTypes.WIN_WRITE_NEW_LANG_WORDS:
                // let _newLangCodeRequest = await config.getParam('langCode')
                // if(!_newLangCodeRequest.success){
                //     break;
                // }
                let _newWords = await this.__getAllWords(action.payload)
                let _newWindows = [..._state.windows]
                _newWindows.forEach((_w,_wi)=>{
                    let _wObj = JSON.parse(_w)
                    _wObj.langCode = action.payload
                    _wObj.langWords = _newWords
                    _newWindows[_wi] = JSON.stringify( _wObj )
                })
                _state = {..._state,windows:_newWindows}
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
                let _newRowElement = await __newRow({_state:_state,_monitorId:_payloadObj.monitorId,_position:_newMonitors[_neededMonitorIndex].rows.length})
                _newMonitors[_neededMonitorIndex].rows.push(_newRowElement)
                _state = {..._state,monitors:_newMonitors}
                break;
            case actionTypes.REMOVE_ROW:
                if(!__validateInputs(action.payload,['rowId'])){
                    loger.out(`REMOVE_ROW Error: expected to recive rowId`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                _newMonitors = [..._state.monitors]
                _neededMonitorIndex = _newMonitors.map((_m)=>{
                    return _m.monitorId == _payloadObj.rowId.split('.')[0]
                }).indexOf(true)

                _newMonitors[_neededMonitorIndex].rows = _newMonitors[_neededMonitorIndex].rows.filter(_rwStr=>{return _rwStr.indexOf(`"rowId":${_payloadObj.rowId}`) == -1})
                _state = {..._state,monitors:_newMonitors}
                break;
            case actionTypes.ROW_SUBMIT_PING_PROBE:
                if(!__validateInputs(action.payload,['rowId','status','dellay','packetLoss','ttl','fullResponce'])){
                    loger.out(`ROW_SET_PROP Error: expected to recive rowId,status,dellay,packetLoss,ttl,fullResponce`)
                    break
                }
                _newMonitors = [..._state.monitors]
                _rowInfo = __getRow(action.payload,_newMonitors)
                if(!_rowInfo.success){
                    loger.out(`ROW_SET_PROP Error: row was not found`)
                    break;
                }
                _rowInfo.rowObj.isBusy = false
                _payloadObj = JSON.parse(action.payload)
                _rowInfo.rowObj.history.push({
                    timestamp: new Date().getTime(),
                    time: new Date(),
                    status:_payloadObj.status,
                    dellayMS:_payloadObj.dellay,
                    ttl:_payloadObj.ttl,
                    fullResponce:_payloadObj.fillResponce
                })
                let pingHistoryTimeLimitMINS = await config.getParam('pingHistoryTimeLimitMINS')
                if((new Date().getTime() - _rowInfo.rowObj.history[0].timestamp)>pingHistoryTimeLimitMINS.value*60*1000){
                    _rowInfo.rowObj.history.shift()
                }
                try{
                    let _ptsNeededStatus = _rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == _payloadObj.status)
                    if(_ptsNeededStatus != null){
                        if(_ptsNeededStatus.updateTimeMS != _rowInfo.rowObj.updateTimeMS){
                            _rowInfo.rowObj.updateTimeMS = _ptsNeededStatus.updateTimeMS
                        }
                    }else{
                        //TODO add new PTS
                    }
                }catch(e){
                    loger.out(`Reducer error: Unable to check update time conditions. Action: ${action.action}`)
                }
                //do we need to turn on alarm
                if(_payloadObj.status != 'online' && _rowInfo.rowObj.isMuted == false && _rowInfo.rowObj.isPaused == false){
                    let lastNotOnlineProbeTime:number
                    let i = _rowInfo.rowObj.history.length-1;
                    while(_rowInfo.rowObj.history[i].status != 'online' && i>0){
                            lastNotOnlineProbeTime = _rowInfo.rowObj.history[i].timestamp
                        i--
                    }
                    let timeToAlarmMS = await config.getParam('timeToAlarmMS')
                    if(new Date().getTime() - lastNotOnlineProbeTime >= timeToAlarmMS.value && _rowInfo.rowObj.history[_rowInfo.rowObj.history.length-1].status != 'online'){
                        _rowInfo.rowObj.isAlarmed = true
                    }
                }
                //do we need ot write change to log
                if(_rowInfo.rowObj.history.length>1){
                    let _userLoggerRequest = await config.getParam('logSettings')
                    if(_userLoggerRequest.success){
                        //do we need to check for log
                        if(_userLoggerRequest.value.logChanges){
                            let _getTimeOfLastChange = (_hist:any[])=>{
                                let _ret:any = {}
                                let _i:number=_hist.length-1
                                let _statusNow:string = _hist[_i].status
                                while(_statusNow == _hist[_i].status && _i>0){
                                    _i--
                                }
                                if(_i!=0){
                                    _ret.time = new Date().getTime() - _hist[_i].timestamp
                                    _ret.from = _hist[_i]
                                    _ret.to = _hist[_i+1]
                                }
                                return _ret
                            }
                            //do we need to check for change -> get time from last change
                            let _lastChangeData = _getTimeOfLastChange(_rowInfo.rowObj.history)
                            if(Object.keys(_lastChangeData).length!=0){
                                let _prevUpdateTime = _rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == _lastChangeData.from.status).updateTimeMS
                                let _currUpdateTime = _rowInfo.rowObj.pingTimeStrategy.find(_pts=>_pts.conditions.status == _lastChangeData.to.status).updateTimeMS
                                let _upperLimit = _prevUpdateTime>_currUpdateTime?_prevUpdateTime+1000:_currUpdateTime+1000
                                //does this time greather then time from config
                               if(_lastChangeData.time > _userLoggerRequest.value.timeToLogStatusChangeMS && 
                                    _lastChangeData.time < _userLoggerRequest.value.timeToLogStatusChangeMS + _upperLimit){//to not to emit twise
                                    //save to userLog with name from config
                                    let _dateNow = new Date()
                                    let _logNameDate = _userLoggerRequest.value.newLogNameEveryday?`${_dateNow.getFullYear()}-${_dateNow.getMonth()+1}-${_dateNow.getDate()}`:` `
                                    let _logName = `${_userLoggerRequest.value.defaultLogName} ${_logNameDate}`
                                    let _logText = `${_rowInfo.rowObj.name} ${_lastChangeData.from.status}>${_lastChangeData.to.status}`
                                    let _logIndent = _rowInfo.rowObj.position
                                    await this.__userLogger({name:_logName,text:_logText,indent:_logIndent})
                                }
                            }
                        }
                    }
                }
                //do we need to unmute
                if(_rowInfo.rowObj.history.length>1){
                    if(_payloadObj.status == 'online' && _rowInfo.rowObj.history[_rowInfo.rowObj.history.length-2].status != 'online'){
                        let unmuteOnGettingOnline = await config.getParam('unmuteOnGettingOnline')
                        if(unmuteOnGettingOnline.value){
                            _rowInfo.rowObj.isMuted = false
                        }
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
            case actionTypes.ROW_CLEAR_ALL_HISTORY:
                if(!__validateInputs(action.payload,['monitorId'])){
                    loger.out(`ROW_CLEAR_ALL_HISTORY Error: expected to recive monitorId`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                _newMonitors = [..._state.monitors]
                _neededMonitorIndex = _newMonitors.map((_m)=>{
                    return _m.monitorId == _payloadObj.monitorId
                }).indexOf(true)
                _newMonitors[_neededMonitorIndex].rows.forEach((_rowStr,_i)=>{
                    let _rowObj = JSON.parse(_rowStr)
                    if(_rowObj.history.length > 0){
                        _rowObj.history = []
                        _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj)
                    }
                })
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
            case actionTypes.ROW_UNSELECT_ALL:
                if(!__validateInputs(action.payload,['monitorId'])){
                    loger.out(`ROW_UNSELECT_ALL Error: expected to recive monitorId`)
                    break;
                }
                _payloadObj = JSON.parse(action.payload)
                _newMonitors = [..._state.monitors]
                _neededMonitorIndex = _newMonitors.map((_m)=>{
                    return _m.monitorId == _payloadObj.monitorId
                }).indexOf(true)
                _newMonitors[_neededMonitorIndex].rows.forEach((_rowStr,_i)=>{
                    let _rowObj = JSON.parse(_rowStr)
                    if(_rowObj.isSelected == true){
                        _rowObj.isSelected = false
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
    __setState = async(_state:coreState)=>{
        
        _state = {..._state}
        let _prevState = {...await this.__stateNow()}
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
    undo = async ()=>{
        let _ret = false
        if(this.__history.length>0){
            this.__history.pop()//removes current
            if( await this.__setState(this.__history.pop())){//setts second instnce from the end
                _ret = true;
            }
        }
        return _ret;
    }
    dispach = async (action:actionType)=>{
        let _newState = await this.__reduce( await this.__stateNow(),action)

        return await this.__setState(_newState) ? true : false;
    }
    subscribe = (_callback:any)=>{
        this.__subscribers.push(_callback)
    }
}
module.exports = stateManager