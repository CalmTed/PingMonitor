# PingMonitor
Interface for terminal ping function with statistics

**Features**
- Pinging as many targets as will fit in one window, in up to 9 separate windows
- Saving time of connection loss, duration without a connection
- Showing ping delay, TTL, and ping time statistics (grouped by TTL to show network loops)
- Intuitive settings of name, target address, picture, update time
- Custom picture setting by editing assets/icons directory
- Pausing each target and instant pausing all active
- Alarm sound on connection loss and muting individual targets
- Exporting/Importing configuration .pm file in JSON format
- Full-screen view
- Drag and drop sorting
- Different update times with different row status - Ping time strategy
- Statistics history graph visualization for each target
- Save statistics to CSV

**Usage**
1. Download `PingMonitor<Latest version>.zip` file for Windows OS
2. Unpack then open the `PingMonitor.exe` application
3. Add a new row by clicking "+ Add new row" or with hotkey Ctrl+N
4. Enter row address by double-clicking on the address label
5. If needed, change row name, picture, and ping update time
6. Start pinging by clicking "▶"
7. Remove unneeded rows by double-clicking delete button
8. Export configuration to file with Ctrl+S or Alt and Edit>Save config

**Custom building**
You can use compiled version for MS Windows or build your custom one with:
`git clone https://github.com/CalmTed/PingMonitor.git`
then after configuring the `package.json` `build` section compile with `electron-builder`:
`npm run build`
