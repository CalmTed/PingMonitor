var data = {}
data.rows = []
data.pics = {
  'server':'assets/server.png',
  'computer':'assets/computer.png',
  'tooway':'assets/tooway.png',
  'direct':'assets/tooway.png',
  'r402':'assets/tooway.png',
}

class Row {
  _status = 'unchecked';

  set status(value){
    this.changeProp('_status',value);
  }
  get status(){
    return this._status;
  }
  constructor(type,name,picture,pingIP,pingUpdateTime){
    this.id = data.rows.length;
    this.type = type;
    this.name = name;
    this.picture = picture;

    this.pingIP = pingIP;
    this.pingDellayTime = 0;
    this.pingUpdateTime = pingUpdateTime;

    this.packetsSent = 0;
    this.packetsResived = 0;
    this.packetsLost = 0;

    this.lastConnectionLost = 0;
    this.lastConnectionFound = 0;
    this.lastOutOfConnection = 0;
    this.totalOutOfConnection = 0;

    this.isDisabled = false;
    this.isPaused = false;
    this.isChecking = false;
    this.pingTimeStrategy = {

    }
    this.rowDom = ''
  }
  create(parrent){
    this.rowDom = $(`<div class="row row-${this.id}" rowId="${this.id}" status="${this.status}"></div>`);//${data.pics[row.picture]}
    this.rowDom.append($(`<div class="row-column"><div class="row-picture" alt="${this.type}" style="background-image:url('${data.pics[this.picture]}')"></div><div class="row-name">${this.name}</div><div class="row-address">${this.pingIP}</div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-status"><span class="row-status-span">${translate(this.status)}</span></div> </div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-ping"><label>${translate('Dellay')}: <span class="row-ping-dellay"></span></label><label>${translate('Update time')}: <span class="row-ping-updatetime">${translate(this.pingUpdateTime)} ${translate('s')}</span></label><label>${translate('Uptime')}: <span class="row-uptime"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-connection"><label>${translate('Last Connection Lost')}: <span class="row-last-conn-lost"></span></label><label>${translate('Last Connection Found')}: <span class="row-last-conn-found"></span></label><label>${translate('Last Out of Connection')}: <span class="row-last-out-of-conn"></span></label><label>${translate('Total Out of Connection')}: <span class="row-total-out-of-conn"></span></label></div></div>`));
    parrent.append(this.rowDom);
    this.pinging();
  }
  render(){
    //col1
    $(`.row-${this.id} .row-name`).html(this.name);
    $(`.row-${this.id} .row-address`).html(this.pingIP);
    //col2
    $(`.row-${this.id}`).attr('status',this.status)
    $(`.row-${this.id} .row-status-span`).html(this.status);
    //col3
    if(['unknown','NaN'].indexOf(this.pingDellayTime)){
      $(`.row-${this.id} .row-ping-dellay`).html(`${Math.round(this.pingDellayTime)} ms`);
    }else{
      $(`.row-${this.id} .row-ping-dellay`).html(`- ms`);
    }
    $(`.row-${this.id} .row-ping-updatetime`).html(`${this.pingUpdateTime} s`);
    $(`.row-${this.id} .row-uptime`).html(`${Math.round(100/this.packetsSent*this.packetsResived*100)/100} %`).attr('title','S:'+(this.packetsSent)+' R:'+(this.packetsResived)+' L:'+(this.packetsLost));
    //col4
    if(this.lastConnectionLost !=0 ){
      $(`.row-${this.id} .row-last-conn-lost`).html(`${this.lastConnectionLost.getHours()}:${this.lastConnectionLost.getMinutes()}:${this.lastConnectionLost.getSeconds()}`);
      $(`.row-${this.id} .row-last-conn-lost`).attr('title',this.lastConnectionLost);
    }else{
      $(`.row-${this.id} .row-last-conn-lost`).html(`-`);
    }
    if(this.lastConnectionFound !=0 ){
      $(`.row-${this.id} .row-last-conn-found`).html(`${this.lastConnectionFound.getHours()}:${this.lastConnectionFound.getMinutes()}:${this.lastConnectionFound.getSeconds()}`);
      $(`.row-${this.id} .row-last-conn-found`).attr('title',this.lastConnectionFound);
    }else{
      $(`.row-${this.id} .row-last-conn-found`).html(`-`);

    }
    let toFormat = function(t){
      if(t<1000){
        return t+' '+translate('ms');
      }else if(t<60000){
        return Math.floor(t/1000)+' '+translate('s');
      }else if(t<360000){
        return Math.floor(t/60000)+' '+translate('m');
      }else{
        return Math.floor(t/360000)+' '+translate('h');
      }
    }
    $(`.row-${this.id} .row-last-out-of-conn`).html(toFormat(this.lastOutOfConnection));
    if(this.lastConnectionFound < this.lastConnectionLost){
      //when out of connection
      $(`.row-${this.id} .row-total-out-of-conn`).html(toFormat(this.totalOutOfConnection + this.lastOutOfConnection));
    }else{
      $(`.row-${this.id} .row-total-out-of-conn`).html(toFormat(this.totalOutOfConnection));
    }
  }
  remove(){

  }
  changeProp(prop,value){
    this[prop] = value;
    this.render()
  }
  pinging(){
    if(!this.isChecking){
        this.changeProp('isChecking','true');
      ping(this.pingIP,this.id,function(res){
        let status = res.status;
        let rowId = res.rowId;
        let _this = data.rows[rowId];

        //on conn lost
        if(['online'].indexOf(_this.status) > -1 /*if was online*/ &&  /* but now is offline */['offline','error','timeout'].indexOf(res.status) > -1 ){
          _this.changeProp('lastConnectionLost', new Date());
        }
        //on offline
        if(['offline','error','timeout'].indexOf(res.status) > -1 && res.status == _this.status && _this.lastConnectionLost != 0){
          let now = new Date();
          _this.changeProp('lastOutOfConnection', now.getTime() - _this.lastConnectionLost.getTime());
        }
        //on founding connection
        if(['offline','error','timeout'].indexOf(_this.status) > -1 /* if was offline */ && /* but now online*/ ['online'].indexOf(res.status) > -1 ){
          _this.changeProp('lastConnectionFound',new Date());
          _this.changeProp('lastOutOfConnection', _this.lastConnectionFound.getTime() - _this.lastConnectionLost.getTime());
            _this.changeProp('totalOutOfConnection', _this.totalOutOfConnection + _this.lastOutOfConnection);
        }

        _this.changeProp('_status',status);
        _this.changeProp('pingDellayTime',res.pingDelay);
        _this.changeProp('packetsSent',_this.packetsSent+1);
        if(res.packetLoss != 100){
          _this.changeProp('packetsResived',_this.packetsResived+1);
        }else{
          _this.changeProp('packetsLost',_this.packetsLost+1);
        }
        _this.changeProp('isChecking',false);
        setTimeout(()=>{_this.pinging()},_this.pingUpdateTime*1000)
      })
    }
  }
}


let newRow = new Row('server','random','server','12.17.193.102','20')
data.rows.push(newRow)
newRow = new Row('server','local','computer','192.168.68.101','5')
data.rows.push(newRow)
newRow = new Row('server','tooway','tooway','88.88.88.88','10')
data.rows.push(newRow)

createPage = function(){
  var root = $('.root')
  let monitorTable = $('<div class="table"></div>')
  data.rows.forEach(
    (row) => {
      row.create($(monitorTable))
    })
  root.append(monitorTable)
}
$(document).ready(function(){
  createPage();
});

translate = function(a){
  return a;
}

async function ping(ip,rowId ,callback) {
  var result = await ipcRenderer.invoke('ping', ip, rowId);
  result = JSON.parse(result);
  callback(result)
}
