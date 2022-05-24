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
      - [+] pinging without interface (2022-04-01)

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


    Files from pre 1.4 version:
    index.html
    graph.html
    index.js
    monitor.js
    graph.js

    #### Tasks from 2022-04-27
    - [+] Render(initial create) empty modals(menu,setting,imgPicker) 0.3 day 2022-04-27 11:18
    - [+] Add optimizers for them to rerender from stateDifference object 0.3 day 2022-04-27 11:39
      - [+] open/hide
    - [+] Add screen tools render (open menu, add row,full screen, pause all,unalarm all) 0.3 day  2022-04-27 12:40
    ---- before 28.04
    - [+] Add dispatches for tools for state change 0.3 day 2022-04-28 11:00
      - [+] openMenu, fullScreenToggle, addRow, pauseAllActive <- SAVE PAUSED ROWS AS A LIST
    - [+] Render rows optimaly 0.6 day
      - [+] add/remove row 2022-04-28 19:00
      - [+] swaping rows 2022-05-05
      - [+] selector,property,value for 2022-04-30 18:00 
        - [+] isPaused,status,isBusy 2022-04-28 22:00
        - [+] +isSelected,+isAlarmed,+isEditing,+updateTime,+name,+address,+imageLink 2022-04-30 10:00
        - [+] +size,+graph
    ---- before 29.04
    - [+] Row action dispatches 1 day
      - [+] remove,pause 2022-05-02 16:50
      - [+] name,address,updateTime(change PTS too) 2022-04-30
      - [+] in context menu: change row size,open image picker, mute(unalarm) 2022-05-03 15:30
      - [+] include scroll in contect menu position 2022-05-03 15:44
      - [+] check if paused before turning on alarm 2022-05-03 16:00
      - [+] make context action work for a list of selected rows not only for one 2022-05-03 17:54
      - [?] if alarmed show "unalarm" instead of "pause" in row
    ---- before 30.04
    - [] Menu action dispaches 1 day
      - [+] new window, duplicate window 2022-05-04 16:02
      - [+] export&import PM config <- WITH OR WITHOUT HISTORY 2022-05-04 21:30
      - [+] scale screen 2022-05-05 10:08
      - [+] hide tools buttons if unneded (pause all, unalarm all) 2022-05-03 18:54
      - [] other TODOs
        - [+] menu btn icon chage 2022-05-05 10:50
        - [+-] col4 stats 2022-05-06 15:50
          - [ ] sum does not counts first change
          - [+] last change always wrong
          - [+] stats does not render on history change
        - [+] context position 2022-05-06 16:20
        - [+] limit ping history & get info about graph max duration 2022-05-06 19:41
        - [-] make PTS work with different conditions 2022-05-06 20:03 not for MVP
    ---- before 01.05
    ---- 01.05 not for work!
    - [+] Settings 2 days 2022-05-13
      - [+] Sync config data 2022-05-09 17:20
        - [+] fetch data for settings 2022-05-06 20:17
        - [+] colorMode, timeToAlarm, unmuteOnGettingOnline, pingHistLimitMINS, minigraphLimitMINS, savePingHistToExportConfig 2022-05-09 14:40
        - [+] initial rows //for one now for MVP 2022-05-09 17:18
        - [+] default new row (newRowRule fromLast|default) 2022-05-09 15:56
        - [+] log settings 2022-05-09 16:00
      - [+] Dispach config change <-SET DEFAULTS BUTTON 2022-05-11 17:00
      - [+] Make all settings parameters work(+always on top, +initial rows,+new row rule,+time to alarm, +save hist to config 2022-05-12) 14:48
      - [+] UserLogger (log changes, log everyday, time to log change) 2022-05-13
    - [+] hot keys 2 hours 2022-05-14 00:01
      - [+] set tab index for important staff(like open context for focused row options)
    - [+] clear all history button & save config without history 2022-05-14 01:41
    - [+] Language settings 2 days 2022-05-14
      - [+] so on config change it can rerender only text with 't' tag
      - [+] title all icons, especialy col2 trio
2022-05-16 Bugs to remove:
- [+] dispatching action on arrow keys on row input events 2022-05-18
- [+] sometimes cant create new monitor(window) 2022-05-18
- [+] does not show first status in row stats when there are two or more changes 2022-05-18

2022-05-20 todo
- [+] cant open saved config
- [+] wrong stats
- [+] more grid freedom
  - [+] even number of rows to size 4,6,8
  - [+] ctrl+wheel sizing
- [] better error managing
  - [+] stateManager exeptions
  - [+] host exeptions
  - [+] pm.ts exeptions
- [] more effitient stateManager
  - [+] measure time computing to find bottlenecks
  - [+] less calls to fileManager
  - [+] less loop operations
- [+] second entity
- [] more scalable settigs parameters adding
- [] swap rows with drag&drop
- [] stats preview without changeon to 6x size
- [] auto fit button
- [] auto open last save
- [] save window size, position and scale to window state