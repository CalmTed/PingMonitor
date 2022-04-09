Design
[+] show more intuitevely when it pings 210921
[+] better fluidity
[+] play\pause icon
[+] 2 cols in small screen
[+] pause all btn
[+] fullscreen btn
[+] add "0"`s in time stats
[+] do not round time offline
[+] add pics
[+] other icons

UX
[+] Save all data in localStorage 210925 1531
[+] Save all setting as and load from file (reactive replacing) 210925 1728
[+] alarm for 10+ losed packets (config variable and dismissable in tools(turnin on when back online)) 210925 1845
[+] hot keys 210925 2131
  [+] enter finish editing
  [+] f for full screen
  [+] ctrl+n new row
  [+] ctrl+space (pauses all, unpauses last paused(not all))
  [+] ctrl+s ctrl+o save open settings
[+] build app as finished product
[+] save TTL
[+] try[] ewerything
[+] Dellay stats (min,max,avg,now) graph
[ ] Add settings
  [ ] initial rows
  [ ] PTS (basedOnType,auto,fullCustom)
  [ ] new row (custom,last)
  [ ] color and size
  [ ] subnets
[+] sorting rows 211127 1600
Network
[ ] show network settings
[ ] change network settings
[ ] add autoChange for 2 or more networks

Bugs
+dont open from the same data localstorage
+dont open from .json file
?-dont show ping time stats only ttl:59

Plan for MultyWindow:

Main
+ 1.get data from storage if exists (if not ignore sending data to windows -> send useLocal)
+ 2.open n windows from data.length
+ 3.send data to open for each window
+ 4.:onNewWindow    <=every win have data for each other win
+   if storage have info for this win : sendDataToWin else 'useLocal'
+ 5.:onWindowClosing
+   resort and rename all windows
+ 6.:onOpenFile
+  if data is old(for one window)
+    create only one new window
+  else recreate all windows and send data to them
+ 7.:onSaveFile getInfoFromAllWindows and save to one file once
+  when resived from last window - save file
!if localStorage have "data-[id+1]"   <= its better to be centralized
   call to open one more window

Interfaces:
Main=>Win  +sendRowsToWin:rowData:winData
           +              rowData:'useLocal'
           +sendIdTOWin:  winId:id
           +requestInfoFromWin:'rowData' || 'winId'

Win=>Main  +sendDataToMain:'file',rowData
           sendDataToMain:'storage',rowData

Window
+1.:onCreation
+  if resived "useLocal" try to open from localStorage
+     if not exists, open from config
+  if resived dataToOpen
+     check validity
+     openDataRows
+ 2.:onSaving
+  sendDataToMain:rowData
! 3.:onChanging
  sendDataToMainStorage:rowData

  TO DO
+ clear old comments
+ remove console.log
+ add trys
+ ttls
+ light mode + dynamic styling
+ sorting
+ icons for home and for buttons
+ flex for 5 rows, 4?
+ dynamic localization from the main process
+ mute for each row
+ if ttl=-1 ??
+ sort data.rows after drag and drop event

  TESTS
pinging
+ strange renaming
+ strange adresses
+ strange times
opening
+ strange file types
+ strange configs
+ max amount of windows
+ strange pics
+ aborting
saving
+ max amount of wins
+ aborting
+ cnfig tweak

RELEASE
+ disable theme switcher or create timer
+ update version
+ update links switcher
+ build app

TODO
+ show stats graph
+ one click to change name,address and update
+ disable "pause all" when nothing to pause
+ always show bottom tools when there are no rows
+ save statistics to csv
+ BUG sorting dont work properly for ping resiving
? BUG still dont open old json saves
? dont show when dont see one of two ways
+ BUG dont update "all time offline" when being offline
- upload custom image to list
- select rows to delete together
- group rows
- ultra eco pic,name,addr,status,dellay,update without titles
- save\open buttons in the interface

+ ctrl+"+" bug
- graph zoom/scroll without a wheel
- little graph instead of connection loss information
- redesign:
- config and settings tab
- image selector(there are more then 14 images to select between)
- number indicator
- selecting, small view, big view
- alarm indicator
- new communication interface(backend)
- compatible with old configs (multiview)
- centralized state:
- instant language change
- instant config opening
- duplicate view OR extend view

17mar2022 Version 1.4 Plan:
  - Undone from above All ideas:
    - Network settings(Show,Set,Change)
    - Keys(Graph zoom and scroll without a wheel)
    - Interface Settings(initial rows, PTS,new row, color and size, subnets)
    - Interface buttons(Save & Open config)
    - Rows Pictures(Drag to add, Image selector, number indicator)
    - Rows size Ultra eco
    - Rows selection(Group, delete)
    - Rows alarm indicator
    - Compatible with old configs(multywin,onewin)
    - Arch for communicator
    - Arch for Language
    - Arch for Config(Initial values)
    - Arch for duplicating save view or adding new
  - Rethinked set of new features:
    - Arch Core state control (logging, history(undo), renderer subscribed for change, if there are render error try to undo state,
      no rendering|styling in the core, no mutating in a window)
    - Arch Core delegated subsystems (fileManager, config, stateManager, ping, localozator, loger, communicatorCore | communicatorWindow)
    - Arch Core communicatorCore<>constructorWindow (strict interface,backup errors in window for user to be able to save config and log)
    - Arch Window custom reactive renderer (find what needs to be rerended, handle hooked variables)
    - Arch Compatible with old configs
    - Design No AltMenu, only interface menu with (Setting, config Export|Import, window new|duplicate, size, subscriptionKey)
    - Design Rows in different sizes, selecting rows(deleting, changing), alarm visual indicator
    - Design Row Picture (Drag to Add, save in base64, Image Picker), Number indicator from name
    - Design Row auto unpause in mutating IPaddress
    - No network changing for now
    - Keys for wheel events(graph scroll)
    - show ttl as a line in Graph window with Alt
  - FOR FUTURE
    - Select network adaptors for different apps in paralel
    - Long press on row for drag&drop sorting like iOS wiggling
  - Goal structure:
    - Corelevel:
      - async fileManager FileManagerMessage(command:String, [payload] } <> FileManagerReply(success:Bool,[errorMessage:String|payload:Object(name:String,content:String)])
        - read [payload] => Object(openDialog:Bool, path:String, [typeFilter:String,Title:String])
        - write [payload] => Object(openDialog:Bool, path:String, name:String, content:String,[encoding:String])
      - async config Function(Object(key:String,value:Number|String|Array|Object)) <> appConfig:Object                             // if no config get in it from file(initiate backup)
      - async stateManager: StateManager
        - reduce: Function(coreState,action) <> (new)coreState                 // if no state get it from file, updatefile on action(history)
        - stateNow: Function() <> coreState
        - undo: Function() <> (old)coreState                                   //limit history length to about 20
      - async log: Funtion(action:String) <> void                               //writes to the log file all actions & errors
      - (a)sync mainFunction: void
      - async ping: Function(pingData: Object(address: String) ) <> Object(rowid:Int, status:String, packetLoss:Int, ttl:Int, numericHost:String, fullResponce:String)
      - async ComunicatorCore: ComMessage(command:String,[payload:String]) <> ComReply(success:Bool, payload:String)
        - core command types: setWinState(winid,state),
        - win command types: getWinState(winid), initWinStateAction(winid,actionStr), getLangData(code,words), getConfig, initConfigMutation(key,vale), initCommand(saveRows)
      - Network setting: in case of a number of network adapters add selector
    - Windowlevel:
      - async ComunicatorWindow: ComMessage <> ComReply
      - sync createPage: Funtion()
      - sync renderer: Funtion(state:WinState)
      - async config: Funtion() <> appConfig:Object
      - async handleMutation: Function(action:WinAction) <> WinState <- returns new win state to render
    - CoreState:
      - version: String
      - langCode: String
      - langWords: Array(Object(key:String,value:String))
      - colorMode: String
      - windows: Array(String) <- window states in json string
    - WinState:
      - version: CoreState.version
      - langCode: CoreState.langCore
      - langWords: CoreState.langWords
      - winId: Number(11111-99999(5))
      - subscriptionKey: Number(1111-9999(4))
      - title: String
      - isGraph: Bool
      - isHidden: Bool
      - isFullscreen: Bool
      - isMenuOpen:Bool <- priorities Settings>Menu>SelectedRows>ImagePicker
      - isSettingOpen:Bool
      - isImagePickerOpen:Bool <- check is there row with editing image
      - rows: array(String) <- row states in json Including history
    - rowState:
      - rowId: Number(11111111-99 999 999(8))
      - position: Number <- for sorting on render
      - size: String("1Little"'2Small','4Middle',"6Big")
      - ipAddress: String
      - updateTimeMS: Number
      - name: String
      - imageBase64: String
      - history: Array(Object(timestamp:Number,time:Date,status:String,dellayMS:,ttl,fullResponce))
      - pingTimeStrategy: Array(Object(updateTimeMS:Number,Object(variable:value))) <- conditions and value of update time  with "from", "to", "inRange(N,N)"
      - hasStarted:Bool <- for initial pause
      - isPused:Bool
      - isMuted:Bool
      - isAlarmed:Bool
      - isEditing:Bool
      - filedEditing:String(name,address,updatetime,image)
      - isGraphSubscribed:Bool
      - isSelected:Bool
    - Config(Settings):
      - langCode: String
      - colorMode: String
      - initialRows: Array(Object(address,updateTime,name,picture,isPaused))
      - defaultNewRow: Object(address,updateTime,name,picture,isPaused)
      - newRowRule: String('copyPrev','default')
      - timeToAlarmMS: Number(10sec)
      - unmuteOnGettingOnline: Bool(true)
      - pingHistoryTimeLimitMINS: Number(6h)
      - miniGraphShowLimitMIMS: Number(5min)
      - savePingHistoryToConfig:Bool(false)
    - mainFunction: Function() <> void
      - initiates config, stateManager, log, ping, comunicatorCore
      - computes after every state reducing:
        - pingCheck: Function(coreState) <> success:Bool
          - for(every monitor & every row)
            - if(not paused and not busy) then pingProbe(monitor,row,ip)
              - reduce(monitor,row,pingReport)
        - monitorCheck
          - if(no monitor) reduce(add default Monitor with initial Rows)
        - windowCheck: Function(coreState) <> success:Bool
          - checkDifference of monitorStates
            - if(number on wins not the same)  addWindow|removeWindow
            - for(windows where subscribeKey in the list of changed monitors)
            - updateWindow(winState) > communicatorCore
    - Order of implementation(from general to specific):
    - [+] mainFunction>
      - [+] fileMaganer>(done 27.03.22 09:00)
      - [+] config>(27.03.22 13:13)
      - [+] log>(27.03.22 17:42)
      - [+] ping>(27.03.22 17:42)
      - [+] stateManager>(28.03.22 15:45)
      - [+] communicatorCore pt1>(28.03.22 17:00)
      - [ ] pinging without interface

      - [ ] createPage>
      - [ ] communicatorWindow & communicatorCore pt2>
      - [ ] config>
      - [ ] render(new design)>
      - [ ] handleMutation

  Task for 2022-04-03 night:
    - [+] set config time to react on change (seconds)
    - [+] log data from all rows with change of status
    - [+] calculate duration of period
    - [+] button to creat all rows data and log about it
  Tasks from 2022-04-04 morning:
    - [+] pseudo columns
    - [+] wrong ip
    - [+] Log program starting, editing rows,errors
    - [+] New log for new day


- #### Tasks from 2022-04-07:
  - Goal
  - Main problems
    - No settings
    - Bad blocks flexibility
    - 
  - Improvements directions
    - Interface settings
      - Defaults
      - Log settings
      - Network settings
    - Better destructions to modules
      - communicator
      - file manager
      - log
      - config

    - one button to unAlarm all rows