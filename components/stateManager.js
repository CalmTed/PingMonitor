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
        this.__getAppVersion = function () {
            return _this.__appVersion;
        };
        this.__getLangCode = function () {
            //TODO make it async
            if (typeof _this.__langCode == 'undefined') {
                var config_1 = require('./config');
                _this.__langCode = config_1.getParam('langCode').value;
            }
            return _this.__langCode;
        };
        this.__getImagesList = function () { return __awaiter(_this, void 0, void 0, function () {
            var _imgNames, fileManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileManager = require('./fileManager');
                        return [4 /*yield*/, fileManager.getNames({ path: 'assets/icons', typeFilter: [{ name: '*', extensions: ['.png'] }] })];
                    case 1:
                        _imgNames = _a.sent();
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
        this.__getInitialPingTimeStrategy = function () {
            var _ret = [
                {
                    conditions: {
                        status: 'online'
                    },
                    updateTimeMS: 20000
                },
                {
                    conditions: {
                        status: 'timeout'
                    },
                    updateTimeMS: 10000
                }
            ];
            return _ret;
        };
        this.__getInitialRowState = function (_a) {
            var _monitorId = _a._monitorId, _b = _a._position, _position = _b === void 0 ? 0 : _b;
            var _ret = {
                rowId: Number("".concat(_monitorId, ".").concat(_this.__genId('row'))),
                position: _position,
                size: '2Small',
                ipAddress: '1.1.1.1',
                updateTimeMS: 5000,
                name: 'name',
                imageLink: '0 PingMonitor.png',
                history: [],
                pingTimeStrategy: _this.__getInitialPingTimeStrategy(),
                isBusy: false,
                isPaused: false,
                isPausedGrouped: false,
                isMuted: false,
                isAlarmed: false,
                isEditing: false,
                fieldEditing: 'none',
                isGraphSubscribed: false,
                isSelected: false
            };
            return JSON.stringify(_ret);
        };
        this.__getInitialWindow = function (_appVersion, _appLangCode, _parameters) {
            if (_parameters === void 0) { _parameters = {}; }
            return __awaiter(_this, void 0, void 0, function () {
                var _winData;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = {
                                version: _appVersion,
                                langCode: _appLangCode,
                                langWords: [{}]
                            };
                            return [4 /*yield*/, this.__getImagesList()];
                        case 1:
                            _winData = (_a.imagesList = _b.sent(),
                                _a.winId = this.__genId('window'),
                                _a.subscriptionKey = -1,
                                _a.title = "Ping monitor ".concat(_appVersion),
                                _a.isGraph = false,
                                _a.isHidden = false,
                                _a.isFullscreen = false,
                                _a.isMenuOpen = false,
                                _a.isSettingOpen = false,
                                _a.isImagePickerOpen = false,
                                _a.requestedUpdate = false,
                                _a.monitor = {},
                                _a);
                            if (Object.entries(_parameters).length > 0) {
                                Object.entries(_parameters).forEach(function (_a) {
                                    var _key = _a[0], _value = _a[1];
                                    _winData[_key] = _value;
                                });
                            }
                            return [2 /*return*/, JSON.stringify(_winData)];
                    }
                });
            });
        };
        this.__getInitialCoreState = function () { return __awaiter(_this, void 0, void 0, function () {
            var _appVersion, _appLangCode, _initialMonitorId1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _appVersion = this.__getAppVersion();
                        _appLangCode = this.__getLangCode();
                        _initialMonitorId1 = this.__genId('monitor');
                        _a = {
                            version: _appVersion,
                            langCode: _appLangCode,
                            langWords: [{}],
                            colorMode: 'dark',
                            monitors: [
                                {
                                    monitorId: _initialMonitorId1,
                                    rows: [
                                        this.__getInitialRowState({ _monitorId: _initialMonitorId1 }),
                                    ]
                                },
                                // {
                                //     monitorId:_initialMonitorId2,
                                //     rows:[
                                //         this.__getInitialRowState({_monitorId:_initialMonitorId2}),
                                //     ]
                                // }
                            ]
                        };
                        return [4 /*yield*/, this.__getInitialWindow(_appVersion, _appLangCode, { subscriptionKey: '1232' })];
                    case 1: 
                    // let _initialMonitorId2 = this.__genId('monitor')
                    return [2 /*return*/, (_a.windows = [
                            _b.sent()
                        ],
                            _a.propertyForTesting = 0,
                            _a)];
                }
            });
        }); };
        this.__stateNow = function () { return __awaiter(_this, void 0, void 0, function () {
            var _reply, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).stringify;
                        return [4 /*yield*/, this.__getInitialCoreState()];
                    case 1:
                        _reply = _b.apply(_a, [_c.sent()]);
                        if (typeof this.__state !== 'undefined') {
                            _reply = JSON.stringify(__assign({}, this.__state));
                        }
                        return [2 /*return*/, JSON.parse(_reply)];
                }
            });
        }); };
        this.__reduce = function (_state, action) { return __awaiter(_this, void 0, void 0, function () {
            var actionTypes, fileManager, loger, config, __newRow, __newMonitor, __validateInputs, __getRow, _rowInfo, _newMonitors, _neededMonitorIndex, _newWindowsStr, _newWindowsObj, _neededWindowIndex, _payloadObj, _a, _dateNow, _exportTimeStamp, _modifiedState, _exportContent, _exportResult, _importContent, _importResult, _openedStateStr, _openedStateObj, _oneNewWindowStr, _newRowElement, lastNotOnlineProbeTime, i, timeToAlarmMS, unmuteOnGettingOnline, _actualStatus_1, _unpausedIndexes_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        actionTypes = require('./actionTypes');
                        fileManager = require('./fileManager');
                        loger = require('./loger');
                        config = require('./config');
                        __newRow = function (_a /* MAY BE THERE SHOULD BE CUSTOM VALUES*/) {
                            var _monitorId = _a._monitorId, _b = _a._position, _position = _b === void 0 ? 0 : _b;
                            return _this.__getInitialRowState({ _monitorId: _monitorId, _position: _position });
                        };
                        __newMonitor = function () {
                            var _monitorId = _this.__genId('monitor');
                            return { monitorId: _monitorId, rows: [__newRow({ _monitorId: _monitorId })] };
                        };
                        __validateInputs = function (_payload, _targetInputsArray) {
                            var _ret = true;
                            if (typeof action.payload != 'string') {
                                console.log('Payload should be a JSON string');
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
                        _a = action.action;
                        switch (_a) {
                            case actionTypes.SET_PROPERTY_FOR_TESTING: return [3 /*break*/, 1];
                            case actionTypes.ADD_NEW_MONITOR: return [3 /*break*/, 2];
                            case actionTypes.REMOVE_MONITOR_BY_ID: return [3 /*break*/, 3];
                            case actionTypes.MONITOR_EXPORT_CONFIG: return [3 /*break*/, 4];
                            case actionTypes.MONITOR_IMPORT_CONFIG: return [3 /*break*/, 6];
                            case actionTypes.ADD_NEW_WINDOW_BY_SUBKEY: return [3 /*break*/, 8];
                            case actionTypes.REMOVE_WINDOW_BY_ID: return [3 /*break*/, 10];
                            case actionTypes.WIN_SET_PROP: return [3 /*break*/, 11];
                            case actionTypes.WIN_TOGGLE_PROP: return [3 /*break*/, 12];
                            case actionTypes.WIN_SET_IMAGE_PICKER_OPEN: return [3 /*break*/, 13];
                            case actionTypes.WIN_REQUEST_STATE: return [3 /*break*/, 14];
                            case actionTypes.ADD_ROW: return [3 /*break*/, 15];
                            case actionTypes.REMOVE_ROW: return [3 /*break*/, 16];
                            case actionTypes.ROW_SUBMIT_PING_PROBE: return [3 /*break*/, 17];
                            case actionTypes.ROW_SET_PROP: return [3 /*break*/, 22];
                            case actionTypes.ROW_TOGGLE_PROP: return [3 /*break*/, 23];
                            case actionTypes.ROW_EDIT_PROP_SET: return [3 /*break*/, 24];
                            case actionTypes.ROW_EDIT_PROP_REMOVE: return [3 /*break*/, 25];
                            case actionTypes.ROW_PAUSE_ALL: return [3 /*break*/, 26];
                            case actionTypes.ROW_UNALARM_ALL: return [3 /*break*/, 27];
                            case actionTypes.ROW_UNSELECT_ALL: return [3 /*break*/, 28];
                        }
                        return [3 /*break*/, 29];
                    case 1:
                        _state = __assign(__assign({}, _state), { propertyForTesting: action.payload });
                        return [3 /*break*/, 30];
                    case 2:
                        _newMonitors = __spreadArray(__spreadArray([], _state.monitors, true), [__newMonitor()], false);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 3:
                        _newMonitors = __spreadArray([], _state.monitors.filter(function (_m) { return _m.monitorId != action.payload; }), true);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 4:
                        _newMonitors = __spreadArray([], _state.monitors.filter(function (_m) { return _m.monitorId != action.payload; }), true);
                        _dateNow = new Date();
                        _exportTimeStamp = "".concat(_dateNow.getFullYear(), "-").concat(_dateNow.getMonth() + 1, "-").concat(_dateNow.getDate(), " ").concat(_dateNow.getHours() + 1, "-").concat(_dateNow.getMinutes(), "-").concat(_dateNow.getSeconds());
                        _modifiedState = __assign({}, _state);
                        _exportContent = JSON.stringify(_modifiedState);
                        return [4 /*yield*/, fileManager.write({
                                openDialog: true,
                                path: "PM Config ".concat(_exportTimeStamp, ".pm"),
                                dialogTile: "Save config",
                                content: _exportContent
                            })];
                    case 5:
                        _exportResult = _b.sent();
                        if (_exportResult.success) {
                            //do nothing or show little message
                        }
                        else {
                            loger.out("Reducer error:MONITOR_EXPORT_CONFIG unable to write config ".concat(_exportResult));
                        }
                        return [3 /*break*/, 30];
                    case 6:
                        _newMonitors = __spreadArray([], _state.monitors.filter(function (_m) { return _m.monitorId != action.payload; }), true);
                        _importContent = "";
                        return [4 /*yield*/, fileManager.read({
                                openDialog: true,
                                dialogTile: "Save config",
                                content: _importContent
                            })];
                    case 7:
                        _importResult = _b.sent();
                        if (_importResult.success) {
                            _openedStateStr = _importResult.payload.content;
                            _openedStateObj = JSON.parse(_openedStateStr);
                            if (_openedStateObj.version == _state.version) {
                                _state = __assign({}, _openedStateObj);
                            }
                        }
                        else {
                            loger.out("Reducer error:MONITOR_IMPORT_CONFIG unable to read config ".concat(_importResult));
                        }
                        return [3 /*break*/, 30];
                    case 8:
                        if (typeof action.payload != 'string') {
                            loger.out("Reducer error:".concat(action.action, " expected to recive subscriptionKey:string"));
                            return [3 /*break*/, 30];
                        }
                        return [4 /*yield*/, this.__getInitialWindow(this.__getAppVersion(), this.__getLangCode(), { subscriptionKey: action.payload })];
                    case 9:
                        _oneNewWindowStr = _b.sent();
                        _newWindowsStr = __spreadArray(__spreadArray([], _state.windows, true), [_oneNewWindowStr], false);
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        return [3 /*break*/, 30];
                    case 10:
                        if (typeof action.payload != 'string') {
                            loger.out("Reducer error:".concat(action.action, " expected to recive winId:string"));
                            return [3 /*break*/, 30];
                        }
                        //going lazy way without parsing json string
                        _newWindowsStr = __spreadArray([], _state.windows.filter(function (_w) { return _w.indexOf("\"winId\":".concat(action.payload)) == -1; }), true);
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        return [3 /*break*/, 30];
                    case 11:
                        if (typeof action.payload != 'string') {
                            loger.out("Reducer error:".concat(action.action, " expected to recive winId:string,key:string,value:string"));
                            return [3 /*break*/, 30];
                        }
                        _newWindowsStr = __spreadArray([], _state.windows, true);
                        _payloadObj = JSON.parse(action.payload);
                        _neededWindowIndex = _newWindowsStr.map(function (_w) {
                            return _w.indexOf("\"winId\":".concat(_payloadObj.winId)) > -1;
                        }).indexOf(true);
                        if (_neededWindowIndex == -1) {
                            loger.out("Reducer error:".concat(action.action, " window with entered winId is not found"));
                            return [3 /*break*/, 30];
                        }
                        _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex]);
                        if (_newWindowsObj[_payloadObj.key] != _payloadObj.value) { // limits at least some duplicates
                            _newWindowsObj[_payloadObj.key] = _payloadObj.value;
                        }
                        _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj);
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        return [3 /*break*/, 30];
                    case 12:
                        if (typeof action.payload != 'string') {
                            loger.out("Reducer error:".concat(action.action, " expected to recive winId:string,key:string"));
                            return [3 /*break*/, 30];
                        }
                        _newWindowsStr = __spreadArray([], _state.windows, true);
                        _payloadObj = JSON.parse(action.payload);
                        _neededWindowIndex = _newWindowsStr.map(function (_w) {
                            return _w.indexOf("\"winId\":".concat(_payloadObj.winId)) > -1;
                        }).indexOf(true);
                        _newWindowsObj = JSON.parse(_newWindowsStr[_neededWindowIndex]);
                        _newWindowsObj[_payloadObj.key] = !_newWindowsObj[_payloadObj.key];
                        _newWindowsStr[_neededWindowIndex] = JSON.stringify(_newWindowsObj);
                        _state = __assign(__assign({}, _state), { windows: _newWindowsStr });
                        return [3 /*break*/, 30];
                    case 13:
                        if (!__validateInputs(action.payload, ['rowId', 'winId', 'value'])) {
                            loger.out("WIN_SET_IMAGE_PICKER_OPEN Error: expected to recive rowId,winId,value");
                            return [3 /*break*/, 30];
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
                        return [3 /*break*/, 30];
                    case 14:
                        if (!__validateInputs(action.payload, ['winId'])) {
                            loger.out("WIN_SET_IMAGE_PICKER_OPEN Error: expected to recive winId");
                            return [3 /*break*/, 30];
                        }
                        return [3 /*break*/, 30];
                    case 15:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive monitorId");
                            return [3 /*break*/, 30];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _newRowElement = __newRow({ _monitorId: _payloadObj.monitorId, _position: _newMonitors[_neededMonitorIndex].rows.length });
                        _newMonitors[_neededMonitorIndex].rows.push(_newRowElement);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 16:
                        if (!__validateInputs(action.payload, ['rowId'])) {
                            loger.out("REMOVE_ROW Error: expected to recive rowId");
                            return [3 /*break*/, 30];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.rowId.split('.')[0];
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows = _newMonitors[_neededMonitorIndex].rows.filter(function (_rwStr) { return _rwStr.indexOf("\"rowId\":".concat(_payloadObj.rowId)) == -1; });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 17:
                        if (!__validateInputs(action.payload, ['rowId', 'status', 'dellay', 'packetLoss', 'ttl', 'fullResponce'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive rowId,status,dellay,packetLoss,ttl,fullResponce");
                            return [3 /*break*/, 30];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (!_rowInfo.success) {
                            loger.out("ROW_SET_PROP Error: row was not found");
                            return [3 /*break*/, 30];
                        }
                        _rowInfo.rowObj.isBusy = false;
                        _payloadObj = JSON.parse(action.payload);
                        console.log('TODO: limit history size');
                        _rowInfo.rowObj.history.push({
                            timestamp: new Date().getTime(),
                            time: new Date(),
                            status: _payloadObj.status,
                            dellayMS: _payloadObj.dellay,
                            ttl: _payloadObj.ttl,
                            fullResponce: _payloadObj.fillResponce
                        });
                        console.log('TODO: make PTS work for different conditions');
                        try {
                            if (_rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _payloadObj.status; }).updateTimeMS != _rowInfo.rowObj.updateTimeMS) {
                                _rowInfo.rowObj.updateTimeMS = _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _payloadObj.status; }).updateTimeMS;
                            }
                        }
                        catch (e) {
                            console.log('PTS ERROR', _rowInfo.rowObj.pingTimeStrategy, _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _payloadObj.status; }), _payloadObj.status);
                            // loger.out(`Reducer error: Unable to check update time conditions. Action: ${action.action}`)
                        }
                        if (!(action.payload.status != 'online' && _rowInfo.rowObj.isMuted == false && _rowInfo.rowObj.isPaused == false)) return [3 /*break*/, 19];
                        lastNotOnlineProbeTime = void 0;
                        i = _rowInfo.rowObj.history.length - 1;
                        while (_rowInfo.rowObj.history[i] && i > -1) {
                            if (_rowInfo.rowObj.history[i].status != 'online') {
                                lastNotOnlineProbeTime = _rowInfo.rowObj.history[i].timestamp;
                            }
                            i--;
                        }
                        return [4 /*yield*/, config.getParam('timeToAlarmMS')];
                    case 18:
                        timeToAlarmMS = _b.sent();
                        if (new Date().getTime() - lastNotOnlineProbeTime >= timeToAlarmMS.value && _rowInfo.rowObj.history[_rowInfo.rowObj.history.length - 1].status != 'online') {
                            _rowInfo.rowObj.isAlarmed = true;
                        }
                        _b.label = 19;
                    case 19:
                        if (!(action.payload.status == 'online' && action.payload.history[action.payload.history.length - 2].status != 'online')) return [3 /*break*/, 21];
                        return [4 /*yield*/, config.getParam('unmuteOnGettingOnline')];
                    case 20:
                        unmuteOnGettingOnline = _b.sent();
                        if (unmuteOnGettingOnline.value) {
                            _rowInfo.rowObj.isMuted = false;
                        }
                        _b.label = 21;
                    case 21:
                        //save to state
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign({}, _state);
                        return [3 /*break*/, 30];
                    case 22:
                        if (!__validateInputs(action.payload, ['rowId', 'key', 'value'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive rowId,key and value");
                            return [3 /*break*/, 30];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined') {
                            loger.out("ROW_SET_PROP error unknown key of the row. Key:".concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 30];
                        }
                        if (_rowInfo.rowObj[_rowInfo.payloadObj.key] === _rowInfo.payloadObj.value) {
                            loger.out("ROW_SET_PROP warn value is already set. Key:".concat(_rowInfo.payloadObj.key, " Values:").concat(_rowInfo.rowObj[_rowInfo.payloadObj.key], ">>").concat(_rowInfo.payloadObj.value, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 30];
                        }
                        if (['name', 'address', 'updateTimeMS'].includes(_rowInfo.payloadObj.key)) {
                            if (_rowInfo.payloadObj.key == 'name') {
                                if (_rowInfo.payloadObj.value.length < 1 || _rowInfo.payloadObj.value.length > 20) {
                                    return [3 /*break*/, 30];
                                }
                            }
                            if (_rowInfo.payloadObj.key == 'address') {
                                if (_rowInfo.payloadObj.value.length < 1 || _rowInfo.payloadObj.value.length > 50) {
                                    return [3 /*break*/, 30];
                                }
                            }
                            if (_rowInfo.payloadObj.key == 'updateTimeMS') {
                                if (_rowInfo.payloadObj.value < 1000 || _rowInfo.payloadObj.value > 300000) {
                                    return [3 /*break*/, 30];
                                }
                                try {
                                    _actualStatus_1 = _rowInfo.rowObj.history[_rowInfo.rowObj.history.length - 1].status;
                                    _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == _actualStatus_1; }).updateTimeMS = _rowInfo.payloadObj.value;
                                }
                                catch (e) {
                                    loger.out("ROW_SET_PROP unable to write PTS Key:".concat(_rowInfo.payloadObj.key, " Values:").concat(_rowInfo.rowObj[_rowInfo.payloadObj.key], ">>").concat(_rowInfo.payloadObj.value, " RowId:").concat(_rowInfo.payloadObj.rowId));
                                }
                            }
                        }
                        _rowInfo.rowObj[_rowInfo.payloadObj.key] = _rowInfo.payloadObj.value;
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 23:
                        if (!__validateInputs(action.payload, ['rowId', 'key'])) {
                            loger.out("ROW_TOGGLE_PROP Error: expected to recive rowId and key");
                            return [3 /*break*/, 30];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined') {
                            loger.out("ROW_TOGGLE_PROP error unknown key of the row. Key:".concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 30];
                        }
                        _rowInfo.rowObj[_rowInfo.payloadObj.key] = !_rowInfo.rowObj[_rowInfo.payloadObj.key];
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 24:
                        if (!__validateInputs(action.payload, ['rowId', 'key'])) {
                            loger.out("ROW_EDIT_PROP_SET Error: expected to recive rowId,key");
                            return [3 /*break*/, 30];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (!['name', 'address', 'updatetime', 'image'].includes(_rowInfo.payloadObj.key)) {
                            loger.out("ROW_EDIT_PROP_SET error unknown key(".concat(_rowInfo.payloadObj.key, "). Key:").concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 30];
                        }
                        if (!_rowInfo.rowObj['isEditing']) {
                            _rowInfo.rowObj['isEditing'] = true;
                            _rowInfo.rowObj['fieldEditing'] = _rowInfo.payloadObj.key;
                            _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                            _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                            _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        }
                        return [3 /*break*/, 30];
                    case 25:
                        if (!__validateInputs(action.payload, ['rowId', 'key'])) {
                            loger.out("ROW_EDIT_PROP_REMOVE Error: expected to recive rowId,key");
                            return [3 /*break*/, 30];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (!['name', 'address', 'updatetime', 'image'].includes(_rowInfo.payloadObj.key)) {
                            loger.out("ROW_EDIT_PROP_REMOVE error unknown key(".concat(_rowInfo.payloadObj.key, "). Key:").concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 30];
                        }
                        if (_rowInfo.rowObj['isEditing']) {
                            _rowInfo.rowObj['isEditing'] = false;
                            _rowInfo.rowObj['fieldEditing'] = 'none';
                            _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                            _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                            _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        }
                        return [3 /*break*/, 30];
                    case 26:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            loger.out("ROW_PAUSE_ALL Error: expected to recive monitorId");
                            return [3 /*break*/, 30];
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
                        return [3 /*break*/, 30];
                    case 27:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            loger.out("ROW_UNALARM_ALL Error: expected to recive monitorId");
                            return [3 /*break*/, 30];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                            var _rowObj = JSON.parse(_rowStr);
                            if (_rowObj.isAlarmed == true) {
                                _rowObj.isAlarmed = false;
                                _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                            }
                        });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 28:
                        if (!__validateInputs(action.payload, ['monitorId'])) {
                            loger.out("ROW_UNSELECT_ALL Error: expected to recive monitorId");
                            return [3 /*break*/, 30];
                        }
                        _payloadObj = JSON.parse(action.payload);
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _neededMonitorIndex = _newMonitors.map(function (_m) {
                            return _m.monitorId == _payloadObj.monitorId;
                        }).indexOf(true);
                        _newMonitors[_neededMonitorIndex].rows.forEach(function (_rowStr, _i) {
                            var _rowObj = JSON.parse(_rowStr);
                            if (_rowObj.isSelected == true) {
                                _rowObj.isSelected = false;
                                _newMonitors[_neededMonitorIndex].rows[_i] = JSON.stringify(_rowObj);
                            }
                        });
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 30];
                    case 29:
                        loger.out("Reducer error: Unknown action type: ".concat(action.action));
                        console.error("Reducer error: Unknown action type: ".concat(action.action));
                        return [3 /*break*/, 30];
                    case 30: return [2 /*return*/, _state];
                }
            });
        }); };
        this.__setState = function (_state) { return __awaiter(_this, void 0, void 0, function () {
            var _prevState, _a, checkFullDifference, _fullMonotorDifference;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _state = __assign({}, _state);
                        _a = [{}];
                        return [4 /*yield*/, this.__stateNow()];
                    case 1:
                        _prevState = __assign.apply(void 0, _a.concat([_b.sent()]));
                        this.__state = __assign({}, _state);
                        checkFullDifference = function (_obj1, _obj2) {
                            //TODO make this work properly
                            var checkDiffStr = function (_one, _two) {
                                var _strdiffret = '';
                                var aArr = _one.split('');
                                var bArr = _two.split('');
                                aArr.forEach(function (letter, i) {
                                    if (aArr[i] != bArr[i]) {
                                        _strdiffret += aArr[i];
                                    }
                                });
                                return _strdiffret;
                            };
                            var _ret = {};
                            //we expect two objects to have the same scheme to minimize computation time
                            Object.entries(_obj1).forEach(function (_a) {
                                var _k = _a[0], _v = _a[1];
                                if (typeof _obj1[_k] != 'object') {
                                    var strDiff = checkDiffStr(_obj1[_k].toString(), _obj2[_k].toString());
                                    if (strDiff.length > 0) {
                                        _ret[_k] = _v;
                                    }
                                }
                                else {
                                    _ret[_k] = checkFullDifference(_obj1[_k], _obj2[_k]);
                                }
                            });
                            return _ret;
                        };
                        if (typeof _state.monitors > 'undefined') {
                            _fullMonotorDifference = checkFullDifference(_state.monitors, _prevState.monitors);
                        }
                        //TODO we need to save history only on user inputs not background services like ping report
                        // but how cat we get list of changed parameters?
                        // if([].indexOf() != -1){
                        // }
                        //limit to 20 elements
                        if (this.__history.length >= 20) {
                            // removes first element of the array: [1,2,3] > [2,3]
                            this.__history.shift();
                        }
                        this.__history.push(_state);
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
        this.undo = function () { return __awaiter(_this, void 0, void 0, function () {
            var _ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _ret = false;
                        if (!(this.__history.length > 0)) return [3 /*break*/, 2];
                        this.__history.pop(); //removes current
                        return [4 /*yield*/, this.__setState(this.__history.pop())];
                    case 1:
                        if (_a.sent()) { //setts second instnce from the end
                            _ret = true;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, _ret];
                }
            });
        }); };
        this.dispach = function (action) { return __awaiter(_this, void 0, void 0, function () {
            var _newState, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.__reduce;
                        return [4 /*yield*/, this.__stateNow()];
                    case 1: return [4 /*yield*/, _a.apply(this, [_b.sent(), action])];
                    case 2:
                        _newState = _b.sent();
                        return [4 /*yield*/, this.__setState(_newState)];
                    case 3: return [2 /*return*/, (_b.sent()) ? true : false];
                }
            });
        }); };
        this.subscribe = function (_callback) {
            _this.__subscribers.push(_callback);
        };
        this.__appVersion = data.version;
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
                loger.out('Unknown genId target');
                break;
        }
        return _ret;
    };
    return stateManager;
}());
module.exports = stateManager;
