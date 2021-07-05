const fs = require("fs");
var data = {}
data.rows = [];
data.pics =[];
data.lang = [];
var config = [];

/*=============== CHANGE THIS FLAG BEFORE BUILDING ==============*/
var build = true;
/*===============================================================*/

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
    this.picture = Number(picture);

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

    this.isPaused = config.initialPause;
    this.isChecking = false;
    this.pingTimeStrategy = config.defaultPingTimeStrategy;
    this.rowDom = ''
  }
  create(parent){
    this.rowDom = $(`<div class="row row-${this.id}" rowId="${this.id}" status="${this.status}"></div>`);//${data.pics[row.picture]}
    this.rowDom.append($(`<div class="row-column"><div class="row-picture" title="${translate('Change picture')}" alt="${this.type}" style="background-image:url('${data.pics[this.picture]}')"></div><div class="row-name" title="2x ${translate('Change name')}">${this.name}</div><div class="row-address" title="2x ${translate('Change address')}">${this.pingIP}</div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-status"><span class="row-status-span">${translate(this.status)}</span></div> </div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-ping"><label>${translate('Dellay')}: <span class="row-ping-dellay"></span></label><label>${translate('Update time')}: <span class="row-ping-updatetime" title="2x ${translate('Change update time')}">${this.pingUpdateTime} ${translate('s')}</span></label><label>${translate('Uptime')}: <span class="row-uptime"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-connection"><label>${translate('Last Connection Lost')}: <span class="row-last-conn-lost"></span></label><label>${translate('Last Connection Found')}: <span class="row-last-conn-found"></span></label><label>${translate('Last Out of Connection')}: <span class="row-last-out-of-conn"></span></label><label>${translate('Total Out of Connection')}: <span class="row-total-out-of-conn"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column tools"><div class="row-tools"> <div class="row-tool tool-pause-row" title="${translate('Pause pinging')}"></div><div class="row-tool tool-remove-row" title="2x ${translate('Remove row')}"></div> </div></div>`));
    parent.append(this.rowDom);
    if(this.isPaused){this.render([])};//for initial pausing
    this.pinging();
    checkRowsNumber();//for Eco mode
  }
  createRowEventListeners(){
    //adding eventlisteners for editing fields
    //picture
    $(`.row-${this.id} .row-picture`).on('click',function(){
      let colDOM = $(this).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];

      let nextPic = rowOBJ.picture + 1;
      if(nextPic>data.pics.length-1){
        nextPic = 0;
      }
      data.rows[rowOBJ.id].changeProp('picture',nextPic);
    });
    //name
    $(`.row-${this.id} .row-name`).on('dblclick',function(){
      let colDOM = $(this).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      $(this).html(`<input rowId="${rowOBJ.id}"  value="${rowOBJ.name}"> `)
      $('.row-name input').focus();
      $('.row-name input').on('blur',function(){
        if($(this).val().length>1 && $(this).val().length<20){
          data.rows[$(this).attr('rowId')].changeProp('name',$(this).val());
        }else{
          data.rows[$(this).attr('rowId')].changeProp('name',data.rows[$(this).attr('rowId')].name);
        }
      })
    });
    //Ping IP
    $(`.row-${this.id} .row-address`).on('dblclick',function(){
      let colDOM = $(this).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      $(this).html(`<input rowId="${rowOBJ.id}"  value="${rowOBJ.pingIP}">`)
      $('.row-address input').focus();
      $('.row-address input').on('blur',function(){
        if( $(this).val().length>6 && $(this).val().length<30){
          data.rows[$(this).attr('rowId')].changeProp('pingIP',$(this).val());
        }else{
          data.rows[$(this).attr('rowId')].changeProp('pingIP',data.rows[$(this).attr('rowId')].pingIP);
        }
      })
    });
    //UpdateTime
    $(`.row-${this.id} .row-ping-updatetime`).on('dblclick',function(){
      let label = $(this).parent()[0]
      let subColDOM = $(label).parent()[0]
      let colDOM = $(subColDOM).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      $(this).html(`<input rowId="${rowOBJ.id}"  value="${rowOBJ.pingUpdateTime}"> `)
      $('.row-ping-updatetime input').focus();
      $('.row-ping-updatetime input').on('blur',function(){
        if( ($(this).val()*1)>1 && ($(this).val()*1)<1000){
          let _this = data.rows[$(this).attr('rowId')];
          _this.changeProp('pingUpdateTime',$(this).val());
          let strat = _this.pingTimeStrategy;
          strat[_this.status] = $(this).val();
          _this.changeProp('pingTimeStrategy',strat);
        }else{
          data.rows[$(this).attr('rowId')].changeProp('pingUpdateTime',data.rows[$(this).attr('rowId')].pingUpdateTime);
        }
      })
    });
    //removeRow
    $(`.row-${this.id} .tool-remove-row`).on('dblclick',function(){
      let toolsDOM = $(this).parent()[0]
      let colDOM = $(toolsDOM).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      rowOBJ.remove()
    });
    //pauseRow
    $(`.row-${this.id} .tool-pause-row`).on('click',function(){
      let toolsDOM = $(this).parent()[0]
      let colDOM = $(toolsDOM).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      if(!rowOBJ.isPaused){
        rowOBJ.changeProp('isPaused',true);
        rowOBJ.changeProp('isChecking',true);
      }else{
        rowOBJ.changeProp('isPaused',false);
        rowOBJ.pinging();//restart pinging
      }
    });
  }
  render(list = ['picture','name','pingIP','status','pingDellayTime','pingUpdateTime','packetsSent','packetsResived','packetsLost','lastConnectionLost','lastConnectionFound','lastOutOfConnection','totalOutOfConnection']){
    /*                                                               */
    /*    CAN'T CHANGE HTML OF OBJECT OUTSIDE OF THIS METHOD         */
    /*                                                               */
    let needToUpdate = function(param){
      if(list.indexOf(param) > -1 ){
        return true;
      }else{
        return false;
      }
    }
    //col1
    if(needToUpdate('picture') && $(`.row-${this.id} .row-picture`).css("background-image") != `url('${data.pics[this.picture]}')`){
      $(`.row-${this.id} .row-picture`).css("background-image",`url('${data.pics[this.picture]}')`);
    }
    if(needToUpdate('name') && $(`.row-${this.id} .row-name`).html() != this.name){
      $(`.row-${this.id} .row-name`).html(this.name);
    }
    if(needToUpdate('pingIP') && $(`.row-${this.id} .row-address`).html() != this.pingIP){
      $(`.row-${this.id} .row-address`).html(this.pingIP);
    }
    //col2
    if(needToUpdate('status')){
      $(`.row-${this.id}`).attr('status',this.status);
      $(`.row-${this.id} .row-status-span`).html(translate(this.status));
    }
    //col3
    if(needToUpdate('pingDellayTime')){
      if(['unknown','NaN'].indexOf(this.pingDellayTime)){
        $(`.row-${this.id} .row-ping-dellay`).html(`${Math.round(this.pingDellayTime)} ${translate('ms')}`);
      }else{
        $(`.row-${this.id} .row-ping-dellay`).html(`-`);
      }
    }
    if(needToUpdate('pingUpdateTime') && $(`.row-${this.id} .row-ping-updatetime`).html() != `${this.pingUpdateTime} ${translate('s')}`){
      $(`.row-${this.id} .row-ping-updatetime`).html(`${this.pingUpdateTime} ${translate('s')}`);
      $(`.row-${this.id}`).css('--row-time',this.pingUpdateTime+'s')

    }
    if(needToUpdate('packetsSent') || needToUpdate('packetsResived') || needToUpdate('packetsLost')){
      let uptime = 0
      if(this.packetsSent*this.packetsResived != 0){
        let uptime = Math.round(100/this.packetsSent*this.packetsResived*100)/100;
      }
      $(`.row-${this.id} .row-uptime`).html(`${uptime} %`).attr('title','S:'+(this.packetsSent)+' R:'+(this.packetsResived)+' L:'+(this.packetsLost));
    }
    //col4
    if(needToUpdate('lastConnectionLost') || needToUpdate('lastConnectionFound') || needToUpdate('lastOutOfConnection')|| needToUpdate('totalOutOfConnection')){
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
    //pausing
    if(this.isPaused){
      if($(`.row-${this.id}.paused`).length == 0){
        $(`.row-${this.id}`).addClass('paused')
        $(`.row-${this.id} .tool-pause-row`).attr('title',translate('Restart pinging'))
      }
      $(`.row-${this.id} .row-status-span`).html(translate('paused'))
    }else if(!this.isPaused && $(`.row-${this.id}.paused`).length != 0){
      $(`.row-${this.id}`).removeClass('paused')
      $(`.row-${this.id} .tool-pause-row`).attr('title',translate('Pause pinging'))
      this.render()
    }
  }
  remove(){
    $(`.row-${this.id}`).remove();
    data.rows.splice(this.id,1);
    let i = 0;
    data.rows.forEach(
      (row) => {
        $(`.row-${row.id}`).addClass(`temp-row-${i}`)
        $(`.temp-row-${i}`).removeClass(`row-${row.id}`).attr('rowId',i)
        row.changeProp('id',i);
        i++;
    })
    let prevId;
    data.rows.forEach(
      (row) => {
        $(`.temp-row-${row.id}`).addClass(`row-${row.id}`)
        $(`.row-${row.id}`).removeClass(`temp-row-${row.id}`)
    })
    checkRowsNumber();//for Eco mode
  }
  changeProp(prop,value){
    if(this[prop] !== value || /* white list */ ['name','pingUpdateTime','pingIP'].indexOf(prop) !== -1){
      this[prop] = value;
      if(/* black list */['packetsSent','packetsLost','packetsResived','isChecking'].indexOf(prop) == -1){
        this.render(prop);
      }
    }
  }
  pinging(){
    if(!this.isChecking && !this.isPaused){
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
        if(['offline','error','timeout'].indexOf(res.status) > -1){
          let now = new Date();
          if(_this.lastConnectionLost == 0){
            _this.changeProp('lastConnectionLost', new Date());
          }
          if(res.status == _this.status){
            _this.changeProp('lastOutOfConnection', now.getTime() - _this.lastConnectionLost.getTime());
          }
        }
        //on founding connection
        if(['offline','error','timeout'].indexOf(_this.status) > -1 /* if was offline */ && /* but now online*/ ['online'].indexOf(res.status) > -1 ){

          _this.changeProp('lastConnectionFound',new Date());
          if(_this.lastConnectionLost == 0){
            _this.changeProp('lastConnectionLost', new Date());
          }
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
        if(_this.pingTimeStrategy[_this.status] != undefined){
          _this.changeProp('pingUpdateTime',_this.pingTimeStrategy[_this.status]);
        }else{
          _this.changeProp('pingUpdateTime',_this.pingTimeStrategy['default']);
        }
        setTimeout(()=>{_this.pinging()},Number(_this.pingUpdateTime)*1000)
      })
    }else{
      this.changeProp('isChecking',false);
    }

  }
}

function createPage(){
  var root = $('.root')
  root.html('');
  let monitorTable = $('<div class="table"></div>')
  root.append(monitorTable);
  //adding initial rows
  config.initialRows.forEach((row)=>{
      data.rows.push(new Row(row.type,row.name,row.picture,row.address,row.updatetime))
  })

  data.rows.forEach(
    (row) => {
      row.create($(monitorTable))
      row.createRowEventListeners()
  })
  newRowBtn = $('<div class="new-row-btn" title="'+translate("Add new row")+'">+</div>');
  root.append(newRowBtn)
  $('.new-row-btn').on('click',function () {
    let lastRow = data.rows[data.rows.length-1];
      newRowData = config.defaultNewRow;
    let newData = new Row(newRowData.type,newRowData.name,newRowData.picture,newRowData.pingIP,newRowData.pingUpdateTime)
    if(lastRow != undefined){
      newData = new Row(lastRow.type,lastRow.name,lastRow.picture,lastRow.pingIP,lastRow.pingUpdateTime);
    }
    data.rows.push( newData );
    data.rows[data.rows.length-1].create($(monitorTable))
    data.rows[data.rows.length-1].createRowEventListeners()
  })
}
$(document).ready(function(){
  $('.root').html('<div style="background-image: url(assets/icons/PM.png);width: 300px;height: 100vh;background-size: 294px;display: flex;justify-content: center;width: 100%;background-repeat: no-repeat;background-position: center;position: fixed;background-position-y: 127px;"> </div><h1 style="display:flex;justify-content:center;align-items:center;height:100vh;position: fixed;width: 100%;  ">Reading files...<h1>');
   readDir(function(ret){
    data.pics = ret.pics;
    createPage();
  })
});

translate = function(a){
  let trans = a;
  if( typeof data.lang[a] == 'undefined'){
    console.warn('No translation for word: "'+a+'"');
  }else{
    trans = data.lang[a];
  }
  return trans;
}

async function ping(ip,rowId ,callback) {
  var result = await ipcRenderer.invoke('ping', ip, rowId);
  result = JSON.parse(result);
  console.debug(new Date(),'Row-'+result.rowId,result.status,result.pingDelay,data.rows[result.rowId].name,data.rows[result.rowId].pingIP);
  callback(result)
}

function checkRowsNumber(){
  if(data.rows.length > 5){
    $('.table').addClass('eco');
  }else{
    $('.table').removeClass('eco');
  }
}

function readDir(callback){

  if(build){
    picsDir = 'resources/app/assets/icons';
    picsDirLocal = 'assets/icons';
    langDataFile = 'resources/app/assets/config/langData.json'
    configFile = 'resources/app/assets/config/config.json'
  }else{
    picsDir = 'assets/icons';
    picsDirLocal = picsDir;
    langDataFile = 'assets/config/langData.json'
    configFile = 'assets/config/config.json'
  }
  ret = {};
  //config
  try{
    config = JSON.parse(fs.readFileSync(configFile, 'utf8', (err, retData) => {
      if (err) {
        config = [];
        console.error('ERROR reading config at: '+configFile);
        console.error(err);
      }
    }));
  }catch(e){
    console.error(e);
    config = [];
  }
  //language
  try{
    data.lang = JSON.parse(fs.readFileSync(langDataFile, 'utf8', (err, retData) => {
      if (err) {
        console.error('ERROR reading langDataFile at '+langDataFile);
        console.error(err);
      }
    }));
  }catch(e){
    console.error(e);
  }
  //pictures
  ret.pics = [];
  fs.readdir(picsDir,  (err, dir) => {
    for(let filePath of dir){
        ret.pics.push(picsDirLocal+'/'+filePath);
      }
      return callback(ret);
    });
}
