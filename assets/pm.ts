
interface renderItem {
    secector:string,
    property:string,
    value:string
}
interface comunicatorMessage {
    command:string,
    payload:string
}
const Page = (_winId)=>{
    this.winId = _winId
    this.state
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
                return _mainChangesList//[{selector:'state',key:'isMenuOpened',value:false}]
            }
            let _getRowChanges = (_stateNew,_stateOld)=>{
                let _rowChangesList = []
                let _newStateIds = _stateNew.monitor.rows.map(r=>{let rr = JSON.parse(r);return [rr.rowId,rr.position]})
                let _oldStateIds = _stateOld.monitor.rows.map(r=>{let rr = JSON.parse(r);return [rr.rowId,rr.position]})
                // console.log(_newStateIds,_oldStateIds)
                let _newRows = _newStateIds.filter(_nr=>_oldStateIds.filter(_or=>_or[0] == _nr[0]).length == 0)
                let _removedRows = _oldStateIds.filter(_or=>_newStateIds.filter(_nr=>_nr[0] == _or[0]).length == 0)
                // console.log(_newRows,_removedRows)
                _newRows.forEach(_nr=>{
                    _rowChangesList.push({selector:'list',key:'new_row',value:_stateNew.monitor.rows.find(_mr=>_mr.indexOf(`"rowId":${_nr[0]}`)>-1)})
                })
                _removedRows.forEach(_rr=>{
                    _rowChangesList.push({selector:'list',key:'remove_row',value:_stateOld.monitor.rows.find(_mr=>_mr.indexOf(`"rowId":${_rr[0]}`)>-1)})
                })
                //TODO find row position change(swaping places)
                _stateNew.monitor.rows.forEach((_row,_i)=>{
                    let _rowObjNew = JSON.parse(_stateNew.monitor.rows[_i])
                    if(typeof _stateOld.monitor.rows.find(_mr=>_mr.indexOf(`"rowId":${_rowObjNew.rowId}`)>-1) != 'undefined'){
                        let _rowObjOld = JSON.parse(_stateOld.monitor.rows[_i])
                        Object.keys(_rowObjNew).forEach(_key=>{
                            if(typeof _rowObjNew[_key] != 'object'){
                                if(_rowObjNew[_key] != _rowObjOld[_key]){
                                    _rowChangesList.push({selector:'row',id:_rowObjNew.rowId,key:_key,value:_rowObjNew[_key]})
                                }                
                            }else{
                                if(_key == 'history'){
                                    //what if they are the same length but diff still
                                    console.log(_key,_rowObjNew[_key].length,_rowObjOld[_key].length)
                                    if(_rowObjNew[_key].length>0 && _rowObjOld[_key].length>0){
                                        var _lastElementOfNewHist = _rowObjNew[_key][_rowObjNew[_key].length-1]
                                        var _lastElementOfOldHist = _rowObjOld[_key][_rowObjOld[_key].length-1]
                                        if(_lastElementOfNewHist.timestamp != _lastElementOfOldHist.timestamp){
                                            _lastElementOfNewHist.quality = Math.round(100/_rowObjNew[_key].length*_rowObjNew[_key].reduce((ps,a)=>(a.status == 'online'? ps+1:ps+0),0))
                                            _rowChangesList.push({selector:'row',id:_rowObjNew.rowId,key:_key,value:_lastElementOfNewHist})
                                        }
                                    }
                                }
                            }
                        })
                        
                    }
                    
                    //new rows
                    //removed rows
                    //switched place
                    
                })
                return _rowChangesList
            }
            _diffList = [..._getMainChanges(_stateNew,_stateOld),..._getRowChanges(_stateNew,_stateOld)]
            
            return _diffList
        }
        _renObj = _stateDiff(_stateNew,_stateOld)

        return _renObj
    }
    this.render = (_state:any)=>{
        let initialRender = false
        let difference:any
        if(typeof this.state == 'undefined'){
            this.state = _state
            difference = _state
            initialRender = true
        }else{
            difference = this.optimize(_state,this.state)
            console.log(`State`,_state)
            console.log(`Difference`,difference)
        }
        let _createMenuModal = ({hidden})=>{
            let _menuModal = document.createElement('menumodal')
            _menuModal.setAttribute('hidden',hidden)
            return _menuModal
        }
        let _createSettingsModal = ({hidden})=>{
            let _settingsModal = document.createElement('settingsmodal')
            _settingsModal.setAttribute('hidden',hidden)
            return _settingsModal
        }
        let _createImagePickerModal = ({hidden})=>{
            let _imagePickerModal = document.createElement('imgpickermodal')
            _imagePickerModal.setAttribute('hidden',hidden)
            return _imagePickerModal
        }
        let _createTool = ({tagName,icon,altText,action})=>{
            let _tool = document.createElement(tagName)
            _tool.classList.add('tool')
            _tool.setAttribute('alt',altText)
            _tool.classList.add('material-icons')
            _tool.innerHTML = icon
            _tool.onclick = ()=>{
                let comunicator = Comunicator()
                comunicator.send({
                    command:'dispachAction',
                    payload:JSON.stringify(action)
                })
            }
            return _tool
        }
        let _createListDOM = ()=>{
            let _ret = document.createElement('list')
            return _ret
        }
        let _createRowDOM = ({rowId,name,imageLink: imageLink,ipAddress,isBusy,isPaused,size,isSelected,history,updateTimeMS})=>{
            let _rowDOM = document.createElement('row')
            let _knownHistory = {status:'unknown',dellayMS:0}
            let _knownQuality = 0
            if(history.length>0){
                _knownHistory = history[history.length-1]
                _knownQuality = Math.round(100/history.length*history.reduce((ps,a)=>(a.status == 'online'? ps+1:ps+0),0))
            }
            let status = _knownHistory.status
            let dellayMS = _knownHistory.dellayMS
            let quality = _knownQuality
            _rowDOM.setAttribute('id',rowId)
            _rowDOM.setAttribute('busy',isBusy)
            _rowDOM.setAttribute('paused',isPaused)
            _rowDOM.setAttribute('size',size)
            _rowDOM.setAttribute('selected',isSelected)
            _rowDOM.setAttribute('status',status)
            
            let _getCol1Content = (imageLink,name,ipAddress)=>{
                let _col1Content = document.createElement('col1')
                //picture
                let _picDOMElement = document.createElement('pic')
                _picDOMElement.setAttribute('style',`background-image: url('assets/icons/${imageLink}')`)
                _col1Content.append(_picDOMElement)
                //name
                let _nameDOMElement = document.createElement('name')
                _nameDOMElement.innerHTML = name
                _col1Content.append(_nameDOMElement)
                //address
                let _addressDOMElement = document.createElement('address')
                _addressDOMElement.innerHTML = ipAddress
                _col1Content.append(_addressDOMElement)
                return _col1Content
            }
            let _getCol2Content = (status,dellayMS,updateTimeMS,quality)=>{
                let _col2Content = document.createElement('col2')
                //status
                let _statusDOMElement = document.createElement('status')
                _statusDOMElement.innerHTML = status
                //trio
                let _trioDOMElement = document.createElement('trio')
                    // dellay
                    let _dellayDOMElement = document.createElement('triodelay')
                    _dellayDOMElement.innerHTML = `${dellayMS}ms`
                    // update
                    let _updateDOMElement = document.createElement('trioupdate')
                    _updateDOMElement.innerHTML = `${updateTimeMS/1000}s`
                    // quality
                    let _qualityDOMElement = document.createElement('trioquality')
                    _qualityDOMElement.innerHTML = `${quality}%`
                    
                _trioDOMElement.append(_dellayDOMElement)
                _trioDOMElement.append(_updateDOMElement)
                _trioDOMElement.append(_qualityDOMElement)

                _col2Content.append(_statusDOMElement)
                _col2Content.append(_trioDOMElement)
                return _col2Content
            }

            _rowDOM.append(_getCol1Content(imageLink,name,ipAddress))
            if(size != '1Little'){
                _rowDOM.append(_getCol2Content(status,dellayMS,updateTimeMS,quality))
            }
            return _rowDOM
        }
        let _createToolsDOM = ()=>{
            let _toolsDOM = document.createElement('toolset')
            let toolMenu = _createTool({
                tagName:'toolmenu',
                icon:'menu',//TODO WHAT IF MENU IS OPENED
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
                icon:'pause',//MAKE IT DEPEND ON PAUSE STATE
                altText:'pause all',
                action:{
                    action:'rowPauseAllActive',
                    payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                }
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
            //show when at least one row in alarmed
            let toolUnalarmAll = _createTool({
                tagName:'toolunalarm',
                icon:'volume_off',
                altText:'unalarm all',
                action:{
                    action:'winUnalarmAllRows',
                    payload:JSON.stringify({winId:this.winId})
                }
            })
            _toolsDOM.append(toolMenu)
            _toolsDOM.append(toolNewRow)
            _toolsDOM.append(toolPauseAll)
            _toolsDOM.append(toolFullScreen)
            _toolsDOM.append(toolUnalarmAll)
            return _toolsDOM
        }


        if(initialRender){
            let domRoot = document.querySelector('.root')
            domRoot.innerHTML = ''
            //render modal
            let menuModal = _createMenuModal({hidden:!Boolean(_state.isMenuOpen)})
            domRoot.append(menuModal)
            let settingsModal = _createSettingsModal({hidden:!Boolean(_state.isSettingOpen)})
            domRoot.append(settingsModal)
            let imagePickerModal = _createImagePickerModal({hidden:!Boolean(_state.isImagePickerOpen)})
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
        }else{ 
            //render modal
            let _localDiff = difference
            difference.forEach(_dif=>{
                let _renderMainGroup = (diffUnit)=>{
                    switch(diffUnit.key){
                        case 'isMenuOpen':
                            document.querySelector('menumodal').setAttribute('hidden',String(diffUnit.value == false));    
                            break;
                        case 'isSettingOpen':
                            document.querySelector('settingsmodal').setAttribute('hidden',String(diffUnit.value == false));    
                            break;
                        case 'isImagePickerOpen':
                            document.querySelector('imgpickermodal').setAttribute('hidden',String(diffUnit.value == false));    
                            break;
                        case 'isFullscreen':
                            diffUnit.value?document.documentElement.requestFullscreen():document.exitFullscreen?document.fullscreenElement?document.exitFullscreen():0:0
                            break;
                        default:
                            console.error('Unknown main group diffUnit:',diffUnit) 
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
                        default:
                            console.error('Unknown list group diffUnit',diffUnit)
                    }
                    
                }
                let _renderRowGroup = (diffUnit)=>{
                    //if size changed we beed to check what do we need to render more, of hide!
                    //check all parts and add or remove them if needed
                    let targetRow = document.querySelector(`row[id="${diffUnit.id}"]`)
                    if(diffUnit.key == 'size'){
                        
                    }
                    if(diffUnit.key == 'history'){
                        //status, dellay, quality, graph
                        let _changeHtmlIfNedded = (selector,value)=>{
                            if(document.querySelector(selector).innerHTML != value){
                                document.querySelector(selector).innerHTML = value
                            }
                        }
                        let status = diffUnit.value.status
                        let dellayMS = diffUnit.value.dellayMS
                        let quality = diffUnit.value.quality
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 status`,status)
                        document.querySelector(`row[id="${diffUnit.id}"]`).setAttribute('status',status)
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 trio triodelay`,`${dellayMS}ms`)
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 trio trioquality`,`${quality}%`)
                        // document.querySelector(`row[id="${diffUnit.id}"]`)
                    }
                    switch(diffUnit.key){
                        case 'isBusy':
                            targetRow.setAttribute('busy',diffUnit.value)
                            break;
                        case 'isPaused':
                            targetRow.setAttribute('paused',diffUnit.value)
                            console.log(targetRow.getAttribute('paused'),diffUnit.value)
                            break;
                        case 'isSelected':
                            targetRow.setAttribute('selected',diffUnit.value)
                            break;
                        case 'image':
                            break;
                        case 'name':
                            break;
                        case 'ipAdress':
                            break;
                        case 'updateTime':
                            break;
                        case 'isEditing?':
                            break;
                            
                        
                        
                    }
                    //change row property
        // monitor>rows[]>JSON>rowId,position,size,adress,updateTime,name,image,history,pts,isBusy,isPaused,isMuted,isAlarmed,isEditing,fieldEditing,isSelected,isGraphSubscribed
                }
                if(_dif.selector == 'main'){
                    _renderMainGroup(_dif)
                }else if(_dif.selector == 'list'){
                    _renderListGroup(_dif)
                }else if(_dif.selector == 'row'){
                    _renderRowGroup(_dif)
                }
            })
            
        }
        
    }
    return this
}
const { ipcRenderer } = require('electron')
const Comunicator = ()=>{
    this.send = ({command,payload})=>{
        ipcRenderer.invoke('window',{command:command,payload:payload});
    }
    this.subscribe = (_callback = (_m:comunicatorMessage)=>{},_channel = 'window')=>{
        ipcRenderer.on(_channel, function (event, message:comunicatorMessage) {
            _callback(message)
        })
    }
    return this
}
const pageStart = ()=>{
    var page:any
    var comunicator = Comunicator()
    comunicator.subscribe((_message:comunicatorMessage)=>{
        if(_message.command == 'sendWinId'){
            page = Page(_message.payload)
        }
        if(_message.command == 'sendWinState'){
            if(page){
                let _resivedStateObj:any
                try{
                    _resivedStateObj = JSON.parse(_message.payload)
                }catch(e){
                    console.error('Error: unable to render')
                }
                page.render(_resivedStateObj)
                this.state = _resivedStateObj//saving new state
            }
        }
    })

}
pageStart()