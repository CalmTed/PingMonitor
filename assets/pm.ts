
interface renderItem {
    secector:string,
    property:string,
    value:string
}
interface comunicatorMessage {
    command:string,
    payload:any
}
var contextMenu
const {webFrame} = require('electron')
const Page = (_winId)=>{
    this.appConfig
    this.isProduction = true
    this.winId = _winId
    this.state
    this.siren = Siren()
    this.optimize = (_stateNew:any,_stateOld:any):renderItem[]=>{
        let _renObj:any
        let _stateDiff = (_stateNew:any,_stateOld:any)=>{
            let _diffList:{
                selector:string,
                key:string,
                value:any
            }[] = []
            
            let _getMainChanges = (_stateNew,_stateOld)=>{
                let _mainChangesList = []
                Object.keys(_stateNew).forEach(_key=>{
                    if(!['monitor','langWords'].includes(_key))
                    if(_stateNew[_key] != _stateOld[_key]){
                        _mainChangesList.push({selector:'main',key:_key,value:_stateNew[_key]})
                    }
                })
                return _mainChangesList
            }
            let _getRowChanges = (_stateNew,_stateOld)=>{
                let _rowChangesList = []
                let _newStateIds = _stateNew.monitor.rows.map(r=>{let rr = JSON.parse(r);return [rr.rowId,rr.position]})
                let _oldStateIds = _stateOld.monitor.rows.map(r=>{let rr = JSON.parse(r);return [rr.rowId,rr.position]})
                let _newRows = _newStateIds.filter(_nr=>_oldStateIds.filter(_or=>_or[0] == _nr[0]).length == 0)
                let _removedRows = _oldStateIds.filter(_or=>_newStateIds.filter(_nr=>_nr[0] == _or[0]).length == 0)
                _newRows.forEach(_nr=>{
                    _rowChangesList.push({selector:'list',key:'new_row',value:_stateNew.monitor.rows.find(_mr=>_mr.includes(`"rowId":${_nr[0]}`))})
                })
                _removedRows.forEach(_rr=>{
                    _rowChangesList.push({selector:'list',key:'remove_row',value:_stateOld.monitor.rows.find(_mr=>_mr.includes(`"rowId":${_rr[0]}`))})
                })
                _stateNew.monitor.rows.forEach((_row,_i)=>{
                    const _rowObjNew = JSON.parse(_row)
                    //if not new row
                    if(_stateOld.monitor.rows.find(_mr => _mr.includes(`"rowId":${_rowObjNew.rowId}`))){
                        const _rowObjOld = JSON.parse(_stateOld.monitor.rows[_i])
                        Object.keys(_rowObjNew).forEach(_key => {
                            if(typeof _rowObjNew[_key] != 'object'){
                                if(_rowObjNew[_key] !== _rowObjOld[_key]){
                                    _rowChangesList.push({selector:'row',id:_rowObjNew.rowId,key:_key,value:_rowObjNew[_key]})
                                }
                            }else{
                                if(_key === 'history'){
                                    const _oldHistory = _rowObjOld[_key];
                                    const _newHistory = _rowObjNew[_key];
                                    const getQuality = (histList) => {
                                        return (100 / histList.length) * histList.reduce((ps,a)=>(a.s == 'online' ? ps+1 : ps+0), 0) << 0// rounding
                                    }
                                    if (!!_newHistory.length && !!_oldHistory.length) {
                                        const _lastElementOfNewHist = _newHistory.pop()
                                        const _lastElementOfOldHist = _oldHistory.pop()
                                        if(_lastElementOfNewHist.t != _lastElementOfOldHist.t){
                                            _lastElementOfNewHist.quality = getQuality(_newHistory.slice(0, 300))//last 5 minutes
                                            _rowChangesList.push({selector: 'row', id: _rowObjNew.rowId, key: _key, value: _lastElementOfNewHist})
                                        }
                                    }else{
                                        if(!!_newHistory.length){
                                            const _lastElementOfNewHist = _newHistory.pop()
                                            _lastElementOfNewHist.quality = getQuality(_newHistory.slice(0, 300))//last 5 minutes
                                            _rowChangesList.push({selector:'row',id:_rowObjNew.rowId,key:_key,value:_lastElementOfNewHist})
                                        }
                                    }
                                }
                            }
                        })
                    }
                    
                })
                //check if row switched place
                if(_newRows.length + _removedRows.length == 0){
                    let _checkOfSwaped = (_new,_old)=>{
                        let swapped = false
                        _new.forEach(([rid,pos],i)=>{
                            if(typeof _old[i] != 'undefined'){
                                _new[i][1] != _old[i][1]?swapped==false?swapped=true:0:0
                            }else{
                                swapped==false?swapped=true:0
                            }
                        })
                        return swapped
                    }
                    let isSwapped = _checkOfSwaped(_newStateIds,_oldStateIds)
                    if(isSwapped){
                        _rowChangesList.push({selector:'list',key:'recreateByPosition',value:_stateNew.monitor.rows})   
                    }
                }
                return _rowChangesList
            }
            _diffList = [..._getMainChanges(_stateNew,_stateOld),..._getRowChanges(_stateNew,_stateOld)]
            
            return _diffList
        }
        _renObj = _stateDiff(_stateNew,_stateOld)

        return _renObj
    }
    this.t = (word)=>{
        let _ret = word
        let _langSet = this.state.langWords
        if(typeof _langSet[word] == 'undefined'){
            return _ret
        }
        if(_langSet[word].length == 0 || word.length == 0){
            return _ret
        }
        _ret = _langSet[word]
        return _ret
    }
    this.render = (_state:any)=>{
        try{
        let initialRender = false
        let difference:any
        if(typeof this.state == 'undefined'){
            this.state = _state
            difference = _state
            initialRender = true
        }else{
            difference = this.optimize(_state,this.state)
        }
        let _toFormat = (_ms)=>{
            let _h = Math.floor((_ms)/1000/60/60)
            let _m = Math.floor((_ms-(_h*3600000))/1000/60)
            let _s = Math.floor((_ms-(_h*3600000)-(_m*60000))/1000)
            let addZero = (num)=>{
                return num<10?`0${num}`:`${num}`
            }
            if(_h>0){
                return `${addZero(_h)}:${addZero(_m)}:${addZero(_s)}`
            }else{
                return `${addZero(_m)}:${addZero(_s)}`
            }
        }
        let formatExactDateTime = function(_timestamp){
            let d = new Date(_timestamp);
            let h = d.getHours();
            let m = d.getMinutes();
            let s = d.getSeconds();
            let year = d.getFullYear();
            let mos = d.getMonth()+1;
            let day = d.getDate();
            let addZero = (num)=>{
              return num<10?`0${num}`:`${num}`
            }
            return `${year}.${addZero(mos)}.${addZero(day)} ${addZero(h)}:${addZero(m)}:${addZero(s)}`
        }
        let _getPath = ({dataArray,width,height,length})=>{
            let _ret = '';
            let _canvasWidth = width;
            let _canvasHeight = height;
            let _heightMargin = 10;
            let _widthMargin = _heightMargin;
            let dataLenghtLimit = length*60*1000;
            let timeOfBegining = new Date().getTime() - dataLenghtLimit;//cut to last N min
            let dataTrimmed = dataArray.filter(dot=>{return dot.t >= timeOfBegining})
            let widthKoof = (100-(_widthMargin*2));
            if(dataTrimmed.length>1){
              if(dataTrimmed[dataTrimmed.length-1].t - dataTrimmed[0].t > dataLenghtLimit){
                 widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataTrimmed[dataTrimmed.length-1].t - dataTrimmed[0].t)
              }else{
                widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataLenghtLimit)
              }
            }
            let maxDellay = Math.max(...dataTrimmed.map(dot=>{return dot.d}));
            let _map = (val,start1,stop1,start2,stop2)=>{
              let __a = (val-start1)/(stop1-start1)*(stop2-start2)+start2;
              return start2 < stop2 ? Math.round(Math.max(Math.min(__a, stop2), start2)*10)/10 : Math.round(Math.max(Math.min(__a, start2), stop2)*10)/10;
            }
            if(dataTrimmed.length>0){
              _ret += `M${_widthMargin} ${_map(dataTrimmed[0].d,maxDellay,0,_heightMargin,_canvasHeight-_heightMargin)}`
              let _firstTime = dataTrimmed[0].t;
              dataTrimmed.forEach((dot,i)=>{
                if(i>0){
                  let _x = Math.round((_widthMargin+(dot.t - _firstTime)*widthKoof)*100)/100;
                  let _y = _map(dot.d,maxDellay,0,_heightMargin,_canvasHeight-_heightMargin);
                  if(dot.s == 'offline' ||dot.s == 'timeout'||dot.s == 'error'){
                    _ret += `M${_x} ${_y}`;
                  }else{
                    _ret += `L${_x} ${_y}`;
                  }
                }
              })
            }
            return _ret;
        }
        let _getStats  = ({history})=>{ 
            
            let _changesList:{
                    status:string,
                    prevStatus:string,  
                    duration:number,
                    from:number,
                    until:number
                }[] = []
            let _statusList:{
                    status:string,
                    duration:number,
                    changesNum:number
            }[] = [];
            if(history.length<2){
                return {
                    changesList:_changesList,
                    statusList:_statusList
                }  
            }
            let _getChanges = (history)=>{
                let _ret
                let _tempBeginigTime
                let _tempStatus
                let _startTime
                history.forEach(({s,t},_i)=>{
                    if(!_tempStatus){_tempStatus = s}
                    if(!_tempBeginigTime){_tempBeginigTime = t;_startTime = t}
                    if(_tempStatus != s){
                        _ret.push({
                            status:s,
                            prevStatus:_tempStatus,
                            duration:Math.abs(t - _tempBeginigTime),
                            from:t,
                            until:_tempBeginigTime
                        })
                        _tempStatus = s;
                        _tempBeginigTime = t;
                    }else{//same status but the end of history
                        if(_ret.length>0){
                            _ret[_ret.length-1].duration = Math.abs(t - _tempBeginigTime)
                            _ret[_ret.length-1].until = t
                        }
                    }
                })
                return _ret
            }
            let _getStatus = (__changesList)=>{
                let _ret = []
                if(__changesList.length == 0){
                    if(history.length>0){
                        _ret.push({
                            status:history[history.length-1].s,
                            duration:Math.abs(history[history.length-1].t - history[0].t),
                            changesNum:0
                        })
                    }
                }else{
                    __changesList.forEach(_chLEl=>{
                        if(_ret.length == 0){
                            //adding status before first change
                            _ret.push({
                                status:_chLEl.prevStatus,
                                duration:Math.abs(_chLEl.from - history[0].t),
                                changesNum:1
                            })  
                        }
                        if(!_ret.find(_slEl=>{return _slEl.status == _chLEl.status})){
                            _ret.push({
                                status:_chLEl.status,
                                duration:_chLEl.duration,
                                changesNum:1
                            })
                        }else{
                            let _index = _ret.indexOf(_ret.find(_slEl=>{return _slEl.status == _chLEl.status}))
                            _ret[_index].duration += _chLEl.duration
                            _ret[_index].changesNum++;
                        }
                    })
                }
                return _ret
            }
            let initialStatus = history[0].s
            let initialTime = history[0].t
            let addStatusIfNeeded = (__statusList,__status,__duration)=>{
                if(!__statusList.find(_slEl=>{return _slEl.status == __status})){
                    __statusList.push({
                        status:__status,
                        duration:__duration,
                        changesNum:1
                    })
                }else{
                    let _index = __statusList.indexOf(__statusList.find(_slEl=>{return _slEl.status == __status}))
                    __statusList[_index].duration += __duration
                    __statusList[_index].changesNum++;
                }
                return __statusList
            }
            history.forEach((_moment,_i)=>{
                let duration = _moment.t - initialTime
                if(_moment.s !== initialStatus){
                    //changes
                    _changesList.push({
                        status:_moment.s,
                        prevStatus:initialStatus,
                        duration:duration,
                        from:initialTime,
                        until:_moment.t 
                    })
                    //status
                    _statusList = addStatusIfNeeded(_statusList,initialStatus,duration)
                    initialStatus = _moment.s
                    initialTime = _moment.t
                }else if(_i == history.length-1){
                    _changesList.push({
                        status:_moment.s,
                        prevStatus:initialStatus,
                        duration:duration,
                        from:initialTime,
                        until:_moment.t 
                    })
                    _statusList = addStatusIfNeeded(_statusList,initialStatus,duration)
                } 
            })
            return {
                changesList:_changesList.reverse(),
                statusList:_statusList
            }
        }
        let _renderColor = (theme)=>{
            document.querySelector('.root').setAttribute('colorMode',theme)
        }
        let _renderLanguage = (_config)=>{
            if(_state.langCode != _config.langCode){
                location.reload()
            }
        }
        let _createMenuModal = ({hidden})=>{
            let _menuModal = document.createElement('menumodal')
            let _createMenuOption = ({name,alt,_class,action,icon,width})=>{
                let _menuOptionDom = document.createElement('menuoption')
                _menuOptionDom.innerHTML =this.t(name)
                _menuOptionDom.setAttribute('title',this.t(alt))
                _menuOptionDom.setAttribute('tabindex','1')
                _menuOptionDom.classList.add(_class)
                _menuOptionDom.style.setProperty('--icon-name',`'${icon}'`)
                if(width != ''){
                    _menuOptionDom.style.setProperty('width',`calc(${width} - 2.9em)`)
                }
                _menuOptionDom.onclick = (_e)=>{
                    if(action.command == 'setZoom'){
                        switch(action.payload){
                            case 'In':
                                webFrame.setZoomFactor(webFrame.getZoomFactor()*1.5);
                                break
                            case 'Out':
                                webFrame.setZoomFactor(webFrame.getZoomFactor()/1.5);
                                break;
                            case 'Fix':
                                webFrame.setZoomFactor(1);
                                break;
                        }
                    }else{
                        let comunicator = Comunicator()
                        comunicator.send(action)
                    }
                }
                _menuOptionDom.onkeyup = (_e:any)=>{
                    if(_e.key == 'Enter' ||_e.key == ' '){
                        _e.preventDefault()
                        _e.target.click()
                    }
                }
                return _menuOptionDom
            }
            let _menuOption = [
                {
                    name:'New window',
                    alt:'Open new window',
                    _class:'newwin',
                    icon:'add_to_queue',
                    action:{
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'addMonitor',
                            payload:JSON.stringify({})
                        })
                    }
                },
                {
                    name:'Duplicate window',
                    alt:'Duplicate window',
                    _class:'dupwin',
                    icon:'add_to_photos',
                    action:{
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'addNewWindowBySubKey',
                            payload:_state.subscriptionKey
                        })
                    }
                },
                {
                    name:'Settings',
                    alt:'Open settings',
                    _class:'winsettngs',
                    icon:'settings',
                    action:{
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'winSetProp',
                            payload:JSON.stringify({winId:_state.winId,key:'isSettingOpen',value:true})
                        })
                    }
                },
                {
                    name:'Save config',
                    alt:'Export config',
                    _class:'configexport',
                    icon:'get_app',
                    action:{
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'monitorExportConfig',
                            payload:''
                        })
                    }
                },
                {
                    name:'Open config',
                    alt:'Import config',
                    _class:'configimport',
                    icon:'file_open',
                    action:{
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'monitorImportConfig',
                            payload:''
                        })
                    }
                },
                {
                    name:'',
                    alt:'Scale down',
                    _class:'zoomout',
                    icon:'zoom_out',
                    width:'33%',
                    action:{
                        command:'setZoom',
                        payload:'Out'
                    }
                },
                {
                    name:'',
                    alt:'Normal scale',
                    _class:'zoomfix',
                    icon:'search',
                    width:'33%',
                    action:{
                        command:'setZoom',
                        payload:'Fix'
                    }
                },
                {
                    name:'',
                    alt:'Scale up',
                    _class:'zoomin',
                    icon:'zoom_in',
                    width:'33%',
                    action:{
                        command:'setZoom',
                        payload:'In'
                    }
                },
                
            ]
            _menuOption.forEach(_mo=>{
                if(typeof _mo.width == 'undefined'){
                    _mo.width = ''
                }
                _menuModal.append(_createMenuOption({
                    name:_mo.name,
                    _class:_mo._class,
                    icon:_mo.icon,
                    alt:_mo.alt,
                    action:_mo.action,
                    width:_mo.width
                }))

            })
            _menuModal.setAttribute('hidden',hidden)
            return _menuModal
        }
        let _renderSettingsContent = (_configData)=>{
            let _settingsModalDom = document.querySelector('settingsmodal')
            let _getOptions = (_options,_value)=>{
                let _op = []
                _options.forEach(_o=>{
                    _op.push(`<option ${_value===_o?'selected':''} value="${_o}">${this.t(_o)}</option>`)
                })
                return _op.join('')
            }
            let _getInputContent = (_type,_name,_value,_options=['no options'])=>{
                let _ret = []
                let _parent = ''
                if(_name.includes('_')){
                    _parent = _name.split('_').filter((_n,_i,_a)=>{return _i<_a.length-1}).join('_')
                    _name = _name.split('_').filter((_n,_i,_a)=>{return _i==_a.length-1}).toString()
                }
                let _getNameDom = (text)=>{
                    let _nameDom = document.createElement('name')
                    _nameDom.innerHTML = this.t(text)
                    return _nameDom
                }
                let _getInputDom = ({type,name,value,randNum=0,options=[],callback=(e)=>{}})=>{
                    let _inputDom
                    if(type == 'selector'){
                        _inputDom = document.createElement('select')
                    }else{
                        _inputDom = document.createElement('input')
                    }
                    switch(type){
                        case 'checkbox':
                            _inputDom.setAttribute('type',`checkbox`)
                            _inputDom.setAttribute('id',`${name}${randNum}`)
                            _inputDom.style.setProperty('display','none')
                            value?_inputDom.setAttribute('checked',''):0
                            _inputDom.onchange = (e)=>{
                                callback(e)
                            }
                            break;
                        case 'number':
                            _inputDom.setAttribute('type',`number`)
                            _inputDom.setAttribute('value',`${value}`)
                            _inputDom.setAttribute('tabindex','7')
                            _inputDom.onkeyup = (e)=>{
                                if(e.target.value!=value){
                                    callback(e)
                                }
                            }
                            break;
                        case 'string':
                            _inputDom.setAttribute('type',`text`)
                            _inputDom.setAttribute('value',`${value}`)
                            _inputDom.setAttribute('tabindex','7')
                            _inputDom.onkeyup = (e)=>{
                                if(e.target.value!=value){
                                    callback(e)
                                }
                            }
                            break;
                        case 'selector':
                            _inputDom.innerHTML = _getOptions(options,value)
                            _inputDom.setAttribute('tabindex','7')
                            _inputDom.onchange = (e)=>{
                                callback(e)
                            }
                            break;
                    }
                    
                    return _inputDom
                }
                let _getLabelDom = (name='',randNum=-1)=>{
                    let _labelDom = document.createElement('label')
                    randNum!=-1?_labelDom.setAttribute('for',`${name}${randNum}`):0
                    return _labelDom
                }
                let _sendConfigChange = (_fullName,_value)=>{
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'configSetProp',
                        payload:JSON.stringify({key:_fullName,value:_value})
                    })
                }
                switch(_type){
                    case 'checkbox':
                        let _randNum = Math.round(Math.random()*10000)
                        _ret.push(_getNameDom(_name))
                        _ret.push(_getInputDom({type:_type,name:_name,value:_value,randNum:_randNum,callback:(e)=>{
                            let _fullN = _parent!=''?`${_parent}_${_name}`:_name
                                _sendConfigChange(_fullN,e.target.checked)
                        }}))
                        let _checkboxLabel = _getLabelDom(_name,_randNum)
                        _checkboxLabel.setAttribute('tabindex','7')
                        _checkboxLabel.onkeyup = (_e:any)=>{
                            if(_e.key == 'Enter' ||_e.key == ' '){                    
                                _e.preventDefault()
                                _e.target.click()
                            }
                        }
                        _ret.push(_checkboxLabel)
                        break;
                    case 'number':
                        let _numberInputLabel= _getLabelDom(_name)
                        _numberInputLabel.append(_getNameDom(_name))
                        _numberInputLabel.append(_getInputDom({type:_type,name:_name,value:_value,callback:(e)=>{
                            let _fullN = _parent!=''?`${_parent}_${_name}`:_name
                                _sendConfigChange(_fullN,e.target.value)
                            }
                        }))
                        _ret.push(_numberInputLabel)
                        break;
                    case 'string':
                        let _stringInputLabel = _getLabelDom(_name)
                        _stringInputLabel.append(_getNameDom(_name))
                        _stringInputLabel.append(_getInputDom({type:_type,name:_name,value:_value,callback:(e)=>{
                            let _fullN = _parent!=''?`${_parent}_${_name}`:_name
                                _sendConfigChange(_fullN,e.target.value)
                            }
                        }))
                        _ret.push(_stringInputLabel)
                        break;
                    case 'selector':
                        let _selectorInputLabel = _getLabelDom(_name)
                        _selectorInputLabel.append(_getNameDom(_name))
                        _selectorInputLabel.append(_getInputDom({type:_type,name:_name,value:_value,options:_options,callback:(e)=>{
                            let _fullN = _parent!=''?`${_parent}_${_name}`:_name
                            _sendConfigChange(_fullN,e.target.value)
                        }
                        }))
                        _ret.push(_selectorInputLabel)
                        break;
                }
                if(['hideTitleBar',''].includes(_name)){
                    let _miniLabel = document.createElement('minilabel')
                    _miniLabel.innerHTML = this.t('*Requires manual reload')
                    _ret.push(_miniLabel)
                }
                return _ret
            }
            let _getSettingsRow = ({type,name,value,options})=>{
                let _settingsRow = document.createElement('settingsrow')
                //TYPES: text_short,selector,number,checkbox
                _settingsRow.setAttribute('name',name)
                //TODO add event listeners
                if(type == 'defaultNewRow'){
                    let _defaultSubTitle = document.createElement('subtitle')
                    _defaultSubTitle.innerHTML = this.t(name)
                    _settingsRow.append(_defaultSubTitle)
                    Object.entries(value).forEach(_v=>{
                        let _srN = _v[0]
                        let _srV = _v[1]
                        let _subRow = document.createElement('subrow')
                        _subRow.setAttribute('name',`${name}_${_srN}`)
                        if(['address','name'].includes(_srN)){
                            _subRow.append(..._getInputContent('string',`${name}_${_srN}`,_srV))
                        }else if(['updateTimeMS'].includes(_srN)){
                            _subRow.append(..._getInputContent('number',`${name}_${_srN}`,_srV))
                        }else if(['isPaused','isMuted'].includes(_srN)){
                            _subRow.append(..._getInputContent('checkbox',`${name}_${_srN}`,_srV))
                        }else if(['pictureLink','size'].includes(_srN)){
                            let _opt = []
                            switch(_srN){
                                case 'pictureLink':_opt = JSON.parse(_state.imagesList);break;
                                case 'size':_opt = ['1Little','2Small','4Middle','6Big'];break;
                            }
                            _subRow.append(..._getInputContent('selector',`${name}_${_srN}`,_srV,_opt))
                        }
                        _settingsRow.append(_subRow)
                    })
                }else if(type == 'logSettings'){
                    let _logSubTitle = document.createElement('subtitle')
                    _logSubTitle.innerHTML = this.t(name)
                    _settingsRow.append(_logSubTitle)
                    Object.entries(value).forEach(_v=>{
                        let _srN = _v[0]
                        let _srV = _v[1]
                        let _subRow = document.createElement('subrow')
                        _subRow.setAttribute('name',`${name}_${_srN}`)
                        if(['defaultLogName'].includes(_srN)){
                            _subRow.append(..._getInputContent('string',`${name}_${_srN}`,_srV))
                        }else if(['logChanges','newLogNameEveryday'].includes(_srN)){
                            _subRow.append(..._getInputContent('checkbox',`${name}_${_srN}`,_srV))
                        }else if(['timeToLogStatusChangeMS'].includes(_srN)){
                            _subRow.append(..._getInputContent('number',`${name}_${_srN}`,_srV))
                        }
                        _settingsRow.append(_subRow)
                    })
                }else if(type == 'initialRows'){
                    let _initSubTitle = document.createElement('subtitle')
                    _initSubTitle.innerHTML = this.t(name)
                    _settingsRow.append(_initSubTitle)

                    value.forEach((_vl,_i)=>{
                        if(_i>0){
                            _settingsRow.append(document.createElement('hr'))
                        }
                        Object.entries(value[_i]).forEach((_v)=>{
                            let _srN = _v[0]
                            let _srV = _v[1]
                            let _subRow = document.createElement('subrow')                        
                           _subRow.setAttribute('name',`${name}_${_i}_${_srN}`)
                            if(['address','name'].includes(_srN)){
                                _subRow.append(..._getInputContent('string',`${name}_${_i}_${_srN}`,_srV))
                            }else if(['updateTimeMS'].includes(_srN)){
                                _subRow.append(..._getInputContent('number',`${name}_${_i}_${_srN}`,_srV))
                            }else if(['isPaused','isMuted'].includes(_srN)){
                                _subRow.append(..._getInputContent('checkbox',`${name}_${_i}_${_srN}`,_srV))
                            }else if(['pictureLink','size'].includes(_srN)){
                                let _opt = []
                                switch(_srN){
                                    case 'pictureLink':_opt = JSON.parse(_state.imagesList);break;
                                    case 'size':_opt = ['1Little','2Small','4Middle','6Big'];break;
                                }
                                _subRow.append(..._getInputContent('selector',`${name}_${_i}_${_srN}`,_srV,_opt))
                            }
                            _settingsRow.append(_subRow)
                        })
                    })
                }else if(type == 'defaultPingTimeStrategy'){
                    let _initSubTitle = document.createElement('subtitle')
                    _initSubTitle.innerHTML = this.t(name)
                    _settingsRow.append(_initSubTitle)
                    Object.entries(value).forEach((_v)=>{
                            let _srN = _v[0]
                            let _srV = _v[1]
                            let _subRow = document.createElement('subrow')                        
                           _subRow.setAttribute('name',`${name}_${_srN}`)
                           _subRow.append(..._getInputContent('number',`${name}_${_srN}`,_srV))
                            _settingsRow.append(_subRow)
                        })
                }else{
                    _settingsRow.append(..._getInputContent(type,name,value,options))
                }
                _settingsRow.setAttribute('type',type)
                return _settingsRow
            }
            let _updateSettingsRow = ({type,name,value})=>{
                let _updateBySelector = (selector,type,value)=>{
                    let target
                    switch(type){
                    case 'checkbox': 
                        target = document.querySelector(selector)
                        if(target.checked !== value){
                            target.checked = value
                        }
                        break;
                    case 'number':
                    case 'string':
                        target = document.querySelector(selector)
                    case 'selector':
                        type=='selector'?target = document.querySelector(selector):0
                        if(target.value !== value){
                            target.value = value
                        }
                        break;
                    }
                }
                switch(type){
                case 'checkbox': 
                    _updateBySelector(`settingsrow[name="${name}"] input[type="checkbox"]`,type,value)
                    break;
                case 'number':
                case 'string':
                    _updateBySelector(`settingsrow[name="${name}"] input`,type,value)
                    break;
                case 'selector':
                    _updateBySelector(`settingsrow[name="${name}"] select`,type,value)
                    break;
                case 'initialRows':
                    value.forEach((_vl,_i)=>{
                        Object.entries(_vl).forEach(_irs=>{
                            let _irN = _irs[0]
                            let _irV = _irs[1]
                            let _targetSubRow = `settingsrow[name="${name}"] subrow[name="${name}_${_i}_${_irN}"]`
                            if(['address','name'].includes(_irN)){
                                _updateBySelector(`${_targetSubRow} input`,'string',_irV)
                            }else if(['updateTimeMS'].includes(_irN)){
                                _updateBySelector(`${_targetSubRow} input`,'number',_irV)
                            }else if(['isPaused','isMuted'].includes(_irN)){
                                _updateBySelector(`${_targetSubRow} input[type="checkbox"]`,'checkbox',_irV)
                            }else if(['pictureLink'].includes(_irN)){
                                _updateBySelector(`${_targetSubRow} select`,'selector',_irV)
                            }
                        })
                    })
                    break;
                case 'defaultNewRow':
                    Object.entries(value).forEach(_drp=>{
                        let _drN = _drp[0]
                        let _drV = _drp[1]
                        let _targetSubRow = `settingsrow[name="${name}"] subrow[name="${name}_${_drN}"]`
                        if(['address','name'].includes(_drN)){
                            _updateBySelector(`${_targetSubRow} input`,'string',_drV)
                        }else if(['updateTimeMS'].includes(_drN)){
                            _updateBySelector(`${_targetSubRow} input`,'number',_drV)
                        }else if(['isPaused'].includes(_drN)){
                            _updateBySelector(`${_targetSubRow} input[type="checkbox"]`,'checkbox',_drV)
                        }else if(['pictureLink','size'].includes(_drN)){
                            _updateBySelector(`${_targetSubRow} select`,'selector',_drV)
                        }
                    })
                    break;
                case 'logSettings':
                    Object.entries(value).forEach(_lsp=>{
                        let _lsN = _lsp[0]
                        let _lsV = _lsp[1]
                        let _targetSubRow = `settingsrow[name="${name}"] subrow[name="${name}_${_lsN}"]`
                        if(['defaultLogName'].includes(_lsN)){
                            _updateBySelector(`${_targetSubRow} input`,'string',_lsV)
                        }else if(['logChanges','newLogNameEveryday'].includes(_lsN)){
                            _updateBySelector(`${_targetSubRow} input[type="checkbox"]`,'checkbox',_lsV)
                        }else if(['timeToLogStatusChangeMS'].includes(_lsN)){
                            _updateBySelector(`${_targetSubRow} input`,'number',_lsV)
                        }
                    })
                    break;
                case 'defaultPingTimeStrategy':
                    Object.entries(value).forEach(_lsp=>{
                        let _lsN = _lsp[0]
                        let _lsV = _lsp[1]
                        let _targetSubRow = `settingsrow[name="${name}"] subrow[name="${name}_${_lsN}"]`
                        _updateBySelector(`${_targetSubRow} input`,'number',_lsV)
                    })
                    break;
                default:
                    console.error('no case for type: ',type)
                break;
                }
            }
            let _checkSettingsRow = (_entri)=>{
                let _type = 'input'
                let _name = _entri[0]
                let _value = _entri[1]
                let _options = []
                if(_name == '__keyForTesting' ){
                    return 0
                }
                if(['timeToAlarmMS','timeToLogStatusChangeMS','pingHistoryTimeLimitMINS','miniGraphShowLimitMINS'].includes(_name)){
                    _type='number'
                }
                if(['langCode','colorMode','newRowRule'].includes(_name)){
                    _type='selector'
                    switch(_name){
                        case 'langCode':
                            _options = ['ua','en']
                            break;
                        case 'colorMode':
                            _options = ['system','dark','light']
                            break;
                        case 'newRowRule':
                            _options = ['copyPrev','default']
                            break;
                    }
                }
                if(['unmuteOnGettingOnline','savePingHistoryToConfig','alwaysShowOnTop','hideTitleBar'].includes(_name)){
                    _type='checkbox'
                }
                if(_type == 'input'){
                    _type = _name
                }

                if(document.querySelector(`settingsrow[name="${_name}"]`) == null){
                    let _settRowDom = _getSettingsRow({type:_type,name:_name,value:_value,options:_options})
                    _settingsModalDom.append(_settRowDom)
                }else{
                    _updateSettingsRow({type:_type,name:_name,value:_value})
                }
            }
            if(document.querySelector('settingstitle') == null){
                _settingsModalDom.innerHTML = ''
                let _settTitle = document.createElement('settingstitle')
                _settTitle.innerHTML = this.t('Settings')
                _settingsModalDom.append(_settTitle)
            }
            Object.entries(_configData).forEach(_e=>{
                _checkSettingsRow(_e)
            })
            if(document.querySelector('settingsrestore') == null){
                let _settRestore = document.createElement('settingsrestore') as HTMLElement
                _settRestore.classList.add('button')
                _settRestore.style.setProperty('--icon-name',`'restore'`)
                _settRestore.innerHTML = this.t('Restore defaults')
                _settRestore.setAttribute('tabindex','8')
                _settRestore.onclick = (e)=>{
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'configRestoreDefaults',
                        payload:''
                    })
                }
                _settRestore.onkeyup = (_e:any)=>{
                    if(_e.key == 'Enter' ||_e.key == ' '){
                        _e.preventDefault()
                        _e.target.click()
                    }
                }
                _settingsModalDom.append(_settRestore)
            }
            if(document.querySelector('settingshotkeys') == null){
                let _settKeys = document.createElement('settingshotkeys') as HTMLElement
                _settKeys.classList.add('button')
                _settKeys.style.setProperty('--icon-name',`'keyboard_alt'`)
                _settKeys.innerHTML = this.t('Hot keys')
                _settKeys.setAttribute('tabindex','8')
                _settKeys.onclick = (e)=>{
                    alert(`${this.t('HOT KEYS')}\n`+
                    `M - ${this.t('open menu')}\n`+
                    `P - ${this.t('pause all')}\n`+
                    `F - ${this.t('fullscreen')}\n`+
                    `A - ${this.t('disable alarm')}\n`+
                    `Ctrl+N - ${this.t('new row')}\n`+
                    `Ctrl+Shift+N - ${this.t('new window')}\n`+
                    `Ctrl+Shift+D - ${this.t('duplicate window')}\n`+
                    `Ctrl+S - ${this.t('save config')}\n`+
                    `Ctrl+O - ${this.t('open config')}\n`+
                    `Ctrl+H - ${this.t('clear all ping history')}\n`+
                    `Ctrl+A - ${this.t('select all rows')}\n`+
                    `(Row)Space - ${this.t('select row')}\n`+
                    `(Row)Enter - ${this.t('open row menu')}\n`+
                    `(Row)Right - ${this.t('next row')}\n`+
                    `(Row)Left - ${this.t('previus row')}`)
                }
                _settKeys.onkeyup = (_e:any)=>{
                    if(_e.key == 'Enter' ||_e.key == ' '){
                        _e.preventDefault()
                        _e.target.click()
                    }
                }
                _settingsModalDom.append(_settKeys)
            }
            if(document.querySelector('settingsabout') == null){
                let _settKeys = document.createElement('settingsabout') as HTMLElement
                _settKeys.classList.add('button')
                _settKeys.style.setProperty('--icon-name',`'info'`)
                _settKeys.innerHTML = this.t('About')
                _settKeys.setAttribute('tabindex','8')
                _settKeys.onclick = (e)=>{
                    alert(`${this.t('ABOUT')}\n`+
                    `${this.t('PingMonitor is a free app to automatically ping and show status of network devices.')}\n`+
                    `${this.t('Version')} ${this.state.version} (${this.t('May')} 2022)\n`+
                    `©${this.t('Made by Fedir Moroz for Ukrainian Military Forces in Sep 2021 for no commercial use only.')}\n`+
                    `${this.t('For more info contact me at')} github.com/calmted`)
                }
                _settKeys.onkeyup = (_e:any)=>{
                    if(_e.key == 'Enter' ||_e.key == ' '){
                        _e.preventDefault()
                        _e.target.click()
                    }
                }
                _settingsModalDom.append(_settKeys)
            }

        }
        let _renderNewConfig = (_newConfigObj)=>{
            let _previousConfig = JSON.parse(JSON.stringify(this.appConfig))
            if(_previousConfig.langCode != _newConfigObj.langCode){
                _renderLanguage(_newConfigObj)
            }
            if(_previousConfig.colorMode != _newConfigObj.colorMode){
                _renderColor(_newConfigObj.colorMode)
            }
            _renderSettingsContent(_newConfigObj)
            this.appConfig = _newConfigObj
        }
        let _createSettingsModal = ({hidden})=>{
            let _settingsModal = document.createElement('settingsmodal')
            _settingsModal.setAttribute('hidden',hidden)
            let comunicator = Comunicator()
            comunicator.subscribe((_message:comunicatorMessage)=>{
                if(_message.command == 'sendConfig'){
                    _renderNewConfig(_message.payload)
                }
            })
            if(!hidden){
                comunicator.send({
                    command:'getConfigData',
                    payload:this.winId
                })
            }
            return _settingsModal
        }
        let _getImagePickerImageDom = ({_imageLink})=>{
            let _imagePickerContentDom = document.createElement('image') as HTMLElement
            _imagePickerContentDom.setAttribute('style',`background-image: url('${this.isProduction?'../../':''}assets/icons/${_imageLink}')`)
            _imagePickerContentDom.setAttribute('title',`${_imageLink}`)
            _imagePickerContentDom.onclick = (_e)=>{
                let _el = _e.target as HTMLElement
                let _rowId = document.querySelector('imgpickermodal').getAttribute('targetRow')
                if(!_el.classList.contains('selected') && _rowId!=null){
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'rowSetProp',
                            payload:JSON.stringify({rowId:_rowId,key:'imageLink',value:_imageLink})
                        })
                    })
                }
            }
            _imagePickerContentDom.onkeyup = (_e:any)=>{
                if(_e.key == 'Enter'||_e.key == ' '){
                    _e.preventDefault()
                    _e.target.click()
                }
            }
            return _imagePickerContentDom
        }
        let _createImagePickerModal = ({hidden,imageList})=>{
            let _imagePickerModal = document.createElement('imgpickermodal')
            _imagePickerModal.setAttribute('hidden',hidden)
            typeof imageList == 'string'?imageList = JSON.parse(imageList):0;
            
            imageList.forEach(_linkStr=>{
                _imagePickerModal.append(_getImagePickerImageDom({_imageLink:_linkStr}))
            })
            return _imagePickerModal
        }
        let _createTool = ({tagName,icon,altText,action,hidden=false})=>{
            let _tool = document.createElement(tagName)
            _tool.classList.add('tool')
            _tool.setAttribute('title',this.t(altText))
            _tool.setAttribute('hidden',hidden)
            _tool.setAttribute('tabindex','0')
            _tool.classList.add('material-icons')
            _tool.innerHTML = icon
            _tool.onclick = (e)=>{
                let comunicator = Comunicator()
                comunicator.send({
                    command:'dispachAction',
                    payload:JSON.stringify(action)
                })
            }
            _tool.onkeyup = (_e)=>{
                if(_e.key == 'Enter' ||_e.key == ' '){
                    _e.preventDefault()
                    _e.target.click()
                }
            }
            return _tool
        }
        let _createListDOM = ()=>{
            let _ret = document.createElement('list')
            return _ret
        }
        let _addEditEvents = ({domElement,name,className,rowId})=>{
            domElement.onclick = (e)=>{
                let eventElement = e.target as HTMLInputElement
                if(eventElement.classList.contains(className)){
                    eventElement.focus()
                    eventElement.select()
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'rowEditProperySet',
                            payload:JSON.stringify({rowId:rowId,key:name})
                        })
                    })
                }
            }
            domElement.onkeyup = (e)=>{
                let eventElement = e.target as HTMLInputElement
                let _name:string = name
                let _value:any = e.target.value
                if(e.key.length>1){
                    return 0
                }
                if(name == 'updatetime'){
                    _name = 'updateTimeMS'
                    _value = Number(_value.replace(/[^0-9]/g,'')) * 1000;
                }
                if(name == 'address'){
                    _name = 'ipAddress'
                }
                if(eventElement.validity){
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'rowSetProp',
                            payload:JSON.stringify({rowId:rowId,key:_name,value:_value})
                        })
                    })
                }
            }
            domElement.onblur = (e)=>{
                let comunicator = Comunicator()
                comunicator.send({
                    command:'dispachAction',
                    payload:JSON.stringify({
                        action:'rowEditProperyRemove',
                        payload:JSON.stringify({rowId:rowId,key:name})
                    })
                })
            }
        }
        let _getCol1Content = (imageLink,name,ipAddress,rowId)=>{
            let _col1Content = document.createElement('col1')
            //picture
            let _picDOMElement = document.createElement('pic')
            _picDOMElement.setAttribute('style',`background-image: url('${this.isProduction?'../../':''}assets/icons/${imageLink}')`)
            _col1Content.append(_picDOMElement)
            //name
            let _nameDOMElement = document.createElement('input')
            _nameDOMElement.classList.add('name')
            _nameDOMElement.setAttribute('tabindex','6')
            _nameDOMElement.value = name
            _addEditEvents({domElement:_nameDOMElement,name:'name',className:'name',rowId:rowId})
            _col1Content.append(_nameDOMElement)
            //address
            let _addressDOMElement = document.createElement('input')
            _addressDOMElement.classList.add('address')
            _addressDOMElement.setAttribute('tabindex','6')
            _addressDOMElement.value = ipAddress
            _addEditEvents({domElement:_addressDOMElement,name:'address',className:'address',rowId:rowId})
            _col1Content.append(_addressDOMElement)
            return _col1Content
        }
        let _getCol2Content = (history,updateTimeMS,rowId)=>{
            let _knownHistory = {s:'unknown',d:0}
            let _knownQuality = 0
            if(history.length>0){
                _knownHistory = history[history.length-1]
                _knownQuality = Math.round(100/history.length*history.reduce((ps,a)=>(a.s == 'online'? ps+1:ps+0),0))
            }
            let status = _knownHistory.s
            let dellayMS = _knownHistory.d
            let quality = _knownQuality
            let _col2Content = document.createElement('col2')
            //status
            let _statusDOMElement = document.createElement('status')
            _statusDOMElement.innerHTML = this.t(status)
            //trio
            let _trioDOMElement = document.createElement('trio')
                // dellay
                let _dellayDOMElement = document.createElement('triodelay')
                _dellayDOMElement.innerHTML = `${dellayMS}${this.t('ms')}`
                _dellayDOMElement.setAttribute('title',this.t('Ping delay'))
                // update
                let _updateDOMElement = document.createElement('input')
                _updateDOMElement.value = `${updateTimeMS/1000}${this.t('s')}`
                _updateDOMElement.classList.add('trioupdate')
                _updateDOMElement.setAttribute('tabindex','6')
                _updateDOMElement.setAttribute('title',this.t('Update time'))
                _addEditEvents({domElement:_updateDOMElement,name:'updatetime',className:'trioupdate',rowId:rowId})
                // quality
                let _qualityDOMElement = document.createElement('trioquality')
                _qualityDOMElement.innerHTML = `${quality}%`
                _qualityDOMElement.setAttribute('title',this.t('Quality'))
                
            _trioDOMElement.append(_dellayDOMElement)
            _trioDOMElement.append(_updateDOMElement)
            _trioDOMElement.append(_qualityDOMElement)

            _col2Content.append(_statusDOMElement)
            _col2Content.append(_trioDOMElement)
            return _col2Content
        }
        let _getCol3Content = (history,rowId)=>{
            let _col3Content = document.createElement('col3')
            //somehow it is the only way to make svg work
            //we do not render path b.c. we can not get svg size right now, need to render it first
            _col3Content.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 200 100"><path d=""/></svg>`
            // _col3Content.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 200 100"><path d="${_getPath({dataArray:history,width:200,height:100,length:this.appConfig.miniGraphShowLimitMINS})}"/></svg>`
            return _col3Content
        }
        let _getCol4Content = (history,rowId)=>{
            let _col4Content = document.createElement('col4')
            let _stats = _getStats({history:history})
            //each status change and duration
            let _chagesList = _stats.changesList
            //each status and duration sortad by duration
            let _statsList = _stats.statusList.sort((_sl1,_sl2)=>{return _sl1.duration<_sl2.duration?1:-1}) 
            let _statsAllOfflineDurationDom = document.createElement('statsall')
            let _getStatusElementDom = ({status,duration,changesNum,_i})=>{
                let _statusElement = document.createElement('statselement')
                    _statusElement.innerHTML = `<status>${this.t(status)}</status> <duration>${_toFormat(duration)}</duration>`
                    _statusElement.setAttribute('title',`${changesNum} ${this.t('changes')}`)
                return _statusElement
            }
            //if there are no changes
            if(_chagesList.length == 0){
                if(_statsList.length>0){
                    _statsAllOfflineDurationDom.append(_getStatusElementDom({
                        status:_statsList[0].status,
                        duration:_statsList[0].duration,
                        changesNum:_statsList[0].changesNum,
                        _i:0
                    }))
                }
                _col4Content.append(_statsAllOfflineDurationDom)
            }else{
                let _statsLastChangeTimeDom = document.createElement('statslast')
                _chagesList.forEach((_chLEl,_i)=>{
                    let _changeElement = document.createElement('changeelement')
                    _changeElement.innerHTML = `<status>${this.t(_chLEl.prevStatus)}</status> <duration>${_toFormat(_chLEl.duration)}</duration>`
                    if(_i==0){
                        _changeElement.style.setProperty('--icon-text',`'-'`);
                    }else{
                        _changeElement.style.setProperty('--icon-text',`'${_i}'`);
                    }
                    let _formatedDateFrom = formatExactDateTime(_chLEl.from)
                    let _formatedDateUntil = formatExactDateTime(_chLEl.until)
                    if(_formatedDateUntil.substring(0,10) == _formatedDateFrom.substring(0,10)){
                        _formatedDateUntil = _formatedDateUntil.replace(_formatedDateUntil.substring(0,10),'')
                    }
                    _changeElement.setAttribute('title',`${_formatedDateFrom} ${_formatedDateUntil}`)
                    _statsLastChangeTimeDom.append(_changeElement)
                })
                _statsList.forEach((_slEl,_i)=>{
                    _statsAllOfflineDurationDom.append(_getStatusElementDom({
                        _i:_i,
                        status:_slEl.status,
                        duration:_slEl.duration,
                        changesNum:_slEl.changesNum
                    }))
                })
                _col4Content.append(_statsAllOfflineDurationDom)
                _col4Content.append(_statsLastChangeTimeDom)
            }
            return _col4Content
        }
        let _createRowDOM = ({rowId,name,imageLink,ipAddress,isBusy,isPaused,isMuted,isAlarmed,size,isSelected,history,updateTimeMS})=>{
            let _rowDOM = document.createElement('row')
            let _knownHistory = {s:'unknown',d:0}
            if(history.length>0){
                _knownHistory = history[history.length-1]
            }
            let status = _knownHistory.s
            _rowDOM.setAttribute('id',rowId)
            _rowDOM.setAttribute('busy',isBusy)
            _rowDOM.setAttribute('paused',isPaused)
            _rowDOM.setAttribute('muted',isMuted)
            _rowDOM.setAttribute('alarmed',isAlarmed)
            _rowDOM.setAttribute('size',size)
            _rowDOM.setAttribute('selected',isSelected)
            _rowDOM.setAttribute('status',status)
            _rowDOM.setAttribute('tabindex','4')
            
            _rowDOM.append(_getCol1Content(imageLink,name,ipAddress,rowId))
            if(size != '1Little'){
                _rowDOM.append(_getCol2Content(history,updateTimeMS,rowId))
            }
            if(['4Middle','6Big'].includes(size)){
                _rowDOM.append(_getCol3Content(history,rowId))
            }
            if(['6Big'].includes(size)){
                _rowDOM.append(_getCol4Content(history,rowId))
            }
            //event handler
            _rowDOM.onclick = (e)=>{
                let eventElement = e.target as HTMLElement
                if(['ROW','COL1','COL2'].includes(eventElement.tagName)){
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'rowToggleProp',
                            payload:JSON.stringify({rowId:rowId,key:'isSelected'})
                        })
                    })
                }
            }
            _rowDOM.oncontextmenu = (e)=>{
                contextMenu.show(e)
            }
            _rowDOM.onkeyup = (_e:any)=>{
                //not for inputs
                if(_e.path.filter(_el=>{return _el.tagName == 'INPUT'}).length > 0){
                    return 0;
                }
                if(_e.key == 'Enter'){
                    contextMenu.show(_e)
                }
                if(_e.key == ' '){
                    _e.preventDefault()//to not to scroll
                    _e.target.click()
                }
                if(_e.key == 'ArrowRight'){
                    if(_e.target.nextSibling){
                        _e.target.nextSibling.focus()
                    }
                }
                if(_e.key == 'ArrowLeft'){
                    if(_e.target.previousSibling){
                        _e.target.previousSibling.focus()
                    }
                }
            }

            return _rowDOM
        }
        let _createToolsDOM = ()=>{
            let _toolsDOM = document.createElement('toolset')
            let toolMenu = _createTool({
                tagName:'toolmenu',
                icon:'menu',
                altText:'',
                action:{
                    action:'winToggleProp',
                    payload:JSON.stringify({winId:this.winId,key:'isMenuOpen'})
                }
            })
            let toolNewRow = _createTool({
                tagName:'toolnewrow',
                icon:'add',
                altText:'add row',
                action:{
                    action:'addRow',
                    payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                }
            })
            let toolPauseAll = _createTool({
                tagName:'toolpauseall',
                icon:'pause',
                altText:'pause all',
                action:{
                    action:'rowPauseAllActive',
                    payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                },
                hidden:_state.monitor.rows.filter(_r=>{return _r.includes(`"isPaused":false`)}).length>0?false:true
            })
            let toolFullScreen = _createTool({
                tagName:'toolfullscreen',
                icon:'fullscreen',
                altText:'toggle full screen',
                action:{
                    action:'winToggleProp',
                    payload:JSON.stringify({winId:this.winId,key:'isFullscreen'})
                }
            })
            let toolUnalarmAll = _createTool({
                tagName:'toolunalarm',
                icon:'notifications_off',
                altText:'unalarm all',
                action:{
                    action:'winUnalarmAllRows',
                    payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                },
                hidden:_state.monitor.rows.filter(_r=>{return _r.includes(`"isAlarmed":true`)}).length>0?false:true
            })
            _toolsDOM.append(toolMenu)
            _toolsDOM.append(toolNewRow)
            _toolsDOM.append(toolPauseAll)
            _toolsDOM.append(toolFullScreen)
            _toolsDOM.append(toolUnalarmAll)
            if(this.appConfig.hideTitleBar){
                let dragTool = document.createElement('tooldrag')
                dragTool.setAttribute('title',this.t('Drag window'))
                dragTool.classList.add('tool')
                dragTool.classList.add('material-icons')
                dragTool.innerHTML = 'drag_indicator'
                _toolsDOM.append(dragTool)
            }
            return _toolsDOM
        }
        if(initialRender){
            //reder title
            document.querySelector('title').innerHTML = _state.title
            let domRoot = document.querySelector('.root') as HTMLElement
            
            domRoot.innerHTML = ``
            _renderColor(this.appConfig.colorMode)
            domRoot.setAttribute('langCode',_state.langCode)
            //render modal
            let menuModal = _createMenuModal({hidden:!Boolean(_state.isMenuOpen)})
            domRoot.append(menuModal)
            let settingsModal = _createSettingsModal({hidden:!Boolean(_state.isSettingOpen)})
            domRoot.append(settingsModal)
            if(typeof this.appConfig != 'undefined'){//render settings data if posible
                _renderSettingsContent(this.appConfig)
            }
            let imagePickerModal = _createImagePickerModal({hidden:!Boolean(_state.isImagePickerOpen),imageList:_state.imagesList})
            domRoot.append(imagePickerModal)
            let tools = _createToolsDOM()
            domRoot.append(tools)

            let domList = _createListDOM()
            domRoot.append(domList)
            _state.monitor.rows.length > 0 ? _state.monitor.rows.forEach((rowStr:string)=>{
                    let rowObj = JSON.parse(rowStr)
                    let rowElement = _createRowDOM(rowObj)
                    domList.append(rowElement)
            }):0
            domRoot.onclick = (_e:any)=>{
                //if clicked not on row
                if(_e.path.filter(_el=>{return _el.tagName == 'ROW'}).length == 0){
                    contextMenu.hideContextMenu()
                    let _selectedRows = this.state.monitor.rows.filter(_r=>_r.includes(`"isSelected":true`)).map(_r=>JSON.parse(_r))
                    if(_selectedRows.length>0){
                        let comunicator = Comunicator()
                        comunicator.send({
                            command:'dispachAction',
                            payload:JSON.stringify({
                                action:'rowUnselectAllSelected',
                                payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                            })
                        })
                    }
                }else{
                    //if clicked on row 
                    if(contextMenu.isShown){
                        contextMenu.hideContextMenu()
                    }
                }
                //if imgPicker is open
                if(document.querySelector('imgpickermodal[hidden="false"]') != null){
                    //hide image picker
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'winSetImagePickerOpen',
                            payload:JSON.stringify({rowId:this.targetRow.id,winId:this.winId,value:false})
                        })
                    })
                }
                //if clicked on menu tool button
                if(document.querySelector('menumodal[hidden="false"]') != null){
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'winSetProp',
                            payload:JSON.stringify({winId:this.winId,key:'isMenuOpen',value:false})
                        })
                    })
                }
                //if settings is open
                if(document.querySelector('settingsmodal[hidden="false"]') != null && _e.path.filter(_el=>{return _el.tagName == 'SETTINGSMODAL'}).length == 0){
                    let comunicator = Comunicator()
                    comunicator.send({
                        command:'dispachAction',
                        payload:JSON.stringify({
                            action:'winSetProp',
                            payload:JSON.stringify({winId:this.winId,key:'isSettingOpen',value:false})
                        })
                    })
                }
            }
            document.body.onkeyup = (_e:any)=>{
                if(_e.path.find(_el=>{return _el.tagName == 'INPUT'})){
                    return 0
                }
                let _ctrl = _e.ctrlKey
                let _shift = _e.shiftKey
                let _click = (_selector)=>{
                    if(!_selector){
                        return 0;
                    }
                    let target = document.querySelector(_selector);
                    target.click();
                }
                switch(_e.key){
                    case'm': _click('toolmenu'); break;
                    case'p': _click('toolpauseall'); break;
                    case'f': _click('toolfullscreen'); break;
                    case'n':
                        if(_ctrl){_click('toolnewrow')}
                        break;
                    case'N':
                        if(_ctrl&&_shift){_click('menuoption.newwin')}
                        break;
                    case'D':
                        if(_ctrl&&_shift){_click('menuoption.dupwin')}
                        break;
                    case's':
                        if(_ctrl){_click('menuoption.configexport')}
                        break;
                    case'o':
                        if(_ctrl){_click('menuoption.configimport')}
                        break;
                    case'a':
                        if(_ctrl){
                            document.querySelectorAll('row').forEach((_r:any)=>{_r.click()})
                        }else{
                            _click('toolunalarm')
                        }
                        break;
                    case'h':
                        if(_ctrl){
                            let comunicator = Comunicator()
                            comunicator.send({
                                command:'dispachAction',
                                payload:JSON.stringify({
                                    action:'rowClearAllHistory',
                                    payload:JSON.stringify({monitorId:_state.subscriptionKey})
                                })
                            })
                        }
                        break;
                }
            }
            document.body.onwheel = (_e:any)=>{
                if(_e.ctrlKey){
                    if(_e.deltaY>0){//up
                        webFrame.setZoomFactor(webFrame.getZoomFactor()*1.02);
                    }else{//down
                        webFrame.setZoomFactor(webFrame.getZoomFactor()/1.02);
                    }
                }
            }
        }else{
            let _changeHtmlIfNedded = (selector,value)=>{
                if(document.querySelector(selector).innerHTML != value){
                    document.querySelector(selector).innerHTML = value
                }
            }
            let _chageAttrIfNeeded = ({selector,key,value})=>{
                if(document.querySelector(selector) == null){
                    console.warn('selector to change attr not found')
                    return 0;
                }
                if(document.querySelector(selector).getAttribute(key) != value){
                    document.querySelector(selector).setAttribute(key,value)
                }
            }
            let _checkToolButtons = (_focus = 'all')=>{
                //hiding if paused
                if(['all','pause'].includes(_focus)){
                    let _unpausedRows = _state.monitor.rows.filter(_r=>{return _r.includes(`"isPaused":false`)})
                    if(typeof _unpausedRows == "undefined"){
                        return 0;
                    }
                    if(_unpausedRows.length>0){
                        _chageAttrIfNeeded({selector:'toolpauseall',key:'hidden',value:'false'})
                    }else{
                        _chageAttrIfNeeded({selector:'toolpauseall',key:'hidden',value:'true'})
                    }
                }
                //hiding unalarm button
                if(['all','alarm'].includes(_focus)){
                    let _alarmedRows = _state.monitor.rows.filter(_r=>{return _r.includes(`"isAlarmed":true`)})
                    if(typeof _alarmedRows == "undefined"){
                        return 0;
                    }
                    if(_alarmedRows.length>0){
                        _chageAttrIfNeeded({selector:'toolunalarm',key:'hidden',value:'false'})
                    }else{
                        _chageAttrIfNeeded({selector:'toolunalarm',key:'hidden',value:'true'})
                    }
                }
                if(['all','menu'].includes(_focus)){
                    let _isMenuOpen = _state.isMenuOpen
                    if(typeof _isMenuOpen == "undefined"){
                        return 0;
                    }
                    let _menuButtonDom = document.querySelector('toolmenu')
                    if(_isMenuOpen){
                        _menuButtonDom.innerHTML = 'close'
                    }else{
                        _menuButtonDom.innerHTML = 'menu'
                    }
                }
            }
            let _renderMainGroup = (diffUnit)=>{
                switch(diffUnit.key){
                    case 'isMenuOpen':
                        document.querySelector('menumodal').setAttribute('hidden',String(diffUnit.value == false));    
                        _checkToolButtons('menu')
                        break;
                    case 'isSettingOpen':
                        document.querySelector('settingsmodal').setAttribute('hidden',String(diffUnit.value == false)); 
                        if(diffUnit.value){
                            let comunicator = Comunicator()
                            comunicator.send({
                                command:'getConfigData',
                                payload:this.winId
                            })
                        }
                        break;
                    case 'isImagePickerOpen':
                        document.querySelector('imgpickermodal').setAttribute('hidden',String(diffUnit.value == false));
                        if(!diffUnit.value){
                            break;
                        }
                        let _targetRowObj = _state.monitor.rows.find(_r=>_r.includes(`"fieldEditing":"image"`))
                        if(typeof _targetRowObj != 'undefined'){
                            let _targetRowId = JSON.parse(_targetRowObj).rowId
                            document.querySelector('imgpickermodal').setAttribute('targetRow',_targetRowId)
                        }
                        break;
                    case 'isFullscreen':
                        diffUnit.value?document.documentElement.requestFullscreen():document.exitFullscreen?document.fullscreenElement?document.exitFullscreen():0:0
                        break;
                    case 'title':
                        document.querySelector('title').innerHTML = diffUnit.value
                    case 'imagesList':break;
                    case 'langCode':
                        if(diffUnit.value != this.appConfig.langCode){
                            let comunicator = Comunicator()
                            comunicator.send({
                                command:'getConfigData',
                                payload:this.winId
                            })
                        } 
                        break;
                    default:
                        console.error('Unknown main group diffUnit:',diffUnit)
                }
                if(diffUnit.key == 'imagesList'){
                    let _imagePickerModal = document.querySelector('imgpickermodal')
                    _imagePickerModal.innerHTML = ''
                    diffUnit.value.forEach(_linkStr=>{
                        _imagePickerModal.append(_getImagePickerImageDom({_imageLink:_linkStr}))
                    })
                }
            }
            let _renderListGroup = (diffUnit)=>{
                switch(diffUnit.key){
                    //add row
                    case 'new_row':
                        let list = document.querySelector('list')
                        let _newRowObj = JSON.parse(diffUnit.value)
                        list.append( _createRowDOM( _newRowObj ))
                        break;
                    //remove row
                    case 'remove_row':
                        let rowObj = JSON.parse(diffUnit.value)
                        let neededDom = document.querySelector(`row[id="${rowObj.rowId}"]`)
                        neededDom.parentNode.removeChild(neededDom)
                        break;
                    case 'recreateByPosition':
                        //get rowsObj[]
                        let _recreationRowsObjList = diffUnit.value.map(_rs=>{return JSON.parse(_rs)})
                        //sort by position
                        _recreationRowsObjList.sort((_r1,_r2)=>{
                            return _r1.position<_r2.position?-1:1
                        })
                        let _rowListForRecreation = document.querySelector('list')
                        _rowListForRecreation.innerHTML = ''
                        _recreationRowsObjList.forEach(_ro=>{
                            _rowListForRecreation.append(_createRowDOM(_ro))
                        })
                        break;
                    default:
                        console.error('Unknown list group diffUnit',diffUnit)
                }
                _checkToolButtons()
            }
            let _renderRowGroup = (diffUnit)=>{
                let targetRowDom = document.querySelector(`row[id="${diffUnit.id}"]`)
                let targetRowObj = JSON.parse(_state.monitor.rows.find(_r=>{return _r.includes(`"rowId":${diffUnit.id}`)}))
                let _updateInputElement = ({_selector,_value})=>{
                    let _newInputValue = _value
                    let _inputTarget = document.querySelector(`row[id="${diffUnit.id}"] ${_selector}`) as HTMLInputElement
                    if(_inputTarget == null){
                        console.warn(`Can't find row[id="${diffUnit.id}"] ${_selector}`)
                        return 0;
                    }
                    if(targetRowObj.fieldEditing !== 'updateTime' && _selector == '.trioupdate'){
                        _newInputValue =(_newInputValue/1000)+this.t('s');
                    }
                    _inputTarget.value = _newInputValue
                }
                
                let _renderCol2 = ({diffUnit})=>{
                    //check size
                    let _col2DOM = document.querySelector(`row[id="${diffUnit.id}"] col2`)
                    if(['2Small','4Middle','6Big'].includes(targetRowObj.size)){
                        if(_col2DOM == null){
                            //we need to create col2
                            targetRowDom.append(_getCol2Content(targetRowObj.history,targetRowObj.updateTimeMS,diffUnit.id))
                        }else{
                            //we just need to rerender values

                        }
                    }else{
                        //do we need to remove col
                        if(_col2DOM != null){
                            _col2DOM.parentNode.removeChild(_col2DOM)
                        }
                    }
                }
                let _renderCol3 = ({diffUnit})=>{
                    let _col3DOM = document.querySelector(`row[id="${diffUnit.id}"] col3`)
                    if(['4Middle','6Big'].includes(targetRowObj.size)){
                        if(_col3DOM == null){
                            targetRowDom.append(_getCol3Content(targetRowObj.history,diffUnit.id))
                            
                        }
                        _checkGraph(diffUnit)
                    }else{
                        if(_col3DOM != null){
                            _col3DOM.parentNode.removeChild(_col3DOM)
                        }
                    }
                }
                let _renderCol4 = ({diffUnit})=>{
                    let _col4DOM = document.querySelector(`row[id="${diffUnit.id}"] col4`)
                    if(['6Big'].includes(targetRowObj.size)){
                        if(_col4DOM == null){
                            targetRowDom.append(_getCol4Content(targetRowObj.history,diffUnit.id))
                        }else{
                            _col4DOM.parentNode.removeChild(_col4DOM)
                            targetRowDom.append(_getCol4Content(targetRowObj.history,diffUnit.id))
                        }   
                    }else{
                        if(_col4DOM != null){
                            _col4DOM.parentNode.removeChild(_col4DOM)
                        }
                    }
                }
                let _checkGraph = (_diffUnit)=>{
                    if(document.querySelector(`row[id="${_diffUnit.id}"] path`) != null){
                        let _svgDom = document.querySelector(`row[id="${_diffUnit.id}"] svg`)
                        let _svgWidth = _svgDom.clientWidth
                        let _svgHeight = _svgDom.clientHeight
                        if(_svgDom.getAttribute('viewBox') != `0 0 ${_svgWidth} ${_svgHeight}`){
                            _svgDom.setAttribute('viewBox',`0 0 ${_svgWidth} ${_svgHeight}`)
                        }
                        document.querySelector(`row[id="${_diffUnit.id}"] path`).setAttribute('d',_getPath({dataArray:targetRowObj.history,width:_svgWidth,height:_svgHeight,length:this.appConfig.miniGraphShowLimitMINS}))
                    }
                }
                let _checkStats = (_diffUnit)=>{
                    //do we need to add to log
                    //do we need to change statusList
                    _renderCol4({diffUnit:_diffUnit})
                }
                //if we have isEditing we create input somewhere and we do not update its value later
                if(diffUnit.key == 'isEditing'){
                    if(diffUnit.value){
                        let _enableInput = (_selector,)=>{
                            document.querySelector(`row[id="${diffUnit.id}"] ${_selector}`).classList.remove('disabled')
                        }
                        switch(targetRowObj.fieldEditing){
                            case 'name': _enableInput('.name');break;
                            case 'address': _enableInput('.address');break;
                            case 'updatetime': _enableInput('.trioupdate');break;
                        }
                    }else{
                        let _removeInput = (_selector)=>{
                            if(document.querySelector(_selector) != null)
                            document.querySelector(_selector).classList.add('disabled')
                        }
                        ['.name','.address','.trioupdate'].forEach(_selector=>{
                            _removeInput(_selector)
                            if(_selector == '.trioupdate' && targetRowObj.size != '1Little'){
                                _updateInputElement({_selector:_selector,_value:targetRowObj['updateTimeMS']})
                            }
                        })
                    }
                }
               
                if(diffUnit.key == 'size'){
                    targetRowDom.setAttribute('size',diffUnit.value)
                    //do we need to create it to remove it to update it
                    _renderCol2({diffUnit:diffUnit})//status
                    _renderCol3({diffUnit:diffUnit})//graph
                    _renderCol4({diffUnit:diffUnit})//statistics
                }
                if(diffUnit.key == 'history'){

                    const status = diffUnit.value.s
                    document.querySelector(`row[id="${diffUnit.id}"]`).setAttribute('status',status)
                    const rowDomElement = document.querySelector(`row[id="${diffUnit.id}"]`) as HTMLElement
                    // console.log('rendering '+ diffUnit.id);
                    !targetRowObj.isPaused?rowDomElement.animate([
                        {borderColor: 'var(--row-status)'},
                        {borderColor: 'var(--background)'},
                        {borderColor: 'var(--row-status)'},
                    ], {
                        duration: 400,
                        iterations: 1
                    }):0
                    if(targetRowObj.size != '1Little'){
                        let dellayMS = diffUnit.value.d
                        let quality = diffUnit.value.quality
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 status`,this.t(status))
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 trio triodelay`,`${dellayMS}${this.t('ms')}`)
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 trio trioquality`,`${quality}%`)
                    }
                    if(['4Middle','6Big'].includes(targetRowObj.size)){
                        _checkGraph(diffUnit)
                        
                    }
                    if(['6Big'].includes(targetRowObj.size)){
                        _checkGraph(diffUnit)
                        _checkStats(diffUnit)
                    }
                }
                switch(diffUnit.key){
                    case 'isBusy':
                        targetRowDom.setAttribute('busy',diffUnit.value)
                        break;
                    case 'isPaused':
                        targetRowDom.setAttribute('paused',diffUnit.value)
                        _checkToolButtons('pause')
                        break;
                    case 'isSelected':
                        targetRowDom.setAttribute('selected',diffUnit.value)
                        break;
                    case 'isAlarmed':
                        targetRowDom.setAttribute('alarmed',diffUnit.value)
                        _checkToolButtons('alarm')
                        break;
                    case 'isMuted':
                        targetRowDom.setAttribute('muted',diffUnit.value)
                        break;
                    case 'imageLink':
                        let _pictureTarget = document.querySelector(`row[id="${diffUnit.id}"] pic`) as HTMLElement
                        _pictureTarget.setAttribute('style', `background-image: url('${this.isProduction?'../../':''}assets/icons/${diffUnit.value}')`)
                        break;
                    case 'name':
                        _updateInputElement({_selector:'.name',_value:diffUnit.value})
                        break;
                    case 'ipAddress':
                        _updateInputElement({_selector:'.address',_value:diffUnit.value})
                        break;
                    case 'updateTimeMS':
                        _updateInputElement({_selector:'.trioupdate',_value:diffUnit.value})
                        break;
                }
            }
           
            difference.forEach(_dif=>{
                if(_dif.selector == 'main'){
                    _renderMainGroup(_dif)
                }else if(_dif.selector == 'list'){
                    _renderListGroup(_dif)
                }else if(_dif.selector == 'row'){
                    _renderRowGroup(_dif)
                }
            })
            
        }
        if(_state.monitor.rows.filter(_r=>_r.includes(`"isAlarmed":true`)).length>0){
            this.siren.start()
        }else{
            this.siren.stop()
        }   
        }catch(err){
            console.error(`State`,_state)
            alert(`Unable to render new state\n${err}`)
        }
        
    }
    return this
}
const { ipcRenderer } = require('electron')
const Comunicator = ()=>{
    this.send = ({command,payload})=>{
        try{
            ipcRenderer.invoke('window',{command:command,payload:payload});
        }catch(err){
            console.error(`Command:${command}\nPayload:${payload}`)
            alert(`Cant send message by communicator\nError:${err}`)
        }
    }
    this.subscribe = (_callback = (_m:comunicatorMessage)=>{},_channel = 'window')=>{
        ipcRenderer.on(_channel, function (event, message:comunicatorMessage) {
            _callback(message)
        })
    }
    return this
}
const Siren = ()=>{
    this.dom = document.querySelector('audio')
    this.playState = false
    this.start = ()=>{
        if(this.isProduction){
            let _link = this.dom.getAttribute('src')
            if(!_link.includes('../../')){
                this.dom.setAttribute(`src`,`../../${_link}`)
            }
        }
        if(!this.playState){
            this.playState = true
            this.dom.play()
            this.dom.volume = 0
            this.volumeUp()
        }
    }
    this.stop = ()=>{
        if(this.playState){
            this.playState = false
            this.dom.pause()
        }
    }
    this.volumeUp = ()=>{
        if(this.playState){
            if(this.dom.volume+0.1 < 1){
                this.dom.volume+=0.1
                setTimeout(()=>{
                    this.volumeUp()
                },1000)
            }
        }
    }
    return this
}
const ContextMenu = ()=>{
    this.isShown = false
    this.targetRow = ''
    this.x = 0
    this.y = 0
    this.setContextMenuParam = (_key,_value)=>{
        if(typeof this[_key] != 'undefined'){
            if(_key == 'targetRow'){
                if(_value.id != this[_key].id){
                    this[_key] = _value
                    this.renderContextMenu(_key)
                }
            }else if(this[_key] != _value){
                this[_key] = _value
                this.renderContextMenu(_key)
            }
        }
    }
    this.renderContextMenu = (_param)=>{
        try{
        //create dom element if not existed
        if(document.querySelector('contextmenu') == null){
            let rootDom = document.querySelector('.root')
            let newContextDom = document.createElement('contextmenu')
            newContextDom.setAttribute('shown',this.isShown)
            rootDom.appendChild(newContextDom)

        }
        let contextDom = document.querySelector('contextmenu') as HTMLElement
        let _renderOptions = ()=>{
            let _setEventListener = (_domEl,_action)=>{
                _domEl.onclick = ()=>{
                    let comunicator = Comunicator()
                    let _selectedRows = this.state.monitor.rows.filter(_r=>_r.includes(`"isSelected":true`)).map(_r=>JSON.parse(_r))
                    if(_selectedRows.length>0){
                        _selectedRows.forEach(_sr=>{
                            if(typeof _action.rowId != undefined){
                                let _newAction = JSON.parse(JSON.stringify(_action).replace(/\\{0,5}"rowId\\{0,5}":\\{0,5}"[\d]{4}.[\d]{6}\\{0,5}"/,`\\\\\\"rowId\\\\\\":\\\\\\"${_sr.rowId}\\\\\\"`))
                                comunicator.send(_newAction)
                            }
                        })
                    }else{
                        comunicator.send(_action)
                    }
                    contextMenu.hideContextMenu()
                }
                _domEl.onkeyup = (_e)=>{
                    if(_e.key == 'Enter' ||_e.key == ' '){
                        _e.preventDefault()
                        _e.target.click()
                    }
                }
                return _domEl
            }
            if(this.targetRow){
                let _isPausedFlag:boolean = this.targetRow.getAttribute('paused') == 'true'?true:false
                let _isMutedFlag:boolean = this.targetRow.getAttribute('muted') == 'true'?true:false
                let _isAlarmedFlag:boolean = this.targetRow.getAttribute('alarmed') == 'true'?true:false
                let _targetRowSize:string = this.targetRow.getAttribute('size')
                let options:{name:string,icon:string,width:string,action:any}[] = []
                if(_isAlarmedFlag){
                    options.push({
                        name:'Unalarm',
                        icon:'notifications_off',
                        width:'100%',
                        action:{
                            command:'dispachAction',
                            payload:JSON.stringify({
                                action:'rowSetProp',
                                payload:JSON.stringify({rowId:this.targetRow.id,key:'isAlarmed',value:false})
                            })
                        }
                    })
                }
                options = [...options,...[
                    {
                        name:_isPausedFlag?'Start':'Pause',
                        icon:_isPausedFlag?'play_arrow':'pause',
                        width:'100%',//for part size options
                        action:{
                            command:'dispachAction',
                            payload:JSON.stringify({
                                action:'rowToggleProp',
                                payload:JSON.stringify({rowId:this.targetRow.id,key:'isPaused'})
                            })
                        }
                    },
                    {
                        name:'Remove',
                        icon:'delete',
                        width:'100%',
                        action:{
                            command:'dispachAction',
                            payload:JSON.stringify({
                                action:'removeRow',
                                payload:JSON.stringify({rowId:this.targetRow.id})
                            })
                        }
                    },
                    {
                        name:_isMutedFlag?'Unmute':'Mute',
                        icon:_isMutedFlag?'volume_up':'volume_off',
                        width:'100%',
                        action:{
                            command:'dispachAction',
                            payload:JSON.stringify({
                                action:'rowToggleProp',
                                payload:JSON.stringify({rowId:this.targetRow.id,key:'isMuted'})
                            })
                        }
                    },
                    {
                        name:'Change picture',
                        icon:'wallpaper',
                        width:'100%',
                        action:{
                            command:'dispachAction',
                            payload:JSON.stringify({
                                action:'winSetImagePickerOpen',
                                payload:JSON.stringify({rowId:this.targetRow.id,winId:this.winId,value:true})
                            })
                        }
                    }
                ]];
                let _numberOfSelected = document.querySelectorAll('row[selected="true"]').length;
                ['1Little','2Small','4Middle','6Big'].forEach(_sz=>{
                    if(_targetRowSize != _sz || _numberOfSelected>0){
                        options.push({
                            name:'',//`${_sz.substring(0,1)}x`,
                            icon:`filter_${_sz.substring(0,1)}`,
                            width:_numberOfSelected>0?'25%':'33%',
                            action:{
                                command:'dispachAction',
                                payload:JSON.stringify({
                                    action:'rowSetProp',
                                    payload:JSON.stringify({rowId:this.targetRow.id,key:'size',value:_sz})
                                })
                            }
                        })
                    }
                })
                let _contextMenuDom = document.querySelector('contextmenu')
                _contextMenuDom.innerHTML = '';
                if(_numberOfSelected>0){
                    let _contextTitleDom = document.createElement('contexttitle')
                    let _titleOfSelected = (_num:number)=>{
                        let _ret:string = 'row'
                        if(_num>1){
                            _ret = 'rows'
                        }else if(_num>4){
                            _ret = 'rows'
                        }
                        return _ret
                    }
                    _contextTitleDom.innerHTML = `${_numberOfSelected} ${_titleOfSelected(_numberOfSelected)}`
                    _contextMenuDom.append(_contextTitleDom)
                }
                options.forEach(_opt=>{
                    let _contextOptionDom = document.createElement('option')
                    _contextOptionDom.innerHTML = `${this.t(_opt.name)}`
                    _contextOptionDom.style.setProperty('--icon-name',`'${_opt.icon}'`)
                    _contextOptionDom.style.setProperty('--option-width',_opt.width)
                    _contextOptionDom.setAttribute('tabindex','5')
                    _contextOptionDom = _setEventListener(_contextOptionDom,_opt.action)
                    _contextMenuDom.append(_contextOptionDom)
                })
            }
            //TODO GET CONTEXT SIZE maybe we need to chage x or y to fit to screen
        }
        switch(_param){
            case 'isShown':
                contextDom.setAttribute('shown',this.isShown)
                _renderOptions()
            break;
            case 'x':
                let _cWidth = contextDom.clientWidth
                let _pageWidth = window.window.innerWidth
                let _definateX = this.x
                if(_definateX+_cWidth>_pageWidth){
                    _definateX = _pageWidth-_cWidth
                }
                contextDom.style.setProperty('--c-x', _definateX)
                break;
            case 'y': 
                let _cHeight = contextDom.clientWidth
                let _pageHeight = window.window.innerHeight+window.window.scrollY
                let _definateY = this.y
                if(_definateY+_cHeight>_pageHeight){
                    _definateY = _pageHeight-_cHeight
                }
                contextDom.style.setProperty('--c-y', _definateY)
            case 'targetRow':
                _renderOptions()
            break;
        }
        }catch(err){
            alert(`Cant render contextMenu ${_param}`)
        }   
    }
    this.show = (_e)=>{
        if(this.isShown){
            this.hideContextMenu()
        }
        let targetRow = _e.path.find(_el=>{return _el.tagName == 'ROW'})
        let targetX = _e.clientX?_e.clientX+window.scrollX:targetRow.offsetLeft+window.scrollX+20
        let targetY = _e.clientY?_e.clientY+window.scrollY:targetRow.offsetTop+window.scrollY+20
        Object.entries({
            'x':targetX,
            'y':targetY,
            'targetRow':targetRow,
            'isShown':true
        }).forEach(([_k,_v])=>{
            this.setContextMenuParam(_k,_v)
        })
    }
    this.hideContextMenu = ()=>{
        this.setContextMenuParam('isShown',false)
    }
    return this
}
const pageStart = ()=>{
    var page:any
    var comunicator = Comunicator()
    contextMenu = ContextMenu()
    comunicator.subscribe((_message:comunicatorMessage)=>{
        console.debug(_message.command)
        if(_message.command == 'sendInitData'){
            let _plObj = JSON.parse(_message.payload)
            let _winId = _plObj.winId
            page = Page(_winId)

            let _config = _plObj.configData
            page.appConfig = _config
            page.isProduction = _plObj.isProduction
            comunicator.send({
                command:'dispachAction',
                payload:JSON.stringify({
                    action:'winToggleProp',
                    payload:JSON.stringify({winId:page.winId,key:'requestedUpdate',value:true})
                })
            })
        }
        if(_message.command == 'sendWinState'){
            if(page){
                let _resivedStateObj:any
                try{
                    _resivedStateObj = JSON.parse(_message.payload)
                }catch(e){
                    console.error('Error: unable to parse resived state')
                } 
                
                page.render(_resivedStateObj)
                //saving new state
                this.state = _resivedStateObj
            }
        }
    })
    
}
pageStart()