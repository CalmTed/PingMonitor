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
    var version = '1.4';
    var dev = true;
    var actionTypes = require('./components/actionTypes');
    var fileManager = require('./components/fileManager');
    var config = require('./components/config');
    var loger = require('./components/loger');
    var pinger = require('./components/pinger');
    var stateManager = require('./components/stateManager');
    var store = new stateManager({ version: version });
    var comunicatorCore = require('./components/comunicatorCore');
    var comunicator = new comunicatorCore();
    var app = require('electron').app;
    var windows = {};
    var timeOfStart = 0;
    var pingCheck = function (_coreState, _resolve) {
        _coreState.monitors.forEach(function (_mon) {
            // for(every monitor & every row)
            //ITS MIGHT BE QUITE EXPENCIVE!!
            _mon.rows.forEach(function (_rowStr) {
                if (_rowStr.indexOf("\"isBusy\":false") > -1 && _rowStr.indexOf("\"isPaused\":false") > -1) {
                    var _rowObj_1 = JSON.parse(_rowStr);
                    // if(not paused and not busy) then timeout pingProbe(monitor,row,ip)
                    setTimeout(function (_a) {
                        var _store = _a._store, _actionTypes = _a._actionTypes;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var pingResult;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, pinger.probe({ address: _rowObj_1.ipAddress, rowId: _rowObj_1.rowId })];
                                    case 1:
                                        pingResult = _b.sent();
                                        if (!pingResult.success) return [3 /*break*/, 3];
                                        // dispach(rowId,pingReport)
                                        return [4 /*yield*/, _store.dispach({
                                                action: _actionTypes.ROW_SUBMIT_PING_PROBE,
                                                payload: JSON.stringify(pingResult.payload)
                                            })];
                                    case 2:
                                        // dispach(rowId,pingReport)
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        loger.out("Unsuccessfull ping probe! Error: ".concat(pingResult.errorMessage, ". Row:id:").concat(_rowObj_1.rowId, " ip:").concat(_rowObj_1.ipAddress));
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        });
                    }, _rowObj_1.updateTimeMS, { _store: store, _actionTypes: actionTypes });
                    _resolve.set === false ? _resolve = { set: true, action: actionTypes.ROW_SET_PROP, payload: JSON.stringify({
                            rowId: _rowObj_1.rowId,
                            key: 'isBusy',
                            value: true
                        })
                    } : 0;
                }
            });
        });
        return _resolve;
    };
    var monitorCheck = function (_coreState, _prevState, _resolve) {
        //if(no monitor) reduce(add default Monitor with initial Rows)
        if (_coreState.monitors.length < 1) {
            _resolve = {
                set: true,
                action: actionTypes.ADD_NEW_MONITOR
            };
        }
        if (_resolve.set) {
            return _resolve;
        }
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
            _coreState.monitors.forEach(function (_mon) {
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
        return _resolve;
    };
    var windowCheck = function (_coreState, _prevState, _resolve) {
        var getNormalWindow = function (winData) {
            if (winData === void 0) { winData = { w: 700, h: 400, show: false }; }
            var _ret = new electron_1.BrowserWindow({
                width: winData.w,
                height: winData.h,
                icon: __dirname + '/assets/PM.ico',
                autoHideMenuBar: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                },
                // devTools:true,
                show: winData.show
            });
            return _ret;
        };
        // do we need to add new browser window
        var uncreatedBrowserWIndowsF = function (_state) {
            var _ret = [];
            _state.windows.forEach(function (_wStr) {
                var _wObj = JSON.parse(_wStr);
                if (windows[_wObj.winId] == undefined) {
                    _ret.push(_wObj.winId);
                }
            });
            return _ret;
        };
        // do we need to remove some browser windows
        var undelitedBrowserWindowsF = function (_state) {
            var _ret = [];
            Object.keys(windows).forEach(function (_wId) {
                if (_state.windows.filter(function (_wStr) { return _wStr.indexOf("\"winId\":".concat(_wId)) > -1; }).length == 0) {
                    _ret.push(_wId);
                }
            });
            return _ret;
        };
        var uncreatedBrowserWIndows = uncreatedBrowserWIndowsF(_coreState);
        var undelitedBrowserWindows = undelitedBrowserWindowsF(_coreState);
        // console.log('Uncreated windows',uncreatedBrowserWIndows)
        // console.log('Undeleted windows',undelitedBrowserWindows)
        if (uncreatedBrowserWIndows.length) {
            uncreatedBrowserWIndows.forEach(function (_winId) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    windows[_winId] = getNormalWindow();
                    windows[_winId].loadFile('pm.html');
                    windows[_winId].on('ready-to-show', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, comunicator.send({
                                        window: windows[_winId],
                                        command: 'sendWinId',
                                        payload: _winId
                                    })];
                                case 1:
                                    _a.sent();
                                    windows[_winId].show();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
        }
        if (undelitedBrowserWindows.length) {
            undelitedBrowserWindows.forEach(function (_winId) {
                windows[_winId].destroy();
            });
        }
        if (_resolve.set) {
            return _resolve;
        }
        var checkFullDifference = function (_obj1, _obj2) {
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
                    if (typeof _obj2[_k] != 'undefined') {
                        var strDiff = checkDiffStr(_obj1[_k].toString(), _obj2[_k].toString());
                        if (strDiff.length > 0) {
                            _ret[_k] = _obj1[_k];
                        }
                    }
                    else {
                        _ret[_k] = _obj1[_k]; //added new element
                    }
                }
                else {
                    _ret[_k] = checkFullDifference(_obj1[_k], _obj2[_k]);
                }
            });
            return _ret;
        };
        if (typeof _coreState.monitors != 'undefined') {
            var differenceObject = checkFullDifference(_coreState.monitors, _prevState.monitors);
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
                                        if (!(_winStr.indexOf("\"subscriptionKey\":\"".concat(targetId, "\"")) > -1)) return [3 /*break*/, 2];
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
        return _resolve;
    };
    var compute = function (_coreState, _prevState) { return __awaiter(void 0, void 0, void 0, function () {
        var _resolve;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _resolve = {
                        set: false,
                        action: {
                            action: ''
                        }
                    };
                    if (!_resolve.set) {
                        _resolve = windowCheck(_coreState, _prevState, _resolve);
                    }
                    if (!_resolve.set) {
                        _resolve = pingCheck(_coreState, _resolve);
                    }
                    if (!_resolve.set) {
                        _resolve = monitorCheck(_coreState, _prevState, _resolve);
                    }
                    if (!!_resolve.set) return [3 /*break*/, 1];
                    return [3 /*break*/, 3];
                case 1:
                    dev ? console.log('Computed with action:', _resolve.action, _resolve.payload) : 0;
                    return [4 /*yield*/, store.dispach({ action: _resolve.action, payload: _resolve.payload })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    store.subscribe(compute); //execute compute on any state change
    comunicator.subscribe({
        channel: 'window',
        commandListString: 'dispachAction',
        callback: function (_pl) { return __awaiter(void 0, void 0, void 0, function () {
            var _plObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dev ? console.log('resived action', _pl) : 0;
                        _plObj = JSON.parse(_pl.payload);
                        return [4 /*yield*/, store.dispach({ action: _plObj.action, payload: _plObj.payload })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    });
    app.whenReady().then(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeOfStart = new Date().getTime();
                        return [4 /*yield*/, store.dispach({ action: actionTypes.SET_PROPERTY_FOR_TESTING, payload: 42 })];
                    case 1:
                        _a.sent();
                        if (dev) {
                            // testComponents(fileManager,config,loger,pinger,store)
                        }
                        else {
                        }
                        return [2 /*return*/];
                }
            });
        });
    });
};
pingMonitor();
var testComponents = function (fileManager, config, loger, pinger, store) { return __awaiter(void 0, void 0, void 0, function () {
    var testFileName, fileContent, wasDeleted, testConfigValue, setResult, testValueResult, pingResult, valueForTesting, stateManagerTestResult, undo, recivedValue;
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
                    console.log('[PASS] test 1 fileManager!');
                }
                else {
                    console.log('[FAIL] test 1 fileManager!');
                    console.log("".concat(!fileContent.success ? fileContent.errorMessage : ''));
                    console.log("".concat(!wasDeleted.success ? wasDeleted.errorMessage : ''));
                }
                testConfigValue = Math.round((Math.random() * 1000) * 1000);
                return [4 /*yield*/, config.setParam({ key: '__keyForTesting', value: testConfigValue })];
            case 4:
                setResult = _a.sent();
                return [4 /*yield*/, config.getParam('__keyForTesting')];
            case 5:
                testValueResult = _a.sent();
                if (setResult.success && testValueResult.value == testConfigValue) {
                    console.log('[PASS] test 2 config!');
                }
                else {
                    console.log('[FAIL] test 2 config!');
                    typeof setResult.errorMessage != 'undefined' ? console.log(setResult.errorMessage) : 0;
                    console.log("Recived: ".concat(testValueResult.value, " Expected:").concat(testConfigValue));
                }
                //logger
                if (loger.out('Initial test')) {
                    console.log('[PASS] test 3 loger!');
                }
                else {
                    console.log('[FAIL] test 3 loger!');
                }
                return [4 /*yield*/, pinger.probe({ address: 'localhost', rowId: 0 })];
            case 6:
                pingResult = _a.sent();
                if (pingResult.success) {
                    console.log('[PASS] test 4 pinger!');
                    // console.log(pingResult)
                }
                else {
                    console.log('[FAIL] test 4 pinger!:');
                    console.log(pingResult.errorMessage);
                }
                valueForTesting = Math.round((Math.random() * 1000) * 1000);
                stateManagerTestResult = false;
                return [4 /*yield*/, store.dispach({ action: 'setPropertyForTesting', payload: valueForTesting })];
            case 7:
                _a.sent();
                return [4 /*yield*/, store.dispach({ action: 'setPropertyForTesting', payload: 42 })];
            case 8:
                _a.sent();
                undo = store.undo();
                recivedValue = store.__stateNow().propertyForTesting;
                if (undo) {
                    if (recivedValue == valueForTesting) {
                        stateManagerTestResult = true;
                    }
                }
                if (stateManagerTestResult) {
                    console.log('[PASS] test 5 stateManager!');
                }
                else {
                    console.log('[FAIL] test 5 stateManager!');
                    console.log("Expected:".concat(valueForTesting, " Recived:").concat(recivedValue));
                }
                return [2 /*return*/];
        }
    });
}); };
