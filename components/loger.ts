const loger:any = {}
loger.out = async (message:string)=>{
    let reply = {
        success:false
    }
    let logFilePath = 'assets/pm.log'
    let fileManager = require('./fileManager')
    let date = new Date()
    let toWrite = `[${date.getTime()}|${date}] ${message}\n`
    const loggingToFile = await fileManager.write({openDialog:false,path:logFilePath,content:toWrite,append:true})
    if(loggingToFile.success){
        reply = {
            success:true
        }
    }
    return reply
}
module.exports = loger