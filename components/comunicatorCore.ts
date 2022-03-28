//was
//   SEND
//sendWinState(id,lang,rowsData), requestInfo, toggleDarkMode, graphDataRequest, graphSubscriptionRemove
//graphDeliverData, saveToCSV,

//   RECIVE
//graphWinOpen,subscriptionRecive,saveRowsToFile,
//dataRequests

//has to be
//      SEND
//sendWinId,sendWinState,sendWinStateUpdate,[sendPingResult?]
//sendGraphData,


interface comMessage {
    window:BrowserWindow
    command:string
    payload?:string
}
interface comReply {
    success:boolean
    errorMessage?:string
    payload?:string
}
import {BrowserWindow, ipcMain} from 'electron'

class comunicatorCore {
    __subscriptions = []
    constructor(){
        try{
            ipcMain.handle('window', async (e,data)=>{
                let channel = 'window';
                let command = data.command
                let payload = data.payload
                //looking for the same channel and command in subscriptions
                this.__subscriptions.find(sub=>(sub.channel === channel && sub.commandListString.indexOf(command)>-1)).forEach((sub:any)=>{
                    sub.callback(payload)
                })
            })
        }catch(e){
            let errorMessage = `Error in comunicator ipc window handling ${e}`
            loger.out(errorMessage)
        }
    }
    send = async (message:comMessage)=>{
        let _reply:comReply
        try{
            if(typeof message.window == 'undefined' || typeof message.command == 'undefined'){
                _reply = {
                    success:false,
                    errorMessage:'Expected to recive at least `window` and `command` parameters'
                }
                return _reply
            }
            message.window.webContents.send('window', {
                command:message.command,
                payload:message.payload
            })
            _reply = {
                success:true
            }
        }catch(e){
            _reply = {
                success:false,
                errorMessage:`Error in comunicatorCore send method: ${e}`
            }
        }
        return _reply
    }
    subscribe = ({channel,commandListString,callback})=>{
        this.__subscriptions.push({
            channel:channel,
            commandListString:commandListString,
            callback:callback
        })
        return true
    }
}
module.exports = comunicatorCore