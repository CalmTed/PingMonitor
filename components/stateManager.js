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
            if (typeof _this.__langCode == 'undefined') {
                var config_1 = require('./config');
                _this.__langCode = config_1.getParam('langCode');
            }
            return _this.__langCode;
        };
        this.__getInitialPingTimeStrategy = function () {
            var _ret = [
                {
                    conditions: {
                        status: 'online'
                    },
                    updateTimeMS: 2000
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
            var _monitorId = _a._monitorId;
            var _ret = {
                rowId: Number("".concat(_monitorId, ".").concat(_this.__genId('row'))),
                position: 0,
                size: '1Little',
                ipAddress: '1.1.1.1',
                updateTimeMS: 5000,
                name: 'name',
                imageBase64: '',
                history: [],
                pingTimeStrategy: _this.__getInitialPingTimeStrategy(),
                isBusy: false,
                isPaused: false,
                isMuted: false,
                isAlarmed: false,
                isEditing: false,
                filedEditing: 'none',
                isGraphSubscribed: false,
                isSelected: false
            };
            return JSON.stringify(_ret);
        };
        this.__getInitialWindow = function (_appVersion, _appLangCode, _parameters) {
            if (_parameters === void 0) { _parameters = {}; }
            var _winData = {
                version: _appVersion,
                langCode: _appLangCode,
                langWords: [{}],
                winId: _this.__genId('window'),
                subscriptionKey: -1,
                title: 'Default window',
                isGraph: false,
                isHidden: true,
                isFullscreen: false,
                isMenuOpen: false,
                isSettingOpen: false,
                isImagePickerOpen: false,
                monitor: {}
            };
            if (Object.entries(_parameters).length > 0) {
                Object.entries(_parameters).forEach(function (_a) {
                    var _key = _a[0], _value = _a[1];
                    _winData[_key] = _value;
                });
            }
            return JSON.stringify(_winData);
        };
        this.__getInitialCoreState = function () {
            var _appVersion = _this.__getAppVersion();
            var _appLangCode = _this.__getLangCode();
            var _initialMonitorId1 = _this.__genId('monitor');
            var _initialMonitorId2 = _this.__genId('monitor');
            return {
                version: _appVersion,
                langCode: _appLangCode,
                langWords: [{}],
                colorMode: 'dark',
                monitors: [
                    {
                        monitorId: _initialMonitorId1,
                        rows: [
                            _this.__getInitialRowState({ _monitorId: _initialMonitorId1 }),
                        ]
                    },
                    {
                        monitorId: _initialMonitorId2,
                        rows: [
                            _this.__getInitialRowState({ _monitorId: _initialMonitorId2 }),
                        ]
                    }
                ],
                windows: [
                    _this.__getInitialWindow(_appVersion, _appLangCode, { subscriptionKey: '1232' })
                ],
                propertyForTesting: 0
            };
        };
        this.__stateNow = function () {
            var _reply = JSON.stringify(_this.__getInitialCoreState());
            if (typeof _this.__state !== 'undefined') {
                _reply = JSON.stringify(__assign({}, _this.__state));
            }
            return JSON.parse(_reply);
        };
        this.__reduce = function (_state, action) { return __awaiter(_this, void 0, void 0, function () {
            var actionTypes, config, loger, __newRow, __newMonitor, __validateInputs, __getRow, _rowInfo, _newMonitors, _newWIndowsStr, _a, lastNotOnlineProbeTime, i, timeToAlarmMS, unmuteOnGettingOnline;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        actionTypes = require('./actionTypes');
                        config = require('./config');
                        loger = require('./loger');
                        __newRow = function (_a /* MAY BE THERE SHOULD BE CUSTOM VALUES*/) {
                            var _monitorId = _a._monitorId;
                            return _this.__getInitialRowState({ _monitorId: _monitorId });
                        };
                        __newMonitor = function () {
                            var _monitorId = _this.__genId('monitor');
                            return { monitorId: _monitorId, rows: [__newRow({ _monitorId: _monitorId })] };
                        };
                        __validateInputs = function (_payload, _targetInputsArray) {
                            var _ret = true;
                            _targetInputsArray.forEach(function (_in) {
                                if (action.payload.indexOf("\"".concat(_in, "\":")) == -1) {
                                    _ret = false;
                                }
                            });
                            return _ret;
                        };
                        __getRow = function (_payloadStr, _monitors) {
                            var _plObj = JSON.parse(_payloadStr);
                            var _selMon = _monitors.find(function (_mon) { return _mon.monitorId == Number(_plObj.rowId.toString().split('.')[0]); });
                            var _monInd = _monitors.indexOf(_selMon);
                            var _rwStr = _selMon.rows.find(function (_row) { return _row.indexOf("\"rowId\":".concat(_plObj.rowId)) > -1; });
                            var _rwInd = _selMon.rows.indexOf(_rwStr);
                            var _rwObj = JSON.parse(_rwStr);
                            return {
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
                            case actionTypes.ADD_NEW_WINDOW_BY_SUBKEY: return [3 /*break*/, 4];
                            case actionTypes.REMOVE_WINDOW_BY_ID: return [3 /*break*/, 5];
                            case actionTypes.ROW_SUBMIT_PING_PROBE: return [3 /*break*/, 6];
                            case actionTypes.ROW_SET_PROP: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 12];
                    case 1:
                        _state = __assign(__assign({}, _state), { propertyForTesting: action.payload });
                        return [3 /*break*/, 13];
                    case 2:
                        _newMonitors = __spreadArray(__spreadArray([], _state.monitors, true), [__newMonitor()], false);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 13];
                    case 3:
                        // _newMonitors = [..._state.monitors,__newMonitor()]
                        _newMonitors = __spreadArray([], _state.monitors.filter(function (_m) { return _m.monitorId != action.payload; }), true);
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 13];
                    case 4:
                        if (typeof action.payload != 'string') {
                            loger.out("Reducer error:".concat(action.action, " expected to recive subscriptionKey:string"));
                            return [3 /*break*/, 13];
                        }
                        _newWIndowsStr = __spreadArray(__spreadArray([], _state.windows, true), [this.__getInitialWindow(this.__getAppVersion(), this.__getLangCode(), { subscriptionKey: action.payload })], false);
                        _state = __assign(__assign({}, _state), { windows: _newWIndowsStr });
                        return [3 /*break*/, 13];
                    case 5:
                        if (typeof action.payload != 'string') {
                            loger.out("Reducer error:".concat(action.action, " expected to recive winId:string"));
                            return [3 /*break*/, 13];
                        }
                        //going lazy way without parsing json string
                        _newWIndowsStr = __spreadArray([], _state.windows.filter(function (_w) { return _w.indexOf("\"winId\":".concat(action.payload)) == -1; }), true);
                        _state = __assign(__assign({}, _state), { windows: _newWIndowsStr });
                        return [3 /*break*/, 13];
                    case 6:
                        if (!__validateInputs(action.payload, ['rowId', 'status', 'dellay', 'packetLoss', 'ttl', 'fullResponce'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive rowId,key and value");
                            return [3 /*break*/, 13];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        _rowInfo.rowObj.isBusy = false;
                        //TODO: limit history size
                        _rowInfo.rowObj.history.push({
                            timestamp: new Date().getTime(),
                            time: new Date(),
                            status: action.payload.status,
                            dellayMS: action.payload.dellay,
                            ttl: action.payload.ttl,
                            fullResponce: action.payload.fillResponce
                        });
                        //TODO make it work for different conditions
                        try {
                            if (_rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == action.payload.status; }).updateTimeMS != _rowInfo.rowObj.updateTimeMS) {
                                _rowInfo.rowObj.updateTimeMS = _rowInfo.rowObj.pingTimeStrategy.find(function (_pts) { return _pts.conditions.status == action.payload.status; }).updateTimeMS;
                            }
                        }
                        catch (e) { }
                        if (!(action.payload.status != 'online')) return [3 /*break*/, 8];
                        lastNotOnlineProbeTime = void 0;
                        i = _rowInfo.rowObj.history.length - 1;
                        while (_rowInfo.rowObj.history[i] && i > -1) {
                            if (_rowInfo.rowObj.history[i].status != 'online') {
                                lastNotOnlineProbeTime = _rowInfo.rowObj.history[i].timestamp;
                            }
                            i--;
                        }
                        return [4 /*yield*/, config.getParam('timeToAlarmMS')];
                    case 7:
                        timeToAlarmMS = _b.sent();
                        if (new Date().getTime() - lastNotOnlineProbeTime >= timeToAlarmMS.value) {
                            _rowInfo.rowObj.isAlarmed = true;
                        }
                        _b.label = 8;
                    case 8:
                        if (!(action.payload.status == 'online' && action.payload.history[action.payload.history.length - 2].status != 'online')) return [3 /*break*/, 10];
                        return [4 /*yield*/, config.getParam('unmuteOnGettingOnline')];
                    case 9:
                        unmuteOnGettingOnline = _b.sent();
                        if (unmuteOnGettingOnline.value) {
                            _rowInfo.rowObj.isMuted = false;
                        }
                        _b.label = 10;
                    case 10:
                        //save to state
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign({}, _state);
                        return [3 /*break*/, 13];
                    case 11:
                        if (!__validateInputs(action.payload, ['rowId', 'key', 'value'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive rowId,key and value");
                            return [3 /*break*/, 13];
                        }
                        _newMonitors = __spreadArray([], _state.monitors, true);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined') {
                            loger.out("ROW_SET_PROP error unknown key of the row. Key:".concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 13];
                        }
                        if (_rowInfo.rowObj[_rowInfo.payloadObj.key] === _rowInfo.payloadObj.value) {
                            loger.out("ROW_SET_PROP warn value is already set. Key:".concat(_rowInfo.payloadObj.key, " RowId:").concat(_rowInfo.payloadObj.rowId));
                            return [3 /*break*/, 13];
                        }
                        _rowInfo.rowObj[_rowInfo.payloadObj.key] = _rowInfo.payloadObj.value;
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 13];
                    case 12:
                        loger.out("Reducer error: Unknown action type: ".concat(action.action));
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/, _state];
                }
            });
        }); };
        this.__setState = function (_state) {
            _state = __assign({}, _state);
            var _prevState = __assign({}, _this.__state);
            _this.__state = __assign({}, _state);
            var checkFullDifference = function (_obj1, _obj2) {
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
                var _fullMonotorDifference = checkFullDifference(_state.monitors, _prevState.monitors);
            }
            //TODO we need to save history only on user inputs not background services like ping report
            // but how cat we get list of changed parameters?
            // if([].indexOf() != -1){
            // }
            //limit to 20 elements
            if (_this.__history.length >= 20) {
                // removes first element of the array: [1,2,3] > [2,3]
                _this.__history.shift();
            }
            _this.__history.push(_state);
            return _this.__notifySubscribers(_state, _prevState) ? true : false;
        };
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
        this.undo = function () {
            var _ret = false;
            if (_this.__history.length > 0) {
                _this.__history.pop(); //removes current
                if (_this.__setState(_this.__history.pop())) { //setts second instnce from the end
                    _ret = true;
                }
            }
            return _ret;
        };
        this.dispach = function (action) { return __awaiter(_this, void 0, void 0, function () {
            var _newState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.__reduce(this.__stateNow(), action)];
                    case 1:
                        _newState = _a.sent();
                        return [2 /*return*/, this.__setState(_newState) ? true : false];
                }
            });
        }); };
        this.subscribe = function (_callback) {
            _this.__subscribers.push(_callback);
        };
        this.__appVersion = data.version;
        this.__state = __assign({}, this.__stateNow());
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
