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
var Siren = function () {
    _this.dom = document.querySelector('audio');
    _this.playState = false;
    _this.start = function () {
        if (!_this.playState) {
            _this.playState = true;
            _this.dom.play();
            _this.dom.volume = 0;
            _this.volumeUp();
        }
    };
    _this.stop = function () {
        if (_this.playState) {
            _this.playState = false;
            _this.dom.pause();
        }
    };
    _this.volumeUp = function () {
        if (_this.playState) {
            if (_this.dom.volume + 0.1 < 1) {
                _this.dom.volume += 0.1;
                console.log(_this.dom.volume);
                setTimeout(function () {
                    _this.volumeUp();
                }, 1000);
            }
        }
    };
    return _this;
};
var Page = function (_winId) {
    _this.winId = _winId;
    _this.state;
    _this.siren = Siren();
    _this.optimize = function (_stateNew, _stateOld) {
        var _renObj;
        var _stateDiff = function (_stateNew, _stateOld) {
            var _diffList = [];
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
                                    //what if they are the same length but diff 
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
                });
                //switched place
                if (_newRows.length + _removedRows.length == 0) {
                    var _checkOfSwaped = function (_new, _old) {
                        var swapped = false;
                        _new.forEach(function (_a, i) {
                            var rid = _a[0], pos = _a[1];
                            _new[i][1] != _old[i][1] ? swapped = true : 0;
                        });
                        return swapped;
                    };
                    var _getSwapPairs = function (_new, _old) {
                        var _r = [];
                        console.log('TODO swaping differencing');
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
                        return _r;
                    };
                    if (_newStateIds.length + _oldStateIds.length > 3) {
                        var __t = _newStateIds[0][1];
                        _newStateIds[0][1] = _newStateIds[1][1];
                        _newStateIds[1][1] = __t;
                    }
                    var isSwapped = _checkOfSwaped(_newStateIds, _oldStateIds);
                    if (isSwapped) {
                        _rowChangesList = __spreadArray(__spreadArray([], _rowChangesList, true), _getSwapPairs(_newStateIds, _oldStateIds), true);
                    }
                }
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
            _tool.onclick = function (e) {
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
        var _addEditEvents = function (_a) {
            var domElement = _a.domElement, name = _a.name, className = _a.className, rowId = _a.rowId;
            domElement.onclick = function (e) {
                var eventElement = e.target;
                if (eventElement.classList.contains(className)) {
                    eventElement.focus();
                    eventElement.select();
                    var comunicator = Comunicator();
                    comunicator.send({
                        command: 'dispachAction',
                        payload: JSON.stringify({
                            action: 'rowEditProperySet',
                            payload: JSON.stringify({ rowId: rowId, key: name })
                        })
                    });
                }
            };
            domElement.onkeyup = function (e) {
                var eventElement = e.target;
                var _name = name;
                var _value = e.target.value;
                if (name == 'updatetime') {
                    _name = 'updateTimeMS';
                    _value = Number(_value.replace(/[^0-9]/g, '')) * 1000;
                    console.log(_value, e.target.value);
                }
                if (name == 'address') {
                    _name = 'ipAddress';
                }
                if (eventElement.validity) {
                    var comunicator = Comunicator();
                    comunicator.send({
                        command: 'dispachAction',
                        payload: JSON.stringify({
                            action: 'rowSetProp',
                            payload: JSON.stringify({ rowId: rowId, key: _name, value: _value })
                        })
                    });
                }
            };
            domElement.onblur = function (e) {
                // let eventElement = e.target as HTMLElement
                var comunicator = Comunicator();
                comunicator.send({
                    command: 'dispachAction',
                    payload: JSON.stringify({
                        action: 'rowEditProperyRemove',
                        payload: JSON.stringify({ rowId: rowId, key: name })
                    })
                });
            };
        };
        var _getCol1Content = function (imageLink, name, ipAddress, rowId) {
            var _col1Content = document.createElement('col1');
            //picture
            var _picDOMElement = document.createElement('pic');
            _picDOMElement.setAttribute('style', "background-image: url('assets/icons/".concat(imageLink, "')"));
            _col1Content.append(_picDOMElement);
            //name
            var _nameDOMElement = document.createElement('input');
            _nameDOMElement.classList.add('name');
            _nameDOMElement.value = name;
            // _nameDOMElement.setAttribute('disabled','')
            _addEditEvents({ domElement: _nameDOMElement, name: 'name', className: 'name', rowId: rowId });
            _col1Content.append(_nameDOMElement);
            //address
            var _addressDOMElement = document.createElement('input');
            _addressDOMElement.classList.add('address');
            _addressDOMElement.value = ipAddress;
            // _addressDOMElement.setAttribute('disabled','')
            _addEditEvents({ domElement: _addressDOMElement, name: 'address', className: 'address', rowId: rowId });
            _col1Content.append(_addressDOMElement);
            return _col1Content;
        };
        var _getCol2Content = function (history, updateTimeMS, rowId) {
            var _knownHistory = { status: 'unknown', dellayMS: 0 };
            var _knownQuality = 0;
            if (history.length > 0) {
                _knownHistory = history[history.length - 1];
                _knownQuality = Math.round(100 / history.length * history.reduce(function (ps, a) { return (a.status == 'online' ? ps + 1 : ps + 0); }, 0));
            }
            var status = _knownHistory.status;
            var dellayMS = _knownHistory.dellayMS;
            var quality = _knownQuality;
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
            var _updateDOMElement = document.createElement('input');
            _updateDOMElement.value = "".concat(updateTimeMS / 1000, "s");
            _updateDOMElement.classList.add('trioupdate');
            _addEditEvents({ domElement: _updateDOMElement, name: 'updatetime', className: 'trioupdate', rowId: rowId });
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
        var _getPath = function (_a) {
            var dataArray = _a.dataArray;
            var _ret = '';
            var _canvasWidth = 200;
            var _canvasHeight = 100;
            var _heightMargin = 5;
            var _widthMargin = _heightMargin;
            var dataLenghtLimit = 60000; //TODO get from config
            var timeOfBegining = new Date().getTime() - dataLenghtLimit; //cut to last N min
            var dataTrimmed = dataArray.filter(function (dot) { return dot.timestamp >= timeOfBegining; });
            var widthKoof = (100 - (_widthMargin * 2));
            if (dataTrimmed.length > 1) {
                if (dataTrimmed[dataTrimmed.length - 1].time - dataTrimmed[0].timestamp > dataLenghtLimit) {
                    widthKoof = (_canvasWidth - (_widthMargin * 2)) / (dataTrimmed[dataTrimmed.length - 1].timestamp - dataTrimmed[0].timestamp);
                }
                else {
                    widthKoof = (_canvasWidth - (_widthMargin * 2)) / (dataLenghtLimit);
                }
            }
            var maxDellay = Math.max.apply(Math, dataTrimmed.map(function (dot) { return dot.dellayMS; }));
            var _map = function (val, start1, stop1, start2, stop2) {
                var __a = (val - start1) / (stop1 - start1) * (stop2 - start2) + start2;
                return start2 < stop2 ? Math.round(Math.max(Math.min(__a, stop2), start2) * 10) / 10 : Math.round(Math.max(Math.min(__a, start2), stop2) * 10) / 10;
            };
            if (dataTrimmed.length > 0) {
                _ret += "M".concat(_widthMargin, " ").concat(_map(dataTrimmed[0].dellayMS, maxDellay, 0, _heightMargin, _canvasHeight - _heightMargin));
                var _firstTime_1 = dataTrimmed[0].timestamp;
                dataTrimmed.forEach(function (dot, i) {
                    if (i > 0) {
                        var _x = Math.round((_widthMargin + (dot.timestamp - _firstTime_1) * widthKoof) * 100) / 100;
                        var _y = _map(dot.dellayMS, maxDellay, 0, _heightMargin, _canvasHeight - _heightMargin);
                        if (dot.status == 'offline' || dot.status == 'timeout' || dot.status == 'error') {
                            _ret += "M".concat(_x, " ").concat(_y);
                        }
                        else {
                            _ret += "L".concat(_x, " ").concat(_y);
                        }
                    }
                });
            }
            return _ret;
        };
        var _getCol3Content = function (history, rowId) {
            var _col3Content = document.createElement('col3');
            // let _col3PathDom = document.createElement('path')
            // _col3PathDom.setAttribute('d',_getPath({dataArray:history}))
            // let _col3SVGdom = document.createElement('svg')
            // _col3SVGdom.setAttribute('width','100%')
            // _col3SVGdom.setAttribute('height','100%')
            // _col3SVGdom.setAttribute('viewBox','0 20 100 6')
            // _col3SVGdom.innerHTML = '<path d=""></path>';
            // _col3SVGdom.append(_col3PathDom)
            // _col3Content.append(_col3SVGdom)
            _col3Content.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 200 100"><path d=""/></svg>';
            return _col3Content;
        };
        var _getCol4Content = function (history, rowId) {
            var _col4Content = document.createElement('col4');
            _col4Content.innerHTML = 'stats will go here';
            return _col4Content;
        };
        var _createRowDOM = function (_a) {
            var rowId = _a.rowId, name = _a.name, imageLink = _a.imageLink, ipAddress = _a.ipAddress, isBusy = _a.isBusy, isPaused = _a.isPaused, size = _a.size, isSelected = _a.isSelected, history = _a.history, updateTimeMS = _a.updateTimeMS;
            var _rowDOM = document.createElement('row');
            var _knownHistory = { status: 'unknown', dellayMS: 0 };
            if (history.length > 0) {
                _knownHistory = history[history.length - 1];
            }
            var status = _knownHistory.status;
            _rowDOM.setAttribute('id', rowId);
            _rowDOM.setAttribute('busy', isBusy);
            _rowDOM.setAttribute('paused', isPaused);
            _rowDOM.setAttribute('size', size);
            _rowDOM.setAttribute('selected', isSelected);
            _rowDOM.setAttribute('status', status);
            _rowDOM.append(_getCol1Content(imageLink, name, ipAddress, rowId));
            if (size != '1Little') {
                _rowDOM.append(_getCol2Content(history, updateTimeMS, rowId));
            }
            if (['4Middle', '6Big'].includes(size)) {
                _rowDOM.append(_getCol3Content(history, rowId));
            }
            if (['6Big'].includes(size)) {
                _rowDOM.append(_getCol4Content(history, rowId));
            }
            //event handler
            _rowDOM.onclick = function (e) {
                var eventElement = e.target;
                if (['ROW', 'COL1', 'COL2'].includes(eventElement.tagName)) {
                    var comunicator = Comunicator();
                    comunicator.send({
                        command: 'dispachAction',
                        payload: JSON.stringify({
                            action: 'rowToggleProp',
                            payload: JSON.stringify({ rowId: rowId, key: 'isSelected' })
                        })
                    });
                }
            };
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
                    payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
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
                    var targetRowDom = document.querySelector("row[id=\"".concat(diffUnit.id, "\"]"));
                    var targetRowObj = JSON.parse(_state.monitor.rows.find(function (_r) { return _r.indexOf("\"rowId\":".concat(diffUnit.id)) > -1; }));
                    var _updateInputElement = function (_a) {
                        var _selector = _a._selector, _value = _a._value;
                        var _newInputValue = _value;
                        var _inputTarget = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] ").concat(_selector));
                        if (targetRowObj.fieldEditing !== 'updateTime' && _selector == '.trioupdate') {
                            _newInputValue = (_newInputValue / 1000) + 's';
                        }
                        _inputTarget.value = _newInputValue;
                    };
                    var _changeHtmlIfNedded = function (selector, value) {
                        if (document.querySelector(selector).innerHTML != value) {
                            document.querySelector(selector).innerHTML = value;
                        }
                    };
                    var _renderCol2 = function (_a) {
                        var diffUnit = _a.diffUnit;
                        //check size
                        var _col2DOM = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] col2"));
                        if (['2Small', '4Middle', '6Big'].includes(targetRowObj.size)) {
                            if (_col2DOM == null) {
                                //we need to create col2
                                targetRowDom.append(_getCol2Content(targetRowObj.history, targetRowObj.updateTimeMS, diffUnit.id));
                            }
                            else {
                                //we just need to rerender values
                            }
                        }
                        else {
                            //do we need to remove col
                            if (!_col2DOM == null) {
                                _col2DOM.parentNode.removeChild(_col2DOM);
                            }
                        }
                    };
                    var _renderCol3 = function (_a) {
                        var diffUnit = _a.diffUnit;
                        var _col3DOM = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] col3"));
                        if (['4Middle', '6Big'].includes(targetRowObj.size)) {
                            if (_col3DOM == null) {
                                targetRowDom.append(_getCol3Content(targetRowObj.history, diffUnit.id));
                            }
                        }
                        else {
                            if (!_col3DOM == null) {
                                _col3DOM.parentNode.removeChild(_col3DOM);
                            }
                        }
                    };
                    var _renderCol4 = function (_a) {
                        var diffUnit = _a.diffUnit;
                        var _col4DOM = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] col4"));
                        if (['6Big'].includes(targetRowObj.size)) {
                            if (_col4DOM == null) {
                                targetRowDom.append(_getCol4Content(targetRowObj.history, diffUnit.id));
                            }
                        }
                        else {
                            if (!_col4DOM == null) {
                                _col4DOM.parentNode.removeChild(_col4DOM);
                            }
                        }
                    };
                    //if we have isEditing we create input somewhere and we do not update its value later
                    if (diffUnit.key == 'isEditing') {
                        if (diffUnit.value) {
                            var _enableInput = function (_selector) {
                                document.querySelector("row[id=\"".concat(diffUnit.id, "\"] ").concat(_selector)).classList.remove('disabled');
                            };
                            switch (targetRowObj.fieldEditing) {
                                case 'name':
                                    _enableInput('.name');
                                    break;
                                case 'address':
                                    _enableInput('.address');
                                    break;
                                case 'updatetime':
                                    _enableInput('.trioupdate');
                                    break;
                            }
                        }
                        else {
                            var _removeInput_1 = function (_selector) {
                                document.querySelector(_selector).classList.add('disabled');
                            };
                            ['.name', '.address', '.trioupdate'].forEach(function (_selector) {
                                _removeInput_1(_selector);
                                if (_selector == '.trioupdate') {
                                    _updateInputElement({ _selector: _selector, _value: targetRowObj['updateTimeMS'] });
                                }
                            });
                        }
                    }
                    if (diffUnit.key == 'size') {
                        //do we need to create it to remove it to update it
                        _renderCol2({ diffUnit: diffUnit }); //status
                        _renderCol3({ diffUnit: diffUnit }); //graph
                        _renderCol4({ diffUnit: diffUnit }); //statistics
                    }
                    if (diffUnit.key == 'history') {
                        //TODO check do we have row size 2 or bigger
                        //status, dellay, quality, graph
                        var status_1 = diffUnit.value.status;
                        var dellayMS = diffUnit.value.dellayMS;
                        var quality = diffUnit.value.quality;
                        _changeHtmlIfNedded("row[id=\"".concat(diffUnit.id, "\"] col2 status"), status_1);
                        document.querySelector("row[id=\"".concat(diffUnit.id, "\"]")).setAttribute('status', status_1);
                        _changeHtmlIfNedded("row[id=\"".concat(diffUnit.id, "\"] col2 trio triodelay"), "".concat(dellayMS, "ms"));
                        _changeHtmlIfNedded("row[id=\"".concat(diffUnit.id, "\"] col2 trio trioquality"), "".concat(quality, "%"));
                        if (document.querySelector("row[id=\"".concat(diffUnit.id, "\"] path")) != null) {
                            document.querySelector("row[id=\"".concat(diffUnit.id, "\"] path")).setAttribute('d', _getPath({ dataArray: targetRowObj.history }));
                        }
                    }
                    switch (diffUnit.key) {
                        case 'isBusy':
                            targetRowDom.setAttribute('busy', diffUnit.value);
                            break;
                        case 'isPaused':
                            targetRowDom.setAttribute('paused', diffUnit.value);
                            break;
                        case 'isSelected':
                            targetRowDom.setAttribute('selected', diffUnit.value);
                            break;
                        case 'isAlarmed':
                            targetRowDom.setAttribute('alarmed', diffUnit.value);
                            break;
                        case 'imageLink':
                            var _pictureTarget = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] pic"));
                            _pictureTarget.style.backgroundImage = "url(".concat(diffUnit.value, ")");
                            break;
                        case 'name':
                            _updateInputElement({ _selector: '.name', _value: diffUnit.value });
                            // document.querySelector(`row[id="${diffUnit.id}"] col1 .name`).setAttribute('value',diffUnit.value)
                            break;
                        case 'ipAdress':
                            _updateInputElement({ _selector: '.address', _value: diffUnit.value });
                            break;
                        case 'updateTime':
                            _updateInputElement({ _selector: '.trioupdate', _value: diffUnit.value });
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
                if (_state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isAlarmed\":true") > -1; }).length > 0) {
                    //TODO filter out muted alarmed rows
                    _this.siren.start();
                }
                else {
                    _this.siren.stop();
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
