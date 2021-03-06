var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var stateManager = /** @class */ (function () {
    function stateManager(data) {
        var _this = this;
        this.__subscribers = [];
        this.__history = [];
        this.__lastSave = new Date().getTime();
        this.__queue = [];
        this.__queueBusy = false;
        this.__getAppVersion = function () {
            return _this.__appVersion;
        };
        this.__getLangCode = function () { return __awaiter(_this, void 0, void 0, function () {
            var _LCRequest;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof this.__langCode == 'undefined')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.__config.getParam('langCode')];
                    case 1:
                        _LCRequest = _b.sent();
                        this.__langCode = _LCRequest.value;
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.__langCode];
                }
            });
        }); };
        this.__getImagesList = function () { return __awaiter(_this, void 0, void 0, function () {
            var _imgNames;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.__fileManager.getNames({ path: 'assets/icons', typeFilter: [{ name: '*', extensions: ['.png'] }] })];
                    case 1:
                        _imgNames = _b.sent();
                        if (_imgNames.success) {
                            return [2 /*return*/, _imgNames.payload.content];
                        }
                        else {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.__getInitialPingTimeStrategy = function () { return __awaiter(_this, void 0, void 0, function () {
            var _ret, _defaultPTS;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _ret = [];
                        return [4 /*yield*/, this.__config.getParam('defaultPingTimeStrategy')];
                    case 1:
                        _defaultPTS = _b.sent();
                        if (_defaultPTS.success) {
                            Object.entries(_defaultPTS.value).forEach(function (_b) {
                                var _k = _b[0], _v = _b[1];
                                _ret.push({
                                    conditions: {
                                        status: _k
                                    },
                                    updateTimeMS: _v
                                });
                            });
                        }
                        return [2 /*return*/, _ret];
                }
            });
        }); };
        this.__getInitialRowState = function (_b) {
            var _monitorId = _b._monitorId, _c = _b._position, _position = _c === void 0 ? 0 : _c, _name = _b._name, _updateTimeMS = _b._updateTimeMS, _ipAddress = _b._ipAddress, _size = _b._size, _imageLink = _b._imageLink, _isPaused = _b._isPaused, _isMuted = _b._isMuted;
            return __awaiter(_this, void 0, void 0, function () {
                var _ret;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _d = {
                                rowId: Number("".concat(_monitorId, ".").concat(this.__genId('row'))),
                                position: _position,
                                size: _size,
                                ipAddress: _ipAddress,
                                updateTimeMS: _updateTimeMS,
                                name: _name,
                                imageLink: _imageLink,
                                lastPinged: 0,
                                history: []
                            };
                            return [4 /*yield*/, this.__getInitialPingTimeStrategy()];
                        case 1:
                            _ret = (_d.pingTimeStrategy = _e.sent(),
                                _d.isBusy = false,
                                _d.isPaused = _isPaused,
                                _d.isPausedGrouped = false,
                                _d.isMuted = _isMuted,
                                _d.isAlarmed = false,
                                _d.isEditing = false,
                                _d.fieldEditing = 'none',
                                _d.isGraphSubscribed = false,
                                _d.isSelected = false,
                                _d);
                            return [2 /*return*/, JSON.stringify(_ret)];
                    }
                });
            });
        };
        this.__getAllWords = function (_code) { return __awaiter(_this, void 0, void 0, function () {
            var _wordsList;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.__fileManager.read({ path: "assets/local/".concat(_code, ".json"), openDialog: false })];
                    case 1:
                        _wordsList = _b.sent();
                        if (_wordsList.success) {
                            try {
                                return [2 /*return*/, JSON.parse(_wordsList.payload.content)];
                            }
                            catch (er) { }
                        }
                        return [2 /*return*/, {}];
                }
            });
        }); };
        this.__getInitialWindow = function (_appVersion, _appLangCode, _parameters) {
            if (_parameters === void 0) { _parameters = {}; }
            return __awaiter(_this, void 0, void 0, function () {
                var _winData;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = {
                                version: _appVersion,
                                langCode: _appLangCode
                            };
                            return [4 /*yield*/, this.__getAllWords(_appLangCode)];
                        case 1:
                            _b.langWords = _c.sent();
                            return [4 /*yield*/, this.__getImagesList()];
                        case 2:
                            _winData = (_b.imagesList = _c.sent(),
                                _b.winId = this.__genId('window'),
                                _b.subscriptionKey = -1,
                                _b.title = "Ping monitor ".concat(_appVersion),
                                _b.isGraph = false,
                                _b.isHidden = false,
                                _b.isFullscreen = false,
                                _b.isMenuOpen = false,
                                _b.isSettingOpen = false,
                                _b.isImagePickerOpen = false,
                                _b.requestedUpdate = false,
                                _b.monitor = {},
                                _b);
                            if (Object.entries(_parameters).length > 0) {
                                Object.entries(_parameters).forEach(function (_b) {
                                    var _key = _b[0], _value = _b[1];
                                    _winData[_key] = _value;
                                });
                            }
                            return [2 /*return*/, JSON.stringify(_winData)];
                    }
                });
            });
        };
        this.__getInitialCoreState = function () { return __awaiter(_this, void 0, void 0, function () {
            var _appVersion, _appLangCode, _initialMonitorId1, _initValues, _initialColorMode, _initialColorModeRequest, _initialValuesRequest;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _appVersion = this.__getAppVersion();
                        return [4 /*yield*/, this.__getLangCode()];
                    case 1:
                        _appLangCode = _d.sent();
                        _initialMonitorId1 = this.__genId('monitor');
                        _initValues = {
                            _monitorId: _initialMonitorId1
                        };
                        _initialColorMode = 'dark';
                        return [4 /*yield*/, this.__config.getParam('colorMode')];
                    case 2:
                        _initialColorModeRequest = _d.sent();
                        _initialColorModeRequest.success ? _initialColorMode = _initialColorModeRequest.value : 0;
                        return [4 /*yield*/, this.__config.getParam('initialRows')];
                    case 3:
                        _initialValuesRequest = _d.sent();
                        if (_initialValuesRequest.success) {
                            _initValues = {
                                _monitorId: _initialMonitorId1,
                                _name: _initialValuesRequest.value[0].name,
                                _updateTimeMS: _initialValuesRequest.value[0].updateTimeMS,
                                _ipAddress: _initialValuesRequest.value[0].address,
                                _size: _initialValuesRequest.value[0].size,
                                _imageLink: _initialValuesRequest.value[0].pictureLink,
                                _isPaused: _initialValuesRequest.value[0].isPaused,
                                _isMuted: _initialValuesRequest.value[0].isMuted
                            };
                        }
                        _b = {
                            version: _appVersion,
                            langCode: _appLangCode,
                            langWords: [{}],
                            colorMode: _initialColorMode
                        };
                        _c = {
                            monitorId: _initialMonitorId1
                        };
                        return [4 /*yield*/, this.__getInitialRowState(_initValues)];
                    case 4: return [2 /*return*/, (_b.monitors = [
                            (_c.rows = [
                                _d.sent()
                            ],
                                _c)
                        ],
                            _b.windows = [],
                            _b.propertyForTesting = 0,
                            _b)];
                }
            });
        }); };
        this.__stateNow = function () { return __awaiter(_this, void 0, void 0, function () {
            var _reply, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(typeof this.__state !== 'undefined')) return [3 /*break*/, 1];
                        _reply = JSON.stringify(__assign({}, this.__state));
                        return [3 /*break*/, 3];
                    case 1:
                        _c = (_b = JSON).stringify;
                        return [4 /*yield*/, this.__getInitialCoreState()];
                    case 2:
                        _reply = _c.apply(_b, [_d.sent()]);
                        _d.label = 3;
                    case 3: return [2 /*return*/, JSON.parse(_reply)];
                }
            });
        }); };
        this.__userLogger = function (_b) {
            var name = _b.name, text = _b.text, indent = _b.indent;
            return __awaiter(_this, void 0, void 0, function () {
                var _indent, _addZero, _dateNow, _exportResult;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _indent = function (_len) {
                                if (_len === void 0) { _len = 0; }
                                var _ret = '                ';
                                var _ind = '';
                                var _step = ' ';
                                for (var _j = 0; _j < 40; _j++) {
                                    _ind += _step;
                                }
                                for (var _k = 0; _k < _len; _k++) {
                                    _ret += _ind;
                                }
                                return _ret;
                            };
                            _addZero = function (_num) {
                                return Number(parseInt(_num)) < 10 ? "0".concat(_num) : "".concat(_num);
                            };
                            _dateNow = new Date();
                            return [4 /*yield*/, this.__fileManager.write({
                                    openDialog: false,
                                    path: "".concat(name, ".txt"),
                                    content: "".concat(_dateNow.getFullYear(), "-").concat(_addZero(_dateNow.getMonth() + 1), "-").concat(_addZero(_dateNow.getDate()), " ").concat(_addZero(_dateNow.getHours()), "-").concat(_addZero(_dateNow.getMinutes()), "-").concat(_addZero(_dateNow.getSeconds())).concat(_indent(indent)).concat(text, "\n"),
                                    append: true
                                })];
                        case 1:
                            _exportResult = _c.sent();
                            if (!_exportResult.success) {
                                this.dialog.showErrorBox('Error', "Unable to write user logger\nError:".concat(_exportResult.errorMessage));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.__reduce = function (_state, action) { return __awaiter(_this, void 0, void 0, function () {
            var _configState, __newRow, __newMonitor, __validateInputs, __getRow, _rowInfo, _newMonitors, _neededMonitorIndex, _newWindowsStr, _newWindowsObj, _neededWindowIndex, _payloadObj, _reduceTime, _b, _newMon, isAutoSave, _dateNow, _exportTimeStamp, _modifiedState_1, _savePingHistory_1, _savePingHistoryRequest, _exportContent, _exportResult, isAutoOpen, _importResult, _openedStateStr, _openedStateObj, _langCode, _oneNewWindowStr, _winId_1, _newWords_1, _newWindows_1, _newRowElement, probeDetails, pingHistoryTimeLimitMINS, _ptsNeededStatus, lastNotOnlineProbeTime, i, timeToAlarmMS, _userLoggerRequest, _getTimeOfLastChange, _lastChangeData_1, _upperLimit, _prevUpdateTime, _currUpdateTime, _dateNow_1, _logNameDate, _logName, _logText, _logIndent, unmuteOnGettingOnline, _actualStatus_1, _unpausedIndexes_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.__config.getState()];
                    case 1:
                        _configState = _c.sent();
                        __newRow = function (_b /* MAY BE THERE SHOULD BE CUSTOM VALUES*/) {
                            var _state = _b._state, _monitorId = _b._monitorId, _c = _b._position, _position = _c === void 0 ? 0 : _c;
                            return __awaiter(_this, void 0, void 0, function () {
                                var _newRowRuleRequest, _name, _updateTimeMS, _ipAddress, _size, _imageLink, _isPaused, _isMuted, _targetMonitor, _lastRowDataArr, _lastRowDataObj, _defaultRowDataRequest;
                                return __generator(this, function (_d) {
                                    _newRowRuleRequest = _configState.newRowRule;
                                    switch (_newRowRuleRequest) {
                                        case 'copyPrev':
                                            _targetMonitor = _state.monitors.find(function (_m) { return _m.monitorId = _monitorId; });
                                            if (typeof _targetMonitor == 'undefined') {
                                                _targetMonitor = { rows: undefined };
                                            }
                                            if (typeof _targetMonitor.rows !== 'undefined') {
                                                _lastRowDataArr = _targetMonitor.rows.filter(function (_r, _i, _a) { return _i == _a.length - 1; });
                                                if (_lastRowDataArr.length > 0) {
                                                    _lastRowDataObj = JSON.parse(_lastRowDataArr);
                                                    _name = _lastRowDataObj.name;
                                                    _updateTimeMS = _lastRowDataObj.updateTimeMS;
                                                    _ipAddress = _lastRowDataObj.ipAddress;
                                                    _size = _lastRowDataObj.size;
                                                    _imageLink = _lastRowDataObj.imageLink;
                                                    _isPaused = _lastRowDataObj.isPaused;
                                                    _isMuted = _lastRowDataObj.isMuted;
                                                    break;
                                                }
                                            }
                                        default:
                                            _defaultRowDataRequest = _configState.defaultNewRow;
                                            _name = _defaultRowDataRequest.name;
                                            _updateTimeMS = _defaultRowDataRequest.updateTimeMS;
                                            _ipAddress = _defaultRowDataRequest.address;
                                            _size = _defaultRowDataRequest.size;
                                            _imageLink = _defaultRowDataRequest.pictureLink;
                                            _isPaused = _defaultRowDataRequest.isPaused;
                                            _isMuted = _defaultRowDataRequest.isMuted;
                                            break;
                                    }
                                    return [2 /*return*/, this.__getInitialRowState({
                                            _monitorId: _monitorId,
                                            _position: _position,
                                            _name: _name,
                                            _updateTimeMS: _updateTimeMS,
                                            _ipAddress: _ipAddress,
                                            _size: _size,
                                            _imageLink: _imageLink,
                                            _isMuted: _isMuted,
                                            _isPaused: _isPaused
                                        })];
                                });
                            });
                        };
                        __newMonitor = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _monitorId;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _monitorId = this.__genId('monitor');
                                        _b = { monitorId: _monitorId };
                                        return [4 /*yield*/, __newRow({ _state: _state, _monitorId: _monitorId })];
                                    case 1: return [2 /*return*/, (_b.rows = [_c.sent()], _b)];
                                }
                            });
                        }); };
                        __validateInputs = function (_payload, _targetInputsArray) {
                            var _ret = true;
                            if (typeof action.payload != 'string') {
                                console.error('Payload should be a JSON string');
                                _ret = false;
                            }
                            _targetInputsArray.forEach(function (_in) {
                                if (action.payload.indexOf("\"".concat(_in, "\":")) == -1) {
                                    _ret = false;
                                }
                            });
                            return _ret;
                        };
                        __getRow = function (_payloadStrJson, _monitors) {
                            var _plObj = JSON.parse(_payloadStrJson);
                            var _selMon = _monitors.find(function (_mon) { return _mon.monitorId == Number(_plObj.rowId.toString().split('.')[0]); });
                            if (typeof _selMon == 'undefined') {
                                return {
                                    success: false
                                };
                            }
                            var _monInd = _monitors.indexOf(_selMon);
                            var _rwStr = _selMon.rows.find(function (_row) { return _row.indexOf("\"rowId\":".concat(_plObj.rowId)) > -1; });
                            if (typeof _rwStr == 'undefined') {
                                return {
                                    success: false
                                };
                            }
                            var _rwInd = _selMon.rows.indexOf(_rwStr);
                            var _rwObj = JSON.parse(_rwStr);
                            return {
                                success: true,
                                payloadObj: _plObj,
                                monitorObj: _selMon,
                                monitorIndex: _monInd,
                                rowStr: _monInd,
                                rowIndex: _rwInd,
                                rowObj: _rwObj
                            };
                        };
                        _reduceTime = new Date().getTime();
                        _b = action.action;
                        switch (_b) {
                            case this.__actionTypes.SET_PROPERTY_FOR_TESTING: return [3 /*break*/, 2];
                            case this.__actionTypes.ADD_NEW_MONITOR: return [3 /*break*/, 3];
                            case this.__actionTypes.REMOVE_MONITOR_BY_ID: return [3 /*break*/, 5];
                            case this.__actionTypes.MONITOR_EXPORT_CONFIG: return [3 /*break*/, 6];
                            case this.__actionTypes.MONITOR_AUTOSAVE: return [3 /*break*/, 6];
                            case this.__actionTypes.MONITOR_IMPORT_CONFIG: return [3 /*break*/, 8];
                            case this.__actionTypes.MONITOR_AUTOOPEN: return [3 /*break*/, 8];
                            case this.__actionTypes.ADD_NEW_WINDOW_BY_SUBKEY: return [3 /*break*/, 10];
                            case this.__actionTypes.REMOVE_WINDOW_BY_ID: return [3 /*break*/, 13];
                            case this.__actionTypes.WIN_SET_PROP: return [3 /*break*/, 14];
                            case this.__actionTypes.WIN_TOGGLE_PROP: return [3 /*break*/, 15];
                            case this.__actionTypes.WIN_SET_IMAGE_PICKER_OPEN: return [3 /*break*/, 16];
                            case this.__actionTypes.WIN_WRITE_NEW_LANG_WORDS: return [3 /*break*/, 17];
                            case this.__actionTypes.ADD_ROW: return [3 /*break*/, 19];
                            case this.__actionTypes.REMOVE_ROW: return [3 /*break*/, 21];
                            case this.__actionTypes.ROW_SUBMIT_PING_PROBE: return [3 /*break*/, 22];
                            case this.__actionTypes.ROW_SET_PROP: return [3 /*break*/, 26];
                            case this.__actionTypes.ROW_TOGGLE_PROP: return [3 /*break*/, 27];
                            case this.__actionTypes.ROW_CLEAR_ALL_HISTORY: return [3 /*break*/, 28];
                            case this.__actionTypes.ROW_EDIT_PROP_SET: return [3 /*break*/, 29];
                            case this.__actionTypes.ROW_EDIT_PROP_REMOVE: return [3 /*break*/, 30];
                            case this.__actionTypes.ROW_PAUSE_ALL: return [3 /*break*/, 31];
                            case this.__actionTypes.ROW_UNALARM_ALL: return [3 /*break*/, 32];
                            case this.__actionTypes.ROW_UNSELECT_ALL: return [3 /*break*/, 33];
                        }
                        return [3 /*break*/, 34];
                    case 2:
                        _state = __assign(__assign({}, _state), { propertyForTesting: action.payload });
                        return [3 /*break*/, 35];
                    case 3:
                        _newMonitors = JSON.parse(JSON.stringify(_state.monitors));
                        return [4 /*yield*/, __newMonitor()];
                    case 4:
                        _newMon = _c.sent();
                        _newMonitors.push(_newMon);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 5:
                        _newMonitors = __spreadArray([], _state.monitors.filter(function (_m) { return _m.monitorId != action.payload; }), true);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 6:
                        isAutoSave = action.action === this.__actionTypes.MONITOR_AUTOSAVE;
                        if (isAutoSave && _state.monitors.length == 0) {
                            return [2 /*return*/, _state];
                        }
                        _dateNow = new Date();
                        _exportTimeStamp = "".concat(_dateNow.getFullYear(), "-").concat(_dateNow.getMonth() + 1, "-").concat(_dateNow.getDate(), " ").concat(_dateNow.getHours() + 1, "-").concat(_dateNow.getMinutes(), "-").concat(_dateNow.getSeconds());
                        isAutoSave ? _exportTimeStamp = 'Autosave' : null;
                        _modifiedState_1 = JSON.parse(JSON.stringify(_state));
                        _savePingHistory_1 = false;
                        _savePingHistoryRequest = _configState.savePingHistoryToConfig;
                        _savePingHistoryRequest ? _savePingHistory_1 = _savePingHistoryRequest : 0;
                        _modifiedState_1.monitors.forEach(function (_monit, _monitIndex) {
                            _monit.rows.forEach(function (_rowStr, _rowIndex) {
                                var _rowObg = JSON.parse(_rowStr);
                                var _modRowObg = {};
                                Object.entries(_rowObg).forEach(function (_b) {
                                    var _rok = _b[0], _rov = _b[1];
                                    if (!_savePingHistory_1 && _rok == 'history') {
                                        _modRowObg[_rok] = [];
                                    }
                                    else if (_rok == 'isBusy') {
                                        _modRowObg[_rok] = false;
                                        // }else if(_rok=='isPaused'){
                                        //     _modRowObg[_rok] = true
                                    }
                                    else {
                                        _modRowObg[_rok] = _rov;
                                    }
                                });
                                _modifiedState_1.monitors[_monitIndex].rows[_rowIndex] = JSON.stringify(_modRowObg);
                            });
                        });
                        _exportContent = JSON.stringify(_modifiedState_1, undefined, 4);
                        return [4 /*yield*/, this.__fileManager.write({
                                openDialog: !isAutoSave,
                                path: "PM Config ".concat(_exportTimeStamp, ".pm"),
                                dialogTile: "Save config",
                                content: _exportContent
                            })];
                    case 7:
                        _exportResult = _c.sent();
                        if (_exportResult.success) {
                            //do nothing or show little message
                        }
                        else {
                            this.__loger.out("Reducer error:MONITOR_EXPORT_CONFIG unable to write config ".concat(_exportResult));
                        }
                        return [3 /*break*/, 35];
                    case 8:
                        _newMonitors = __spreadArray([], _state.monitors.filter(function (_m) { return _m.monitorId != action.payload; }), true);
                        isAutoOpen = action.action === this.__actionTypes.MONITOR_AUTOOPEN;
                        return [4 /*yield*/, this.__fileManager.read({
                                openDialog: !isAutoOpen,
                                dialogTile: 'Save config',
                                path: isAutoOpen ? 'PM ConFig Autosave.pm' : ''
                            })];
                    case 9:
                        _importResult = _c.sent();
                        if (_importResult.success) {
                            _openedStateStr = _importResult.payload.content;
                            _openedStateObj = JSON.parse(_openedStateStr);
                            if (_openedStateObj.version == _state.version) {
                                _state = __assign({}, _openedStateObj);
                            }
                        }
                        else if (isAutoOpen && _importResult.errorMessage.includes('File is not exists at')) {
                            return [3 /*break*/, 35];
                        }
                        else {
                            this.__loger.out("Reducer error:MONITOR_IMPORT_CONFIG unable to read config ".concat(_importResult));
                        }
                        return [3 /*break*/, 35];
                    case 10:
                        if (typeof action.payload != 'string') {
                            this.__loger.out("Reducer error:".concat(action.action, " expected to recive subscriptionKey:string"));
                            return [3 /*break*/, 35];
                        }
                        return [4 /*yield*/, this.__getLangCode()];
                    case 11:
                        _langCode = _c.sent();
                        return [4 /*yield*/, this.__getInitialWindow(this.__getAppVersion(), _langCode, { subscriptionKey: action.payload })];
                    case 12:
                        _oneNewWindowStr = _c.sent();
                        _newWindowsStr = __spreadArray(__spreadArray([], _state.windows, true), [_oneNewWindowStr], false);
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        return [3 /*break*/, 35];
                    case 13:
                        if (typeof action.payload != 'string') {
                            this.__loger.out("Reducer error:".concat(action.action, " expected to recive winId:string in JSON format"));
                            return [3 /*break*/, 35];
                        }
                        _winId_1 = JSON.parse(action.payload).winId;
                        //going lazy way without parsing json string
                        _newWindowsStr = __spreadArray([], _state.windows.filter(function (_w) { return _w.indexOf("\"winId\":".concat(_winId_1)) == -1; }), true);
                        //check if we need to remove monitor
                        //if there are monitors without windows subscrubed to them filter them
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _newMonitors = _newMonitors.filter(function (_m) {
                            var _ret = true;
                            if (typeof _newWindowsStr.find(function (_w) { return _w.indexOf("\"subscriptionKey\":\"".concat(_m.monitorId, "\"")) > -1; }) == 'undefined') {
                                _ret = false;
                            }
                            return _ret;
                        });
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr, monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 14:
                        if (typeof action.payload != 'string') {
                            this.__loger.out("Reducer error:".concat(action.action, " expected to recive winId:string,key:string,value:string"));
                            return [3 /*break*/, 35];
                        }
                        _newWindowsStr = __spreadArray([], _state.windows, true);
                        _payloadObj = JSON.parse(action.payload);
                        _neededWindowIndex = _newWindowsStr.map(function (_w) {
                            return _w.indexOf("\"winId\":".concat(_payloadObj.winId)) > -1;
                        }).indexOf(true);
                        if (_neededWindowIndex == -1) {
                            this.__loger.out("Reducer error:".concat(action.action, " window with entered winId is not found"));
                            return [3 /*break*/, 35];
                        }
                        _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex]);
                        if (_newWindowsObj[_payloadObj.key] == _payloadObj.value) { // limits at least some duplicate values
                            return [3 /*break*/, 35];
                        }
                        _newWindowsObj[_payloadObj.key] = _payloadObj.value;
                        _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj);
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        return [3 /*break*/, 35];
                    case 15:
                        if (typeof action.payload != 'string') {
                            this.__loger.out("Reducer error:".concat(action.action, " expected to recive winId:string,key:string"));
                            return [3 /*break*/, 35];
                        }
                        _newWindowsStr = __spreadArray([], _state.windows, true);
                        _payloadObj = JSON.parse(action.payload);
                        _neededWindowIndex = _newWindowsStr.map(function (_w) {
                            return _w.includes("\"winId\":".concat(_payloadObj.winId));
                        }).indexOf(true);
                        if (_neededWindowIndex > -1) {
                            _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex]);
                            _newWindowsObj[_payloadObj.key] = !_newWindowsObj[_payloadObj.key];
                            _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj);
                            _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        }
                        return [3 /*break*/, 35];
                    case 16:
                        if (!__validateInputs(action.payload, ['rowId', 'winId', 'value'])) {
                            this.__loger.out("WIN_SET_IMAGE_PICKER_OPEN Error: expected to recive rowId,winId,value");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        //get window
                        _newWindowsStr = __spreadArray([], _state.windows, true);
                        _neededWindowIndex = _newWindowsStr.map(function (_w) {
                            return _w.indexOf("\"winId\":".concat(_payloadObj.winId)) > -1;
                        }).indexOf(true);
                        _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex]);
                        //get row
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        //set win.isIPOpen
                        _newWindowsObj.isImagePickerOpen = _payloadObj.value;
                        //set row.isEditing
                        //set row.editing field
                        _rowInfo.rowObj['isEditing'] = _rowInfo.payloadObj.value;
                        _rowInfo.rowObj['fieldEditing'] = _payloadObj.value ? 'image' : 'none';
                        //save new state
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors, windows: _newWindowsStr });
                        return [3 /*break*/, 35];
                    case 17: return [4 /*yield*/, this.__getAllWords(action.payload)];
                    case 18:
                        _newWords_1 = _c.sent();
                        _newWindows_1 = __spreadArray([], _state.windows, true);
                        _newWindows_1.forEach(function (_w, _wi) {
                            var _wObj = JSON.parse(_w);
                            _wObj.langCode = action.payload;
                            _wObj.langWords = _newWords_1;
                            _newWindows_1[_wi] = JSON.stringify(_wObj);
                        });
                        _state = __assign(__assign({}, _state), { windows: _newWindows_1 });
                        return [3 /*break*/, 35];
                    case 19:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            this.__loger.out("ADD_ROW Error: expected to recive monitorId");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        return [4 /*yield*/, __newRow({ _state: _state, _monitorId: _payloadObj.monitorId, _position: _newMonitors[_neededMonitorIndex].rows.length })];
                    case 20:
                        _newRowElement = _c.sent();
                        _newMonitors[_neededMonitorIndex].rows.push(_newRowElement);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 21:
                        if (!__validateInputs(action.payload, ['rowId'])) {
                            this.__loger.out("REMOVE_ROW Error: expected to recive rowId");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.rowId.split('.')[0];
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows = _newMonitors[_neededMonitorIndex].rows.filter(function (_rwStr) { return _rwStr.indexOf("\"rowId\":".concat(_payloadObj.rowId)) == -1; });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 22:
                        if (!__validateInputs(action.payload, ['rowId'])) {
                            this.__loger.out("ROW_SUBMIT_PING_PROBE Error: expected to recive rowId");
                            return [3 /*break*/, 35];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (!_rowInfo.success) {
                            this.__loger.out("ROW_SET_PROP Error: row was not found");
                            return [3 /*break*/, 35];
                        }
                        if (!_rowInfo.rowObj.isBusy) {
                            return [3 /*break*/, 35];
                        }
                        return [4 /*yield*/, this.__pinger.probe({ address: _rowInfo.rowObj.ipAddress, rowId: _rowInfo.rowObj.rowId })];
                    case 23:
                        probeDetails = _c.sent();
                        _payloadObj = {};
                        _payloadObj.status = probeDetails.payload.status;
                        _payloadObj.dellay = probeDetails.payload.dellay;
                        _payloadObj.ttl = probeDetails.payload.ttl;
                        _rowInfo.rowObj.isBusy = false;
                        _rowInfo.rowObj.lastPinged = _reduceTime;
                        // _payloadObj = JSON.parse(action.payload)
                        _rowInfo.rowObj.history.push({
                            t: _reduceTime,
                            s: _payloadObj.status,
                            d: _payloadObj.dellay,
                            tl: _payloadObj.ttl
                        });
                        pingHistoryTimeLimitMINS = _configState.pingHistoryTimeLimitMINS;
                        if ((_reduceTime - _rowInfo.rowObj.history[0].t) > pingHistoryTimeLimitMINS * 60 * 1000) {
                            _rowInfo.rowObj.history.shift();
                            //this duplication is for deliting speed faster than adding, if there is too much history
                            //TODO clear all trash in one probe, not two by one
                            if ((_reduceTime - _rowInfo.rowObj.history[0].t) > pingHistoryTimeLimitMINS * 60 * 1000) {
                                _rowInfo.rowObj.history.shift();
                            }
                        }
                        try {
                            _ptsNeededStatus = _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _payloadObj.status; });
                            if (_ptsNeededStatus != null) {
                                if (_ptsNeededStatus.updateTimeMS != _rowInfo.rowObj.updateTimeMS) {
                                    _rowInfo.rowObj.updateTimeMS = _ptsNeededStatus.updateTimeMS;
                                }
                            }
                            else {
                                //TODO add new PTS
                            }
                        }
                        catch (e) {
                            this.__loger.out("Reducer error: Unable to check update time conditions. Action: ".concat(action.action));
                        }
                        //do we need to turn on alarm
                        if (_payloadObj.status != 'online' && _rowInfo.rowObj.isMuted === false && _rowInfo.rowObj.isPaused === false) {
                            lastNotOnlineProbeTime = void 0;
                            i = _rowInfo.rowObj.history.length - 1;
                            while (_rowInfo.rowObj.history[i].s != 'online' && i > 0) {
                                lastNotOnlineProbeTime = _rowInfo.rowObj.history[i].t;
                                i--;
                            }
                            timeToAlarmMS = _configState.timeToAlarmMS;
                            if (_reduceTime - lastNotOnlineProbeTime >= timeToAlarmMS && _rowInfo.rowObj.history[_rowInfo.rowObj.history.length - 1].s != 'online') {
                                _rowInfo.rowObj.isAlarmed = true;
                            }
                        }
                        if (!(_rowInfo.rowObj.history.length > 1)) return [3 /*break*/, 25];
                        _userLoggerRequest = _configState.logSettings;
                        if (!_userLoggerRequest.logChanges) return [3 /*break*/, 25];
                        _getTimeOfLastChange = function (_hist) {
                            var _ret = {};
                            var _i = _hist.length - 1;
                            var _statusNow = _hist[_i].status;
                            while (_statusNow == _hist[_i].status && _i > 0) {
                                _i--;
                            }
                            if (_i != 0) {
                                _ret.time = new Date().getTime() - _hist[_i].timestamp;
                                _ret.from = _hist[_i];
                                _ret.to = _hist[_i + 1];
                            }
                            return _ret;
                        };
                        _lastChangeData_1 = _getTimeOfLastChange(_rowInfo.rowObj.history);
                        if (!(Object.keys(_lastChangeData_1).length != 0)) return [3 /*break*/, 25];
                        _upperLimit = _rowInfo.rowObj.updateTimeMS;
                        try {
                            _prevUpdateTime = _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _lastChangeData_1.from.status; }).updateTimeMS;
                            _currUpdateTime = _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _lastChangeData_1.to.status; }).updateTimeMS;
                            _upperLimit = _prevUpdateTime > _currUpdateTime ? _prevUpdateTime + 1000 : _currUpdateTime + 1000;
                        }
                        catch (e) { }
                        if (!(_lastChangeData_1.time > _userLoggerRequest.timeToLogStatusChangeMS &&
                            _lastChangeData_1.time < _userLoggerRequest.timeToLogStatusChangeMS + _upperLimit)) return [3 /*break*/, 25];
                        _dateNow_1 = new Date();
                        _logNameDate = _userLoggerRequest.newLogNameEveryday ? "".concat(_dateNow_1.getFullYear(), "-").concat(_dateNow_1.getMonth() + 1, "-").concat(_dateNow_1.getDate()) : " ";
                        _logName = "".concat(_userLoggerRequest.defaultLogName, " ").concat(_logNameDate);
                        _logText = "".concat(_rowInfo.rowObj.name, " ").concat(_lastChangeData_1.from.status, ">").concat(_lastChangeData_1.to.status);
                        _logIndent = _rowInfo.rowObj.position;
                        return [4 /*yield*/, this.__userLogger({ name: _logName, text: _logText, indent: _logIndent })];
                    case 24:
                        _c.sent();
                        _c.label = 25;
                    case 25:
                        //do we need to unmute
                        if (_rowInfo.rowObj.history.length > 1) {
                            if (_payloadObj.status == 'online' && _rowInfo.rowObj.history[_rowInfo.rowObj.history.length - 2].s != 'online') {
                                unmuteOnGettingOnline = _configState.unmuteOnGettingOnline;
                                if (unmuteOnGettingOnline && _rowInfo.rowObj.isMuted) {
                                    _rowInfo.rowObj.isMuted = false;
                                }
                            }
                        }
                        //save to state
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign({}, _state);
                        return [3 /*break*/, 35];
                    case 26:
                        if (!__validateInputs(action.payload, ['rowId', 'key', 'value'])) {
                            this.__loger.out("ROW_SET_PROP Error: expected to recive rowId,key and value");
                            return [3 /*break*/, 35];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (typeof _rowInfo.rowObj == 'undefined') {
                            return [3 /*break*/, 35];
                        }
                        if (typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined') {
                            this.__loger.out("ROW_SET_PROP error unknown key of the row. Key:".concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 35];
                        }
                        if (_rowInfo.rowObj[_rowInfo.payloadObj.key] === _rowInfo.payloadObj.value) {
                            this.__loger.out("ROW_SET_PROP warn value is already set. Key:".concat(_rowInfo.payloadObj.key, " Values:").concat(_rowInfo.rowObj[_rowInfo.payloadObj.key], ">>").concat(_rowInfo.payloadObj.value, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 35];
                        }
                        if (['name', 'address', 'updateTimeMS'].includes(_rowInfo.payloadObj.key)) {
                            if (_rowInfo.payloadObj.key == 'name') {
                                if (_rowInfo.payloadObj.value.length < 1 || _rowInfo.payloadObj.value.length > 20) {
                                    return [3 /*break*/, 35];
                                }
                            }
                            if (_rowInfo.payloadObj.key == 'address') {
                                if (_rowInfo.payloadObj.value.length < 1 || _rowInfo.payloadObj.value.length > 50) {
                                    return [3 /*break*/, 35];
                                }
                            }
                            if (_rowInfo.payloadObj.key == 'updateTimeMS') {
                                if (_rowInfo.payloadObj.value < 1000 || _rowInfo.payloadObj.value > 300000) {
                                    return [3 /*break*/, 35];
                                }
                                try {
                                    _actualStatus_1 = _rowInfo.rowObj.history[_rowInfo.rowObj.history.length - 1].s;
                                    _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _actualStatus_1; }).updateTimeMS = _rowInfo.payloadObj.value;
                                }
                                catch (e) {
                                    this.__loger.out("ROW_SET_PROP unable to write PTS Key:".concat(_rowInfo.payloadObj.key, " Values:").concat(_rowInfo.rowObj[_rowInfo.payloadObj.key], ">>").concat(_rowInfo.payloadObj.value, " RowId:").concat(_rowInfo.payloadObj.rowId));
                                }
                            }
                        }
                        _rowInfo.rowObj[_rowInfo.payloadObj.key] = _rowInfo.payloadObj.value;
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 27:
                        if (!__validateInputs(action.payload, ['rowId', 'key'])) {
                            this.__loger.out("ROW_TOGGLE_PROP Error: expected to recive rowId and key");
                            return [3 /*break*/, 35];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] === 'undefined') {
                            this.__loger.out("ROW_TOGGLE_PROP error unknown key of the row. Key:".concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 35];
                        }
                        _rowInfo.rowObj[_rowInfo.payloadObj.key] = !_rowInfo.rowObj[_rowInfo.payloadObj.key];
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 28:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            this.__loger.out("ROW_CLEAR_ALL_HISTORY Error: expected to recive monitorId");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                            var _rowObj = JSON.parse(_rowStr);
                            if (_rowObj.history.length > 0) {
                                _rowObj.history = [];
                                _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                            }
                        });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 29:
                        if (!__validateInputs(action.payload, ['rowId', 'key'])) {
                            this.__loger.out("ROW_EDIT_PROP_SET Error: expected to recive rowId,key");
                            return [3 /*break*/, 35];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (!['name', 'address', 'updatetime', 'image'].includes(_rowInfo.payloadObj.key)) {
                            this.__loger.out("ROW_EDIT_PROP_SET error unknown key(".concat(_rowInfo.payloadObj.key, "). Key:").concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 35];
                        }
                        if (!_rowInfo.rowObj['isEditing']) {
                            _rowInfo.rowObj['isEditing'] = true;
                            _rowInfo.rowObj['fieldEditing'] = _rowInfo.payloadObj.key;
                            _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                            _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                            _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        }
                        return [3 /*break*/, 35];
                    case 30:
                        if (!__validateInputs(action.payload, ['rowId', 'key'])) {
                            this.__loger.out("ROW_EDIT_PROP_REMOVE Error: expected to recive rowId,key");
                            return [3 /*break*/, 35];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (!['name', 'address', 'updatetime', 'image'].includes(_rowInfo.payloadObj.key)) {
                            this.__loger.out("ROW_EDIT_PROP_REMOVE error unknown key(".concat(_rowInfo.payloadObj.key, "). Key:").concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 35];
                        }
                        if (_rowInfo.rowObj['isEditing']) {
                            _rowInfo.rowObj['isEditing'] = false;
                            _rowInfo.rowObj['fieldEditing'] = 'none';
                            _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                            _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                            _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        }
                        return [3 /*break*/, 35];
                    case 31:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            this.__loger.out("ROW_PAUSE_ALL Error: expected to recive monitorId");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _unpausedIndexes_1 = [];
                        _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                            var _rowObj = JSON.parse(_rowStr);
                            if (_rowObj.isPaused !== true) {
                                _unpausedIndexes_1.push(_i);
                                _rowObj.isPaused = true;
                                _rowObj.isPausedGrouped = true;
                                _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                            }
                        });
                        //if all paused
                        //unpause all with grouppaused flag
                        //take off the flag
                        if (_unpausedIndexes_1.length == 0) {
                            _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                                var _rowObj = JSON.parse(_rowStr);
                                if (_rowObj.isPausedGrouped === true) {
                                    _rowObj.isPaused = false;
                                    _rowObj.isPausedGrouped = false;
                                    _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                                }
                            });
                        }
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 32:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            this.__loger.out("ROW_UNALARM_ALL Error: expected to recive monitorId");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                            var _rowObj = JSON.parse(_rowStr);
                            if (_rowObj.isAlarmed) {
                                _rowObj.isAlarmed = false;
                                _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                            }
                        });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 33:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            this.__loger.out("ROW_UNSELECT_ALL Error: expected to recive monitorId");
                            return [3 /*break*/, 35];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                            var _rowObj = JSON.parse(_rowStr);
                            if (_rowObj.isSelected) {
                                _rowObj.isSelected = false;
                                _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                            }
                        });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 35];
                    case 34:
                        this.__loger.out("Reducer error: Unknown action type: ".concat(action.action));
                        console.error("Reducer error: Unknown action type: ".concat(action.action));
                        return [3 /*break*/, 35];
                    case 35: return [2 /*return*/, _state];
                }
            });
        }); };
        this.__setState = function (_state) { return __awaiter(_this, void 0, void 0, function () {
            var _prevState, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _state = JSON.parse(JSON.stringify(_state));
                        _b = [{}];
                        return [4 /*yield*/, this.__stateNow()];
                    case 1:
                        _prevState = __assign.apply(void 0, _b.concat([_c.sent()]));
                        this.__state = __assign({}, _state);
                        //TODO we need to save history only on user inputs not background services like ping report
                        // but how cat we get list of changed parameters?
                        //limit to 20 elements
                        // if(this.__history.length>=20){
                        //     // removes first element of the array: [1,2,3] > [2,3]
                        //     this.__history.shift()
                        // }
                        // this.__history.push(_state)
                        return [2 /*return*/, this.__notifySubscribers(_state, _prevState) ? true : false];
                }
            });
        }); };
        this.__notifySubscribers = function (_state, _prevState) {
            try {
                _this.__subscribers.forEach(function (_func) {
                    _func(_state, _prevState);
                });
                return true;
            }
            catch (e) {
                return false;
            }
        };
        //PUBLIC METHODS
        // undo = async ()=>{
        //     let _ret = false
        //     if(this.__history.length>0){
        //         this.__history.pop()//removes current
        //         if( await this.__setState(this.__history.pop())){//setts second instnce from the end
        //             _ret = true;
        //         }
        //     }
        //     return _ret;
        // }
        this.dispach = function (action) { return __awaiter(_this, void 0, void 0, function () {
            var _newState, _b, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        _b = this.__reduce;
                        return [4 /*yield*/, this.__stateNow()];
                    case 1: return [4 /*yield*/, _b.apply(this, [_c.sent(), action])];
                    case 2:
                        _newState = _c.sent();
                        return [4 /*yield*/, this.__setState(_newState)];
                    case 3: return [2 /*return*/, (_c.sent()) ? true : false];
                    case 4:
                        err_1 = _c.sent();
                        this.dialog.showErrorBox('Error', "Unable to dispach action\nAction:".concat(JSON.stringify(action), "\nError:").concat(err_1));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.queue = function (action) {
            var maxSize = 100;
            if (_this.__queue.length < maxSize) {
                //if there are no exact copyes already in the queue
                if (!_this.__queue.filter(function (_action) { return _action.payload === action.payload && _action.action === action.action; }).length) {
                    _this.__queue.push(action);
                    _this.checkqueue();
                }
            }
        };
        this.checkqueue = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.__queue.length > 0 && !this.__queueBusy)) return [3 /*break*/, 2];
                        this.__queueBusy = true;
                        return [4 /*yield*/, this.dispach(this.__queue[0]).then(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            this.__queue.shift();
                                            this.__queueBusy = false;
                                            if (!(this.__queue.length > 0)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.checkqueue()];
                                        case 1:
                                            _b.sent();
                                            _b.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        //add to queue:
        //add to array
        //check next if exists
        //start next only after previus finishes
        this.subscribe = function (_callback) {
            _this.__subscribers.push(_callback);
        };
        this.__appVersion = data.version;
        this.dialog = data.dialog;
        this.__lastSave = new Date().getTime();
        this.__fileManager = data.fileManager;
        this.__actionTypes = data.actionTypes;
        this.__loger = data.loger;
        this.__config = data.config;
        this.__pinger = data.pinger;
    }
    stateManager.prototype.__genId = function (target) {
        var _ret = -1;
        switch (target) {
            case 'monitor':
                _ret = Math.round(Math.random() * 9000 + 999);
                break;
            case 'window':
                _ret = Math.round(Math.random() * 90000 + 9999);
                break;
            case 'row':
                _ret = Math.round(Math.random() * 900000 + 99999);
                break;
            default:
                this.__loger.out('Unknown genId target');
                break;
        }
        return _ret;
    };
    return stateManager;
}());
module.exports = stateManager;
