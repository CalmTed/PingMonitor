const fs = require("fs");
var data = {}
data.rows = [];
data.pics =[];
data.lang = [];
var config = [];

/*=============== CHANGE THIS FLAG BEFORE BUILDING ==============*/
// var target = 'build';
// var target = 'pack';
var target = 'dev';
/*===============================================================*/
var debug = true;

class Row {
  _status = 'unchecked';

  set status(value){
    this.changeProp('_status',value);
  }
  get status(){
    return this._status;
  }
  constructor(name,picture,pingIP,pingUpdateTime,isPaused = config.initialPause){
    this.id = data.rows.length;
    this.name = name;
    this.picture = Number(picture);

    this.pingIP = pingIP;
    this.pingDellayTime = 0;
    this.pingUpdateTime = pingUpdateTime;
    this.pingTTL = -1;
    this.pingHist = [];

    this.packetsSent = 0;
    this.packetsResived = 0;
    this.packetsLost = 0;

    this.lastConnectionLost = 0;
    this.lastConnectionFound = 0;
    this.lastOutOfConnection = 0;
    this.totalOutOfConnection = 0;
    this.isPaused = isPaused;
    this.isChecking = false;
    this.isMuted = false;
    this.pingTimeStrategy = config.defaultPingTimeStrategy;
    this.rowDom = ''
  }
  create(){
    parent = $('.table');
    this.rowDom = $(`<div class="row row-${this.id}" rowId="${this.id}" status="${this.status}"></div>`);
    this.rowDom.append($(`<div class="row-column"><div class="row-picture" title="${translate('Change picture')}" style="background-image:url('${data.pics[this.picture]}')"></div><div class="row-name" title="2x ${translate('Change name')}">${this.name}</div><div class="row-address" title="2x ${translate('Change address')}">${this.pingIP}</div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-status"><span class="row-status-span">${translate(this.status)}</span></div> <div class="row-ping"><label>${translate('Dellay')}: <span class="row-ping-dellay"></span></label><label>${translate('Update time')}: <span class="row-ping-updatetime" title="2x ${translate('Change update time')}">${this.pingUpdateTime} ${translate('s')}</span></label><label>${translate('Uptime')}: <span class="row-uptime"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-connection"><label>${translate('Last Connection Lost')}: <span class="row-last-conn-lost"></span></label><label>${translate('Last Connection Found')}: <span class="row-last-conn-found"></span></label><label>${translate('Last Out of Connection')}: <span class="row-last-out-of-conn"></span></label><label>${translate('Total Out of Connection')}: <span class="row-total-out-of-conn"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column tools"><div class="row-tools">\
                            <div class="row-tool tool-pause-row" title="${translate('Pause pinging')}"></div>\
                            <div class="row-tool tool-mute-row" title="${translate('Mute row')}"></div>\
                            <div class="row-tool tool-remove-row" title="2x ${translate('Remove row')}"></div>\
                          </div></div>`));
    this.rowDom.append($('<div class="player-block"><audio class="player" preload loop src="'+soundFile+'" type="audio/wav"></audio></div>'));
    parent.append(this.rowDom);
    if(this.isPaused){
      this.render()
    };//for initial pausing
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
      let finEdit = (_this)=>{
        if($(_this).val().length>1 && $(_this).val().length<20){
          data.rows[$(_this).attr('rowId')].changeProp('name',$(_this).val());
        }else{
          data.rows[$(_this).attr('rowId')].changeProp('name',data.rows[$(_this).attr('rowId')].name);
        }
      }
      $('.row-name input').on('blur',function(){
        finEdit(this)
      })
      $('.row-name input').on('keypress',function(e){
        if(e.which == 13){
          finEdit(this)
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
      let finEdit = (_this)=>{
        if( $(_this).val().length>6 && $(_this).val().length<30){
          data.rows[$(_this).attr('rowId')].changeProp('pingIP',$(_this).val());
        }else{
          data.rows[$(_this).attr('rowId')].changeProp('pingIP',data.rows[$(_this).attr('rowId')].pingIP);
        }
      }
      $('.row-address input').on('blur',function(){
        finEdit(this);
      })
      $('.row-address input').on('keypress',function(e){
        if(e.which == 13){
          finEdit(this);
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
      $('.row-ping-updatetime input').select();
      let finEdit = (__this)=>{
        if( ($(__this).val()*1)>1 && ($(__this).val()*1)<1000){
          let _this = data.rows[$(__this).attr('rowId')];
          _this.changeProp('pingUpdateTime',$(__this).val());
          let strat = _this.pingTimeStrategy;
          strat[_this.status] = $(__this).val();
          if(_this.pingTimeStrategy != strat){
            _this.changeProp('pingTimeStrategy',strat);
          }
        }else{
          data.rows[$(__this).attr('rowId')].changeProp('pingUpdateTime',data.rows[$(__this).attr('rowId')].pingUpdateTime);
        }
      }
      $('.row-ping-updatetime input').on('blur',function(){
        finEdit(this)
      })
      $('.row-ping-updatetime input').on('keypress',function(e){
        if(e.which == 13){
          finEdit(this)
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
    //muteRow
    $(`.row-${this.id} .tool-mute-row`).on('click',function(){
      let toolsDOM = $(this).parent()[0]
      let colDOM = $(toolsDOM).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      if(!rowOBJ.isMuted){
        rowOBJ.changeProp('isMuted',true);
        $('.player')[0].pause();
      }else{
        rowOBJ.changeProp('isMuted',false);
      }
    });
  }
  render(list = ['picture','name','pingIP','status','pingDellayTime','pingUpdateTime','pingTTL','packetsSent','packetsResived','packetsLost','lastConnectionLost','lastConnectionFound','lastOutOfConnection','totalOutOfConnection','isChecking']){
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
    //col2-3
    if(needToUpdate('status')){
      $(`.row-${this.id}`).attr('status',this.status);
      $(`.row-${this.id} .row-status-span`).html(translate(this.status));
    }
    //col3
    if(needToUpdate('pingDellayTime')){
      let ttlList = [];
      let stats = {};
      this.pingHist.forEach(e=>{
        if(ttlList.indexOf(e.pingTTL) == -1 && e.pingTTL != -1){
          //add cluster
          ttlList.push(e.ttl);
          stats[this.pingTTL] = []
        }
        //add to stats
        if(typeof stats[this.pingTTL] != 'undefined'){
          stats[this.pingTTL].push(e.pingDellay)
        }
      })

      if(['unknown','NaN',-1].indexOf(this.pingDellayTime) == -1){
        $(`.row-${this.id} .row-ping-dellay`).html(`${this.pingDellayTime} ${translate('ms')}`);
      }else{
        $(`.row-${this.id} .row-ping-dellay`).html(`-`);
      }
    }
    if(needToUpdate('pingTTL')){
      if(['unknown','NaN',-1].indexOf(this.pingTTL) == -1){
        $(`.row-${this.id} .row-ping-dellay`).attr('title',`TTL:${this.pingTTL}`);
      }else{
        $(`.row-${this.id} .row-ping-dellay`).attr('title',`TTL:-`);
      }
    }
    if(needToUpdate('pingUpdateTime')){
      $(`.row-${this.id} .row-ping-updatetime`).html(`${this.pingUpdateTime} ${translate('s')}`);
      $(`.row-${this.id}`).css('--row-time',this.pingUpdateTime+'s')
    }
    if(needToUpdate('packetsSent') || needToUpdate('packetsResived') || needToUpdate('packetsLost')){
      let uptime = 0
      if(this.packetsSent*this.packetsResived != 0){
        uptime = Math.round(100/this.packetsSent*this.packetsResived*100)/100;
      }
      $(`.row-${this.id} .row-uptime`).html(`${uptime} %`).attr('title','S:'+(this.packetsSent)+' R:'+(this.packetsResived)+' L:'+(this.packetsLost));
    }
    //col4
    if(needToUpdate('lastConnectionLost') || needToUpdate('lastConnectionFound') || needToUpdate('lastOutOfConnection')|| needToUpdate('totalOutOfConnection')){
      if(this.lastConnectionLost !=0 ){
        let minsL = this.lastConnectionLost.getMinutes();
        if(minsL<10){
          minsL = '0'+minsL;
        }
        let secsL = this.lastConnectionLost.getSeconds();
        if(secsL<10){
          secsL = '0'+secsL;
        }
        $(`.row-${this.id} .row-last-conn-lost`).html(`${this.lastConnectionLost.getHours()}:${minsL}:${secsL}`);
        $(`.row-${this.id} .row-last-conn-lost`).attr('title',this.lastConnectionLost);
      }else{
        $(`.row-${this.id} .row-last-conn-lost`).html(`-`);
      }
      if(this.lastConnectionFound !=0 ){
        let  minsF = this.lastConnectionFound.getMinutes();
        if(minsF<10){
          minsF = '0'+minsF;
        }
        let secsF = this.lastConnectionFound.getSeconds();
        if(secsF<10){
          secsF = '0'+secsF;
        }
        $(`.row-${this.id} .row-last-conn-found`).html(`${this.lastConnectionFound.getHours()}:${minsF}:${secsF}`);
        $(`.row-${this.id} .row-last-conn-found`).attr('title',this.lastConnectionFound);
      }else{
        $(`.row-${this.id} .row-last-conn-found`).html(`-`);
      }
      let toFormat = function(t){
        if(t<1000){
          return t+' '+translate('ms');
        }else if(t<60000){
          return Math.floor(t/1000)+' '+translate('s');
        }else if(t<3600000){
          return Math.floor(t/60000)+' '+translate('m');
        }else{
          return Math.floor(t/3600000)+' '+translate('h');
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
    }else{
      $(`.row-${this.id}`).removeClass('paused')
      $(`.row-${this.id} .tool-pause-row`).attr('title',translate('Pause pinging'))
      $(`.row-${this.id}`).attr('status',this.status);
      $(`.row-${this.id} .row-status-span`).html(translate(this.status));
    }

    if(needToUpdate('isChecking')){
      if(this.isChecking){
        $(`.row-${this.id}`).addClass('checking')
      }else{
        $(`.row-${this.id}`).removeClass('checking')
      }
    }
    //muting
    if(needToUpdate('isMuted')){
      if(this.isMuted){
        $(`.row-${this.id}`).addClass('muted')
        $(`.row-${this.id} .tool-mute-row`).attr('title',translate('Unmute row'))
      }else{
        $(`.row-${this.id}`).removeClass('muted')
        $(`.row-${this.id} .tool-mute-row`).attr('title',translate('Mute row'))
      }
    }
  }
  remove(){
    //remove from DOM
    $(`.row-${this.id}`).remove();
    //remove from array
    data.rows.splice(this.id,1);
    let i = 0;
    //sort list of remaining
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
    saveToLocalStorage();
  }
  changeProp(prop,value){
    if(this[prop] != value || /* white list */ ['name','pingUpdateTime','pingIP','pingDellayTime'].indexOf(prop) !== -1){
      this[prop] = value;
      if(/* black list */[].indexOf(prop) == -1){
        this.render(prop);
      }
      if(/* black list */['isChecking','_status','pingDellayTime','packetsSent','packetsResived','packetsLost','lastConnectionLost','lastOutOfConnection'].indexOf(prop) == -1){
        saveToLocalStorage();
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
        //ttl
        if( ['undefined','null'].indexOf( typeof res.ttl) == -1){
          _this.changeProp('pingTTL', res.ttl);
        }else{
          _this.changeProp('pingTTL', -1);
        }
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
            let looc = now.getTime() - _this.lastConnectionLost.getTime();
            if(looc>(config.timeToAlarm*1000) && !_this.isMuted && $('.player')[0].paused){
              $('.player')[0].play();
            }
            _this.changeProp('lastOutOfConnection',looc);
          }
        }
        //on founding connection
        if(['offline','error','timeout'].indexOf(_this.status) > -1 /* if was offline */ && /* but now online*/ ['online'].indexOf(res.status) > -1 ){

          _this.changeProp('lastConnectionFound',new Date());
          //removing mute on reconection
          if(_this.isMuted && config.unmuteOnGettingOnline){
            _this.changeProp('isMuted',false)
          }
          _this.changeProp('lastOutOfConnection', _this.lastConnectionFound.getTime() - _this.lastConnectionLost.getTime());
          _this.changeProp('totalOutOfConnection', _this.totalOutOfConnection + _this.lastOutOfConnection);
        }

        _this.changeProp('_status',status);
        _this.changeProp('pingDellayTime',res.pingDellay);
        _this.changeProp('packetsSent',_this.packetsSent+1);
        if(res.packetLoss != 100 && res.status == 'online'){
          _this.changeProp('packetsResived',_this.packetsResived+1);
        }else{
          _this.changeProp('packetsLost',_this.packetsLost+1);
        }
        _this.changeProp('isChecking',false);
        //changing time based on ping time strategy
        if(_this.packetsSent > 0){//to not to change onstartup
          if(_this.pingTimeStrategy[_this.status] != undefined){
            if(_this.pingUpdateTime != _this.pingTimeStrategy[_this.status]){
              _this.changeProp('pingUpdateTime',_this.pingTimeStrategy[_this.status]);
            }
          }else if(_this.pingUpdateTime != _this.pingTimeStrategy['default']){
            _this.changeProp('pingUpdateTime',_this.pingTimeStrategy['default']);
          }
        }
        //hist
        let timenow = new Date().getTime()
        let timeToDelete = 1000*60*60; //six hours
        _this.pingHist.push({
          'time':timenow,
          'timestamp':new Date(),
          'status':_this.status,
          'pingDellay':_this.pingDellayTime,
          'pingTTL':_this.pingTTL
        })
        _this.pingHist.map(h=>{
          if(timenow - h.time < timeToDelete){
            return h;
          }else{
            return false;
          }
        });
        _this.timeout = setTimeout(()=>{_this.pinging()},Number(_this.pingUpdateTime)*1000);
      })
    }else{
      this.changeProp('isChecking',false);
    }

  }
  getSetts(){
    ret = {
      name:this.name,
      pingIP:this.pingIP,
      pingUpdateTime:this.pingUpdateTime,
      picture:this.picture,
      pingTimeStrategy:this.pingTimeStrategy,
      isPaused:this.isPaused,
      isMuted:this.isMuted
    }
    return ret;
  }
}

function createPage(){
  var root = $('.root')
  root.html('');
  let monitorTable = $('<div class="table"></div>');
  root.append(monitorTable);
  if(window.localStorage.getItem('data') !== null){
    loadFromLocalStorage();
  }else{
    //adding initial rows
    config.initialRows.forEach((row)=>{
        data.rows.push(new Row(row.name,row.picture,row.address,row.updatetime,row.isPaused))
    })
  }
  data.rows.forEach(
    (row) => {
      row.create()
      row.createRowEventListeners()
    })
  newRowBtns = $('<div class="bottom-tools"><div class="new-row-btn" title="'+translate("Add new row")+' [Ctrl+N]" onclick="addRow()">+ <span>'+translate("Add new row")+'</span></div><div class="full-screen-btn" title="'+translate("Toggle full screen")+' [Ctrl+F]" onclick="toggleFullScreen()">'+translate("Toggle full screen")+'</div><div class="pause-all-btn" title="'+translate("Pause all rows")+' [Ctrl+Space]" onclick="togglePause()">'+translate("Pause all rows")+'  </div></div>');
  root.append(newRowBtns)
}

$(document).ready(function(){
  $('.root').html('<div style="background-image: url(assets/icons/PM_nofill.ico);width: 300px;height: 100vh;background-size: 294px;display: flex;justify-content: center;width: 100%;background-repeat: no-repeat;background-position: center;position: fixed;background-position-y: 127px;"> </div><h1 style="display:flex;justify-content:center;align-items:center;height:100vh;position: fixed;width: 100%; ">Ping Monitor</h1><p style=" display: flex; justify-content: center; align-items: center; height: 110vh; position: fixed; width: 100%; opacity: 0.7; ">Reading files...</p>');
  readDir(function(ret){
    data.pics = ret.pics;
    createPage();
  })
  pausedRows = [];
  $(this).on('keypress',(e)=>{
    // "F"
    if(e.ctrlKey && e.which == 6){
      toggleFullScreen()
    }
    //N
    if(e.ctrlKey && (e.which == 110 || e.which == 14)){
      addRow();
    }
    //DOING IT IN THE MENU
    //"S"
    // if(e.ctrlKey && e.which == 19){
    //   saveAs();
    // }
    // // "O"
    // if(e.ctrlKey && e.which == 15){
    //   openConfig();
    // }
    //pause
    if(e.ctrlKey && e.which == 0){
      e.preventDefault();//stoping scroll
      togglePause();
    }
  })
});

function translate(a){
  let trans = a;

  if(config.langCode == 'ua'){
    if( typeof data.lang[a] == 'undefined' ){
      console.warn('No translation for word: "'+a+'"');
    }else{
      trans = data.lang[a];
    }
  }
  return trans;
}

function saveToLocalStorage(){
  rowsToSave = [];
  data.rows.forEach((row,i)=>{

    rowsToSave[i] = row.getSetts();
  });
  dataToSave = {
    langCode:config.langCode,
    colorMode:config.colorMode,
    rows:rowsToSave,
    progName:'PingMonitor'
  }
  window.localStorage.setItem('data',JSON.stringify(dataToSave));
  return JSON.stringify(dataToSave,undefined, 4);
}

function loadFromLocalStorage(){
  let dataLocal = JSON.parse(window.localStorage.getItem('data'));
  Object.keys(dataLocal).forEach((g)=>{
    if(['langCode','colorMode'].indexOf(g) !=-1){
      data[g] = dataLocal[g];
    }else if(g == 'rows'){
      Object.keys(dataLocal[g]).forEach((o)=>{
        if(data.rows[o] !== undefined){
          Object.keys(dataLocal[g][o]).forEach((d)=>{
            data.rows[o][d] = dataLocal[g][o][d];
          });
        }else{
          let newData = dataLocal[g][o];
          let newRow = new Row(newData.name,newData.picture,newData.pingIP,newData.pingUpdateTime,newData.isPaused);
          newRow.pingTimeStrategy = newData.pingTimeStrategy;
          data.rows.push( newRow );
          data.rows[data.rows.length-1].render()
          data.rows[data.rows.length-1].createRowEventListeners()
        }
      });
    }
  })
}

async function ping(ip,rowId,callback) {
  var result = await ipcRenderer.invoke('ping', ip, rowId);
  result = JSON.parse(result);
  if(debug){
    console.debug(new Date(),'Row-'+result.rowId,data.rows[result.rowId].name,data. rows[result.rowId].pingIP,result);
  }
  callback(result)
}

function checkRowsNumber(){
  if(data.rows.length > 5){
    $('.table').addClass('eco');
  }else{
    $('.table').removeClass('eco');
  }
}

var picsDirLocal;
function readDir(callback){
  if(target == 'build'){
    picsDir = 'assets/icons';
    picsDirLocal = '../../assets/icons';
    langDataFile = 'assets/config/langData.json'
    configFile = 'assets/config/config.json'
    soundFile = '../../assets/alarm.wav'
  }
  else if(target == 'pack'){
    picsDir = 'resources/app/assets/icons';
    picsDirLocal = 'assets/icons';
    langDataFile = 'resources/app/assets/config/langData.json'
    configFile = 'resources/app/assets/config/config.json'
    soundFile = 'resources/app/assets/alarm.wav'
  }else{
    picsDir = 'assets/icons';
    picsDirLocal = picsDir;
    langDataFile = 'assets/config/langData.json'
    configFile = 'assets/config/config.json'
    soundFile = 'assets/alarm.wav'
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
        if(filePath.indexOf('.png') != -1){
          ret.pics.push(picsDirLocal+'/'+filePath);
        }
      }
      return callback(ret);
    });
}

// async function saveAs(){
//   let time = new Date();
//   let name = 'PMConfig_'+time.getFullYear()+(time.getMonth()+1)+time.getDate()+time.getHours()+time.getMinutes()+time.getSeconds();
//   let text = saveToLocalStorage();
//   await ipcRenderer.invoke('saveFile',name, text,translate('Save config'));
// }

ipcRenderer.on('asynchronous-message', function (evt, message) {
  // if(message.call == 'saveAs'){
  //   saveAs();
  // }
  // if(message.call == 'openConfig'){
  //   openConfig();
  // }
  if(message.call == 'sendDataToWin'){
    if(message.rowsData){
      let newRowsData = message.rowsData;
      if(newRowsData == 'useLocal'){
        console.log('Using localStorage save');
      }else{
        console.log('rowData: ',newRowData);
      }
      //check for validity
      //create rows...

    }else if(message.id){
      // id should be titleId-1
      localStorage.setItem('winId',message.id)
    }else{
      console.error('setRowData call must specify rowsData or id message: ',message);
    }
  }else if(message.call == 'requestInfo'){
    if(message.info){
      if(message.info == 'rowsData'){
        console.log('reguest info');
        let text = saveToLocalStorage({saveToStorage:false});
        let id = localStorage.getItem('winId');
        ipcRenderer.invoke('sendDataToMain',{call:'saveRowsToFile',rowsData:text,winId:id});
      }
    }else{
      console.error('requestInfo call must specify info parameter');
    }
  }else{
    console.error('Unknown message call: ',message.call);
  }
});

async function openConfig(){
  let ret = await ipcRenderer.invoke('openFile',translate('Open config'));
  console.debug(ret);
  if(ret != 'canceled'){
    data.rows.forEach(
      (row) => {
        row.remove()
    })
    confToOpen = JSON.parse(ret.text);
    window.localStorage.setItem('data',JSON.stringify(confToOpen));
    loadFromLocalStorage();
    createPage();
  }

}

var toggleFullScreen = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

var addRow = ()=>{
  let lastRow = data.rows[data.rows.length-1];
    newRowData = config.defaultNewRow;
  let newData = new Row(newRowData.name,newRowData.picture,newRowData.pingIP,newRowData.pingUpdateTime,newRowData.isPaused)
  if(lastRow != undefined){
    newData = new Row(lastRow.name,lastRow.picture,lastRow.pingIP,lastRow.pingUpdateTime,lastRow.isPaused);
  }
  data.rows.push( newData );
  data.rows[data.rows.length-1].create()
  data.rows[data.rows.length-1].render();
  data.rows[data.rows.length-1].createRowEventListeners()
  saveToLocalStorage();
}

var togglePause = ()=>{
  unpausedNum = 0;
  Object.keys(data.rows).forEach((row)=>{
    if(!data.rows[row].isPaused){
      unpausedNum++;
    }
  });
  Object.keys(data.rows).forEach((row)=>{
    //unpausing
    if(unpausedNum>0){
        //pausing all
        if(!data.rows[row].isPaused){
          data.rows[row].changeProp('isPaused',true);
          pausedRows.push(row);
        }
    }else{
      if(pausedRows.indexOf(row) != -1){
        data.rows[row].changeProp('isPaused',false);
      }
    }
  })
  if(unpausedNum==0){
    pausedRows = [];
  }
}
