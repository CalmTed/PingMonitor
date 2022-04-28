//create window process
//init vars
//get data from the core
//render data
//create event listeners
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var Page = function (_winId) {
    _this.winId = _winId;
    _this.state;
    _this.optimize = function (_stateNew, _stateOld) {
        var _renObj;
        var _stateDiff = function (_stateNew, _stateOld) {
            var _diffList = [];
            // let _getStrDiff = (_str1,_str2)=>{
            //     return _str1!=_str2?_str1:undefined
            // }
            // let _getArrDiff = (_arr1,_arr2)=>{
            //     let _retArr = []
            //     //we supose to have the same state scheme
            //     _arr1.forEach((_elm,_i)=>{
            //         let _getDiff:any;
            //         if(typeof _elm != 'object'){
            //             _getDiff = _getStrDiff(_arr1[_i],_arr2[_i])
            //         }else if(Array.isArray(_elm)){
            //             _getDiff = _getArrDiff(_arr1[_i],_arr2[_i])
            //         }else{
            //             _getDiff = _getObjDiff(_arr1[_i],_arr2[_i])
            //         }
            //         if(_getDiff){
            //             _retArr.push(_getDiff)
            //         }
            //     })
            //     return _retArr.length>0?_retArr:undefined
            // }
            // let _getObjDiff = (_obj1,_obj2)=>{
            //     let _ret = {}
            //     //we supose to have the same state scheme
            //     Object.entries(_obj1).forEach(([_key,_value])=>{
            //         let _getDiff:any
            //         if(typeof _value != 'object'){
            //             _getDiff = _getStrDiff(_obj1[_key],_obj2[_key])
            //         }else if(Array.isArray(_value)){
            //             _getDiff = _getArrDiff(_obj1[_key],_obj2[_key])
            //         }else{
            //             _getDiff = _getObjDiff(_obj1[_key],_obj2[_key])
            //         }
            //         if(_getDiff ){
            //             _ret[_key] = _getDiff
            //         }
            //     })
            //     return Object.keys(_ret).length>0?_ret:undefined
            // }
            // _diffObj = _getObjDiff(_stateNew,_stateOld)
            var _getMainChanges = function (_stateNew, _stateOld) {
                var _mainChangesList = [];
                Object.keys(_stateNew).forEach(function (_key) {
                    if (!['monitor', 'langWords'].includes(_key))
                        if (_stateNew[_key] != _stateOld[_key]) {
                            _mainChangesList.push({ selector: 'main', key: _key, value: _stateNew[_key] });
                        }
                });
                return _mainChangesList; //[{selector:'state',key:'isMenuOpened',value:false}]
            };
            var _getRowChanges = function (_stateNew, _stateOld) {
                var _rowChangesList = [];
                var _newStateIds = _stateNew.monitor.rows.map(function (r) { var rr = JSON.parse(r); return [rr.rowId, rr.position]; });
                var _oldStateIds = _stateOld.monitor.rows.map(function (r) { var rr = JSON.parse(r); return [rr.rowId, rr.position]; });
                // console.log(_newStateIds,_oldStateIds)
                var _newRows = _newStateIds.filter(function (_nr) { return _oldStateIds.filter(function (_or) { return _or[0] == _nr[0]; }).length == 0; });
                var _removedRows = _oldStateIds.filter(function (_or) { return _newStateIds.filter(function (_nr) { return _nr[0] == _or[0]; }).length == 0; });
                // console.log(_newRows,_removedRows)
                _newRows.forEach(function (_nr) {
                    _rowChangesList.push({ selector: 'list', key: 'new_row', value: _stateNew.monitor.rows.find(function (_mr) { return _mr.indexOf("\"rowId\":".concat(_nr[0])) > -1; }) });
                });
                _removedRows.forEach(function (_rr) {
                    _rowChangesList.push({ selector: 'list', key: 'remove_row', value: _stateOld.monitor.rows.find(function (_mr) { return _mr.indexOf("\"rowId\":".concat(_rr[0])) > -1; }) });
                });
                //TODO find row position change(swaping places)
                _stateNew.monitor.rows.forEach(function (_row, _i) {
                    var _rowObjNew = JSON.parse(_stateNew.monitor.rows[_i]);
                    if (typeof _stateOld.monitor.rows.find(function (_mr) { return _mr.indexOf("\"rowId\":".concat(_rowObjNew.rowId)) > -1; }) != 'undefined') {
                        var _rowObjOld_1 = JSON.parse(_stateOld.monitor.rows[_i]);
                        Object.keys(_rowObjNew).forEach(function (_key) {
                            if (typeof _rowObjNew[_key] != 'object') {
                                if (_rowObjNew[_key] != _rowObjOld_1[_key]) {
                                    _rowChangesList.push({ selector: 'row', id: _rowObjNew.rowId, key: _key, value: _rowObjNew[_key] });
                                }
                            }
                            else {
                                if (_key == 'history') {
                                    //what if they are the same length but diff still
                                    console.log(_key, _rowObjNew[_key].length, _rowObjOld_1[_key].length);
                                    if (_rowObjNew[_key].length > 0 && _rowObjOld_1[_key].length > 0) {
                                        var _lastElementOfNewHist = _rowObjNew[_key][_rowObjNew[_key].length - 1];
                                        var _lastElementOfOldHist = _rowObjOld_1[_key][_rowObjOld_1[_key].length - 1];
                                        if (_lastElementOfNewHist.timestamp != _lastElementOfOldHist.timestamp) {
                                            _lastElementOfNewHist.quality = Math.round(100 / _rowObjNew[_key].length * _rowObjNew[_key].reduce(function (ps, a) { return (a.status == 'online' ? ps + 1 : ps + 0); }, 0));
                                            _rowChangesList.push({ selector: 'row', id: _rowObjNew.rowId, key: _key, value: _lastElementOfNewHist });
                                        }
                                    }
                                }
                            }
                        });
                    }
                    //new rows
                    //removed rows
                    //switched place
                });
                return _rowChangesList;
            };
            _diffList = __spreadArray(__spreadArray([], _getMainChanges(_stateNew, _stateOld), true), _getRowChanges(_stateNew, _stateOld), true);
            return _diffList;
        };
        _renObj = _stateDiff(_stateNew, _stateOld);
        return _renObj;
    };
    _this.render = function (_state) {
        var initialRender = false;
        var difference;
        if (typeof _this.state == 'undefined') {
            _this.state = _state;
            difference = _state;
            initialRender = true;
        }
        else {
            difference = _this.optimize(_state, _this.state);
            console.log("State", _state);
            console.log("Difference", difference);
        }
        var _createMenuModal = function (_a) {
            var hidden = _a.hidden;
            var _menuModal = document.createElement('menumodal');
            _menuModal.setAttribute('hidden', hidden);
            return _menuModal;
        };
        var _createSettingsModal = function (_a) {
            var hidden = _a.hidden;
            var _settingsModal = document.createElement('settingsmodal');
            _settingsModal.setAttribute('hidden', hidden);
            return _settingsModal;
        };
        var _createImagePickerModal = function (_a) {
            var hidden = _a.hidden;
            var _imagePickerModal = document.createElement('imgpickermodal');
            _imagePickerModal.setAttribute('hidden', hidden);
            return _imagePickerModal;
        };
        var _createTool = function (_a) {
            var tagName = _a.tagName, icon = _a.icon, altText = _a.altText, action = _a.action;
            var _tool = document.createElement(tagName);
            _tool.classList.add('tool');
            _tool.setAttribute('alt', altText);
            _tool.classList.add('material-icons');
            _tool.innerHTML = icon;
            _tool.onclick = function () {
                var comunicator = Comunicator();
                comunicator.send({
                    command: 'dispachAction',
                    payload: JSON.stringify(action)
                });
            };
            return _tool;
        };
        var _createListDOM = function () {
            var _ret = document.createElement('list');
            return _ret;
        };
        var _createRowDOM = function (_a) {
            var rowId = _a.rowId, name = _a.name, imageLink = _a.imageLink, ipAddress = _a.ipAddress, isBusy = _a.isBusy, isPaused = _a.isPaused, size = _a.size, isSelected = _a.isSelected, history = _a.history, updateTimeMS = _a.updateTimeMS;
            var _rowDOM = document.createElement('row');
            var _knownHistory = { status: 'unknown', dellayMS: 0 };
            var _knownQuality = 0;
            if (history.length > 0) {
                _knownHistory = history[history.length - 1];
                _knownQuality = Math.round(100 / history.length * history.reduce(function (ps, a) { return (a.status == 'online' ? ps + 1 : ps + 0); }, 0));
            }
            var status = _knownHistory.status;
            var dellayMS = _knownHistory.dellayMS;
            var quality = _knownQuality;
            _rowDOM.setAttribute('id', rowId);
            _rowDOM.setAttribute('busy', isBusy);
            _rowDOM.setAttribute('paused', isPaused);
            _rowDOM.setAttribute('size', size);
            _rowDOM.setAttribute('selected', isSelected);
            _rowDOM.setAttribute('status', status);
            var _getCol1Content = function (imageLink, name, ipAddress) {
                var _col1Content = document.createElement('col1');
                //picture
                var _picDOMElement = document.createElement('pic');
                _picDOMElement.setAttribute('style', "background-image: url('assets/icons/".concat(imageLink, "')"));
                _col1Content.append(_picDOMElement);
                //name
                var _nameDOMElement = document.createElement('name');
                _nameDOMElement.innerHTML = name;
                _col1Content.append(_nameDOMElement);
                //address
                var _addressDOMElement = document.createElement('address');
                _addressDOMElement.innerHTML = ipAddress;
                _col1Content.append(_addressDOMElement);
                return _col1Content;
            };
            var _getCol2Content = function (status, dellayMS, updateTimeMS, quality) {
                var _col2Content = document.createElement('col2');
                //status
                var _statusDOMElement = document.createElement('status');
                _statusDOMElement.innerHTML = status;
                //trio
                var _trioDOMElement = document.createElement('trio');
                // dellay
                var _dellayDOMElement = document.createElement('triodelay');
                _dellayDOMElement.innerHTML = "".concat(dellayMS, "ms");
                // update
                var _updateDOMElement = document.createElement('trioupdate');
                _updateDOMElement.innerHTML = "".concat(updateTimeMS / 1000, "s");
                // quality
                var _qualityDOMElement = document.createElement('trioquality');
                _qualityDOMElement.innerHTML = "".concat(quality, "%");
                _trioDOMElement.append(_dellayDOMElement);
                _trioDOMElement.append(_updateDOMElement);
                _trioDOMElement.append(_qualityDOMElement);
                _col2Content.append(_statusDOMElement);
                _col2Content.append(_trioDOMElement);
                return _col2Content;
            };
            _rowDOM.append(_getCol1Content(imageLink, name, ipAddress));
            if (size != '1Little') {
                _rowDOM.append(_getCol2Content(status, dellayMS, updateTimeMS, quality));
            }
            return _rowDOM;
        };
        var _createToolsDOM = function () {
            var _toolsDOM = document.createElement('toolset');
            var toolMenu = _createTool({
                tagName: 'toolmenu',
                icon: 'menu',
                altText: '',
                action: {
                    action: 'winToggleProp',
                    payload: JSON.stringify({ winId: _this.winId, key: 'isMenuOpen' })
                }
            });
            var toolNewRow = _createTool({
                tagName: 'toolnewrow',
                icon: 'add',
                altText: 'add row',
                action: {
                    action: 'addRow',
                    payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
                }
            });
            var toolPauseAll = _createTool({
                tagName: 'toolpauseall',
                icon: 'pause',
                altText: 'pause all',
                action: {
                    action: 'rowPauseAllActive',
                    payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
                }
            });
            var toolFullScreen = _createTool({
                tagName: 'toolfullscreen',
                icon: 'fullscreen',
                altText: 'toggle full screen',
                action: {
                    action: 'winToggleProp',
                    payload: JSON.stringify({ winId: _this.winId, key: 'isFullscreen' })
                }
            });
            //show when at least one row in alarmed
            var toolUnalarmAll = _createTool({
                tagName: 'toolunalarm',
                icon: 'volume_off',
                altText: 'unalarm all',
                action: {
                    action: 'winUnalarmAllRows',
                    payload: JSON.stringify({ winId: _this.winId })
                }
            });
            _toolsDOM.append(toolMenu);
            _toolsDOM.append(toolNewRow);
            _toolsDOM.append(toolPauseAll);
            _toolsDOM.append(toolFullScreen);
            _toolsDOM.append(toolUnalarmAll);
            return _toolsDOM;
        };
        if (initialRender) {
            var domRoot = document.querySelector('.root');
            domRoot.innerHTML = '';
            //render modal
            var menuModal = _createMenuModal({ hidden: !Boolean(_state.isMenuOpen) });
            domRoot.append(menuModal);
            var settingsModal = _createSettingsModal({ hidden: !Boolean(_state.isSettingOpen) });
            domRoot.append(settingsModal);
            var imagePickerModal = _createImagePickerModal({ hidden: !Boolean(_state.isImagePickerOpen) });
            domRoot.append(imagePickerModal);
            var tools = _createToolsDOM();
            domRoot.append(tools);
            var domList_1 = _createListDOM();
            domRoot.append(domList_1);
            _state.monitor.rows.length > 0 ? _state.monitor.rows.forEach(function (rowStr) {
                var rowObj = JSON.parse(rowStr);
                var rowElement = _createRowDOM(rowObj);
                domList_1.append(rowElement);
            }) : 0;
        }
        else {
            //render modal
            var _localDiff = difference;
            difference.forEach(function (_dif) {
                var _renderMainGroup = function (diffUnit) {
                    switch (diffUnit.key) {
                        case 'isMenuOpen':
                            document.querySelector('menumodal').setAttribute('hidden', String(diffUnit.value == false));
                            break;
                        case 'isSettingOpen':
                            document.querySelector('settingsmodal').setAttribute('hidden', String(diffUnit.value == false));
                            break;
                        case 'isImagePickerOpen':
                            document.querySelector('imgpickermodal').setAttribute('hidden', String(diffUnit.value == false));
                            break;
                        case 'isFullscreen':
                            diffUnit.value ? document.documentElement.requestFullscreen() : document.exitFullscreen ? document.fullscreenElement ? document.exitFullscreen() : 0 : 0;
                            break;
                        default:
                            console.error('Unknown main group diffUnit:', diffUnit);
                    }
                };
                var _renderListGroup = function (diffUnit) {
                    switch (diffUnit.key) {
                        //add row
                        case 'new_row':
                            var list = document.querySelector('list');
                            var _newRowObj = JSON.parse(diffUnit.value);
                            list.append(_createRowDOM(_newRowObj));
                            break;
                        //remove row
                        case 'remove_row':
                            var rowObj = JSON.parse(diffUnit.value);
                            var neededDom = document.querySelector("row[id=\"".concat(rowObj.rowId, "\"]"));
                            neededDom.parentNode.removeChild(neededDom);
                            break;
                        default:
                            console.error('Unknown list group diffUnit', diffUnit);
                    }
                };
                var _renderRowGroup = function (diffUnit) {
                    //if size changed we beed to check what do we need to render more, of hide!
                    //check all parts and add or remove them if needed
                    var targetRow = document.querySelector("row[id=\"".concat(diffUnit.id, "\"]"));
                    if (diffUnit.key == 'size') {
                    }
                    if (diffUnit.key == 'history') {
                        //status, dellay, quality, graph
                        var _changeHtmlIfNedded = function (selector, value) {
                            if (document.querySelector(selector).innerHTML != value) {
                                document.querySelector(selector).innerHTML = value;
                            }
                        };
                        var status_1 = diffUnit.value.status;
                        var dellayMS = diffUnit.value.dellayMS;
                        var quality = diffUnit.value.quality;
                        _changeHtmlIfNedded("row[id=\"".concat(diffUnit.id, "\"] col2 status"), status_1);
                        document.querySelector("row[id=\"".concat(diffUnit.id, "\"]")).setAttribute('status', status_1);
                        _changeHtmlIfNedded("row[id=\"".concat(diffUnit.id, "\"] col2 trio triodelay"), "".concat(dellayMS, "ms"));
                        _changeHtmlIfNedded("row[id=\"".concat(diffUnit.id, "\"] col2 trio trioquality"), "".concat(quality, "%"));
                        // document.querySelector(`row[id="${diffUnit.id}"]`)
                    }
                    switch (diffUnit.key) {
                        case 'isBusy':
                            targetRow.setAttribute('busy', diffUnit.value);
                            break;
                        case 'isPaused':
                            targetRow.setAttribute('paused', diffUnit.value);
                            console.log(targetRow.getAttribute('paused'), diffUnit.value);
                            break;
                        case 'isSelected':
                            targetRow.setAttribute('selected', diffUnit.value);
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
                };
                if (_dif.selector == 'main') {
                    _renderMainGroup(_dif);
                }
                else if (_dif.selector == 'list') {
                    _renderListGroup(_dif);
                }
                else if (_dif.selector == 'row') {
                    _renderRowGroup(_dif);
                }
            });
        }
    };
    return _this;
};
var ipcRenderer = require('electron').ipcRenderer;
var Comunicator = function () {
    _this.send = function (_a) {
        var command = _a.command, payload = _a.payload;
        ipcRenderer.invoke('window', { command: command, payload: payload });
    };
    _this.subscribe = function (_callback, _channel) {
        if (_callback === void 0) { _callback = function (_m) { }; }
        if (_channel === void 0) { _channel = 'window'; }
        ipcRenderer.on(_channel, function (event, message) {
            _callback(message);
        });
    };
    return _this;
};
var pageStart = function () {
    var page;
    var comunicator = Comunicator();
    comunicator.subscribe(function (_message) {
        if (_message.command == 'sendWinId') {
            page = Page(_message.payload);
        }
        if (_message.command == 'sendWinState') {
            if (page) {
                var _resivedStateObj = void 0;
                try {
                    _resivedStateObj = JSON.parse(_message.payload);
                }
                catch (e) {
                    console.error('Error: unable to render');
                }
                page.render(_resivedStateObj);
                _this.state = _resivedStateObj; //saving new state
            }
        }
    });
};
pageStart();
