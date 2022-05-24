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
var contextMenu;
var webFrame = require('electron').webFrame;
var Page = function (_winId) {
    _this.appConfig;
    _this.isProduction = true;
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
                return _mainChangesList;
            };
            var _getRowChanges = function (_stateNew, _stateOld) {
                var _rowChangesList = [];
                var _newStateIds = _stateNew.monitor.rows.map(function (r) { var rr = JSON.parse(r); return [rr.rowId, rr.position]; });
                var _oldStateIds = _stateOld.monitor.rows.map(function (r) { var rr = JSON.parse(r); return [rr.rowId, rr.position]; });
                var _newRows = _newStateIds.filter(function (_nr) { return _oldStateIds.filter(function (_or) { return _or[0] == _nr[0]; }).length == 0; });
                var _removedRows = _oldStateIds.filter(function (_or) { return _newStateIds.filter(function (_nr) { return _nr[0] == _or[0]; }).length == 0; });
                _newRows.forEach(function (_nr) {
                    _rowChangesList.push({ selector: 'list', key: 'new_row', value: _stateNew.monitor.rows.find(function (_mr) { return _mr.indexOf("\"rowId\":".concat(_nr[0])) > -1; }) });
                });
                _removedRows.forEach(function (_rr) {
                    _rowChangesList.push({ selector: 'list', key: 'remove_row', value: _stateOld.monitor.rows.find(function (_mr) { return _mr.indexOf("\"rowId\":".concat(_rr[0])) > -1; }) });
                });
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
                //check if row switched place
                if (_newRows.length + _removedRows.length == 0) {
                    var _checkOfSwaped = function (_new, _old) {
                        var swapped = false;
                        _new.forEach(function (_b, i) {
                            var rid = _b[0], pos = _b[1];
                            if (typeof _old[i] != 'undefined') {
                                _new[i][1] != _old[i][1] ? swapped == false ? swapped = true : 0 : 0;
                            }
                            else {
                                swapped == false ? swapped = true : 0;
                            }
                        });
                        return swapped;
                    };
                    var isSwapped = _checkOfSwaped(_newStateIds, _oldStateIds);
                    if (isSwapped) {
                        _rowChangesList.push({ selector: 'list', key: 'recreateByPosition', value: _stateNew.monitor.rows });
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
    _this.t = function (word) {
        var _ret = word;
        var _langSet = _this.state.langWords;
        if (typeof _langSet[word] == 'undefined') {
            // console.log(`"${word}":""`)
            return _ret;
        }
        if (_langSet[word].length == 0 || word.length == 0) {
            return _ret;
        }
        _ret = _langSet[word];
        return _ret;
    };
    _this.render = function (_state) {
        try {
            var initialRender = false;
            var difference = void 0;
            if (typeof _this.state == 'undefined') {
                _this.state = _state;
                difference = _state;
                initialRender = true;
            }
            else {
                difference = _this.optimize(_state, _this.state);
            }
            var _toFormat_1 = function (_ms) {
                var _h = Math.floor((_ms) / 1000 / 60 / 60);
                var _m = Math.floor((_ms - (_h * 3600000)) / 1000 / 60);
                var _s = Math.floor((_ms - (_h * 3600000) - (_m * 60000)) / 1000);
                var addZero = function (num) {
                    return num < 10 ? "0".concat(num) : "".concat(num);
                };
                if (_h > 0) {
                    return "".concat(addZero(_h), ":").concat(addZero(_m), ":").concat(addZero(_s));
                }
                else {
                    return "".concat(addZero(_m), ":").concat(addZero(_s));
                }
            };
            var formatExactDateTime_1 = function (_timestamp) {
                var d = new Date(_timestamp);
                var h = d.getHours();
                var m = d.getMinutes();
                var s = d.getSeconds();
                var year = d.getFullYear();
                var mos = d.getMonth() + 1;
                var day = d.getDate();
                var addZero = function (num) {
                    return num < 10 ? "0".concat(num) : "".concat(num);
                };
                return "".concat(year, ".").concat(addZero(mos), ".").concat(addZero(day), " ").concat(addZero(h), ":").concat(addZero(m), ":").concat(addZero(s));
            };
            var _getPath_1 = function (_b) {
                var dataArray = _b.dataArray, width = _b.width, height = _b.height, length = _b.length;
                var _ret = '';
                var _canvasWidth = width;
                var _canvasHeight = height;
                var _heightMargin = 10;
                var _widthMargin = _heightMargin;
                var dataLenghtLimit = length * 60 * 1000;
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
            var _getStats_1 = function (_b) {
                var history = _b.history;
                var _changesList = [];
                var _statusList = [];
                if (history.length < 2) {
                    return {
                        changesList: _changesList,
                        statusList: _statusList
                    };
                }
                var _getChanges = function (history) {
                    var _ret;
                    var _tempBeginigTime;
                    var _tempStatus;
                    var _startTime;
                    history.forEach(function (_b, _i) {
                        var status = _b.status, timestamp = _b.timestamp;
                        if (!_tempStatus) {
                            _tempStatus = status;
                        }
                        if (!_tempBeginigTime) {
                            _tempBeginigTime = timestamp;
                            _startTime = timestamp;
                        }
                        if (_tempStatus != status) {
                            _ret.push({
                                status: status,
                                prevStatus: _tempStatus,
                                duration: Math.abs(timestamp - _tempBeginigTime),
                                from: timestamp,
                                until: _tempBeginigTime
                            });
                            _tempStatus = status;
                            _tempBeginigTime = timestamp;
                        }
                        else { //same status but the end of history
                            if (_ret.length > 0) {
                                _ret[_ret.length - 1].duration = Math.abs(timestamp - _tempBeginigTime);
                                _ret[_ret.length - 1].until = timestamp;
                            }
                        }
                    });
                    return _ret;
                };
                var _getStatus = function (__changesList) {
                    var _ret = [];
                    if (__changesList.length == 0) {
                        if (history.length > 0) {
                            _ret.push({
                                status: history[history.length - 1].status,
                                duration: Math.abs(history[history.length - 1].timestamp - history[0].timestamp),
                                changesNum: 0
                            });
                        }
                    }
                    else {
                        __changesList.forEach(function (_chLEl) {
                            if (_ret.length == 0) {
                                //adding status before first change
                                console.log(_chLEl.duration, _chLEl.from, history[0].timestamp);
                                _ret.push({
                                    status: _chLEl.prevStatus,
                                    duration: Math.abs(_chLEl.from - history[0].timestamp),
                                    changesNum: 1
                                });
                                console.log('updated 1');
                            }
                            if (!_ret.find(function (_slEl) { return _slEl.status == _chLEl.status; })) {
                                _ret.push({
                                    status: _chLEl.status,
                                    duration: _chLEl.duration,
                                    changesNum: 1
                                });
                                console.log('updated 2');
                            }
                            else {
                                var _index = _ret.indexOf(_ret.find(function (_slEl) { return _slEl.status == _chLEl.status; }));
                                _ret[_index].duration += _chLEl.duration;
                                _ret[_index].changesNum++;
                            }
                        });
                    }
                    return _ret;
                };
                var initialStatus = history[0].status;
                var initialTime = history[0].timestamp;
                var addStatusIfNeeded = function (__statusList, __status, __duration) {
                    if (!__statusList.find(function (_slEl) { return _slEl.status == __status; })) {
                        __statusList.push({
                            status: __status,
                            duration: __duration,
                            changesNum: 1
                        });
                    }
                    else {
                        var _index = __statusList.indexOf(__statusList.find(function (_slEl) { return _slEl.status == __status; }));
                        __statusList[_index].duration += __duration;
                        __statusList[_index].changesNum++;
                    }
                    return __statusList;
                };
                history.forEach(function (_moment, _i) {
                    var duration = _moment.timestamp - initialTime;
                    if (_moment.status !== initialStatus) {
                        //changes
                        _changesList.push({
                            status: _moment.status,
                            prevStatus: initialStatus,
                            duration: duration,
                            from: initialTime,
                            until: _moment.timestamp
                        });
                        //status
                        _statusList = addStatusIfNeeded(_statusList, initialStatus, duration);
                        initialStatus = _moment.status;
                        initialTime = _moment.timestamp;
                    }
                    else if (_i == history.length - 1) {
                        _changesList.push({
                            status: _moment.status,
                            prevStatus: initialStatus,
                            duration: duration,
                            from: initialTime,
                            until: _moment.timestamp
                        });
                        _statusList = addStatusIfNeeded(_statusList, initialStatus, duration);
                    }
                });
                console.log(_changesList);
                console.log(_statusList);
                return {
                    changesList: _changesList.reverse(),
                    statusList: _statusList
                };
            };
            var _renderColor_1 = function (theme) {
                document.querySelector('.root').setAttribute('colorMode', theme);
            };
            var _renderLanguage_1 = function (_config) {
                if (_state.langCode != _config.langCode) {
                    location.reload();
                }
            };
            var _createMenuModal = function (_b) {
                var hidden = _b.hidden;
                var _menuModal = document.createElement('menumodal');
                var _createMenuOption = function (_b) {
                    var name = _b.name, alt = _b.alt, _class = _b._class, action = _b.action, icon = _b.icon, width = _b.width;
                    var _menuOptionDom = document.createElement('menuoption');
                    _menuOptionDom.innerHTML = _this.t(name);
                    _menuOptionDom.setAttribute('title', _this.t(alt));
                    _menuOptionDom.setAttribute('tabindex', '1');
                    _menuOptionDom.classList.add(_class);
                    _menuOptionDom.style.setProperty('--icon-name', "'".concat(icon, "'"));
                    if (width != '') {
                        _menuOptionDom.style.setProperty('width', "calc(".concat(width, " - 2.9em)"));
                    }
                    _menuOptionDom.onclick = function (_e) {
                        if (action.command == 'setZoom') {
                            switch (action.payload) {
                                case 'In':
                                    webFrame.setZoomFactor(webFrame.getZoomFactor() * 1.5);
                                    break;
                                case 'Out':
                                    webFrame.setZoomFactor(webFrame.getZoomFactor() / 1.5);
                                    break;
                                case 'Fix':
                                    webFrame.setZoomFactor(1);
                                    break;
                            }
                        }
                        else {
                            var comunicator = Comunicator();
                            comunicator.send(action);
                        }
                    };
                    _menuOptionDom.onkeyup = function (_e) {
                        if (_e.key == 'Enter' || _e.key == ' ') {
                            _e.preventDefault();
                            _e.target.click();
                        }
                    };
                    return _menuOptionDom;
                };
                var _menuOption = [
                    {
                        name: 'New window',
                        alt: 'Open new window',
                        _class: 'newwin',
                        icon: 'add_to_queue',
                        action: {
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'addMonitor',
                                payload: JSON.stringify({})
                            })
                        }
                    },
                    {
                        name: 'Duplicate window',
                        alt: 'Duplicate window',
                        _class: 'dupwin',
                        icon: 'add_to_photos',
                        action: {
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'addNewWindowBySubKey',
                                payload: _state.subscriptionKey
                            })
                        }
                    },
                    {
                        name: 'Settings',
                        alt: 'Open settings',
                        _class: 'winsettngs',
                        icon: 'settings',
                        action: {
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'winSetProp',
                                payload: JSON.stringify({ winId: _state.winId, key: 'isSettingOpen', value: true })
                            })
                        }
                    },
                    {
                        name: 'Save config',
                        alt: 'Export config',
                        _class: 'configexport',
                        icon: 'get_app',
                        action: {
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'monitorExportConfig',
                                payload: ''
                            })
                        }
                    },
                    {
                        name: 'Open config',
                        alt: 'Import config',
                        _class: 'configimport',
                        icon: 'file_open',
                        action: {
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'monitorImportConfig',
                                payload: ''
                            })
                        }
                    },
                    {
                        name: '',
                        alt: 'Scale down',
                        _class: 'zoomout',
                        icon: 'zoom_out',
                        width: '33%',
                        action: {
                            command: 'setZoom',
                            payload: 'Out'
                        }
                    },
                    {
                        name: '',
                        alt: 'Normal scale',
                        _class: 'zoomfix',
                        icon: 'search',
                        width: '33%',
                        action: {
                            command: 'setZoom',
                            payload: 'Fix'
                        }
                    },
                    {
                        name: '',
                        alt: 'Scale up',
                        _class: 'zoomin',
                        icon: 'zoom_in',
                        width: '33%',
                        action: {
                            command: 'setZoom',
                            payload: 'In'
                        }
                    },
                ];
                _menuOption.forEach(function (_mo) {
                    if (typeof _mo.width == 'undefined') {
                        _mo.width = '';
                    }
                    _menuModal.append(_createMenuOption({
                        name: _mo.name,
                        _class: _mo._class,
                        icon: _mo.icon,
                        alt: _mo.alt,
                        action: _mo.action,
                        width: _mo.width
                    }));
                });
                _menuModal.setAttribute('hidden', hidden);
                return _menuModal;
            };
            var _renderSettingsContent_1 = function (_configData) {
                var _settingsModalDom = document.querySelector('settingsmodal');
                var _getOptions = function (_options, _value) {
                    var _op = [];
                    _options.forEach(function (_o) {
                        _op.push("<option ".concat(_value === _o ? 'selected' : '', " value=\"").concat(_o, "\">").concat(_this.t(_o), "</option>"));
                    });
                    return _op.join('');
                };
                var _getInputContent = function (_type, _name, _value, _options) {
                    if (_options === void 0) { _options = ['no options']; }
                    var _ret = [];
                    var _parent = '';
                    if (_name.indexOf('_') > -1) {
                        _parent = _name.split('_').filter(function (_n, _i, _a) { return _i < _a.length - 1; }).join('_');
                        _name = _name.split('_').filter(function (_n, _i, _a) { return _i == _a.length - 1; }).toString();
                    }
                    var _getNameDom = function (text) {
                        var _nameDom = document.createElement('name');
                        _nameDom.innerHTML = _this.t(text);
                        return _nameDom;
                    };
                    var _getInputDom = function (_b) {
                        var type = _b.type, name = _b.name, value = _b.value, _c = _b.randNum, randNum = _c === void 0 ? 0 : _c, _d = _b.options, options = _d === void 0 ? [] : _d, _f = _b.callback, callback = _f === void 0 ? function (e) { } : _f;
                        var _inputDom;
                        if (type == 'selector') {
                            _inputDom = document.createElement('select');
                        }
                        else {
                            _inputDom = document.createElement('input');
                        }
                        switch (type) {
                            case 'checkbox':
                                _inputDom.setAttribute('type', "checkbox");
                                _inputDom.setAttribute('id', "".concat(name).concat(randNum));
                                _inputDom.style.setProperty('display', 'none');
                                value ? _inputDom.setAttribute('checked', '') : 0;
                                _inputDom.onchange = function (e) {
                                    callback(e);
                                };
                                break;
                            case 'number':
                                _inputDom.setAttribute('type', "number");
                                _inputDom.setAttribute('value', "".concat(value));
                                _inputDom.setAttribute('tabindex', '7');
                                _inputDom.onkeyup = function (e) {
                                    if (e.target.value != value) {
                                        callback(e);
                                    }
                                };
                                break;
                            case 'string':
                                _inputDom.setAttribute('type', "text");
                                _inputDom.setAttribute('value', "".concat(value));
                                _inputDom.setAttribute('tabindex', '7');
                                _inputDom.onkeyup = function (e) {
                                    if (e.target.value != value) {
                                        callback(e);
                                    }
                                };
                                break;
                            case 'selector':
                                _inputDom.innerHTML = _getOptions(options, value);
                                _inputDom.setAttribute('tabindex', '7');
                                _inputDom.onchange = function (e) {
                                    callback(e);
                                };
                                break;
                        }
                        return _inputDom;
                    };
                    var _getLabelDom = function (name, randNum) {
                        if (name === void 0) { name = ''; }
                        if (randNum === void 0) { randNum = -1; }
                        var _labelDom = document.createElement('label');
                        randNum != -1 ? _labelDom.setAttribute('for', "".concat(name).concat(randNum)) : 0;
                        return _labelDom;
                    };
                    var _sendConfigChange = function (_fullName, _value) {
                        var comunicator = Comunicator();
                        comunicator.send({
                            command: 'configSetProp',
                            payload: JSON.stringify({ key: _fullName, value: _value })
                        });
                    };
                    switch (_type) {
                        case 'checkbox':
                            var _randNum = Math.round(Math.random() * 10000);
                            _ret.push(_getNameDom(_name));
                            _ret.push(_getInputDom({ type: _type, name: _name, value: _value, randNum: _randNum, callback: function (e) {
                                    var _fullN = _parent != '' ? "".concat(_parent, "_").concat(_name) : _name;
                                    _sendConfigChange(_fullN, e.target.checked);
                                } }));
                            var _checkboxLabel = _getLabelDom(_name, _randNum);
                            _checkboxLabel.setAttribute('tabindex', '7');
                            _checkboxLabel.onkeyup = function (_e) {
                                if (_e.key == 'Enter' || _e.key == ' ') {
                                    _e.preventDefault();
                                    _e.target.click();
                                }
                            };
                            _ret.push(_checkboxLabel);
                            break;
                        case 'number':
                            var _numberInputLabel = _getLabelDom(_name);
                            _numberInputLabel.append(_getNameDom(_name));
                            _numberInputLabel.append(_getInputDom({ type: _type, name: _name, value: _value, callback: function (e) {
                                    var _fullN = _parent != '' ? "".concat(_parent, "_").concat(_name) : _name;
                                    _sendConfigChange(_fullN, e.target.value);
                                }
                            }));
                            _ret.push(_numberInputLabel);
                            break;
                        case 'string':
                            var _stringInputLabel = _getLabelDom(_name);
                            _stringInputLabel.append(_getNameDom(_name));
                            _stringInputLabel.append(_getInputDom({ type: _type, name: _name, value: _value, callback: function (e) {
                                    var _fullN = _parent != '' ? "".concat(_parent, "_").concat(_name) : _name;
                                    _sendConfigChange(_fullN, e.target.value);
                                }
                            }));
                            _ret.push(_stringInputLabel);
                            break;
                        case 'selector':
                            var _selectorInputLabel = _getLabelDom(_name);
                            _selectorInputLabel.append(_getNameDom(_name));
                            _selectorInputLabel.append(_getInputDom({ type: _type, name: _name, value: _value, options: _options, callback: function (e) {
                                    var _fullN = _parent != '' ? "".concat(_parent, "_").concat(_name) : _name;
                                    _sendConfigChange(_fullN, e.target.value);
                                }
                            }));
                            _ret.push(_selectorInputLabel);
                            break;
                    }
                    if (['hideTitleBar', ''].includes(_name)) {
                        var _miniLabel = document.createElement('minilabel');
                        _miniLabel.innerHTML = _this.t('*Requires manual reload');
                        _ret.push(_miniLabel);
                    }
                    return _ret;
                };
                var _getSettingsRow = function (_b) {
                    var type = _b.type, name = _b.name, value = _b.value, options = _b.options;
                    var _settingsRow = document.createElement('settingsrow');
                    //TYPES: text_short,selector,number,checkbox
                    _settingsRow.setAttribute('name', name);
                    //TODO add event listeners
                    if (type == 'defaultNewRow') {
                        var _defaultSubTitle = document.createElement('subtitle');
                        _defaultSubTitle.innerHTML = _this.t(name);
                        _settingsRow.append(_defaultSubTitle);
                        Object.entries(value).forEach(function (_v) {
                            var _srN = _v[0];
                            var _srV = _v[1];
                            var _subRow = document.createElement('subrow');
                            _subRow.setAttribute('name', "".concat(name, "_").concat(_srN));
                            if (['address', 'name'].includes(_srN)) {
                                _subRow.append.apply(_subRow, _getInputContent('string', "".concat(name, "_").concat(_srN), _srV));
                            }
                            else if (['updateTimeMS'].includes(_srN)) {
                                _subRow.append.apply(_subRow, _getInputContent('number', "".concat(name, "_").concat(_srN), _srV));
                            }
                            else if (['isPaused', 'isMuted'].includes(_srN)) {
                                _subRow.append.apply(_subRow, _getInputContent('checkbox', "".concat(name, "_").concat(_srN), _srV));
                            }
                            else if (['pictureLink', 'size'].includes(_srN)) {
                                var _opt = [];
                                switch (_srN) {
                                    case 'pictureLink':
                                        _opt = JSON.parse(_state.imagesList);
                                        break;
                                    case 'size':
                                        _opt = ['1Little', '2Small', '4Middle', '6Big'];
                                        break;
                                }
                                _subRow.append.apply(_subRow, _getInputContent('selector', "".concat(name, "_").concat(_srN), _srV, _opt));
                            }
                            _settingsRow.append(_subRow);
                        });
                    }
                    else if (type == 'logSettings') {
                        var _logSubTitle = document.createElement('subtitle');
                        _logSubTitle.innerHTML = _this.t(name);
                        _settingsRow.append(_logSubTitle);
                        Object.entries(value).forEach(function (_v) {
                            var _srN = _v[0];
                            var _srV = _v[1];
                            var _subRow = document.createElement('subrow');
                            _subRow.setAttribute('name', "".concat(name, "_").concat(_srN));
                            if (['defaultLogName'].includes(_srN)) {
                                _subRow.append.apply(_subRow, _getInputContent('string', "".concat(name, "_").concat(_srN), _srV));
                            }
                            else if (['logChanges', 'newLogNameEveryday'].includes(_srN)) {
                                _subRow.append.apply(_subRow, _getInputContent('checkbox', "".concat(name, "_").concat(_srN), _srV));
                            }
                            else if (['timeToLogStatusChangeMS'].includes(_srN)) {
                                _subRow.append.apply(_subRow, _getInputContent('number', "".concat(name, "_").concat(_srN), _srV));
                            }
                            _settingsRow.append(_subRow);
                        });
                    }
                    else if (type == 'initialRows') {
                        var _initSubTitle = document.createElement('subtitle');
                        _initSubTitle.innerHTML = _this.t(name);
                        _settingsRow.append(_initSubTitle);
                        value.forEach(function (_vl, _i) {
                            if (_i > 0) {
                                _settingsRow.append(document.createElement('hr'));
                            }
                            Object.entries(value[_i]).forEach(function (_v) {
                                var _srN = _v[0];
                                var _srV = _v[1];
                                var _subRow = document.createElement('subrow');
                                _subRow.setAttribute('name', "".concat(name, "_").concat(_i, "_").concat(_srN));
                                if (['address', 'name'].includes(_srN)) {
                                    _subRow.append.apply(_subRow, _getInputContent('string', "".concat(name, "_").concat(_i, "_").concat(_srN), _srV));
                                }
                                else if (['updateTimeMS'].includes(_srN)) {
                                    _subRow.append.apply(_subRow, _getInputContent('number', "".concat(name, "_").concat(_i, "_").concat(_srN), _srV));
                                }
                                else if (['isPaused', 'isMuted'].includes(_srN)) {
                                    _subRow.append.apply(_subRow, _getInputContent('checkbox', "".concat(name, "_").concat(_i, "_").concat(_srN), _srV));
                                }
                                else if (['pictureLink', 'size'].includes(_srN)) {
                                    var _opt = [];
                                    switch (_srN) {
                                        case 'pictureLink':
                                            _opt = JSON.parse(_state.imagesList);
                                            break;
                                        case 'size':
                                            _opt = ['1Little', '2Small', '4Middle', '6Big'];
                                            break;
                                    }
                                    _subRow.append.apply(_subRow, _getInputContent('selector', "".concat(name, "_").concat(_i, "_").concat(_srN), _srV, _opt));
                                }
                                _settingsRow.append(_subRow);
                            });
                        });
                    }
                    else if (type == 'defaultPingTimeStrategy') {
                        var _initSubTitle = document.createElement('subtitle');
                        _initSubTitle.innerHTML = _this.t(name);
                        _settingsRow.append(_initSubTitle);
                        Object.entries(value).forEach(function (_v) {
                            var _srN = _v[0];
                            var _srV = _v[1];
                            var _subRow = document.createElement('subrow');
                            _subRow.setAttribute('name', "".concat(name, "_").concat(_srN));
                            _subRow.append.apply(_subRow, _getInputContent('number', "".concat(name, "_").concat(_srN), _srV));
                            _settingsRow.append(_subRow);
                        });
                    }
                    else {
                        _settingsRow.append.apply(_settingsRow, _getInputContent(type, name, value, options));
                    }
                    _settingsRow.setAttribute('type', type);
                    return _settingsRow;
                };
                var _updateSettingsRow = function (_b) {
                    var type = _b.type, name = _b.name, value = _b.value;
                    var _updateBySelector = function (selector, type, value) {
                        var target;
                        switch (type) {
                            case 'checkbox':
                                target = document.querySelector(selector);
                                if (target.checked !== value) {
                                    target.checked = value;
                                }
                                break;
                            case 'number':
                            case 'string':
                                target = document.querySelector(selector);
                            case 'selector':
                                type == 'selector' ? target = document.querySelector(selector) : 0;
                                if (target.value !== value) {
                                    target.value = value;
                                }
                                break;
                        }
                    };
                    switch (type) {
                        case 'checkbox':
                            _updateBySelector("settingsrow[name=\"".concat(name, "\"] input[type=\"checkbox\"]"), type, value);
                            break;
                        case 'number':
                        case 'string':
                            _updateBySelector("settingsrow[name=\"".concat(name, "\"] input"), type, value);
                            break;
                        case 'selector':
                            _updateBySelector("settingsrow[name=\"".concat(name, "\"] select"), type, value);
                            break;
                        case 'initialRows':
                            value.forEach(function (_vl, _i) {
                                Object.entries(_vl).forEach(function (_irs) {
                                    var _irN = _irs[0];
                                    var _irV = _irs[1];
                                    var _targetSubRow = "settingsrow[name=\"".concat(name, "\"] subrow[name=\"").concat(name, "_").concat(_i, "_").concat(_irN, "\"]");
                                    if (['address', 'name'].includes(_irN)) {
                                        _updateBySelector("".concat(_targetSubRow, " input"), 'string', _irV);
                                    }
                                    else if (['updateTimeMS'].includes(_irN)) {
                                        _updateBySelector("".concat(_targetSubRow, " input"), 'number', _irV);
                                    }
                                    else if (['isPaused', 'isMuted'].includes(_irN)) {
                                        _updateBySelector("".concat(_targetSubRow, " input[type=\"checkbox\"]"), 'checkbox', _irV);
                                    }
                                    else if (['pictureLink'].includes(_irN)) {
                                        _updateBySelector("".concat(_targetSubRow, " select"), 'selector', _irV);
                                    }
                                });
                            });
                            break;
                        case 'defaultNewRow':
                            Object.entries(value).forEach(function (_drp) {
                                var _drN = _drp[0];
                                var _drV = _drp[1];
                                var _targetSubRow = "settingsrow[name=\"".concat(name, "\"] subrow[name=\"").concat(name, "_").concat(_drN, "\"]");
                                if (['address', 'name'].includes(_drN)) {
                                    _updateBySelector("".concat(_targetSubRow, " input"), 'string', _drV);
                                }
                                else if (['updateTimeMS'].includes(_drN)) {
                                    _updateBySelector("".concat(_targetSubRow, " input"), 'number', _drV);
                                }
                                else if (['isPaused'].includes(_drN)) {
                                    _updateBySelector("".concat(_targetSubRow, " input[type=\"checkbox\"]"), 'checkbox', _drV);
                                }
                                else if (['pictureLink', 'size'].includes(_drN)) {
                                    _updateBySelector("".concat(_targetSubRow, " select"), 'selector', _drV);
                                }
                            });
                            break;
                        case 'logSettings':
                            Object.entries(value).forEach(function (_lsp) {
                                var _lsN = _lsp[0];
                                var _lsV = _lsp[1];
                                var _targetSubRow = "settingsrow[name=\"".concat(name, "\"] subrow[name=\"").concat(name, "_").concat(_lsN, "\"]");
                                if (['defaultLogName'].includes(_lsN)) {
                                    _updateBySelector("".concat(_targetSubRow, " input"), 'string', _lsV);
                                }
                                else if (['logChanges', 'newLogNameEveryday'].includes(_lsN)) {
                                    _updateBySelector("".concat(_targetSubRow, " input[type=\"checkbox\"]"), 'checkbox', _lsV);
                                }
                                else if (['timeToLogStatusChangeMS'].includes(_lsN)) {
                                    _updateBySelector("".concat(_targetSubRow, " input"), 'number', _lsV);
                                }
                            });
                            break;
                        case 'defaultPingTimeStrategy':
                            Object.entries(value).forEach(function (_lsp) {
                                var _lsN = _lsp[0];
                                var _lsV = _lsp[1];
                                var _targetSubRow = "settingsrow[name=\"".concat(name, "\"] subrow[name=\"").concat(name, "_").concat(_lsN, "\"]");
                                _updateBySelector("".concat(_targetSubRow, " input"), 'number', _lsV);
                            });
                            break;
                        default:
                            console.error('no case for type: ', type);
                            break;
                    }
                };
                var _checkSettingsRow = function (_entri) {
                    var _type = 'input';
                    var _name = _entri[0];
                    var _value = _entri[1];
                    var _options = [];
                    if (_name == '__keyForTesting') {
                        return 0;
                    }
                    if (['timeToAlarmMS', 'timeToLogStatusChangeMS', 'pingHistoryTimeLimitMINS', 'miniGraphShowLimitMINS'].includes(_name)) {
                        _type = 'number';
                    }
                    if (['langCode', 'colorMode', 'newRowRule'].includes(_name)) {
                        _type = 'selector';
                        switch (_name) {
                            case 'langCode':
                                _options = ['ua', 'en'];
                                break;
                            case 'colorMode':
                                _options = ['system', 'dark', 'light'];
                                break;
                            case 'newRowRule':
                                _options = ['copyPrev', 'default'];
                                break;
                        }
                    }
                    if (['unmuteOnGettingOnline', 'savePingHistoryToConfig', 'alwaysShowOnTop', 'hideTitleBar'].includes(_name)) {
                        _type = 'checkbox';
                    }
                    if (_type == 'input') {
                        _type = _name;
                    }
                    if (document.querySelector("settingsrow[name=\"".concat(_name, "\"]")) == null) {
                        var _settRowDom = _getSettingsRow({ type: _type, name: _name, value: _value, options: _options });
                        _settingsModalDom.append(_settRowDom);
                    }
                    else {
                        _updateSettingsRow({ type: _type, name: _name, value: _value });
                    }
                };
                if (document.querySelector('settingstitle') == null) {
                    _settingsModalDom.innerHTML = '';
                    var _settTitle = document.createElement('settingstitle');
                    _settTitle.innerHTML = _this.t('Settings');
                    _settingsModalDom.append(_settTitle);
                }
                Object.entries(_configData).forEach(function (_e) {
                    _checkSettingsRow(_e);
                });
                if (document.querySelector('settingsrestore') == null) {
                    var _settRestore = document.createElement('settingsrestore');
                    _settRestore.classList.add('button');
                    _settRestore.style.setProperty('--icon-name', "'restore'");
                    _settRestore.innerHTML = _this.t('Restore defaults');
                    _settRestore.setAttribute('tabindex', '8');
                    _settRestore.onclick = function (e) {
                        var comunicator = Comunicator();
                        comunicator.send({
                            command: 'configRestoreDefaults',
                            payload: ''
                        });
                    };
                    _settRestore.onkeyup = function (_e) {
                        if (_e.key == 'Enter' || _e.key == ' ') {
                            _e.preventDefault();
                            _e.target.click();
                        }
                    };
                    _settingsModalDom.append(_settRestore);
                }
                if (document.querySelector('settingshotkeys') == null) {
                    var _settKeys = document.createElement('settingshotkeys');
                    _settKeys.classList.add('button');
                    _settKeys.style.setProperty('--icon-name', "'keyboard_alt'");
                    _settKeys.innerHTML = _this.t('Hot keys');
                    _settKeys.setAttribute('tabindex', '8');
                    _settKeys.onclick = function (e) {
                        alert("".concat(_this.t('HOT KEYS'), "\n") +
                            "M - ".concat(_this.t('open menu'), "\n") +
                            "P - ".concat(_this.t('pause all'), "\n") +
                            "F - ".concat(_this.t('fullscreen'), "\n") +
                            "A - ".concat(_this.t('disable alarm'), "\n") +
                            "Ctrl+N - ".concat(_this.t('new row'), "\n") +
                            "Ctrl+Shift+N - ".concat(_this.t('new window'), "\n") +
                            "Ctrl+Shift+D - ".concat(_this.t('duplicate window'), "\n") +
                            "Ctrl+S - ".concat(_this.t('save config'), "\n") +
                            "Ctrl+O - ".concat(_this.t('open config'), "\n") +
                            "Ctrl+H - ".concat(_this.t('clear all ping history'), "\n") +
                            "Ctrl+A - ".concat(_this.t('select all rows'), "\n") +
                            "(Row)Space - ".concat(_this.t('select row'), "\n") +
                            "(Row)Enter - ".concat(_this.t('open row menu'), "\n") +
                            "(Row)Right - ".concat(_this.t('next row'), "\n") +
                            "(Row)Left - ".concat(_this.t('previus row')));
                    };
                    _settKeys.onkeyup = function (_e) {
                        if (_e.key == 'Enter' || _e.key == ' ') {
                            _e.preventDefault();
                            _e.target.click();
                        }
                    };
                    _settingsModalDom.append(_settKeys);
                }
                if (document.querySelector('settingsabout') == null) {
                    var _settKeys = document.createElement('settingsabout');
                    _settKeys.classList.add('button');
                    _settKeys.style.setProperty('--icon-name', "'info'");
                    _settKeys.innerHTML = _this.t('About');
                    _settKeys.setAttribute('tabindex', '8');
                    _settKeys.onclick = function (e) {
                        alert("".concat(_this.t('ABOUT'), "\n") +
                            "".concat(_this.t('PingMonitor is a free app to automatically ping and show status of network devices.'), "\n") +
                            "".concat(_this.t('Version'), " ").concat(_this.state.version, " (").concat(_this.t('May'), " 2022)\n") +
                            "\u00A9".concat(_this.t('Made by Fedir Moroz for Ukrainian Military Forces in Sep 2021 for no commercial use only.'), "\n") +
                            "".concat(_this.t('For more info contact me at'), " github.com/calmted"));
                    };
                    _settKeys.onkeyup = function (_e) {
                        if (_e.key == 'Enter' || _e.key == ' ') {
                            _e.preventDefault();
                            _e.target.click();
                        }
                    };
                    _settingsModalDom.append(_settKeys);
                }
            };
            var _renderNewConfig_1 = function (_newConfigObj) {
                var _previousConfig = JSON.parse(JSON.stringify(_this.appConfig));
                if (_previousConfig.langCode != _newConfigObj.langCode) {
                    _renderLanguage_1(_newConfigObj);
                }
                if (_previousConfig.colorMode != _newConfigObj.colorMode) {
                    _renderColor_1(_newConfigObj.colorMode);
                }
                _renderSettingsContent_1(_newConfigObj);
                _this.appConfig = _newConfigObj;
            };
            var _createSettingsModal = function (_b) {
                var hidden = _b.hidden;
                var _settingsModal = document.createElement('settingsmodal');
                _settingsModal.setAttribute('hidden', hidden);
                var comunicator = Comunicator();
                comunicator.subscribe(function (_message) {
                    if (_message.command == 'sendConfig') {
                        _renderNewConfig_1(_message.payload);
                    }
                });
                if (!hidden) {
                    comunicator.send({
                        command: 'getConfigData',
                        payload: _this.winId
                    });
                }
                return _settingsModal;
            };
            var _getImagePickerImageDom_1 = function (_b) {
                var _imageLink = _b._imageLink;
                var _imagePickerContentDom = document.createElement('image');
                _imagePickerContentDom.setAttribute('style', "background-image: url('".concat(_this.isProduction ? '../../' : '', "assets/icons/").concat(_imageLink, "')"));
                _imagePickerContentDom.setAttribute('title', "".concat(_imageLink));
                _imagePickerContentDom.onclick = function (_e) {
                    var _el = _e.target;
                    var _rowId = document.querySelector('imgpickermodal').getAttribute('targetRow');
                    if (!_el.classList.contains('selected') && _rowId != null) {
                        var comunicator = Comunicator();
                        comunicator.send({
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'rowSetProp',
                                payload: JSON.stringify({ rowId: _rowId, key: 'imageLink', value: _imageLink })
                            })
                        });
                    }
                };
                _imagePickerContentDom.onkeyup = function (_e) {
                    if (_e.key == 'Enter' || _e.key == ' ') {
                        _e.preventDefault();
                        _e.target.click();
                    }
                };
                return _imagePickerContentDom;
            };
            var _createImagePickerModal = function (_b) {
                var hidden = _b.hidden, imageList = _b.imageList;
                var _imagePickerModal = document.createElement('imgpickermodal');
                _imagePickerModal.setAttribute('hidden', hidden);
                typeof imageList == 'string' ? imageList = JSON.parse(imageList) : 0;
                imageList.forEach(function (_linkStr) {
                    _imagePickerModal.append(_getImagePickerImageDom_1({ _imageLink: _linkStr }));
                });
                return _imagePickerModal;
            };
            var _createTool_1 = function (_b) {
                var tagName = _b.tagName, icon = _b.icon, altText = _b.altText, action = _b.action, _c = _b.hidden, hidden = _c === void 0 ? false : _c;
                var _tool = document.createElement(tagName);
                _tool.classList.add('tool');
                _tool.setAttribute('title', _this.t(altText));
                _tool.setAttribute('hidden', hidden);
                _tool.setAttribute('tabindex', '0');
                _tool.classList.add('material-icons');
                _tool.innerHTML = icon;
                _tool.onclick = function (e) {
                    var comunicator = Comunicator();
                    comunicator.send({
                        command: 'dispachAction',
                        payload: JSON.stringify(action)
                    });
                };
                _tool.onkeyup = function (_e) {
                    if (_e.key == 'Enter' || _e.key == ' ') {
                        _e.preventDefault();
                        _e.target.click();
                    }
                };
                return _tool;
            };
            var _createListDOM = function () {
                var _ret = document.createElement('list');
                return _ret;
            };
            var _addEditEvents_1 = function (_b) {
                var domElement = _b.domElement, name = _b.name, className = _b.className, rowId = _b.rowId;
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
                    if (e.key.length > 1) {
                        return 0;
                    }
                    if (name == 'updatetime') {
                        _name = 'updateTimeMS';
                        _value = Number(_value.replace(/[^0-9]/g, '')) * 1000;
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
            var _getCol1Content_1 = function (imageLink, name, ipAddress, rowId) {
                var _col1Content = document.createElement('col1');
                //picture
                var _picDOMElement = document.createElement('pic');
                _picDOMElement.setAttribute('style', "background-image: url('".concat(_this.isProduction ? '../../' : '', "assets/icons/").concat(imageLink, "')"));
                _col1Content.append(_picDOMElement);
                //name
                var _nameDOMElement = document.createElement('input');
                _nameDOMElement.classList.add('name');
                _nameDOMElement.setAttribute('tabindex', '6');
                _nameDOMElement.value = name;
                _addEditEvents_1({ domElement: _nameDOMElement, name: 'name', className: 'name', rowId: rowId });
                _col1Content.append(_nameDOMElement);
                //address
                var _addressDOMElement = document.createElement('input');
                _addressDOMElement.classList.add('address');
                _addressDOMElement.setAttribute('tabindex', '6');
                _addressDOMElement.value = ipAddress;
                _addEditEvents_1({ domElement: _addressDOMElement, name: 'address', className: 'address', rowId: rowId });
                _col1Content.append(_addressDOMElement);
                return _col1Content;
            };
            var _getCol2Content_1 = function (history, updateTimeMS, rowId) {
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
                _statusDOMElement.innerHTML = _this.t(status);
                //trio
                var _trioDOMElement = document.createElement('trio');
                // dellay
                var _dellayDOMElement = document.createElement('triodelay');
                _dellayDOMElement.innerHTML = "".concat(dellayMS).concat(_this.t('ms'));
                _dellayDOMElement.setAttribute('title', _this.t('Ping delay'));
                // update
                var _updateDOMElement = document.createElement('input');
                _updateDOMElement.value = "".concat(updateTimeMS / 1000).concat(_this.t('s'));
                _updateDOMElement.classList.add('trioupdate');
                _updateDOMElement.setAttribute('tabindex', '6');
                _updateDOMElement.setAttribute('title', _this.t('Update time'));
                _addEditEvents_1({ domElement: _updateDOMElement, name: 'updatetime', className: 'trioupdate', rowId: rowId });
                // quality
                var _qualityDOMElement = document.createElement('trioquality');
                _qualityDOMElement.innerHTML = "".concat(quality, "%");
                _qualityDOMElement.setAttribute('title', _this.t('Quality'));
                _trioDOMElement.append(_dellayDOMElement);
                _trioDOMElement.append(_updateDOMElement);
                _trioDOMElement.append(_qualityDOMElement);
                _col2Content.append(_statusDOMElement);
                _col2Content.append(_trioDOMElement);
                return _col2Content;
            };
            var _getCol3Content_1 = function (history, rowId) {
                var _col3Content = document.createElement('col3');
                //somehow it is the only way to make svg work
                //we do not render path b.c. we can not get svg size right now, need to render it first
                _col3Content.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 200 100\"><path d=\"\"/></svg>";
                // _col3Content.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 200 100"><path d="${_getPath({dataArray:history,width:200,height:100,length:this.appConfig.miniGraphShowLimitMINS})}"/></svg>`
                return _col3Content;
            };
            var _getCol4Content_1 = function (history, rowId) {
                var _col4Content = document.createElement('col4');
                var _stats = _getStats_1({ history: history });
                //each status change and duration
                var _chagesList = _stats.changesList;
                //each status and duration sortad by duration
                var _statsList = _stats.statusList.sort(function (_sl1, _sl2) { return _sl1.duration < _sl2.duration ? 1 : -1; });
                var _statsAllOfflineDurationDom = document.createElement('statsall');
                var _getStatusElementDom = function (_b) {
                    var status = _b.status, duration = _b.duration, changesNum = _b.changesNum, _i = _b._i;
                    var _statusElement = document.createElement('statselement');
                    _statusElement.innerHTML = "<status>".concat(_this.t(status), "</status> <duration>").concat(_toFormat_1(duration), "</duration>");
                    _statusElement.setAttribute('title', "".concat(changesNum, " ").concat(_this.t('changes')));
                    return _statusElement;
                };
                //if there are no changes
                if (_chagesList.length == 0) {
                    if (_statsList.length > 0) {
                        _statsAllOfflineDurationDom.append(_getStatusElementDom({
                            status: _statsList[0].status,
                            duration: _statsList[0].duration,
                            changesNum: _statsList[0].changesNum,
                            _i: 0
                        }));
                    }
                    _col4Content.append(_statsAllOfflineDurationDom);
                }
                else {
                    var _statsLastChangeTimeDom_1 = document.createElement('statslast');
                    _chagesList.forEach(function (_chLEl, _i) {
                        var _changeElement = document.createElement('changeelement');
                        _changeElement.innerHTML = "<status>".concat(_this.t(_chLEl.prevStatus), "</status> <duration>").concat(_toFormat_1(_chLEl.duration), "</duration>");
                        if (_i == 0) {
                            _changeElement.style.setProperty('--icon-text', "'-'");
                        }
                        else {
                            _changeElement.style.setProperty('--icon-text', "'".concat(_i, "'"));
                        }
                        var _formatedDateFrom = formatExactDateTime_1(_chLEl.from);
                        var _formatedDateUntil = formatExactDateTime_1(_chLEl.until);
                        if (_formatedDateUntil.substring(0, 10) == _formatedDateFrom.substring(0, 10)) {
                            _formatedDateUntil = _formatedDateUntil.replace(_formatedDateUntil.substring(0, 10), '');
                        }
                        _changeElement.setAttribute('title', "".concat(_formatedDateFrom, " ").concat(_formatedDateUntil));
                        _statsLastChangeTimeDom_1.append(_changeElement);
                    });
                    _statsList.forEach(function (_slEl, _i) {
                        _statsAllOfflineDurationDom.append(_getStatusElementDom({
                            _i: _i,
                            status: _slEl.status,
                            duration: _slEl.duration,
                            changesNum: _slEl.changesNum
                        }));
                    });
                    _col4Content.append(_statsAllOfflineDurationDom);
                    _col4Content.append(_statsLastChangeTimeDom_1);
                }
                return _col4Content;
            };
            var _createRowDOM_1 = function (_b) {
                var rowId = _b.rowId, name = _b.name, imageLink = _b.imageLink, ipAddress = _b.ipAddress, isBusy = _b.isBusy, isPaused = _b.isPaused, isMuted = _b.isMuted, isAlarmed = _b.isAlarmed, size = _b.size, isSelected = _b.isSelected, history = _b.history, updateTimeMS = _b.updateTimeMS;
                var _rowDOM = document.createElement('row');
                var _knownHistory = { status: 'unknown', dellayMS: 0 };
                if (history.length > 0) {
                    _knownHistory = history[history.length - 1];
                }
                var status = _knownHistory.status;
                _rowDOM.setAttribute('id', rowId);
                _rowDOM.setAttribute('busy', isBusy);
                _rowDOM.setAttribute('paused', isPaused);
                _rowDOM.setAttribute('muted', isMuted);
                _rowDOM.setAttribute('alarmed', isAlarmed);
                _rowDOM.setAttribute('size', size);
                _rowDOM.setAttribute('selected', isSelected);
                _rowDOM.setAttribute('status', status);
                _rowDOM.setAttribute('tabindex', '4');
                _rowDOM.append(_getCol1Content_1(imageLink, name, ipAddress, rowId));
                if (size != '1Little') {
                    _rowDOM.append(_getCol2Content_1(history, updateTimeMS, rowId));
                }
                if (['4Middle', '6Big'].includes(size)) {
                    _rowDOM.append(_getCol3Content_1(history, rowId));
                }
                if (['6Big'].includes(size)) {
                    _rowDOM.append(_getCol4Content_1(history, rowId));
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
                _rowDOM.oncontextmenu = function (e) {
                    contextMenu.show(e);
                };
                _rowDOM.onkeyup = function (_e) {
                    //not for inputs
                    if (_e.path.filter(function (_el) { return _el.tagName == 'INPUT'; }).length > 0) {
                        return 0;
                    }
                    if (_e.key == 'Enter') {
                        contextMenu.show(_e);
                    }
                    if (_e.key == ' ') {
                        _e.preventDefault();
                        _e.target.click();
                    }
                    if (_e.key == 'ArrowRight') {
                        if (_e.target.nextSibling) {
                            _e.target.nextSibling.focus();
                        }
                    }
                    if (_e.key == 'ArrowLeft') {
                        if (_e.target.previousSibling) {
                            _e.target.previousSibling.focus();
                        }
                    }
                };
                return _rowDOM;
            };
            var _createToolsDOM = function () {
                var _toolsDOM = document.createElement('toolset');
                var toolMenu = _createTool_1({
                    tagName: 'toolmenu',
                    icon: 'menu',
                    altText: '',
                    action: {
                        action: 'winToggleProp',
                        payload: JSON.stringify({ winId: _this.winId, key: 'isMenuOpen' })
                    }
                });
                var toolNewRow = _createTool_1({
                    tagName: 'toolnewrow',
                    icon: 'add',
                    altText: 'add row',
                    action: {
                        action: 'addRow',
                        payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
                    }
                });
                var toolPauseAll = _createTool_1({
                    tagName: 'toolpauseall',
                    icon: 'pause',
                    altText: 'pause all',
                    action: {
                        action: 'rowPauseAllActive',
                        payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
                    },
                    hidden: _state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isPaused\":false") > -1; }).length > 0 ? false : true
                });
                var toolFullScreen = _createTool_1({
                    tagName: 'toolfullscreen',
                    icon: 'fullscreen',
                    altText: 'toggle full screen',
                    action: {
                        action: 'winToggleProp',
                        payload: JSON.stringify({ winId: _this.winId, key: 'isFullscreen' })
                    }
                });
                var toolUnalarmAll = _createTool_1({
                    tagName: 'toolunalarm',
                    icon: 'notifications_off',
                    altText: 'unalarm all',
                    action: {
                        action: 'winUnalarmAllRows',
                        payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
                    },
                    hidden: _state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isAlarmed\":true") > -1; }).length > 0 ? false : true
                });
                _toolsDOM.append(toolMenu);
                _toolsDOM.append(toolNewRow);
                _toolsDOM.append(toolPauseAll);
                _toolsDOM.append(toolFullScreen);
                _toolsDOM.append(toolUnalarmAll);
                if (_this.appConfig.hideTitleBar) {
                    var dragTool = document.createElement('tooldrag');
                    dragTool.setAttribute('title', _this.t('Drag window'));
                    dragTool.classList.add('tool');
                    dragTool.classList.add('material-icons');
                    dragTool.innerHTML = 'drag_indicator';
                    _toolsDOM.append(dragTool);
                }
                return _toolsDOM;
            };
            if (initialRender) {
                //reder title
                document.querySelector('title').innerHTML = _state.title;
                var domRoot = document.querySelector('.root');
                domRoot.innerHTML = "";
                _renderColor_1(_this.appConfig.colorMode);
                domRoot.setAttribute('langCode', _state.langCode);
                //render modal
                var menuModal = _createMenuModal({ hidden: !Boolean(_state.isMenuOpen) });
                domRoot.append(menuModal);
                var settingsModal = _createSettingsModal({ hidden: !Boolean(_state.isSettingOpen) });
                domRoot.append(settingsModal);
                if (typeof _this.appConfig != 'undefined') { //render settings data if posible
                    _renderSettingsContent_1(_this.appConfig);
                }
                var imagePickerModal = _createImagePickerModal({ hidden: !Boolean(_state.isImagePickerOpen), imageList: _state.imagesList });
                domRoot.append(imagePickerModal);
                var tools = _createToolsDOM();
                domRoot.append(tools);
                var domList_1 = _createListDOM();
                domRoot.append(domList_1);
                _state.monitor.rows.length > 0 ? _state.monitor.rows.forEach(function (rowStr) {
                    var rowObj = JSON.parse(rowStr);
                    var rowElement = _createRowDOM_1(rowObj);
                    domList_1.append(rowElement);
                }) : 0;
                domRoot.onclick = function (_e) {
                    //if clicked not on row
                    if (_e.path.filter(function (_el) { return _el.tagName == 'ROW'; }).length == 0) {
                        contextMenu.hideContextMenu();
                        var _selectedRows = _this.state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isSelected\":true") > -1; }).map(function (_r) { return JSON.parse(_r); });
                        if (_selectedRows.length > 0) {
                            var comunicator = Comunicator();
                            comunicator.send({
                                command: 'dispachAction',
                                payload: JSON.stringify({
                                    action: 'rowUnselectAllSelected',
                                    payload: JSON.stringify({ monitorId: Number(_state.subscriptionKey) })
                                })
                            });
                        }
                    }
                    else {
                        //if clicked on row 
                        if (contextMenu.isShown) {
                            contextMenu.hideContextMenu();
                        }
                    }
                    //if imgPicker is open
                    if (document.querySelector('imgpickermodal[hidden="false"]') != null) {
                        //hide image picker
                        var comunicator = Comunicator();
                        comunicator.send({
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'winSetImagePickerOpen',
                                payload: JSON.stringify({ rowId: _this.targetRow.id, winId: _this.winId, value: false })
                            })
                        });
                    }
                    //if clicked on menu tool button
                    if (document.querySelector('menumodal[hidden="false"]') != null) {
                        var comunicator = Comunicator();
                        comunicator.send({
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'winSetProp',
                                payload: JSON.stringify({ winId: _this.winId, key: 'isMenuOpen', value: false })
                            })
                        });
                    }
                    //if settings is open
                    if (document.querySelector('settingsmodal[hidden="false"]') != null && _e.path.filter(function (_el) { return _el.tagName == 'SETTINGSMODAL'; }).length == 0) {
                        var comunicator = Comunicator();
                        comunicator.send({
                            command: 'dispachAction',
                            payload: JSON.stringify({
                                action: 'winSetProp',
                                payload: JSON.stringify({ winId: _this.winId, key: 'isSettingOpen', value: false })
                            })
                        });
                    }
                };
                document.body.onkeyup = function (_e) {
                    if (_e.path.find(function (_el) { return _el.tagName == 'INPUT'; })) {
                        return 0;
                    }
                    var _ctrl = _e.ctrlKey;
                    var _shift = _e.shiftKey;
                    var _click = function (_selector) {
                        if (!_selector) {
                            return 0;
                        }
                        var target = document.querySelector(_selector);
                        target.click();
                    };
                    switch (_e.key) {
                        case 'm':
                            _click('toolmenu');
                            break;
                        case 'p':
                            _click('toolpauseall');
                            break;
                        case 'f':
                            _click('toolfullscreen');
                            break;
                        case 'n':
                            if (_ctrl) {
                                _click('toolnewrow');
                            }
                            break;
                        case 'N':
                            if (_ctrl && _shift) {
                                _click('menuoption.newwin');
                            }
                            break;
                        case 'D':
                            if (_ctrl && _shift) {
                                _click('menuoption.dupwin');
                            }
                            break;
                        case 's':
                            if (_ctrl) {
                                _click('menuoption.configexport');
                            }
                            break;
                        case 'o':
                            if (_ctrl) {
                                _click('menuoption.configimport');
                            }
                            break;
                        case 'a':
                            if (_ctrl) {
                                document.querySelectorAll('row').forEach(function (_r) { _r.click(); });
                            }
                            else {
                                _click('toolunalarm');
                            }
                            break;
                        case 'h':
                            if (_ctrl) {
                                var comunicator = Comunicator();
                                comunicator.send({
                                    command: 'dispachAction',
                                    payload: JSON.stringify({
                                        action: 'rowClearAllHistory',
                                        payload: JSON.stringify({ monitorId: _state.subscriptionKey })
                                    })
                                });
                            }
                            break;
                    }
                };
                document.body.onwheel = function (_e) {
                    if (_e.ctrlKey) {
                        if (_e.deltaY > 0) { //up
                            webFrame.setZoomFactor(webFrame.getZoomFactor() * 1.02);
                        }
                        else { //down
                            webFrame.setZoomFactor(webFrame.getZoomFactor() / 1.02);
                        }
                    }
                };
            }
            else {
                var _changeHtmlIfNedded_1 = function (selector, value) {
                    if (document.querySelector(selector).innerHTML != value) {
                        document.querySelector(selector).innerHTML = value;
                    }
                };
                var _chageAttrIfNeeded_1 = function (_b) {
                    var selector = _b.selector, key = _b.key, value = _b.value;
                    if (document.querySelector(selector) == null) {
                        console.warn('selector to change attr not found');
                        return 0;
                    }
                    if (document.querySelector(selector).getAttribute(key) != value) {
                        document.querySelector(selector).setAttribute(key, value);
                    }
                };
                var _checkToolButtons_1 = function (_focus) {
                    if (_focus === void 0) { _focus = 'all'; }
                    //hiding if paused
                    if (['all', 'pause'].includes(_focus)) {
                        var _unpausedRows = _state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isPaused\":false") > -1; });
                        if (typeof _unpausedRows == "undefined") {
                            return 0;
                        }
                        if (_unpausedRows.length > 0) {
                            _chageAttrIfNeeded_1({ selector: 'toolpauseall', key: 'hidden', value: 'false' });
                        }
                        else {
                            _chageAttrIfNeeded_1({ selector: 'toolpauseall', key: 'hidden', value: 'true' });
                        }
                    }
                    //hiding unalarm button
                    if (['all', 'alarm'].includes(_focus)) {
                        var _alarmedRows = _state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isAlarmed\":true") > -1; });
                        if (typeof _alarmedRows == "undefined") {
                            return 0;
                        }
                        if (_alarmedRows.length > 0) {
                            _chageAttrIfNeeded_1({ selector: 'toolunalarm', key: 'hidden', value: 'false' });
                        }
                        else {
                            _chageAttrIfNeeded_1({ selector: 'toolunalarm', key: 'hidden', value: 'true' });
                        }
                    }
                    if (['all', 'menu'].includes(_focus)) {
                        var _isMenuOpen = _state.isMenuOpen;
                        if (typeof _isMenuOpen == "undefined") {
                            return 0;
                        }
                        var _menuButtonDom = document.querySelector('toolmenu');
                        if (_isMenuOpen) {
                            _menuButtonDom.innerHTML = 'close';
                        }
                        else {
                            _menuButtonDom.innerHTML = 'menu';
                        }
                    }
                };
                var _renderMainGroup_1 = function (diffUnit) {
                    switch (diffUnit.key) {
                        case 'isMenuOpen':
                            document.querySelector('menumodal').setAttribute('hidden', String(diffUnit.value == false));
                            _checkToolButtons_1('menu');
                            break;
                        case 'isSettingOpen':
                            document.querySelector('settingsmodal').setAttribute('hidden', String(diffUnit.value == false));
                            if (diffUnit.value) {
                                var comunicator = Comunicator();
                                comunicator.send({
                                    command: 'getConfigData',
                                    payload: _this.winId
                                });
                            }
                            break;
                        case 'isImagePickerOpen':
                            document.querySelector('imgpickermodal').setAttribute('hidden', String(diffUnit.value == false));
                            if (!diffUnit.value) {
                                break;
                            }
                            var _targetRowObj = _state.monitor.rows.find(function (_r) { return _r.indexOf("\"fieldEditing\":\"image\"") > -1; });
                            if (typeof _targetRowObj != 'undefined') {
                                var _targetRowId = JSON.parse(_targetRowObj).rowId;
                                document.querySelector('imgpickermodal').setAttribute('targetRow', _targetRowId);
                            }
                            break;
                        case 'isFullscreen':
                            diffUnit.value ? document.documentElement.requestFullscreen() : document.exitFullscreen ? document.fullscreenElement ? document.exitFullscreen() : 0 : 0;
                            break;
                        case 'title':
                            document.querySelector('title').innerHTML = diffUnit.value;
                        case 'imagesList': break;
                        case 'langCode':
                            if (diffUnit.value != _this.appConfig.langCode) {
                                var comunicator = Comunicator();
                                comunicator.send({
                                    command: 'getConfigData',
                                    payload: _this.winId
                                });
                            }
                            break;
                        default:
                            console.error('Unknown main group diffUnit:', diffUnit);
                    }
                    if (diffUnit.key == 'imagesList') {
                        var _imagePickerModal_1 = document.querySelector('imgpickermodal');
                        _imagePickerModal_1.innerHTML = '';
                        diffUnit.value.forEach(function (_linkStr) {
                            _imagePickerModal_1.append(_getImagePickerImageDom_1({ _imageLink: _linkStr }));
                        });
                    }
                };
                var _renderListGroup_1 = function (diffUnit) {
                    switch (diffUnit.key) {
                        //add row
                        case 'new_row':
                            var list = document.querySelector('list');
                            var _newRowObj = JSON.parse(diffUnit.value);
                            list.append(_createRowDOM_1(_newRowObj));
                            break;
                        //remove row
                        case 'remove_row':
                            var rowObj = JSON.parse(diffUnit.value);
                            var neededDom = document.querySelector("row[id=\"".concat(rowObj.rowId, "\"]"));
                            neededDom.parentNode.removeChild(neededDom);
                            break;
                        case 'recreateByPosition':
                            //get rowsObj[]
                            var _recreationRowsObjList = diffUnit.value.map(function (_rs) { return JSON.parse(_rs); });
                            //sort by position
                            _recreationRowsObjList.sort(function (_r1, _r2) {
                                return _r1.position < _r2.position ? -1 : 1;
                            });
                            var _rowListForRecreation_1 = document.querySelector('list');
                            _rowListForRecreation_1.innerHTML = '';
                            _recreationRowsObjList.forEach(function (_ro) {
                                _rowListForRecreation_1.append(_createRowDOM_1(_ro));
                            });
                            break;
                        default:
                            console.error('Unknown list group diffUnit', diffUnit);
                    }
                    _checkToolButtons_1();
                };
                var _renderRowGroup_1 = function (diffUnit) {
                    var targetRowDom = document.querySelector("row[id=\"".concat(diffUnit.id, "\"]"));
                    var targetRowObj = JSON.parse(_state.monitor.rows.find(function (_r) { return _r.indexOf("\"rowId\":".concat(diffUnit.id)) > -1; }));
                    var _updateInputElement = function (_b) {
                        var _selector = _b._selector, _value = _b._value;
                        var _newInputValue = _value;
                        var _inputTarget = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] ").concat(_selector));
                        if (_inputTarget == null) {
                            console.warn("Can't find row[id=\"".concat(diffUnit.id, "\"] ").concat(_selector));
                            return 0;
                        }
                        if (targetRowObj.fieldEditing !== 'updateTime' && _selector == '.trioupdate') {
                            _newInputValue = (_newInputValue / 1000) + _this.t('s');
                        }
                        _inputTarget.value = _newInputValue;
                    };
                    var _renderCol2 = function (_b) {
                        var diffUnit = _b.diffUnit;
                        //check size
                        var _col2DOM = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] col2"));
                        if (['2Small', '4Middle', '6Big'].includes(targetRowObj.size)) {
                            if (_col2DOM == null) {
                                //we need to create col2
                                targetRowDom.append(_getCol2Content_1(targetRowObj.history, targetRowObj.updateTimeMS, diffUnit.id));
                            }
                            else {
                                //we just need to rerender values
                            }
                        }
                        else {
                            //do we need to remove col
                            if (_col2DOM != null) {
                                _col2DOM.parentNode.removeChild(_col2DOM);
                            }
                        }
                    };
                    var _renderCol3 = function (_b) {
                        var diffUnit = _b.diffUnit;
                        var _col3DOM = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] col3"));
                        if (['4Middle', '6Big'].includes(targetRowObj.size)) {
                            if (_col3DOM == null) {
                                targetRowDom.append(_getCol3Content_1(targetRowObj.history, diffUnit.id));
                            }
                            _checkGraph(diffUnit);
                        }
                        else {
                            if (_col3DOM != null) {
                                _col3DOM.parentNode.removeChild(_col3DOM);
                            }
                        }
                    };
                    var _renderCol4 = function (_b) {
                        var diffUnit = _b.diffUnit;
                        var _col4DOM = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] col4"));
                        if (['6Big'].includes(targetRowObj.size)) {
                            if (_col4DOM == null) {
                                targetRowDom.append(_getCol4Content_1(targetRowObj.history, diffUnit.id));
                            }
                            else {
                                _col4DOM.parentNode.removeChild(_col4DOM);
                                targetRowDom.append(_getCol4Content_1(targetRowObj.history, diffUnit.id));
                            }
                        }
                        else {
                            if (_col4DOM != null) {
                                _col4DOM.parentNode.removeChild(_col4DOM);
                            }
                        }
                    };
                    var _checkGraph = function (_diffUnit) {
                        if (document.querySelector("row[id=\"".concat(_diffUnit.id, "\"] path")) != null) {
                            var _svgDom = document.querySelector("row[id=\"".concat(_diffUnit.id, "\"] svg"));
                            var _svgWidth = _svgDom.clientWidth;
                            var _svgHeight = _svgDom.clientHeight;
                            if (_svgDom.getAttribute('viewBox') != "0 0 ".concat(_svgWidth, " ").concat(_svgHeight)) {
                                _svgDom.setAttribute('viewBox', "0 0 ".concat(_svgWidth, " ").concat(_svgHeight));
                            }
                            document.querySelector("row[id=\"".concat(_diffUnit.id, "\"] path")).setAttribute('d', _getPath_1({ dataArray: targetRowObj.history, width: _svgWidth, height: _svgHeight, length: _this.appConfig.miniGraphShowLimitMINS }));
                        }
                    };
                    var _checkStats = function (_diffUnit) {
                        //do we need to add to log
                        //do we need to change statusList
                        _renderCol4({ diffUnit: _diffUnit });
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
                                if (document.querySelector(_selector) != null)
                                    document.querySelector(_selector).classList.add('disabled');
                            };
                            ['.name', '.address', '.trioupdate'].forEach(function (_selector) {
                                _removeInput_1(_selector);
                                if (_selector == '.trioupdate' && targetRowObj.size != '1Little') {
                                    _updateInputElement({ _selector: _selector, _value: targetRowObj['updateTimeMS'] });
                                }
                            });
                        }
                    }
                    if (diffUnit.key == 'size') {
                        targetRowDom.setAttribute('size', diffUnit.value);
                        //do we need to create it to remove it to update it
                        _renderCol2({ diffUnit: diffUnit }); //status
                        _renderCol3({ diffUnit: diffUnit }); //graph
                        _renderCol4({ diffUnit: diffUnit }); //statistics
                    }
                    if (diffUnit.key == 'history') {
                        //status, dellay, quality, graph
                        var status_1 = diffUnit.value.status;
                        document.querySelector("row[id=\"".concat(diffUnit.id, "\"]")).setAttribute('status', status_1);
                        if (targetRowObj.size != '1Little') {
                            var dellayMS = diffUnit.value.dellayMS;
                            var quality = diffUnit.value.quality;
                            _changeHtmlIfNedded_1("row[id=\"".concat(diffUnit.id, "\"] col2 status"), _this.t(status_1));
                            _changeHtmlIfNedded_1("row[id=\"".concat(diffUnit.id, "\"] col2 trio triodelay"), "".concat(dellayMS).concat(_this.t('ms')));
                            _changeHtmlIfNedded_1("row[id=\"".concat(diffUnit.id, "\"] col2 trio trioquality"), "".concat(quality, "%"));
                        }
                        if (['4Middle', '6Big'].includes(targetRowObj.size)) {
                            _checkGraph(diffUnit);
                        }
                        if (['6Big'].includes(targetRowObj.size)) {
                            _checkGraph(diffUnit);
                            _checkStats(diffUnit);
                        }
                    }
                    switch (diffUnit.key) {
                        case 'isBusy':
                            targetRowDom.setAttribute('busy', diffUnit.value);
                            break;
                        case 'isPaused':
                            targetRowDom.setAttribute('paused', diffUnit.value);
                            _checkToolButtons_1('pause');
                            break;
                        case 'isSelected':
                            targetRowDom.setAttribute('selected', diffUnit.value);
                            break;
                        case 'isAlarmed':
                            targetRowDom.setAttribute('alarmed', diffUnit.value);
                            _checkToolButtons_1('alarm');
                            break;
                        case 'isMuted':
                            targetRowDom.setAttribute('muted', diffUnit.value);
                            break;
                        case 'imageLink':
                            var _pictureTarget = document.querySelector("row[id=\"".concat(diffUnit.id, "\"] pic"));
                            _pictureTarget.setAttribute('style', "background-image: url('".concat(_this.isProduction ? '../../' : '', "assets/icons/").concat(diffUnit.value, "')"));
                            break;
                        case 'name':
                            _updateInputElement({ _selector: '.name', _value: diffUnit.value });
                            break;
                        case 'ipAddress':
                            _updateInputElement({ _selector: '.address', _value: diffUnit.value });
                            break;
                        case 'updateTimeMS':
                            _updateInputElement({ _selector: '.trioupdate', _value: diffUnit.value });
                            break;
                    }
                };
                difference.forEach(function (_dif) {
                    if (_dif.selector == 'main') {
                        _renderMainGroup_1(_dif);
                    }
                    else if (_dif.selector == 'list') {
                        _renderListGroup_1(_dif);
                    }
                    else if (_dif.selector == 'row') {
                        _renderRowGroup_1(_dif);
                    }
                });
            }
            if (_state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isAlarmed\":true") > -1; }).length > 0) {
                _this.siren.start();
            }
            else {
                _this.siren.stop();
            }
        }
        catch (err) {
            console.error("State", _state);
            alert("Unable to render new state\n".concat(err));
        }
    };
    return _this;
};
var ipcRenderer = require('electron').ipcRenderer;
var Comunicator = function () {
    _this.send = function (_b) {
        var command = _b.command, payload = _b.payload;
        try {
            ipcRenderer.invoke('window', { command: command, payload: payload });
        }
        catch (err) {
            console.error("Command:".concat(command, "\nPayload:").concat(payload));
            alert("Cant send message by communicator\nError:".concat(err));
        }
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
var Siren = function () {
    _this.dom = document.querySelector('audio');
    _this.playState = false;
    _this.start = function () {
        if (_this.isProduction) {
            var _link = _this.dom.getAttribute('src');
            if (_link.indexOf('../../') == -1) {
                _this.dom.setAttribute("src", "../../".concat(_link));
            }
        }
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
                setTimeout(function () {
                    _this.volumeUp();
                }, 1000);
            }
        }
    };
    return _this;
};
var ContextMenu = function () {
    _this.isShown = false;
    _this.targetRow = '';
    _this.x = 0;
    _this.y = 0;
    _this.setContextMenuParam = function (_key, _value) {
        if (typeof _this[_key] != 'undefined') {
            if (_key == 'targetRow') {
                if (_value.id != _this[_key].id) {
                    _this[_key] = _value;
                    _this.renderContextMenu(_key);
                }
            }
            else if (_this[_key] != _value) {
                _this[_key] = _value;
                _this.renderContextMenu(_key);
            }
        }
    };
    _this.renderContextMenu = function (_param) {
        try {
            //create dom element if not existed
            if (document.querySelector('contextmenu') == null) {
                var rootDom = document.querySelector('.root');
                var newContextDom = document.createElement('contextmenu');
                newContextDom.setAttribute('shown', _this.isShown);
                rootDom.appendChild(newContextDom);
            }
            var contextDom = document.querySelector('contextmenu');
            var _renderOptions = function () {
                var _setEventListener = function (_domEl, _action) {
                    _domEl.onclick = function () {
                        var comunicator = Comunicator();
                        var _selectedRows = _this.state.monitor.rows.filter(function (_r) { return _r.indexOf("\"isSelected\":true") > -1; }).map(function (_r) { return JSON.parse(_r); });
                        if (_selectedRows.length > 0) {
                            _selectedRows.forEach(function (_sr) {
                                if (typeof _action.rowId != undefined) {
                                    var _newAction = JSON.parse(JSON.stringify(_action).replace(/\\{0,5}"rowId\\{0,5}":\\{0,5}"[\d]{4}.[\d]{6}\\{0,5}"/, "\\\\\\\"rowId\\\\\\\":\\\\\\\"".concat(_sr.rowId, "\\\\\\\"")));
                                    comunicator.send(_newAction);
                                }
                            });
                        }
                        else {
                            comunicator.send(_action);
                        }
                        contextMenu.hideContextMenu();
                    };
                    _domEl.onkeyup = function (_e) {
                        if (_e.key == 'Enter' || _e.key == ' ') {
                            _e.preventDefault();
                            _e.target.click();
                        }
                    };
                    return _domEl;
                };
                if (_this.targetRow) {
                    var _isPausedFlag = _this.targetRow.getAttribute('paused') == 'true' ? true : false;
                    var _isMutedFlag = _this.targetRow.getAttribute('muted') == 'true' ? true : false;
                    var _isAlarmedFlag = _this.targetRow.getAttribute('alarmed') == 'true' ? true : false;
                    var _targetRowSize_1 = _this.targetRow.getAttribute('size');
                    var options_1 = [];
                    if (_isAlarmedFlag) {
                        options_1.push({
                            name: 'Unalarm',
                            icon: 'notifications_off',
                            width: '100%',
                            action: {
                                command: 'dispachAction',
                                payload: JSON.stringify({
                                    action: 'rowSetProp',
                                    payload: JSON.stringify({ rowId: _this.targetRow.id, key: 'isAlarmed', value: false })
                                })
                            }
                        });
                    }
                    options_1 = __spreadArray(__spreadArray([], options_1, true), [
                        {
                            name: _isPausedFlag ? 'Start' : 'Pause',
                            icon: _isPausedFlag ? 'play_arrow' : 'pause',
                            width: '100%',
                            action: {
                                command: 'dispachAction',
                                payload: JSON.stringify({
                                    action: 'rowToggleProp',
                                    payload: JSON.stringify({ rowId: _this.targetRow.id, key: 'isPaused' })
                                })
                            }
                        },
                        {
                            name: 'Remove',
                            icon: 'delete',
                            width: '100%',
                            action: {
                                command: 'dispachAction',
                                payload: JSON.stringify({
                                    action: 'removeRow',
                                    payload: JSON.stringify({ rowId: _this.targetRow.id })
                                })
                            }
                        },
                        {
                            name: _isMutedFlag ? 'Unmute' : 'Mute',
                            icon: _isMutedFlag ? 'volume_up' : 'volume_off',
                            width: '100%',
                            action: {
                                command: 'dispachAction',
                                payload: JSON.stringify({
                                    action: 'rowToggleProp',
                                    payload: JSON.stringify({ rowId: _this.targetRow.id, key: 'isMuted' })
                                })
                            }
                        },
                        {
                            name: 'Change picture',
                            icon: 'wallpaper',
                            width: '100%',
                            action: {
                                command: 'dispachAction',
                                payload: JSON.stringify({
                                    action: 'winSetImagePickerOpen',
                                    payload: JSON.stringify({ rowId: _this.targetRow.id, winId: _this.winId, value: true })
                                })
                            }
                        }
                    ], false);
                    var _numberOfSelected_1 = document.querySelectorAll('row[selected="true"]').length;
                    ['1Little', '2Small', '4Middle', '6Big'].forEach(function (_sz) {
                        if (_targetRowSize_1 != _sz || _numberOfSelected_1 > 0) {
                            options_1.push({
                                name: '',
                                icon: "filter_".concat(_sz.substring(0, 1)),
                                width: _numberOfSelected_1 > 0 ? '25%' : '33%',
                                action: {
                                    command: 'dispachAction',
                                    payload: JSON.stringify({
                                        action: 'rowSetProp',
                                        payload: JSON.stringify({ rowId: _this.targetRow.id, key: 'size', value: _sz })
                                    })
                                }
                            });
                        }
                    });
                    var _contextMenuDom_1 = document.querySelector('contextmenu');
                    _contextMenuDom_1.innerHTML = '';
                    if (_numberOfSelected_1 > 0) {
                        var _contextTitleDom = document.createElement('contexttitle');
                        var _titleOfSelected = function (_num) {
                            var _ret = 'row';
                            if (_num > 1) {
                                _ret = 'rows';
                            }
                            else if (_num > 4) {
                                _ret = 'rows';
                            }
                            return _ret;
                        };
                        _contextTitleDom.innerHTML = "".concat(_numberOfSelected_1, " ").concat(_titleOfSelected(_numberOfSelected_1));
                        _contextMenuDom_1.append(_contextTitleDom);
                    }
                    options_1.forEach(function (_opt) {
                        var _contextOptionDom = document.createElement('option');
                        _contextOptionDom.innerHTML = "".concat(_this.t(_opt.name));
                        _contextOptionDom.style.setProperty('--icon-name', "'".concat(_opt.icon, "'"));
                        _contextOptionDom.style.setProperty('--option-width', _opt.width);
                        _contextOptionDom.setAttribute('tabindex', '5');
                        _contextOptionDom = _setEventListener(_contextOptionDom, _opt.action);
                        _contextMenuDom_1.append(_contextOptionDom);
                    });
                }
                //TODO GET CONTEXT SIZE maybe we need to chage x or y to fit to screen
            };
            switch (_param) {
                case 'isShown':
                    contextDom.setAttribute('shown', _this.isShown);
                    _renderOptions();
                    break;
                case 'x':
                    var _cWidth = contextDom.clientWidth;
                    var _pageWidth = window.window.innerWidth;
                    var _definateX = _this.x;
                    if (_definateX + _cWidth > _pageWidth) {
                        _definateX = _pageWidth - _cWidth;
                    }
                    contextDom.style.setProperty('--c-x', _definateX);
                    break;
                case 'y':
                    var _cHeight = contextDom.clientWidth;
                    var _pageHeight = window.window.innerHeight + window.window.scrollY;
                    var _definateY = _this.y;
                    if (_definateY + _cHeight > _pageHeight) {
                        _definateY = _pageHeight - _cHeight;
                    }
                    contextDom.style.setProperty('--c-y', _definateY);
                case 'targetRow':
                    _renderOptions();
                    break;
            }
        }
        catch (err) {
            console.log("Cant render contextMenu", _param);
            alert("Cant render contextMenu ".concat(_param));
        }
    };
    _this.show = function (_e) {
        if (_this.isShown) {
            _this.hideContextMenu();
        }
        var targetRow = _e.path.find(function (_el) { return _el.tagName == 'ROW'; });
        var targetX = _e.clientX ? _e.clientX + window.scrollX : targetRow.offsetLeft + window.scrollX + 20;
        var targetY = _e.clientY ? _e.clientY + window.scrollY : targetRow.offsetTop + window.scrollY + 20;
        Object.entries({
            'x': targetX,
            'y': targetY,
            'targetRow': targetRow,
            'isShown': true
        }).forEach(function (_b) {
            var _k = _b[0], _v = _b[1];
            _this.setContextMenuParam(_k, _v);
        });
    };
    _this.hideContextMenu = function () {
        _this.setContextMenuParam('isShown', false);
    };
    return _this;
};
var pageStart = function () {
    var page;
    var comunicator = Comunicator();
    contextMenu = ContextMenu();
    comunicator.subscribe(function (_message) {
        if (_message.command == 'sendInitData') {
            var _plObj = JSON.parse(_message.payload);
            var _winId = _plObj.winId;
            page = Page(_winId);
            var _config = _plObj.configData;
            page.appConfig = _config;
            page.isProduction = _plObj.isProduction;
            comunicator.send({
                command: 'dispachAction',
                payload: JSON.stringify({
                    action: 'winToggleProp',
                    payload: JSON.stringify({ winId: page.winId, key: 'requestedUpdate', value: true })
                })
            });
        }
        if (_message.command == 'sendWinState') {
            if (page) {
                var _resivedStateObj = void 0;
                try {
                    _resivedStateObj = JSON.parse(_message.payload);
                }
                catch (e) {
                    console.error('Error: unable to parse resived state');
                }
                page.render(_resivedStateObj);
                //saving new state
                _this.state = _resivedStateObj;
            }
        }
    });
};
pageStart();
