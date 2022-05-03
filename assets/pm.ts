
interface renderItem {
    secector:string,
    property:string,
    value:string
}
interface comunicatorMessage {
    command:string,
    payload:string
}

var contextMenu
const Page = (_winId)=>{
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
                                    //what if they are the same length but diff 
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
                    
                })
                //switched place
                if(_newRows.length + _removedRows.length == 0){
                    let _checkOfSwaped = (_new,_old)=>{
                        let swapped = false
                        _new.forEach(([rid,pos],i)=>{
                            _new[i][1] != _old[i][1]?swapped=true:0
                        })
                        return swapped
                    }
                    let _getSwapPairs = (_new,_old)=>{
                        let _r = []
                        console.log('TODO swaping differencing')
                        // //check if uts not out of order
                        // //sort a
                        // _new = _new.sort((a,b)=>{return a[1]<b[1]?-1:1})
                        // let _bt = JSON.parse(JSON.stringify(_old))
                        // //loop a
                        // _new.forEach((_newEl,_i)=>{
                        //     //find element with the same id
                        //     let _oldElSameId = _bt.find(_el=>{return _el[0] == _newEl[0]})
                        //     //save its position
                        //     let _oldElSameIdPos = _bt.indexOf(_oldElSameId)
                        //     if(_oldElSameId[1] != _newEl[1]){//if they have different positions
                        //         let swap = (_arr,_ind1,_ind2) => {
                        //             let _arr2 = JSON.parse(JSON.stringify(_arr))
                        //             let _buffer = _arr2[_ind1]
                        //             _arr2[_ind1] = _arr2[_ind2]
                        //             _arr2[_ind2] = _buffer
                        //             return _arr2
                        //         }
                        //         console.log(_bt.toString())
                        //         _bt = swap(_bt,_i,_oldElSameIdPos)
                        //         console.log(_bt.toString())
                        //         _r.push({selector:'swap_row',id:_newEl[0],value:_oldElSameId[0]})
                        //     }
                        //if a[i] != bt[i]
                        // if(_new[_i][0] != bt[_i][0] && _new[_i][1] != bt[_i][1]){
                        //     //start place
                        //     let _startPlace = _i
                        //     let _finishElIndex = bt.indexOf(bt.find(el=>{ return el[0] == _new[_i][0]}))
                        //     if(typeof _finishElIndex != 'undefined'){
                        //         //finish place
                        //         //swap bt
                        //         let __t = bt[_i]
                        //         bt[_i] = _new[_i]
                        //         bt[_finishElIndex] = __t
                        //         _r.push({selector:'swap_row',id:_new[_i][0],value:__t[0]})
                        //     }
                        // }
                        // })
                        return _r
                    }
                    if(_newStateIds.length + _oldStateIds.length > 3){
                        let __t = _newStateIds[0][1]
                        _newStateIds[0][1] = _newStateIds[1][1]
                        _newStateIds[1][1] = __t
                    }
                    let isSwapped = _checkOfSwaped(_newStateIds,_oldStateIds)
                    if(isSwapped){
                        _rowChangesList = [..._rowChangesList,..._getSwapPairs(_newStateIds,_oldStateIds)]
                        
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
    this.render = (_state:any)=>{
        let initialRender = false
        let difference:any
        if(typeof this.state == 'undefined'){
            this.state = _state
            difference = _state
            initialRender = true
        }else{
            difference = this.optimize(_state,this.state)
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
        let _getImagePickerImageDom = ({_imageLink})=>{
            let _imagePickerContentDom = document.createElement('image') as HTMLElement
            _imagePickerContentDom.setAttribute('style',`background-image: url('assets/icons/${_imageLink}')`)
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
            return _imagePickerContentDom
        }
        let _createImagePickerModal = ({hidden,imageList})=>{
            let _imagePickerModal = document.createElement('imgpickermodal')
            _imagePickerModal.setAttribute('hidden',hidden)
            console.log(imageList)
            typeof imageList == 'string'?imageList = JSON.parse(imageList):0;
            console.log(imageList)
            imageList.forEach(_linkStr=>{
                _imagePickerModal.append(_getImagePickerImageDom({_imageLink:_linkStr}))
            })
            return _imagePickerModal
        }
        let _createTool = ({tagName,icon,altText,action,hidden=false})=>{
            let _tool = document.createElement(tagName)
            _tool.classList.add('tool')
            _tool.setAttribute('title',altText)
            _tool.setAttribute('hidden',hidden)
            _tool.classList.add('material-icons')
            _tool.innerHTML = icon
            _tool.onclick = (e)=>{
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
                if(name == 'updatetime'){
                    _name = 'updateTimeMS'
                    _value = Number(_value.replace(/[^0-9]/g,'')) * 1000;
                    console.log(_value,e.target.value)  
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
            _picDOMElement.setAttribute('style',`background-image: url('assets/icons/${imageLink}')`)
            _col1Content.append(_picDOMElement)
            //name
            let _nameDOMElement = document.createElement('input')
            _nameDOMElement.classList.add('name')
            _nameDOMElement.value = name
            // _nameDOMElement.setAttribute('disabled','')
            _addEditEvents({domElement:_nameDOMElement,name:'name',className:'name',rowId:rowId})
            _col1Content.append(_nameDOMElement)
            //address
            let _addressDOMElement = document.createElement('input')
            _addressDOMElement.classList.add('address')
            _addressDOMElement.value = ipAddress
            // _addressDOMElement.setAttribute('disabled','')
            _addEditEvents({domElement:_addressDOMElement,name:'address',className:'address',rowId:rowId})
            _col1Content.append(_addressDOMElement)
            return _col1Content
        }
        let _getCol2Content = (history,updateTimeMS,rowId)=>{
            let _knownHistory = {status:'unknown',dellayMS:0}
            let _knownQuality = 0
            if(history.length>0){
                _knownHistory = history[history.length-1]
                _knownQuality = Math.round(100/history.length*history.reduce((ps,a)=>(a.status == 'online'? ps+1:ps+0),0))
            }
            let status = _knownHistory.status
            let dellayMS = _knownHistory.dellayMS
            let quality = _knownQuality
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
                let _updateDOMElement = document.createElement('input')
                _updateDOMElement.value = `${updateTimeMS/1000}s`
                _updateDOMElement.classList.add('trioupdate')
                _addEditEvents({domElement:_updateDOMElement,name:'updatetime',className:'trioupdate',rowId:rowId})
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
        const _getPath = ({dataArray,width,height})=>{
            let _ret = '';
            let _canvasWidth = width;
            let _canvasHeight = height;
            let _heightMargin = 10;
            let _widthMargin = _heightMargin;
            let dataLenghtLimit = 360000;//TODO get from config
            let timeOfBegining = new Date().getTime() - dataLenghtLimit;//cut to last N min
            let dataTrimmed = dataArray.filter(dot=>{return dot.timestamp >= timeOfBegining})
            let widthKoof = (100-(_widthMargin*2));
            if(dataTrimmed.length>1){
              if(dataTrimmed[dataTrimmed.length-1].time - dataTrimmed[0].timestamp > dataLenghtLimit){
                 widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataTrimmed[dataTrimmed.length-1].timestamp - dataTrimmed[0].timestamp)
              }else{
                widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataLenghtLimit)
              }
            }
            let maxDellay = Math.max(...dataTrimmed.map(dot=>{return dot.dellayMS}));
            let _map = (val,start1,stop1,start2,stop2)=>{
              let __a = (val-start1)/(stop1-start1)*(stop2-start2)+start2;
              return start2 < stop2 ? Math.round(Math.max(Math.min(__a, stop2), start2)*10)/10 : Math.round(Math.max(Math.min(__a, start2), stop2)*10)/10;
            }
            if(dataTrimmed.length>0){
              _ret += `M${_widthMargin} ${_map(dataTrimmed[0].dellayMS,maxDellay,0,_heightMargin,_canvasHeight-_heightMargin)}`
              let _firstTime = dataTrimmed[0].timestamp;
              dataTrimmed.forEach((dot,i)=>{
                if(i>0){
                  let _x = Math.round((_widthMargin+(dot.timestamp - _firstTime)*widthKoof)*100)/100;
                  let _y = _map(dot.dellayMS,maxDellay,0,_heightMargin,_canvasHeight-_heightMargin);
                  if(dot.status == 'offline' ||dot.status == 'timeout'||dot.status == 'error'){
                    _ret += `M${_x} ${_y}`;
                  }else{
                    _ret += `L${_x} ${_y}`;
                  }
                }
              })
            }
            return _ret;
        }
        let _getCol3Content = (history,rowId)=>{
            let _col3Content = document.createElement('col3')
            //somehow it is the only way to make svd work
            _col3Content.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 200 100"><path d="${_getPath({dataArray:history,width:200,height:100})}"/></svg>`
            return _col3Content
        }
        let _getCol4Content = (history,rowId)=>{
            let _col4Content = document.createElement('col4')
            _col4Content.innerHTML = 'stats will go here'
            return _col4Content
        }
        let _createRowDOM = ({rowId,name,imageLink,ipAddress,isBusy,isPaused,size,isSelected,history,updateTimeMS})=>{
            let _rowDOM = document.createElement('row')
            let _knownHistory = {status:'unknown',dellayMS:0}
            if(history.length>0){
                _knownHistory = history[history.length-1]
            }
            let status = _knownHistory.status
            _rowDOM.setAttribute('id',rowId)
            _rowDOM.setAttribute('busy',isBusy)
            _rowDOM.setAttribute('paused',isPaused)
            _rowDOM.setAttribute('size',size)
            _rowDOM.setAttribute('selected',isSelected)
            _rowDOM.setAttribute('status',status)
            
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
                icon:'pause',
                altText:'pause all',
                action:{
                    action:'rowPauseAllActive',
                    payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                },
                hidden:_state.monitor.rows.filter(_r=>{return _r.indexOf(`"isPaused":false`)>-1}).length>0?false:true
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
                icon:'notifications_off',
                altText:'unalarm all',
                action:{
                    action:'winUnalarmAllRows',
                    payload:JSON.stringify({monitorId:Number(_state.subscriptionKey)})
                },
                hidden:_state.monitor.rows.filter(_r=>{return _r.indexOf(`"isAlarmed":true`)>-1}).length>0?false:true
            })
            _toolsDOM.append(toolMenu)
            _toolsDOM.append(toolNewRow)
            _toolsDOM.append(toolPauseAll)
            _toolsDOM.append(toolFullScreen)
            _toolsDOM.append(toolUnalarmAll)
            return _toolsDOM
        }


        if(initialRender){
            //reder title
            document.querySelector('title').innerHTML = _state.title
            let domRoot = document.querySelector('.root') as HTMLElement
            domRoot.innerHTML = ''
            //render modal
            let menuModal = _createMenuModal({hidden:!Boolean(_state.isMenuOpen)})
            domRoot.append(menuModal)
            let settingsModal = _createSettingsModal({hidden:!Boolean(_state.isSettingOpen)})
            domRoot.append(settingsModal)
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
                if(_e.path.filter(_el=>{return _el.tagName == 'ROW'}).length == 0){
                    contextMenu.hideContextMenu()
                    let _selectedRows = this.state.monitor.rows.filter(_r=>_r.indexOf(`"isSelected":true`)>-1).map(_r=>JSON.parse(_r))
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
                }
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
                if(document.querySelector('settingsmodal[hidden="false"]') != null){
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
        }else{ 
            let _changeHtmlIfNedded = (selector,value)=>{
                if(document.querySelector(selector).innerHTML != value){
                    document.querySelector(selector).innerHTML = value
                }
            }
            let _chageAttrIfNeeded = ({selector,key,value})=>{
                if(document.querySelector(selector) == null){
                    console.warn('selector to chage attr not found')
                    return 0;
                }
                if(document.querySelector(selector).getAttribute(key) != value){
                    document.querySelector(selector).setAttribute(key,value)
                }
            }
            let _checkToolButtons = (_focus = 'all')=>{
                //hiding is paused
                if(['all','pause'].includes(_focus)){
                    let _unpausedRows = _state.monitor.rows.filter(_r=>{return _r.indexOf(`"isPaused":false`)>-1})
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
                    let _alarmedRows = _state.monitor.rows.filter(_r=>{return _r.indexOf(`"isAlarmed":true`)>-1})
                    if(typeof _alarmedRows == "undefined"){
                        return 0;
                    }
                    if(_alarmedRows.length>0){
                        _chageAttrIfNeeded({selector:'toolunalarm',key:'hidden',value:'false'})
                    }else{
                        _chageAttrIfNeeded({selector:'toolunalarm',key:'hidden',value:'true'})
                    }
                }
                //TODO change manu icon if menu is opened here
            }
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
                        if(!diffUnit.value){
                            break;
                        }
                        let _targetRowObj = _state.monitor.rows.find(_r=>_r.indexOf(`"fieldEditing":"image"`)>-1)
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
                    default:
                        console.error('Unknown list group diffUnit',diffUnit)
                }
                _checkToolButtons()
            }
            let _renderRowGroup = (diffUnit)=>{
                //if size changed we beed to check what do we need to render more, of hide!
                //check all parts and add or remove them if needed
                let targetRowDom = document.querySelector(`row[id="${diffUnit.id}"]`)
                let targetRowObj = JSON.parse(_state.monitor.rows.find(_r=>{return _r.indexOf(`"rowId":${diffUnit.id}`) >-1}))
                let _updateInputElement = ({_selector,_value})=>{
                    let _newInputValue = _value
                    let _inputTarget = document.querySelector(`row[id="${diffUnit.id}"] ${_selector}`) as HTMLInputElement
                    console.log(_inputTarget,document.querySelector(`row[id="${diffUnit.id}"] ${_selector}`))
                    if(_inputTarget == null){
                        console.warn(`Can't find row[id="${diffUnit.id}"] ${_selector}`)
                        return 0;
                    }
                    if(targetRowObj.fieldEditing !== 'updateTime' && _selector == '.trioupdate'){
                        _newInputValue =(_newInputValue/1000)+'s';
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
                        document.querySelector(`row[id="${_diffUnit.id}"] path`).setAttribute('d',_getPath({dataArray:targetRowObj.history,width:_svgWidth,height:_svgHeight}))
                    }
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
                    //status, dellay, quality, graph
                    let status = diffUnit.value.status
                    document.querySelector(`row[id="${diffUnit.id}"]`).setAttribute('status',status)
                    if(targetRowObj.size != '1Little'){
                        let dellayMS = diffUnit.value.dellayMS
                        let quality = diffUnit.value.quality
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 status`,status)
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 trio triodelay`,`${dellayMS}ms`)
                        _changeHtmlIfNedded(`row[id="${diffUnit.id}"] col2 trio trioquality`,`${quality}%`)
                    }
                    if(['4Middle','6Big'].includes(targetRowObj.size)){
                        _checkGraph(diffUnit)
                        
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
                        _pictureTarget.setAttribute('style', `background-image: url('assets/icons/${diffUnit.value}')`)
                        break;
                    case 'name':
                        _updateInputElement({_selector:'.name',_value:diffUnit.value})
                        // document.querySelector(`row[id="${diffUnit.id}"] col1 .name`).setAttribute('value',diffUnit.value)
                        break;
                    case 'ipAdress':
                        _updateInputElement({_selector:'.address',_value:diffUnit.value})
                        break;
                    case 'updateTime':
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
                if(_state.monitor.rows.filter(_r=>_r.indexOf(`"isAlarmed":true`)>-1).length>0){
                    this.siren.start()
                }else{
                    this.siren.stop()
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
const Siren = ()=>{
    this.dom = document.querySelector('audio')
    this.playState = false
    this.start = ()=>{
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
                    let _selectedRows = this.state.monitor.rows.filter(_r=>_r.indexOf(`"isSelected":true`)>-1).map(_r=>JSON.parse(_r))
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
                ['1Little','2Small','4Middle','6Big'].forEach(_sz=>{
                    if(_targetRowSize != _sz){
                        options.push({
                            name:'',//`${_sz.substring(0,1)}x`,
                            icon:`filter_${_sz.substring(0,1)}`,
                            width:'33%',
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
                let _numberOfSelected = document.querySelectorAll('row[selected="true"]').length
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
                    _contextOptionDom.innerHTML = `${_opt.name}`
                    _contextOptionDom.style.setProperty('--icon-name',`'${_opt.icon}'`)
                    _contextOptionDom.style.setProperty('--option-width',_opt.width)
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
                contextDom.style.setProperty('--c-x', this.x)
                break;
            case 'y': 
                contextDom.style.setProperty('--c-y', this.y)
            case 'targetRow':
                _renderOptions()
            break;
        }
    }
    this.show = (_e)=>{
        if(this.isShown){
            this.hideContextMenu()
        }
        let targetRow = _e.path.find(_el=>{return _el.tagName == 'ROW'})
        let targetX = _e.clientX+window.scrollX
        let targetY = _e.clientY+window.scrollY
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
        if(_message.command == 'sendWinId'){
            page = Page(_message.payload)
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