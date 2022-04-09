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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var stateManager = /** @class */ (function () {
    function stateManager() {
        var _this = this;
        this.__subscribers = [];
        this.__history = [];
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
                rowId: Number(_monitorId + "." + _this.__genId('row')),
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
        this.__getInitialWindow = function (_appVersion, _appLangCode) {
            return JSON.stringify({
                version: _appVersion,
                langCode: _appLangCode,
                langWords: [{}],
                winId: -1,
                subscriptionKey: -1,
                title: 'Default window',
                isGraph: false,
                isHidden: true,
                isFullscreen: false,
                isMenuOpen: false,
                isSettingOpen: false,
                isImagePickerOpen: false,
                monitor: {}
            });
        };
        this.__getInitialCoreState = function () {
            var _appVersion = '1.4';
            var _appLangCode = 'ua';
            var _initialMonitorId = _this.__genId('monitor');
            return {
                version: _appVersion,
                langCode: _appLangCode,
                langWords: [{}],
                colorMode: 'dark',
                monitors: [
                    {
                        monitorId: _initialMonitorId,
                        rows: [
                            _this.__getInitialRowState({ _monitorId: _initialMonitorId })
                        ]
                    }
                ],
                windows: [
                    _this.__getInitialWindow(_appVersion, _appLangCode)
                ],
                propertyForTesting: 0
            };
        };
        this.__stateNow = function () {
            var _reply = _this.__getInitialCoreState();
            if (typeof _this.__state !== 'undefined') {
                _reply = _this.__state;
            }
            return _reply;
        };
        this.__reduce = function (_state, action) { return __awaiter(_this, void 0, void 0, function () {
            var actionTypes, config, loger, __newRow, __newMonitor, __validateInputs, __getRow, _rowInfo, _newMonitors, _a, newMonitors, lastNotOnlineProbeTime, i, timeToAlarmMS, unmuteOnGettingOnline;
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
                                if (action.payload.indexOf("\"" + _in + "\":") == -1) {
                                    _ret = false;
                                }
                            });
                            return _ret;
                        };
                        __getRow = function (_payloadStr, _monitors) {
                            var _plObj = JSON.parse(_payloadStr);
                            var _selMon = _monitors.find(function (_mon) { return _mon.monitorId == Number(_plObj.rowId.toString().split('.')[0]); });
                            var _monInd = _monitors.indexOf(_selMon);
                            var _rwStr = _selMon.rows.find(function (_row) { return _row.indexOf("\"rowId\":" + _plObj.rowId) > -1; });
                            var _rwInd = _selMon.rows.indexOf(_rwStr);
                            var _rwObj = JSON.parse(_rwStr);
                            return {
                                payloadObj: _plObj,
                                monitirObj: _selMon,
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
                            case actionTypes.ROW_SUBMIT_PING_PROBE: return [3 /*break*/, 3];
                            case actionTypes.ROW_SET_PROP: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 9];
                    case 1:
                        _state = __assign(__assign({}, _state), { propertyForTesting: action.payload });
                        return [3 /*break*/, 10];
                    case 2:
                        newMonitors = __spreadArray(__spreadArray([], _state.monitors), [__newMonitor()]);
                        _state = __assign(__assign({}, _state), { monitors: newMonitors });
                        return [3 /*break*/, 10];
                    case 3:
                        if (!__validateInputs(action.payload, ['rowId', 'status', 'dellay', 'packetLoss', 'ttl', 'fullResponce'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive rowId,key and value");
                            return [3 /*break*/, 10];
                        }
                        _newMonitors = __spreadArray([], _state.monitors);
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
                        if (!(action.payload.status != 'online')) return [3 /*break*/, 5];
                        lastNotOnlineProbeTime = void 0;
                        i = _rowInfo.rowObj.history.length - 1;
                        while (_rowInfo.rowObj.history[i] && i > -1) {
                            if (_rowInfo.rowObj.history[i].status != 'online') {
                                lastNotOnlineProbeTime = _rowInfo.rowObj.history[i].timestamp;
                            }
                            i--;
                        }
                        return [4 /*yield*/, config.getParam('timeToAlarmMS')];
                    case 4:
                        timeToAlarmMS = _b.sent();
                        if (new Date().getTime() - lastNotOnlineProbeTime >= timeToAlarmMS.value) {
                            _rowInfo.rowObj.isAlarmed = true;
                        }
                        _b.label = 5;
                    case 5:
                        if (!(action.payload.status == 'online' && action.payload.history[action.payload.history.length - 2].status != 'online')) return [3 /*break*/, 7];
                        return [4 /*yield*/, config.getParam('unmuteOnGettingOnline')];
                    case 6:
                        unmuteOnGettingOnline = _b.sent();
                        if (unmuteOnGettingOnline.value) {
                            _rowInfo.rowObj.isMuted = false;
                        }
                        _b.label = 7;
                    case 7:
                        //save to state
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign({}, _state);
                        return [3 /*break*/, 10];
                    case 8:
                        if (!__validateInputs(action.payload, ['rowId', 'key', 'value'])) {
                            loger.out("ROW_SET_PROP Error: expected to recive rowId,key and value");
                            return [3 /*break*/, 10];
                        }
                        _newMonitors = __spreadArray([], _state.monitors);
                        _rowInfo = __getRow(action.payload, _newMonitors);
                        if (typeof _rowInfo.rowObj[_rowInfo.payloadObj.key] == 'undefined') {
                            loger.out("ROW_SET_PROP error unknown key of the row. Key:" + _rowInfo.payloadObj.key + " RowId:" + _rowInfo.payloadObj.rowId);
                            return [3 /*break*/, 10];
                        }
                        if (_rowInfo.rowObj[_rowInfo.payloadObj.key] === _rowInfo.payloadObj.value) {
                            loger.out("ROW_SET_PROP warn value is already set. Key:" + _rowInfo.payloadObj.key + " RowId:" + _rowInfo.payloadObj.rowId);
                            return [3 /*break*/, 10];
                        }
                        _rowInfo.rowObj[_rowInfo.payloadObj.key] = _rowInfo.payloadObj.value;
                        _rowInfo.rowStr = JSON.stringify(_rowInfo.rowObj);
                        _newMonitors[_rowInfo.monitorIndex].rows[_rowInfo.rowIndex] = _rowInfo.rowStr;
                        _state = __assign(__assign({}, _state), { monitors: _newMonitors });
                        return [3 /*break*/, 10];
                    case 9:
                        loger.out("Reducer error: Unknown action type: " + action.action);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, _state];
                }
            });
        }); };
        this.__setState = function (_state) {
            var _prevState = __assign({}, _this.__state);
            _this.__state = __assign({}, _state);
            //limit to 20 elements
            if (_this.__history.length >= 20) {
                // removes first element of the array: [1,2,3] > [2,3]
                _this.__history.shift();
            }
            //TODO we need to save hispory only on user inputs not background services
            // but how cat we get list of changed parameters?
            // if([].indexOf() != -1){
            // }
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
                    case 0: return [4 /*yield*/, this.__reduce(this.__state, action)];
                    case 1:
                        _newState = _a.sent();
                        return [2 /*return*/, this.__setState(_newState) ? true : false];
                }
            });
        }); };
        this.subscribe = function (_callback) {
            _this.__subscribers.push(_callback);
        };
        this.__state = this.__stateNow();
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
