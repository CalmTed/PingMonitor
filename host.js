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
var _this = this;
var pingMonitor = function () {
    var version = '1.4';
    var dev = false;
    var actionTypes = require('./components/actionTypes');
    var fileManager = require('./components/fileManager');
    var config = require('./components/config');
    var loger = require('./components/loger');
    var pinger = require('./components/pinger');
    var stateManager = require('./components/stateManager');
    var store = new stateManager();
    var comunicatorCore = require('./components/comunicatorCore');
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
                        return __awaiter(_this, void 0, void 0, function () {
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
                                        loger.out("Unsuccessfull ping probe! Error: " + pingResult.errorMessage + ". Row:id:" + _rowObj_1.rowId + " ip:" + _rowObj_1.ipAddress);
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
    var monitorCheck = function (_coreState, _resolve) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            //if(no monitor) reduce(add default Monitor with initial Rows)
            if (_coreState.monitors.length < 1) {
                _resolve = {
                    set: true,
                    action: actionTypes.ADD_NEW_MONITOR
                };
            }
            return [2 /*return*/, _resolve];
        });
    }); };
    var windowCheck = function (_coreState, _prevState, _resolve) {
        var checkFullDifference = function (_obj1, _obj2) {
            var _ret = {};
            //we expect two objects to have the same scheme to minimize computation time
            // Object.entries(_obj1).forEach(([_k,_v])=>{
            //   if(typeof _obj1[_k] != 'object'){
            //     if(_obj1[_k] !== _obj2[_k]){
            //       _ret._k = _v
            //     }
            //   }else{
            //     // _ret._k = checkFullDifference(_obj1[_k],_obj2[_k])
            //   }
            // })
            return _ret;
        };
        // let differenceObject:any = checkFullDifference(_coreState.monitors,_prevState.monitors)
        // console.log(differenceObject)
        //checkDifference of monitorStates
        // if(number on wins not the same)  addWindow|removeWindow
        // for(windows where subscribiptionKey in the list of changed monitors)
        // updateWindow(winState) > communicatorCore
        return _resolve;
    };
    var compute = function (_coreState, _prevState) { return __awaiter(_this, void 0, void 0, function () {
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
                    _resolve = pingCheck(_coreState, _resolve);
                    if (!!_resolve.set) return [3 /*break*/, 2];
                    return [4 /*yield*/, monitorCheck(_coreState, _resolve)];
                case 1:
                    _resolve = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!_resolve.set) {
                        _resolve = windowCheck(_coreState, _prevState, _resolve);
                    }
                    if (!!_resolve.set) return [3 /*break*/, 3];
                    return [3 /*break*/, 5];
                case 3:
                    console.log("computing resolved with " + _resolve.action + " " + _resolve.payload);
                    return [4 /*yield*/, store.dispach({ action: _resolve.action, payload: _resolve.payload })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    store.subscribe(compute); //execute compute on any state change
    var app = require('electron').app;
    app.whenReady().then(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (dev) {
                    // testComponents(fileManager,config,loger,pinger,store)
                }
                return [2 /*return*/];
            });
        });
    });
};
pingMonitor();
var testComponents = function (fileManager, config, loger, pinger, store) { return __awaiter(_this, void 0, void 0, function () {
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
                    console.log("" + (!fileContent.success ? fileContent.errorMessage : ''));
                    console.log("" + (!wasDeleted.success ? wasDeleted.errorMessage : ''));
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
                    console.log("Recived: " + testValueResult.value + " Expected:" + testConfigValue);
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
                console.log(recivedValue + " " + valueForTesting);
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
                    console.log("Expected:" + valueForTesting + " Recived:" + recivedValue);
                }
                return [2 /*return*/];
        }
    });
}); };
