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
var stateManager = /** @class */ (function () {
    function stateManager() {
        var _this = this;
        this.__subscribers = [];
        this.__history = [];
        this.__getInitialCoreState = function () {
            var appVersion = '1.4';
            var getInitialPingTimeStrategy = function () {
                return {
                    conditions: {
                        status: 'any'
                    },
                    time: 10000
                };
            };
            var getInitialRowState = function () {
                return JSON.stringify({
                    rowId: -1,
                    position: 0,
                    size: '1Little',
                    ipAddress: 'localhost',
                    updateTimeMS: 10000,
                    name: 'name',
                    imageBase64: '',
                    history: [],
                    pingTimeStrategy: [
                        getInitialPingTimeStrategy()
                    ],
                    hasStarted: false,
                    isPused: true,
                    isMuted: false,
                    isAlarmed: false,
                    isEditing: false,
                    filedEditing: '',
                    isGraphSubscribed: false,
                    isSelected: false
                });
            };
            var getInitialWindow = function () {
                return JSON.stringify({
                    version: appVersion,
                    langCode: 'ua',
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
            return {
                version: '1.4',
                langCode: 'ua',
                langWords: [{}],
                colorMode: 'dark',
                monitors: [
                    {
                        monitId: 0,
                        rows: [
                            getInitialRowState()
                        ]
                    }
                ],
                windows: [
                    getInitialWindow()
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
        this.__reduce = function (_state, action) {
            if (action.action == 'setPropertyForTesting') {
                _state = __assign(__assign({}, _state), { propertyForTesting: action.payload });
            }
            return _state;
        };
        this.__setState = function (_state) {
            _this.__state = __assign({}, _state);
            //limit to 20 elements
            if (_this.__history.length > 20) {
                // removes first element of the array: [1,2,3] > [2,3]
                _this.__history.shift();
            }
            _this.__history.push(_state);
            return _this.__notifySubscribers(_state) ? true : false;
        };
        this.__notifySubscribers = function (_state) {
            try {
                _this.__subscribers.forEach(function (_func) {
                    _func(_state);
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
                if (_this.__setState(_this.__history.pop())) { //setts second from the end
                    _ret = true;
                }
            }
            return _ret;
        };
        this.dispach = function (action) {
            var _newState = _this.__reduce(_this.__state, action);
            return _this.__setState(_newState) ? true : false;
        };
        this.subscribe = function (_callback) {
            _this.__subscribers.push(_callback);
        };
        this.__state = this.__stateNow();
    }
    return stateManager;
}());
module.exports = stateManager;
