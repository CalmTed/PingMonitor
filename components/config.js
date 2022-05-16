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
var _this = this;
var config = {};
var initConfig = function () {
    var state = {
        langCode: "ua",
        colorMode: "dark",
        alwaysShowOnTop: false,
        hideTitleBar: false,
        initialRows: [
            {
                address: "localhost",
                updateTimeMS: 10000,
                size: '2Small',
                name: "Initial row 1",
                pictureLink: "0 PingMonitor.png",
                isPaused: true,
                isMuted: false
            }
        ],
        defaultNewRow: {
            address: "localhost",
            size: '2Small',
            updateTimeMS: 10000,
            name: "Default row",
            pictureLink: "0 PingMonitor.png",
            isPaused: true,
            isMuted: false
        },
        defaultPingTimeStrategy: {
            online: 10000,
            error: 2000,
            timeout: 2000
        },
        newRowRule: "copyPrev",
        timeToAlarmMS: 10000,
        unmuteOnGettingOnline: true,
        pingHistoryTimeLimitMINS: 360,
        miniGraphShowLimitMINS: 5,
        savePingHistoryToConfig: false,
        logSettings: {
            logChanges: false,
            defaultLogName: "",
            newLogNameEveryday: true,
            timeToLogStatusChangeMS: 10000
        },
        "__keyForTesting": 169346
    };
    return state;
};
var updateState = function (_a) {
    var newState = _a.newState;
    return __awaiter(_this, void 0, void 0, function () {
        var configState, configFilePath, fileManager, configSavingToFile, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, config.getState()];
                case 1:
                    configState = _b.sent();
                    configFilePath = 'assets/config.json';
                    fileManager = require('./fileManager');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fileManager.write({ openDialog: false, path: configFilePath, content: JSON.stringify(newState, undefined, 4) })];
                case 3:
                    configSavingToFile = _b.sent();
                    if (!configSavingToFile.success) {
                        return [2 /*return*/, false];
                    }
                    else {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    //console.log(e)
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
};
config.getState = function () { return __awaiter(_this, void 0, void 0, function () {
    var configFilePath, fileManager, state, configFromFile, configFromFileStr, configFromFileObj, e_2, configSavingToFile, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                configFilePath = 'assets/config.json';
                fileManager = require('./fileManager');
                state = initConfig();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 8]);
                return [4 /*yield*/, fileManager.read({ openDialog: false, path: configFilePath })];
            case 2:
                configFromFile = _a.sent();
                configFromFileStr = configFromFile.payload.content;
                configFromFileObj = JSON.parse(configFromFileStr);
                state = __assign({}, configFromFileObj);
                return [3 /*break*/, 8];
            case 3:
                e_2 = _a.sent();
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, fileManager.write({ openDialog: false, path: configFilePath, content: JSON.stringify(state, undefined, 4) })];
            case 5:
                configSavingToFile = _a.sent();
                if (configSavingToFile.success) {
                    //console.log('Saved to file successfuly')
                }
                else {
                    //console.log('Unable to save initial config to file. Error:'+configSavingToFile.errorMessage)
                }
                return [3 /*break*/, 7];
            case 6:
                e_3 = _a.sent();
                return [3 /*break*/, 7];
            case 7: return [3 /*break*/, 8];
            case 8: return [2 /*return*/, state];
        }
    });
}); };
config.getParam = function (key) { return __awaiter(_this, void 0, void 0, function () {
    var configState, keyPath, neededValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config.getState()];
            case 1:
                configState = _a.sent();
                if (typeof key == 'undefined') {
                    // loger.out('Expected to recive key:string')
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: 'Expected to recive key:string'
                        }];
                }
                keyPath = [];
                keyPath = key.split('_');
                if (keyPath.length > 1) {
                    try {
                        switch (keyPath.length) {
                            case 2:
                                neededValue = configState[keyPath[0]][keyPath[1]];
                                break;
                            case 3:
                                neededValue = configState[keyPath[0]][keyPath[1]][keyPath[2]];
                                break;
                            case 4:
                                neededValue = configState[keyPath[0]][keyPath[1]][keyPath[2]][keyPath[3]];
                                break;
                        }
                    }
                    catch (err) {
                        return [2 /*return*/, {
                                success: false,
                                errorMessage: 'Key does not exist: ' + keyPath.join('_')
                            }];
                    }
                }
                else {
                    try {
                        neededValue = configState[keyPath[0]];
                    }
                    catch (err) {
                        return [2 /*return*/, {
                                success: false,
                                errorMessage: 'Key does not exist: ' + keyPath.join('_')
                            }];
                    }
                }
                //return undefined key
                if (typeof neededValue == 'undefined') {
                    // loger.out(`Key does not exist: ${key}`)
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: "Key does not exist: ".concat(key)
                        }];
                }
                return [2 /*return*/, {
                        success: true,
                        key: key,
                        value: neededValue
                    }];
        }
    });
}); };
config.setParam = function (message) { return __awaiter(_this, void 0, void 0, function () {
    var stateExample, keyPath, neededValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config.getState()
                //lack of key or value
            ];
            case 1:
                stateExample = _a.sent();
                //lack of key or value
                if (typeof message.key == 'undefined' || typeof message.value == 'undefined') {
                    // loger.out('Expected to recive key and value')
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: 'Expected to recive key and value'
                        }];
                }
                keyPath = [];
                keyPath = message.key.split('_');
                if (keyPath.length > 1) {
                    try {
                        switch (keyPath.length) {
                            case 2:
                                neededValue = stateExample[keyPath[0]][keyPath[1]];
                                break;
                            case 3:
                                neededValue = stateExample[keyPath[0]][keyPath[1]][keyPath[2]];
                                break;
                            case 4:
                                neededValue = stateExample[keyPath[0]][keyPath[1]][keyPath[2]][keyPath[3]];
                                break;
                        }
                    }
                    catch (err) {
                        return [2 /*return*/, {
                                success: false,
                                errorMessage: 'Key does not exist: ' + keyPath.join('_')
                            }];
                    }
                }
                else {
                    try {
                        neededValue = stateExample[keyPath[0]];
                    }
                    catch (err) {
                        return [2 /*return*/, {
                                success: false,
                                errorMessage: 'Key does not exist: ' + keyPath.join('_')
                            }];
                    }
                }
                if (typeof neededValue == 'number') {
                    message.value = Number(parseInt(message.value.toString()));
                    message.value == null || isNaN(message.value) ? message.value = 0 : 0;
                }
                if (typeof neededValue !== typeof message.value && ![''].includes(typeof neededValue)) {
                    console.log("Wrong type of the value. Recived:".concat(typeof message.value, ". Expected:").concat(typeof neededValue));
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: "Wrong type of the value. Recived:".concat(typeof message.value, ". Expected:").concat(typeof neededValue)
                        }];
                }
                if (neededValue === message.value) {
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: "No need to change config. Recived:".concat(typeof message.value, ". Expected:").concat(typeof neededValue)
                        }];
                }
                if (keyPath.length < 2) {
                    stateExample[keyPath[0]] = message.value;
                }
                else {
                    switch (keyPath.length) {
                        case 2:
                            stateExample[keyPath[0]][keyPath[1]] = message.value;
                            break;
                        case 3:
                            stateExample[keyPath[0]][keyPath[1]][keyPath[2]] = message.value;
                            break;
                        case 4:
                            stateExample[keyPath[0]][keyPath[1]][keyPath[2]][keyPath[3]] = message.value;
                            break;
                    }
                }
                return [4 /*yield*/, updateState({ newState: stateExample })];
            case 2:
                if (_a.sent()) {
                    return [2 /*return*/, {
                            success: true
                        }];
                }
                else {
                    console.log("Unable to set parameter for unknown reason.");
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: "Unable to set parameter for unknown reason."
                        }];
                }
                return [2 /*return*/];
        }
    });
}); };
config.restoreDefault = function () { return __awaiter(_this, void 0, void 0, function () {
    var newState;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                newState = initConfig();
                return [4 /*yield*/, updateState({ newState: newState })];
            case 1:
                if (_a.sent()) {
                    return [2 /*return*/, {
                            success: true
                        }];
                }
                else {
                    console.log("Unable to set parameter for unknown reason.");
                    return [2 /*return*/, {
                            success: false,
                            errorMessage: "Unable to set parameter for unknown reason."
                        }];
                }
                return [2 /*return*/];
        }
    });
}); };
module.exports = config;
