interface fileManagerMessage {
  openDialog:boolean
  path?:string | undefined
  dialogTitle?:string
  typeFilter?:{
    name: string
    extensions: string[]
  }[]
  name?:string
  content?:string
  encoding?:string
  append?:boolean
}
interface fileManagerReply {
  success:boolean
  payload?:{
    content:string
  }
  errorMessage?:string
}

const fileManager:any = {}
const {dialog} = require('electron')
const fs = require("fs")
fileManager.read = async (message:fileManagerMessage)=>{
  let reply:fileManagerReply
  let filepathArray = [];
  if(message.openDialog){

    filepathArray = dialog.showOpenDialogSync({
      filters: typeof message.typeFilter != 'undefined' ? message.typeFilter : [],
      title: typeof message.dialogTitle != 'undefined' ? message.dialogTitle : 'Open file...',
      properties: ['openFile']
    })
  }else{
    if(typeof message.path != 'undefined'){
      filepathArray[0] = message.path
    }
    if(typeof message.name != 'undefined'){
      filepathArray[0] = filepathArray[0]+=message.name
    }
  }
  if(filepathArray[0] != 'undefined'){
    let fileContent = fs.readFileSync(filepathArray[0], typeof message.encoding != 'undefined' ? message.encoding : 'utf-8', (err, text) => {
      if(!err){
        return text;
      }else{
        return false;
      }
    })
    if(fileContent){
      reply = {
        success:true,
        payload:{
          content:fileContent
        }
      }
    }else{
      reply = {
        success:false,
        errorMessage:'Unable to read file at ' + filepathArray[0]
      }
      loger.out(reply.errorMessage)
    }
  }else{
    reply = {
      success:false,
      errorMessage:'No file paths were entered to read'
    }
    loger.out(reply.errorMessage)
  }
  return reply;
}
fileManager.write = async (message:fileManagerMessage)=>{
  let reply:fileManagerReply
  let filepathArray = [];
  if(message.openDialog){
    filepathArray[0] = dialog.showSaveDialogSync({
      filters: typeof message.typeFilter != 'undefined' ? message.typeFilter : [],
      defaultPath: typeof message.path != 'undefined' ? message.path : '',
      title: typeof message.dialogTitle != 'undefined' ? message.dialogTitle : 'Save file...',
      // properties: ['saveFile']
    })
  }else{
    if(typeof message.path != 'undefined'){
      filepathArray[0] = message.path
    }else{
      filepathArray[0] = 'test.txt'
    }
  }
  if(filepathArray[0] != 'undefined'){
    try{
      let flag = {'flag':'w'};
      if(typeof message.append != 'undefined'){
        flag['flag'] = message.append?'a':'w'
      }
      fs.writeFileSync(filepathArray[0], message.content, flag)
      reply = {
        success:true
      }
    }catch(e){
      reply = {
        success:false,
        errorMessage:'Unable to write file at ' + filepathArray[0]
      }
      loger.out(reply.errorMessage)
    }
  }else{
    reply = {
      success:false,
      errorMessage:'No file paths were entered to write'
    }
    loger.out(reply.errorMessage)
  }
  return reply;
}
fileManager.remove = async (message:fileManagerMessage)=>{
  let reply:fileManagerReply
  let filepathArray = [];
  let openDialog = (message:fileManagerMessage)=>{
    filepathArray[0] = dialog.showSaveDialogSync({
      filters: typeof message.typeFilter != 'undefined' ? message.typeFilter : [],
      defaultPath: typeof message.path != 'undefined' ? message.path : '',
      title: typeof message.dialogTitle != 'undefined' ? message.dialogTitle : 'Remove file...'
    })
  }
  if(message.openDialog){
    filepathArray[0] = openDialog(message)
  }else{
    if(typeof message.path != 'undefined'){
      
      filepathArray[0] = message.path
      try{
        fs.unlinkSync(filepathArray[0])
        reply = {
          success:true
        }
      }catch(e){
        reply = {
          success:false,
          errorMessage:'Unable to remove item at entered path: '+message.path
        }
        loger.out(reply.errorMessage)
      }
      return reply;
    }else{
      reply = {
        success:false,
        errorMessage:'Path parameter is required to remove file'
      }
      loger.out(reply.errorMessage)
      return reply;
    }
  }
}
fileManager.getNames = async (message:fileManagerMessage)=>{
  let reply:fileManagerReply
  if(typeof message.path == 'undefined' ||typeof message.typeFilter == 'undefined'){
    return reply = {
    success:false,
    errorMessage:'Path and typeFile parameters are required to list file'
    }
  }
  let filePathArray = []
  fs.readdirSync(message.path,{withFileTypes:true}).filter(item=>!item.isDirectory()).forEach(_file=>{
    //TODO make it search for every typeFilter
    if(typeof message.typeFilter[0].extensions.find(_ex=>_file.name.indexOf(_ex)) != 'undefined'){
      filePathArray.push(_file.name)
    }
  })
  return reply = {
    success:true,
    payload:{
      content:JSON.stringify(filePathArray)
    }
  }
}
module.exports = fileManager
