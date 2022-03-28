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
    var dev = true;
    var fileManager = require('./components/fileManager');
    var config = require('./components/config');
    var loger = require('./components/loger');
    var pinger = require('./components/pinger');
    var stateManager = require('./components/stateManager');
    var store = new stateManager();
    var comunicatorCore = require('./components/comunicatorCore');
    var pingCheck = function (_coreState) {
        return true;
    };
    var monitorCheck = function (_coreState) {
        return true;
    };
    var windowCheck = function (_coreState) {
        return true;
    };
    var compute = function (_coreState) {
        if (!pingCheck(_coreState)) {
        }
        if (!monitorCheck(_coreState)) {
        }
        if (!windowCheck(_coreState)) {
        }
        //sconsole.log('computing finished')
    };
    store.subscribe(compute); //execute compute on any state change
    var app = require('electron').app;
    app.whenReady().then(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (dev) {
                    testComponents(fileManager, config, loger, pinger, store);
                }
                return [2 /*return*/];
            });
        });
    });
};
pingMonitor();
var testComponents = function (fileManager, config, loger, pinger, store) { return __awaiter(_this, void 0, void 0, function () {
    var testFileName, fileContent, wasDeleted, testConfigValue, setResult, testValueResult, pingResult, valueForTesting, stateManagerTestResult, undo;
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
                store.dispach({ action: 'setPropertyForTesting', payload: valueForTesting });
                store.dispach({ action: 'setPropertyForTesting', payload: 42 });
                undo = store.undo();
                if (undo) {
                    if (store.__stateNow().propertyForTesting == valueForTesting) {
                        stateManagerTestResult = true;
                    }
                }
                if (stateManagerTestResult) {
                    console.log('[PASS] test 5 stateManager!');
                }
                else {
                    console.log('[FAIL] test 5 stateManager!');
                    console.log("Expected:" + valueForTesting + " Recived:" + store.__stateNow().propertyForTesting);
                }
                return [2 /*return*/];
        }
    });
}); };
