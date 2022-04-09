const pinger:any = {}
interface probeInput {
    rowId:number,
    address:string
}
interface probeReply {
    success:boolean,
    errorMessage?:string
    payload?:{
        status:string,
        rowId:number,
        dellay:number,
        packetLoss:number,
        ttl:number,
        numericHost:string,
        fullResponce:string
    },
}

const ping = require('ping')
// const loger = require('./loger')

pinger.probe = async (message:probeInput)=>{
    let reply:probeReply
    if(typeof message.address == 'undefined' || typeof message.rowId == 'undefined'){
        reply = {
            success: false,
            errorMessage: 'Expected: {addres:string,rowId:string}'
        }
        return reply
    }
    try{
        const result = await ping.promise.probe(message.address, {timeout: 10})
        if(result){
            const getStatus = (_res:any)=>{
                let _responce = 'error';
                if(_res.alive){
                    _responce = 'online'
                }
                if(_res.packetLoss == '100.000'){
                    _responce = 'timeout'
                }
                if(!_res.alive && _res.packetLoss == '0.000'){
                    _responce = 'offline'
                }
                return _responce;
            }
            const getDellay = (_res:any)=>{
                let _response = -1;
                let lineO = _res.output;
                let aline = lineO.split('TTL=')[0].split('=32')[1];
                if(aline){
                    let pingDellayArray = aline.split('').filter((l:string)=>{
                        if(['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){return true}
                    })
                    _response = Number(pingDellayArray.reverse().join(''));
                }
                return _response;
            }
            const getTTL = (_res:any)=>{
                let _response = -1;
                _res.ttl = -1;
                if(_res.output.indexOf('TTL=')!=-1){
                let ttlArray = [];
                let startTTL = _res.output.indexOf('TTL=');
                let lineTTL = _res.output;
                lineTTL.split('').forEach((l,i)=>{
                    if(i >= startTTL && i < startTTL+7 && ['0','1','2','3','4','5','6','7','8','9'].indexOf(l) != -1){
                    ttlArray.push(l);
                    }
                })
                _res.ttl = Number(ttlArray.join(''))
                }
                return _res.ttl;
            }
            reply = {
                ...reply,
                success:true,
                payload:{
                    rowId:message.rowId,
                    status:getStatus(result),
                    dellay:getDellay(result),
                    packetLoss:result.packetLoss*1,
                    ttl:getTTL(result),
                    numericHost:result.numeric_host,
                    fullResponce:JSON.stringify(result)
                }
            }
        }else{
            reply.errorMessage = 'Unable to send ping probe';
            loger.out('Unable to send ping probe')
        }
    }catch(e){
        reply.errorMessage = 'Unable to send ping probe';
        loger.out('Unable to send ping probe')
    }
    return reply
}
module.exports = pinger