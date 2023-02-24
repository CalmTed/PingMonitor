# PingMonitor
Interface for terminal ping function with statistics


### Features ###
- Pinging number of hosts in paralel
- Different update time for different status (check faster when not online)
- Saving ping history to file, one file for a day
- Showing statistics of online/offline time, duration of connection loss
- Customizing rows with name, image, color and size
- Setting on the alarm when a host is unreachable for specific amount of time
- Mutting annoying rows
- Showing timeline with history for each ping or tiles view
- Clustering ping history for smaller file size, leaving status of ttl unchanged
- Hidding address if needed
- Exporting/Importing state, configuration. Exporting history in JSON format
- Drag and drop sorting in timeline view
- Language support: Ukrainian, English, French
- Autosave state every 15 min for backup

### 1.5.0 Update ###

**Removed**
- Multy-window support
- Light theme
- Always in front mode and hide title bar for window

**Added**
- Timeline view
- Saving history for each day
- Coloring customization, new tile row sizes
- Ability to hide address


### Usage ###

**for Windows 11**
1. Download archive `PingMonitor1.5.0_Win11.zip` and unpack
2. Start PingMonitor1.5.0.exe
3. Edit default row by rightclicking on it and pressing "Edit"
4. Enter needed ip address or domain of host
5. Start pinging by rightclicing and pressing "Start"

**for Windows 10 or bellow**
1. Download archive `PingMonitor1.5.0_Win10.zip` and unpack
2. Start `PingMonitor_1.5.0_x64_uk-UA.msi` and instal
3. Start installed "Ping Monitor" app
4. Prossed with using as written above in steps 3-5 in Usage for windows 11

Program can be compiled for Mac OS and Linux with tauri, but you have to make is youself.
