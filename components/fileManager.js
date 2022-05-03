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
var fileManager = {};
var dialog = require('electron').dialog;
var fs = require("fs");
fileManager.read = function (message) { return __awaiter(_this, void 0, void 0, function () {
    var reply, filepathArray, fileContent;
    return __generator(this, function (_a) {
        filepathArray = [];
        if (message.openDialog) {
            filepathArray = dialog.showOpenDialogSync({
                filters: typeof message.typeFilter != 'undefined' ? message.typeFilter : [],
                title: typeof message.dialogTitle != 'undefined' ? message.dialogTitle : 'Open file...',
                properties: ['openFile']
            });
        }
        else {
            if (typeof message.path != 'undefined') {
                filepathArray[0] = message.path;
            }
            if (typeof message.name != 'undefined') {
                filepathArray[0] = filepathArray[0] += message.name;
            }
        }
        if (filepathArray[0] != 'undefined') {
            fileContent = fs.readFileSync(filepathArray[0], typeof message.encoding != 'undefined' ? message.encoding : 'utf-8', function (err, text) {
                if (!err) {
                    return text;
                }
                else {
                    return false;
                }
            });
            if (fileContent) {
                reply = {
                    success: true,
                    payload: {
                        content: fileContent
                    }
                };
            }
            else {
                reply = {
                    success: false,
                    errorMessage: 'Unable to read file at ' + filepathArray[0]
                };
                loger.out(reply.errorMessage);
            }
        }
        else {
            reply = {
                success: false,
                errorMessage: 'No file paths were entered to read'
            };
            loger.out(reply.errorMessage);
        }
        return [2 /*return*/, reply];
    });
}); };
fileManager.write = function (message) { return __awaiter(_this, void 0, void 0, function () {
    var reply, filepathArray, flag;
    return __generator(this, function (_a) {
        filepathArray = [];
        if (message.openDialog) {
            filepathArray[0] = dialog.showSaveDialogSync({
                filters: typeof message.typeFilter != 'undefined' ? message.typeFilter : [],
                defaultPath: typeof message.path != 'undefined' ? message.path : '',
                title: typeof message.dialogTitle != 'undefined' ? message.dialogTitle : 'Save file...'
            });
        }
        else {
            if (typeof message.path != 'undefined') {
                filepathArray[0] = message.path;
            }
            else {
                filepathArray[0] = 'test.txt';
            }
        }
        if (filepathArray[0] != 'undefined') {
            try {
                flag = { 'flag': 'w' };
                if (typeof message.append != 'undefined') {
                    flag['flag'] = message.append ? 'a' : 'w';
                }
                fs.writeFileSync(filepathArray[0], message.content, flag);
                reply = {
                    success: true
                };
            }
            catch (e) {
                reply = {
                    success: false,
                    errorMessage: 'Unable to write file at ' + filepathArray[0]
                };
                loger.out(reply.errorMessage);
            }
        }
        else {
            reply = {
                success: false,
                errorMessage: 'No file paths were entered to write'
            };
            loger.out(reply.errorMessage);
        }
        return [2 /*return*/, reply];
    });
}); };
fileManager.remove = function (message) { return __awaiter(_this, void 0, void 0, function () {
    var reply, filepathArray, openDialog;
    return __generator(this, function (_a) {
        filepathArray = [];
        openDialog = function (message) {
            filepathArray[0] = dialog.showSaveDialogSync({
                filters: typeof message.typeFilter != 'undefined' ? message.typeFilter : [],
                defaultPath: typeof message.path != 'undefined' ? message.path : '',
                title: typeof message.dialogTitle != 'undefined' ? message.dialogTitle : 'Remove file...'
            });
        };
        if (message.openDialog) {
            filepathArray[0] = openDialog(message);
        }
        else {
            if (typeof message.path != 'undefined') {
                filepathArray[0] = message.path;
                try {
                    fs.unlinkSync(filepathArray[0]);
                    reply = {
                        success: true
                    };
                }
                catch (e) {
                    reply = {
                        success: false,
                        errorMessage: 'Unable to remove item at entered path: ' + message.path
                    };
                    loger.out(reply.errorMessage);
                }
                return [2 /*return*/, reply];
            }
            else {
                reply = {
                    success: false,
                    errorMessage: 'Path parameter is required to remove file'
                };
                loger.out(reply.errorMessage);
                return [2 /*return*/, reply];
            }
        }
        return [2 /*return*/];
    });
}); };
fileManager.getNames = function (message) { return __awaiter(_this, void 0, void 0, function () {
    var reply, filePathArray;
    return __generator(this, function (_a) {
        if (typeof message.path == 'undefined' || typeof message.typeFilter == 'undefined') {
            return [2 /*return*/, reply = {
                    success: false,
                    errorMessage: 'Path and typeFile parameters are required to list file'
                }];
        }
        filePathArray = [];
        fs.readdirSync(message.path, { withFileTypes: true }).filter(function (item) { return !item.isDirectory(); }).forEach(function (_file) {
            //TODO make it search for every typeFilter
            if (typeof message.typeFilter[0].extensions.find(function (_ex) { return _file.name.indexOf(_ex); }) != 'undefined') {
                filePathArray.push(_file.name);
            }
        });
        return [2 /*return*/, reply = {
                success: true,
                payload: {
                    content: JSON.stringify(filePathArray)
                }
            }];
    });
}); };
module.exports = fileManager;
