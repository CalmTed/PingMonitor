"use strict";
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
exports.__esModule = true;
var electron_1 = require("electron");
var pingMonitor = function () {
    var version = process.env.npm_package_version ? process.env.npm_package_version : '1.4.0';
    var lang = process.env.LANG;
    var dev = (process.env.npm_lifecycle_event === 'tstart');
    var prefix = process.env.npm_lifecycle_event !== 'tstart' ? '../../' : './';
    var _a = require('electron'), app = _a.app, dialog = _a.dialog;
    var actionTypes = require(prefix + 'components/actionTypes');
    var fileManager = require(prefix + 'components/fileManager');
    var config = require(prefix + 'components/config');
    var loger = require(prefix + 'components/loger');
    var pinger = require(prefix + 'components/pinger');
    var stateManager = require(prefix + 'components/stateManager');
    var store = new stateManager({
        version: version,
        dialog: dialog,
        fileManager: fileManager,
        actionTypes: actionTypes,
        loger: loger,
        config: config,
        pinger: pinger
    });
    var comunicatorCore = require(prefix + 'components/comunicatorCore');
    var comunicator = new comunicatorCore();
    var windows = {};
    var dontQuitApp = false;
    var lastAutosave = new Date().getTime();
    var pingCheck = function (_coreState, _resolve) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            _coreState.monitors.forEach(function (_mon) { return __awaiter(void 0, void 0, void 0, function () {
                var timeNow;
                return __generator(this, function (_a) {
                    timeNow = new Date().getTime();
                    _mon.rows.forEach(function (_rowStr) { return __awaiter(void 0, void 0, void 0, function () {
                        var isBusy, isPaused, _rowObj, _rowObj;
                        return __generator(this, function (_a) {
                            if (!_resolve.set) {
                                isBusy = _rowStr.includes("\"isBusy\":true");
                                isPaused = _rowStr.includes("\"isPaused\":true");
                                if (!isBusy) {
                                    if (!isPaused) {
                                        _rowObj = JSON.parse(_rowStr);
                                        _resolve = {
                                            set: true,
                                            action: actionTypes.ROW_SET_PROP,
                                            payload: "{\"rowId\":".concat(_rowObj.rowId, ",\"key\":\"isBusy\",\"value\":true}")
                                        };
                                    } //end is paused
                                }
                                else { //it is busy
                                    _rowObj = JSON.parse(_rowStr);
                                    if (!isPaused) {
                                        //check time
                                        if (_rowObj.lastPinged + _rowObj.updateTimeMS < timeNow) {
                                            _resolve = {
                                                set: true,
                                                action: actionTypes.ROW_SUBMIT_PING_PROBE,
                                                payload: JSON.stringify({ rowId: _rowObj.rowId })
                                            };
                                        }
                                    }
                                    else {
                                        _resolve = {
                                            set: true,
                                            action: actionTypes.ROW_SET_PROP,
                                            payload: "{\"rowId\":".concat(_rowObj.rowId, ",\"key\":\"isBusy\",\"value\":false}")
                                        };
                                    }
                                }
                            } //end is resolve.set
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/, _resolve];
        });
    }); };
    var monitorCheck = function (_coreState, _prevState, _resolve) {
        // if number on wins is not the same then  addWindow|removeWindow
        var monitorsIds = function (_state) {
            var _monsArrNum = [];
            _monsArrNum = _state.monitors.map(function (_mon) { return Number(_mon.monitorId); });
            return _monsArrNum;
        };
        var uniqueWinSubs = function (_state) {
            var _numOfWins = [];
            _state.windows.forEach(function (_window) {
                var subKey = Number(JSON.parse(_window).subscriptionKey);
                if (_numOfWins.indexOf(subKey) == -1) {
                    _numOfWins.push(subKey);
                }
            });
            return _numOfWins;
        };
        var findAllExtraWindowsStr = function (_state, _monIds, _subKeys) {
            var _winArr = [];
            _subKeys.forEach(function (_subKey) {
                if (!_monIds.includes(_subKey)) {
                    _state.windows.forEach(function (_win) {
                        if (_win.includes("\"subscriptionKey\":\"".concat(_subKey, "\""))) {
                            _winArr.push(_win);
                        }
                    });
                }
            });
            return _winArr;
        };
        var findAllUnwindowedMonitors = function (_state, _monIds, _subKeys) {
            var _monitArr = [];
            _state.monitors.forEach(function (_mon) {
                if (!_subKeys.includes(_mon.monitorId)) {
                    _monitArr.push(_mon);
                }
            });
            return _monitArr;
        };
        var _uniqueWinSubsArr = uniqueWinSubs(_coreState);
        var _monitorsIdsArr = monitorsIds(_coreState);
        var _extraWindowsStrArr = findAllExtraWindowsStr(_coreState, _monitorsIdsArr, _uniqueWinSubsArr);
        var _unwindowedMonitors = findAllUnwindowedMonitors(_coreState, _monitorsIdsArr, _uniqueWinSubsArr);
        if (_unwindowedMonitors.length > 0) { //add window
            _resolve = {
                set: true,
                action: actionTypes.ADD_NEW_WINDOW_BY_SUBKEY,
                //we can't loop throght full list, so lets choose just first one for this iteration
                payload: _unwindowedMonitors[0].monitorId.toString()
            };
        }
        else if (_extraWindowsStrArr.length > 0) { //remove window with unused monitor id
            _resolve = {
                set: true,
                action: actionTypes.REMOVE_WINDOW_BY_ID,
                //selecting only first element in case if difference is more then one window
                payload: JSON.parse(_extraWindowsStrArr[0]).winId.toString()
            };
        }
        if (!monitorsIds.length) {
            _resolve = {
                set: true,
                action: actionTypes.ADD_NEW_MONITOR,
                payload: ''
            };
        }
        return _resolve;
    };
    var windowCheck = function (_coreState, _prevState, _resolve) { return __awaiter(void 0, void 0, void 0, function () {
        var getNormalWindow, uncreatedBrowserWindowsF, undelitedBrowserWindowsF, uncreatedBrowserWIndows, undelitedBrowserWindows, _configData_1, checkFullDifference, differenceObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getNormalWindow = function (winData) {
                        if (winData === void 0) { winData = { w: 700, h: 400, show: false }; }
                        return __awaiter(void 0, void 0, void 0, function () {
                            var _aot, _aotC, _htb, _htbC, _ret;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _aot = false;
                                        return [4 /*yield*/, config.getParam('alwaysShowOnTop')];
                                    case 1:
                                        _aotC = _a.sent();
                                        _aotC.success ? _aot = _aotC.value : 0;
                                        _htb = true;
                                        return [4 /*yield*/, config.getParam('hideTitleBar')];
                                    case 2:
                                        _htbC = _a.sent();
                                        _aotC.success ? _htb = !_htbC.value : 0;
                                        _ret = new electron_1.BrowserWindow({
                                            width: winData.w,
                                            height: winData.h,
                                            icon: __dirname + '/assets/PM.ico',
                                            autoHideMenuBar: true,
                                            webPreferences: {
                                                nodeIntegration: true,
                                                contextIsolation: false
                                            },
                                            alwaysOnTop: _aot,
                                            frame: _htb,
                                            // titleBarStyle:_htb?'default':'hidden',
                                            transparent: !_htb,
                                            // resizable:true,
                                            // devTools:true,
                                            show: winData.show
                                        });
                                        return [2 /*return*/, _ret];
                                }
                            });
                        });
                    };
                    uncreatedBrowserWindowsF = function (_state) {
                        var _ret = [];
                        _state.windows.forEach(function (_wStr) {
                            var _wObj = JSON.parse(_wStr);
                            if (windows[_wObj.winId] == undefined) {
                                _ret.push(_wObj.winId);
                            }
                        });
                        return _ret;
                    };
                    undelitedBrowserWindowsF = function (_state) {
                        var _ret = [];
                        Object.keys(windows).forEach(function (_wId) {
                            if (_state.windows.filter(function (_wStr) { return _wStr.indexOf("\"winId\":".concat(_wId)) > -1; }).length == 0) {
                                _ret.push(_wId);
                            }
                        });
                        return _ret;
                    };
                    uncreatedBrowserWIndows = uncreatedBrowserWindowsF(_coreState);
                    undelitedBrowserWindows = undelitedBrowserWindowsF(_coreState);
                    if (!uncreatedBrowserWIndows.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, config.getState()];
                case 1:
                    _configData_1 = _a.sent();
                    uncreatedBrowserWIndows.forEach(function (_winId) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = windows;
                                    _b = _winId;
                                    return [4 /*yield*/, getNormalWindow()];
                                case 1:
                                    _a[_b] = _c.sent();
                                    windows[_winId].loadFile('pm.html');
                                    // windows[_winId].removeMenu();
                                    windows[_winId].setBackgroundColor('#222222');
                                    //this events are not async!
                                    windows[_winId].on('close', function (e) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            store.queue({ action: actionTypes.MONITOR_AUTOSAVE, payload: '' });
                                            store.queue({
                                                action: 'removeWindowById',
                                                payload: JSON.stringify({ winId: _winId })
                                            });
                                            return [2 /*return*/];
                                        });
                                    }); });
                                    windows[_winId].on('ready-to-show', function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, comunicator.send({
                                                        window: windows[_winId],
                                                        command: 'sendInitData',
                                                        payload: JSON.stringify({ winId: _winId, configData: _configData_1, isProduction: process.env.npm_lifecycle_event !== 'tstart' })
                                                    })];
                                                case 1:
                                                    _a.sent();
                                                    windows[_winId].show();
                                                    if (dontQuitApp) {
                                                        dontQuitApp = false;
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    _a.label = 2;
                case 2:
                    if (undelitedBrowserWindows.length) {
                        if (store.__lastSave + 60 * 1000 < new Date().getTime()) {
                            return [2 /*return*/, _resolve = {
                                    action: actionTypes.MONITOR_AUTOSAVE,
                                    payload: ''
                                }];
                        }
                        undelitedBrowserWindows.forEach(function (_winId) {
                            windows[_winId].destroy();
                            delete windows[_winId];
                        });
                    }
                    if (_resolve.set) {
                        return [2 /*return*/, _resolve];
                    }
                    checkFullDifference = function (_obj1, _obj2) {
                        var checkDiffStr = function (_one, _two) {
                            if (!_two) {
                                return true;
                            }
                            return _one !== _two;
                        };
                        var _ret = {};
                        //we expect two objects to have the same scheme to minimize computation time
                        Object.entries(_obj1).forEach(function (_a) {
                            var _k = _a[0], _v = _a[1];
                            if (typeof _obj1[_k] != 'object') { //its a string or a number
                                if (typeof _obj2 != 'undefined') {
                                    if (typeof _obj2[_k] != 'undefined') {
                                        var strDiff = checkDiffStr(_obj1[_k].toString(), _obj2[_k].toString());
                                        if (strDiff) {
                                            _ret[_k] = _obj1[_k];
                                        }
                                    }
                                    else {
                                        _ret[_k] = _obj1[_k]; //added new element
                                    }
                                }
                                else {
                                    _ret = _obj1; //added new element
                                }
                            }
                            else { //its an object
                                if (typeof _obj2[_k] != 'undefined') { //prev obj have it, so its not new
                                    if (Array.isArray(_obj1[_k])) { //its an array
                                        _obj1[_k].forEach(function (_obj1El, __obj1ElIndex) {
                                            var _a, _b;
                                            if (checkDiffStr(_obj1El.toString(), (_b = (_a = _obj2[_k]) === null || _a === void 0 ? void 0 : _a[__obj1ElIndex]) === null || _b === void 0 ? void 0 : _b.toString())) {
                                                if (!_ret[_k]) {
                                                    _ret[_k] = [];
                                                }
                                                _ret[_k].push(_obj1El);
                                            }
                                        });
                                    }
                                    else { //its an object
                                        _ret[_k] = checkFullDifference(_obj1[_k], _obj2[_k]);
                                    }
                                }
                                else { //its new, add it
                                    _ret[_k] = _obj1[_k];
                                }
                            }
                        });
                        return _ret;
                    };
                    if (typeof _coreState.monitors != 'undefined') {
                        differenceObject = checkFullDifference(_coreState.monitors, _prevState.monitors);
                        Object.entries(differenceObject).forEach(function (_a) {
                            var _monInd = _a[0], _monVal = _a[1];
                            return __awaiter(void 0, void 0, void 0, function () {
                                var targetId;
                                return __generator(this, function (_b) {
                                    targetId = _coreState.monitors[_monInd].monitorId;
                                    _coreState.windows.forEach(function (_winStr) { return __awaiter(void 0, void 0, void 0, function () {
                                        var _winObj;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!_winStr.includes("\"subscriptionKey\":\"".concat(targetId, "\""))) return [3 /*break*/, 2];
                                                    _winObj = JSON.parse(_winStr);
                                                    //copying monitor state to send row data to the window
                                                    _winObj.monitor = _coreState.monitors[_monInd];
                                                    // update window with communicatorCore
                                                    return [4 /*yield*/, comunicator.send({
                                                            window: windows[_winObj.winId],
                                                            command: 'sendWinState',
                                                            payload: JSON.stringify(_winObj)
                                                        })];
                                                case 1:
                                                    // update window with communicatorCore
                                                    _a.sent();
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    return [2 /*return*/];
                                });
                            });
                        });
                    }
                    return [2 /*return*/, _resolve];
            }
        });
    }); };
    var compute = function (_coreState, _prevState) { return __awaiter(void 0, void 0, void 0, function () {
        var _resolve, time, busyRows_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _resolve = {
                        set: false,
                        action: {
                            action: ''
                        }
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!!_resolve.set) return [3 /*break*/, 3];
                    return [4 /*yield*/, pingCheck(_coreState, _resolve)];
                case 2:
                    _resolve = _a.sent();
                    _a.label = 3;
                case 3:
                    if (!!_resolve.set) return [3 /*break*/, 5];
                    return [4 /*yield*/, windowCheck(_coreState, _prevState, _resolve)];
                case 4:
                    _resolve = _a.sent();
                    _a.label = 5;
                case 5:
                    if (!_resolve.set) {
                        _resolve = monitorCheck(_coreState, _prevState, _resolve);
                    }
                    if (!_resolve.set) {
                        time = new Date().getTime();
                        if (lastAutosave + (60 * 1000) < time) {
                            lastAutosave = time;
                            _resolve = {
                                set: true,
                                action: actionTypes.MONITOR_AUTOSAVE,
                                payload: ''
                            };
                        }
                    }
                    if (_resolve.set) {
                        dev ? console.debug('Computed with action:', _resolve.action, _resolve.payload) : 0;
                        store.queue({ action: _resolve.action, payload: _resolve.payload });
                    }
                    else { //if no resolve
                        busyRows_1 = 0;
                        _coreState.monitors.forEach(function (_monitor) {
                            _monitor.rows.forEach(function (_rowStr) {
                                if (_rowStr.includes("\"isBusy\":true")) {
                                    busyRows_1++;
                                }
                            });
                        });
                        if (busyRows_1) {
                            setTimeout(function () {
                                store.queue({ action: 'setPropertyForTesting', payload: Math.round((Math.random() * 1000) * 1000) });
                                // compute(_coreState,_prevState)
                            }, 500);
                        }
                        //if there are some busy rows 
                        //set timeout of 1000 to continue computing
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    dialog.showErrorBox('Error', "Unable to compute\nError:".concat(err_1));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var renderConfig = function (_newConfigObj, _windows) {
        //render always on top for all windows
        var _needToChangeAOT = _newConfigObj.alwaysShowOnTop != Object.entries(windows)[0][1].isAlwaysOnTop();
        if (_needToChangeAOT) {
            Object.entries(windows).forEach(function (_a) {
                var _wk = _a[0], _wv = _a[1];
                _wv.setAlwaysOnTop(_newConfigObj.alwaysShowOnTop, 'screen-saver');
                _wv.setOpacity(_newConfigObj.alwaysShowOnTop ? 0.9 : 1);
            });
        }
    };
    store.subscribe(compute);
    comunicator.subscribe({
        channel: 'window',
        commandListString: 'dispachAction, getConfigData, configSetProp, configRestoreDefaults',
        callback: function (_a) {
            var command = _a.command, payload = _a.payload;
            return __awaiter(void 0, void 0, void 0, function () {
                var dispachAction, getConfigData, configSetProp, configRestoreDefaults, _b, err_2, err_3, err_4, err_5;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            dispachAction = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
                                var _plObj, startTime, actionResult, endTime;
                                return __generator(this, function (_a) {
                                    dev ? console.debug('resived action', payload) : null;
                                    _plObj = JSON.parse(payload);
                                    if (_plObj.action == 'monitorImportConfig') {
                                        dontQuitApp = true;
                                    }
                                    startTime = new Date().getTime();
                                    actionResult = store.queue({ action: _plObj.action, payload: _plObj.payload });
                                    endTime = new Date().getTime();
                                    dev ? console.debug("Time to queue user action ".concat(endTime - startTime, "ms")) : 0;
                                    if (actionResult && _plObj.action == 'monitorImportConfig') {
                                        setTimeout(function () {
                                            if (dontQuitApp) {
                                                dontQuitApp = false;
                                            }
                                        }, 30000);
                                    }
                                    return [2 /*return*/];
                                });
                            }); };
                            getConfigData = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
                                var _plObj, _configData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            dev ? console.debug('resived request for config', payload) : 0;
                                            _plObj = JSON.parse(payload);
                                            return [4 /*yield*/, config.getState()];
                                        case 1:
                                            _configData = _a.sent();
                                            return [4 /*yield*/, comunicator.send({
                                                    window: windows[_plObj],
                                                    command: 'sendConfig',
                                                    payload: _configData
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            configSetProp = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
                                var _plObj, _configSetResult, _configData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            dev ? console.debug('resived request to change config', payload) : 0;
                                            _plObj = JSON.parse(payload);
                                            return [4 /*yield*/, config.setParam({ key: _plObj.key, value: _plObj.value })];
                                        case 1:
                                            _configSetResult = _a.sent();
                                            if (_configSetResult.success == false) {
                                                return [2 /*return*/, 0];
                                            }
                                            return [4 /*yield*/, config.getState()];
                                        case 2:
                                            _configData = _a.sent();
                                            renderConfig(_configData, windows); //updating window visibility
                                            //sending new config
                                            Object.entries(windows).forEach(function (_a) {
                                                var _winId = _a[0], _winObj = _a[1];
                                                return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0: return [4 /*yield*/, comunicator.send({
                                                                    window: _winObj,
                                                                    command: 'sendConfig',
                                                                    payload: _configData
                                                                })];
                                                            case 1:
                                                                _b.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                });
                                            });
                                            if (!(_plObj.key == 'langCode')) return [3 /*break*/, 4];
                                            return [4 /*yield*/, store.queue({ action: 'writeNewLangWords', payload: _plObj.value })];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); };
                            configRestoreDefaults = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
                                var _configSetResult, _configData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            dev ? console.debug('resived request to restore defaults of config', payload) : 0;
                                            return [4 /*yield*/, config.restoreDefault()];
                                        case 1:
                                            _configSetResult = _a.sent();
                                            if (_configSetResult.success == false) {
                                                return [2 /*return*/, 0];
                                            }
                                            return [4 /*yield*/, config.getState()];
                                        case 2:
                                            _configData = _a.sent();
                                            renderConfig(_configData, windows);
                                            Object.entries(windows).forEach(function (_a) {
                                                var _winId = _a[0], _winObj = _a[1];
                                                return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0: return [4 /*yield*/, comunicator.send({
                                                                    window: _winObj,
                                                                    command: 'sendConfig',
                                                                    payload: _configData
                                                                })];
                                                            case 1:
                                                                _b.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                });
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            _b = command;
                            switch (_b) {
                                case 'dispachAction': return [3 /*break*/, 1];
                                case 'getConfigData': return [3 /*break*/, 5];
                                case 'configSetProp': return [3 /*break*/, 9];
                                case 'configRestoreDefaults': return [3 /*break*/, 13];
                            }
                            return [3 /*break*/, 17];
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, dispachAction(payload)];
                        case 2:
                            _c.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_2 = _c.sent();
                            dialog.showErrorBox('Error', "Unable to dispach action that was recived from a window\nPayload:".concat(payload, "\nError:").concat(err_2));
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 17];
                        case 5:
                            _c.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, getConfigData(payload)];
                        case 6:
                            _c.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            err_3 = _c.sent();
                            dialog.showErrorBox('Error', "Unable to get config data that was requested by a window\nPayload:".concat(payload, "\nError:").concat(err_3));
                            return [3 /*break*/, 8];
                        case 8: return [3 /*break*/, 17];
                        case 9:
                            _c.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, configSetProp(payload)];
                        case 10:
                            _c.sent();
                            return [3 /*break*/, 12];
                        case 11:
                            err_4 = _c.sent();
                            dialog.showErrorBox('Error', "Unable to set config prop that was requested by window\nPayload:".concat(payload, "\nError:").concat(err_4));
                            return [3 /*break*/, 12];
                        case 12: return [3 /*break*/, 17];
                        case 13:
                            _c.trys.push([13, 15, , 16]);
                            return [4 /*yield*/, configRestoreDefaults(payload)];
                        case 14:
                            _c.sent();
                            return [3 /*break*/, 16];
                        case 15:
                            err_5 = _c.sent();
                            dialog.showErrorBox('Error', "Unable to set config defaults that was requested by window\nPayload:".concat(payload, "\nError:").concat(err_5));
                            return [3 /*break*/, 16];
                        case 16: return [3 /*break*/, 17];
                        case 17: return [2 /*return*/];
                    }
                });
            });
        }
    });
    app.whenReady().then(function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        //execute compute on any state change
                        //await store.dispach({action:actionTypes.SET_PROPERTY_FOR_TESTING,payload:42})//to create initial window
                        return [4 /*yield*/, store.queue({ action: actionTypes.MONITOR_AUTOOPEN, payload: '' })]; //to load last autosaved state
                    case 1:
                        //execute compute on any state change
                        //await store.dispach({action:actionTypes.SET_PROPERTY_FOR_TESTING,payload:42})//to create initial window
                        _a.sent(); //to load last autosaved state
                        return [3 /*break*/, 3];
                    case 2:
                        err_6 = _a.sent();
                        dialog.showErrorBox('Error', "Unable to start Ping Monitor\nError:".concat(err_6));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.on('second-instance', function (event, commandLine, workingDirectory) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, store.queue({
                        action: 'addMonitor',
                        payload: JSON.stringify({})
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.on('window-all-closed', function () {
        if (!dontQuitApp) {
            //this horrable timeout os for autosave to be able to save in time
            //because close event is not async and will not wait for fileSystem
            dev ? console.debug('waiting to close app') : 0;
            setTimeout(function () {
                if (process.platform !== 'darwin')
                    app.quit();
            }, 4000);
        }
        else {
            console.debug('will not close all windows');
        }
    });
};
try {
    pingMonitor();
}
catch (err) {
    electron_1.dialog.showErrorBox('Error', "cant start an app\n".concat(err));
}
var testComponents = function (fileManager, config, loger, pinger, store) { return __awaiter(void 0, void 0, void 0, function () {
    var testFileName, fileContent, wasDeleted, testConfigValue, setResult, testValueResult, pingResult, valueForTesting, stateManagerTestResult, recivedQuery, recivedValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                testFileName = '__test.txt';
                return [4 /*yield*/, fileManager.write({ openDialog: false, path: testFileName, content: testFileName })];
            case 1:
                _a.sent();
                return [4 /*yield*/, fileManager.read({ openDialog: false, path: testFileName })];
            case 2:
                fileContent = _a.sent();
                return [4 /*yield*/, fileManager.remove({ openDialog: false, path: testFileName })];
            case 3:
                wasDeleted = _a.sent();
                if (fileContent.success && wasDeleted.success) {
                    console.debug('[PASS] test 1 fileManager!');
                }
                else {
                    console.debug('[FAIL] test 1 fileManager!');
                    console.debug("".concat(!fileContent.success ? fileContent.errorMessage : ''));
                    console.debug("".concat(!wasDeleted.success ? wasDeleted.errorMessage : ''));
                }
                testConfigValue = Math.round((Math.random() * 1000) * 1000);
                return [4 /*yield*/, config.setParam({ key: '__keyForTesting', value: testConfigValue })];
            case 4:
                setResult = _a.sent();
                return [4 /*yield*/, config.getParam('__keyForTesting')];
            case 5:
                testValueResult = _a.sent();
                if (setResult.success && testValueResult.value == testConfigValue) {
                    console.debug('[PASS] test 2 config!');
                }
                else {
                    console.debug('[FAIL] test 2 config!');
                    typeof setResult.errorMessage != 'undefined' ? console.debug(setResult.errorMessage) : 0;
                    console.debug("Recived: ".concat(testValueResult.value, " Expected:").concat(testConfigValue));
                }
                //logger
                if (loger.out('Initial test')) {
                    console.debug('[PASS] test 3 loger!');
                }
                else {
                    console.debug('[FAIL] test 3 loger!');
                }
                return [4 /*yield*/, pinger.probe({ address: 'localhost', rowId: 0 })];
            case 6:
                pingResult = _a.sent();
                if (pingResult.success) {
                    console.debug('[PASS] test 4 pinger!');
                    // console.debug(pingResult)
                }
                else {
                    console.debug('[FAIL] test 4 pinger!:');
                    console.debug(pingResult.errorMessage);
                }
                valueForTesting = Math.round((Math.random() * 1000) * 1000);
                stateManagerTestResult = false;
                return [4 /*yield*/, store.queue({ action: 'setPropertyForTesting', payload: valueForTesting })];
            case 7:
                _a.sent();
                return [4 /*yield*/, store.queue({ action: 'setPropertyForTesting', payload: 42 })
                    // let undo = await store.undo()
                ];
            case 8:
                _a.sent();
                return [4 /*yield*/, store.__stateNow()];
            case 9:
                recivedQuery = _a.sent();
                recivedValue = recivedQuery.propertyForTesting;
                // if(undo){
                // if(recivedValue == valueForTesting){
                // stateManagerTestResult = true
                // }
                // }
                if (stateManagerTestResult) {
                    console.debug('[PASS] test 5 stateManager!');
                }
                else {
                    console.debug('[FAIL] test 5 stateManager!');
                    console.debug("Expected:".concat(valueForTesting, " Recived:").concat(recivedValue));
                }
                return [2 /*return*/];
        }
    });
}); };
