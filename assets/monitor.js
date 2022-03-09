const Sortable = require("sortablejs");
const {webFrame} = require('electron');
const fs = require("fs");
var data = {}
data.rows = [];
data.pics =[];
data.lang = [];
var config = [];
var configSet = ()=>{};
var winId,prevWinId;
var sortable;
/*=============== CHANGE THIS FLAG BEFORE BUILDING ==============*/
var target = 'build';
// var target = 'pack';
// var target = 'dev';
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
    this.uid = Math.round(
                Math.random()*100000
              )+'';
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
    this.rowDom = '';
    this.ttls = {};
    this.isSubscribed = false;//subscription to graph
  }
  create(){
    parent = $('.table');
    this.rowDom = $(`<div class="row row-${this.uid}" rowId="${this.id}" status="${this.status}"></div>`);
    this.rowDom.append($(`<div class="row-column"><div class="row-picture" title="${translate('Change picture')}" style="background-image:url('${data.pics[this.picture]}')"></div><div class="row-name" title="2x ${translate('Change name')}">${this.name}</div><div class="row-address" title="2x ${translate('Change address')}">${this.pingIP}</div></div>`));

    this.rowDom.append($(`<div class="row-column"><div class="row-status"><span class="row-graph"><svg width="100" height="40" viewBox="0 0 100 40"><path d=""></path></svg></span><span class="row-status-span">${translate(this.status)}</span></div> <div class="row-ping"><label><span class="row-ping-title">${translate('Dellay')}:</span> <span class="row-ping-dellay"></span></label><label><span class="row-ping-title">${translate('Update time')}:</span> <span class="row-ping-updatetime" title="2x ${translate('Change update time')}">${this.pingUpdateTime} ${translate('s')}</span></label><label><span class="row-ping-title">${translate('Uptime')}:</span> <span class="row-uptime"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column"><div class="row-connection"><label><span class="row-title">${translate('Last Connection Lost')}:</span> <span class="row-last-conn-lost"></span></label><label><span class="row-title">${translate('Last Connection Found')}:</span> <span class="row-last-conn-found"></span></label><label><span class="row-title">${translate('Last Out of Connection')}:</span> <span class="row-last-out-of-conn"></span></label><label><span class="row-title">${translate('Total Out of Connection')}:</span> <span class="row-total-out-of-conn"></span></label></div></div>`));
    this.rowDom.append($(`<div class="row-column tools"><div class="row-tools">\
                            <div class="row-tool material-icons tool-pause-row" title="${translate('Pause pinging')}">play_arrow</div>\
                            <div class="row-tool material-icons tool-mute-row" title="${translate('Mute row')}">volume_up</div>\
                            <div class="row-tool material-icons tool-remove-row" title="2x ${translate('Remove row')}">remove_circle_outline</div>\
                          </div></div>`));
    this.rowDom.append($('<div class="player-block"><audio class="player" preload loop src="'+soundFile+'" type="audio/wav"></audio></div>'));
    parent.append(this.rowDom);
    if(this.isPaused){
      this.render()
    };//for initial pausing
    this.pinging();
    //sorting drag and drop
    sortable = new Sortable($('.table')[0], {
      //sorting rows after list update
      onUpdate:function(evt){
        let tempRow = data.rows[evt.newIndex];
        data.rows[evt.newIndex] = data.rows[evt.oldIndex]
        data.rows[evt.oldIndex] = tempRow;
        data.rows[evt.newIndex].changeProp('id',evt.newIndex);
        data.rows[evt.oldIndex].changeProp('id',evt.oldIndex);
      }
    });
  }
  createRowEventListeners(){
    /*                                                               */
    /*                    CAN CALL  changeProp                       */
    /*                                                               */
    /*             CAN NOT set HTML or Props manualy                 */
    /*                                                               */
    //picture
    $(`.row-${this.uid} .row-picture`).on('click',function(){
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
    $(`.row-${this.uid} .row-name`).on('click',function(){
      let colDOM = $(this).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      $(this).html(`<input rowId="${rowOBJ.id}"  value="${rowOBJ.name}"> `)
      $('.row-name input').focus();
      let finEdit = (_this)=>{
        if($(_this).val().length>1 && $(_this).val().length<14){
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
    $(`.row-${this.uid} .row-address`).on('click',function(){
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

    $(`.row-${this.uid} .row-graph`).on('click',function(){
      let statusDOM = $(this).parent()[0]
      let colDOM = $($(statusDOM).parent()[0])
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId')
      let rowOBJ = data.rows[rowId]
      let hist = rowOBJ.pingHist
      let rowUid = rowOBJ.uid;
      rowOBJ.changeProp('isSubscribed',true)
      ipcRenderer.invoke('sendDataToMain',{call:'openGraphWin',pingHist:hist,winId:winId,rowUid:rowUid});

    })
    //UpdateTime
    $(`.row-${this.uid} .row-ping-updatetime`).on('click',function(){
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
        if(e.which == 13){//enter
          finEdit(this)
        }
      })
    });
    //removeRow
    $(`.row-${this.uid} .tool-remove-row`).on('dblclick',function(){
      let toolsDOM = $(this).parent()[0]
      let colDOM = $(toolsDOM).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      rowOBJ.remove()
    });
    //pauseRow
    $(`.row-${this.uid} .tool-pause-row`).on('click',function(){
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
    $(`.row-${this.uid} .tool-mute-row`).on('click',function(){
      let toolsDOM = $(this).parent()[0]
      let colDOM = $(toolsDOM).parent()[0]
      let rowDOM = $($(colDOM).parent()[0])
      let rowId = rowDOM.attr('rowId');
      let rowOBJ = data.rows[rowId];
      if(!rowOBJ.isMuted){
        rowOBJ.changeProp('isMuted',true);
        $('.row-'+rowOBJ.uid+' .player')[0].pause()
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
    let toFormat = function(t){
      let h = Math.floor(t/3600000)
      let m = Math.floor((t-(h*3600000))/60000)
      let s = Math.floor((t-(h*3600000)-(m*60000))/1000)
      let addZero = (num)=>{
        return num<10?`0${num}`:`${num}`
      }
      return t===0?`-`:`${addZero(h)}:${addZero(m)}:${addZero(s)}`
    }
    if(needToUpdate('id')){
      $(`.row-${this.uid}`).attr('rowid',this.id);
    }
    //col1
    if(needToUpdate('picture') && $(`.row-${this.uid} .row-picture`).css("background-image") != `url('${data.pics[this.picture]}')`){
      $(`.row-${this.uid} .row-picture`).css("background-image",`url('${data.pics[this.picture]}')`);
    }
    if(needToUpdate('name') && $(`.row-${this.uid} .row-name`).html() != this.name){
      $(`.row-${this.uid} .row-name`).html(this.name);
    }
    if(needToUpdate('pingIP') && $(`.row-${this.uid} .row-address`).html() != this.pingIP){
      $(`.row-${this.uid} .row-address`).html(this.pingIP);
    }
    //col2
    if(needToUpdate('pingHist')){
      $(`.row-${this.uid} .row-graph path`).attr('d',getPath({dataArray:this.pingHist}));
    }
    if(needToUpdate('status')){
      $(`.row-${this.uid}`).attr('status',this.status);
      $(`.row-${this.uid} .row-status-span`).html(translate(this.status));

    }
    //col2-3
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
        $(`.row-${this.uid} .row-ping-dellay`).html(`${this.pingDellayTime}${translate('ms')}`);
      }else{
        $(`.row-${this.uid} .row-ping-dellay`).html(`-`);
      }
    }
    if(needToUpdate('pingTTL') || needToUpdate('packetsResived')){
      if(['unknown','NaN',-1].indexOf(this.pingTTL) == -1){
        //calculating ttl stats list
        if(this.pingHist.length >0){
          this.pingHist.forEach((i)=>{
            //creating new ttl
            if(!this.ttls[i.pingTTL] && i.pingTTL != -1){
              console.debug('creating new ttl: ',i.pingTTL);
              this.ttls[i.pingTTL] = {};
              this.ttls[i.pingTTL].min = Infinity
              this.ttls[i.pingTTL].avgSum = 0
              this.ttls[i.pingTTL].avgNum = 0
              this.ttls[i.pingTTL].max = -Infinity;
            //updating existing
            }else if(this.ttls[i.pingTTL]){
              if(i.pingDellay<this.ttls[i.pingTTL].min){
                this.ttls[i.pingTTL].min = i.pingDellay
              }
              if(i.pingDellay>this.ttls[i.pingTTL].max){
                this.ttls[i.pingTTL].max = i.pingDellay
              }
              this.ttls[i.pingTTL].avgSum+=i.pingDellay;
              this.ttls[i.pingTTL].avgNum++;
            }
          })
          let ttlText = '';
          Object.entries(this.ttls).forEach((t)=>{
            let value = t[1];
            value.avgSum = Math.round(value.avgSum/value.avgNum);
            ttlText +=`TTL: ${t[0]} min:${value.min} avg:${value.avgSum} max:${value.max} \n`
            value.avgSum = 0;
            value.avgNum = 0;//?
          })
          $(`.row-${this.uid} .row-ping-dellay`).attr('title',ttlText);
        }else{
          $(`.row-${this.uid} .row-ping-dellay`).attr('title',`TTL:${this.pingTTL}`);
        }
      }else{
        $(`.row-${this.uid} .row-ping-dellay`).attr('title',`TTL:-`);
      }

    }
    if(needToUpdate('pingUpdateTime')){
      $(`.row-${this.uid} .row-ping-updatetime`).html(`${this.pingUpdateTime}${translate('s')}`);
    }
    if(needToUpdate('packetsSent') || needToUpdate('packetsResived') || needToUpdate('packetsLost')){
      let uptime = 0
      if(this.packetsSent*this.packetsResived != 0){
        uptime = Math.round(100/this.packetsSent*this.packetsResived*100)/100;
      }
      $(`.row-${this.uid} .row-uptime`).html(`${uptime}%`).attr('title','S:'+(this.packetsSent)+' R:'+(this.packetsResived)+' L:'+(this.packetsLost));
    }


    //col4
    if(needToUpdate('lastConnectionLost') || needToUpdate('lastConnectionFound') || needToUpdate('lastOutOfConnection')|| needToUpdate('totalOutOfConnection')){
      //LAST LOST
      if(this.lastConnectionLost !=0 ){
        let minsL = this.lastConnectionLost.getMinutes();
        if(minsL<10){
          minsL = '0'+minsL;
        }
        let secsL = this.lastConnectionLost.getSeconds();
        if(secsL<10){
          secsL = '0'+secsL;
        }
        let hursL = this.lastConnectionLost.getHours()
        if(hursL<10){
          hursL = '0'+hursL;
        }
        $(`.row-${this.uid} .row-last-conn-lost`).html(`${hursL}:${minsL}:${secsL}`);
        $(`.row-${this.uid} .row-last-conn-lost`).attr('title',this.lastConnectionLost);
      }else{
        $(`.row-${this.uid} .row-last-conn-lost`).html("-");
      }
      //LAST FOUND
      if(this.lastConnectionFound !=0 ){
        let  minsF = this.lastConnectionFound.getMinutes();
        if(minsF<10){
          minsF = '0'+minsF;
        }
        let secsF = this.lastConnectionFound.getSeconds();
        if(secsF<10){
          secsF = '0'+secsF;
        }
        let hursF = this.lastConnectionFound.getHours()
        if(hursF<10){
          hursF = '0'+hursF;
        }
        $(`.row-${this.uid} .row-last-conn-found`).html(`${hursF}:${minsF}:${secsF}`);
        $(`.row-${this.uid} .row-last-conn-found`).attr('title',this.lastConnectionFound);
      }else{
        $(`.row-${this.uid} .row-last-conn-found`).html(`-`);
      }
      //LAST
      $(`.row-${this.uid} .row-last-out-of-conn`).html(toFormat(this.lastOutOfConnection));
      if(this.lastConnectionFound < this.lastConnectionLost){
        //when out of connection
        $(`.row-${this.uid} .row-total-out-of-conn`).html(toFormat(this.totalOutOfConnection + this.lastOutOfConnection));
      }else{
        //when connected
        $(`.row-${this.uid} .row-total-out-of-conn`).html(toFormat(this.totalOutOfConnection));
      }

    }else{
      if(this.lastConnectionLost == 0){
        $(`.row-${this.uid} .row-last-conn-lost`).html('-');
      }
      if(this.lastConnectionFound == 0){
        $(`.row-${this.uid} .row-last-conn-found`).html('-');
      }
      if(this.lastOutOfConnection == 0){
        $(`.row-${this.uid} .row-last-out-of-conn`).html(toFormat(this.lastOutOfConnection));
      }
      if(this.totalOutOfConnection == 0 && this.lastOutOfConnection == 0){
        $(`.row-${this.uid} .row-total-out-of-conn`).html(toFormat(this.totalOutOfConnection));
      }

    }
    //pausing
    if(this.isPaused){
      if($(`.row-${this.uid}.paused`).length == 0){
        $(`.row-${this.uid}`).addClass('paused')
        $(`.row-${this.uid} .tool-pause-row`).attr('title',translate('Restart pinging'))
        $(`.row-${this.uid} .tool-pause-row`).html('play_arrow')
      }
      $(`.row-${this.uid} .row-status-span`).html(translate('paused'))
    }else{
      $(`.row-${this.uid} .tool-pause-row`).html('pause');
      $(`.row-${this.uid}`).removeClass('paused')
      $(`.row-${this.uid} .tool-pause-row`).attr('title',translate('Pause pinging'))
      $(`.row-${this.uid}`).attr('status',this.status);
      $(`.row-${this.uid} .row-status-span`).html(translate(this.status));
    }
    checkUnpausedRows()

    if(needToUpdate('isChecking')){
      if(this.isChecking){
        $(`.row-${this.uid}`).addClass('checking')
      }else{
        $(`.row-${this.uid}`).removeClass('checking')
      }
    }
    //muting
    if(needToUpdate('isMuted')){
      if(this.isMuted){
        $(`.row-${this.uid} .tool-mute-row`).html('volume_off')
        $(`.row-${this.uid} .tool-mute-row`).attr('title',translate('Unmute row'))
      }else{
        $(`.row-${this.uid} .tool-mute-row`).html('volume_up')
        $(`.row-${this.uid} .tool-mute-row`).attr('title',translate('Mute row'))
      }
    }
  }
  remove(){
    //remove from DOM
    $(`.row-${this.uid}`).remove();
    //remove from array
    data.rows.splice(this.id,1);
    let i = 0;
    //sort remaining rows
    data.rows.forEach(
      (row) => {
        $(`.row-${row.uid}`).attr('rowId',i)
        row.changeProp('id',i);
        i++;
    })
    checkRowsNumber();//for rows size check
    saveToLocalStorage();
  }
  changeProp(prop,value){
    if(this[prop] != value || /* sama value bypass list */ ['name','pingUpdateTime','pingIP','pingDellayTime'].indexOf(prop) !== -1){
      this[prop] = value;
      this.render(prop);
      if(/* dont need to save those list */['isChecking','_status','pingDellayTime','packetsSent','packetsResived','packetsLost','lastConnectionLost','lastOutOfConnection'].indexOf(prop) == -1){
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
        //set ttl
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
            if(looc>(config.timeToAlarm*1000) && !_this.isMuted && $('.row-'+_this.uid+' .player')[0].paused){
              $('.row-'+_this.uid+' .player')[0].play()
            }
            _this.changeProp('lastOutOfConnection',looc);
          }
        }
        //on reconnecting
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
        if(res.pingDellay == -1){
          let bpd = res.pingDellay?res.pingDellay:-1;
          if(bpd !=-1){
            res.pingDellay = bpd;
          }
        }
        _this.changeProp('pingDellayTime',res.pingDellay);
        _this.changeProp('packetsSent',_this.packetsSent+1);
        if(res.packetLoss != 100 && res.status == 'online'){
          _this.changeProp('packetsResived',_this.packetsResived+1);
        }else{
          _this.changeProp('packetsLost',_this.packetsLost+1);
        }
        _this.changeProp('isChecking',false);
        //changing update time based on ping time strategy
        if(_this.packetsSent > 0){//to not to change onstartup
          if(_this.pingTimeStrategy[_this.status] != undefined){
            if(_this.pingUpdateTime != _this.pingTimeStrategy[_this.status]){
              _this.changeProp('pingUpdateTime',_this.pingTimeStrategy[_this.status]);
            }
          }else if(_this.pingUpdateTime != _this.pingTimeStrategy['default']){
            _this.changeProp('pingUpdateTime',_this.pingTimeStrategy['default']);
          }
        }
        //saving data to ping history
        let timenow = new Date().getTime();
        let timeToDelete = typeof config.pingHistoryTimeLimit == 'undefined'?1000*60*60:config.pingHistoryTimeLimit;
        _this.pingHist.push({
          'time':timenow,
          'timestamp':new Date(timenow),
          'status':_this.status,
          'pingDellay':_this.pingDellayTime,
          'pingTTL':_this.pingTTL
        })
        _this.pingHist = [..._this.pingHist.filter(h=>{
          return timenow - h.time < timeToDelete
        })]
        _this.render('pingHist');

        if(_this.isSubscribed){
          let __hist = _this.pingHist
          let __rowUid = _this.uid;
          //winId is a global variable
          ipcRenderer.invoke('sendDataToMain',{call:'subscription_deliver',pingHist:__hist,winId:winId,rowUid:__rowUid});
        }
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
  let id;
  if( winId){
    id = winId
  }else if(window.location.hash.replace('#','')){
    winId = window.location.hash.replace('#','')
    id = winId
  }else{
    window.location.hash = 0;
    winId = 0;
    id = winId;
  }
  if(window.localStorage.getItem('data-'+id) !== null || window.localStorage.getItem('data') !== null){
    console.debug('Opening local for id:',id);
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
  newRowBtns = $('<div class="bottom-tools"><div class="new-row-btn" title="'+translate("Add new row")+' [Ctrl+N]" onclick="addRow()">+ <span>'+translate("Add new row")+'</span></div><div class="full-screen-btn" title="'+translate("Toggle full screen")+' [Ctrl+F]" onclick="toggleFullScreen()"><span class="material-icons">fullscreen</span>'+translate("Toggle full screen")+'</div><div class="pause-all-btn" title="'+translate("Pause all rows")+' [Ctrl+Space]" onclick="togglePause()"><span class="material-icons">pause</span>'+translate("Pause all rows")+'</div></div>');
  root.append(newRowBtns);
  checkUnpausedRows();//to always show tools if needed
}
$(document).ready(function(){
  $('.root').html('<div style="background-image: url(assets/icons/PM_nofill.ico);width: 300px;height: 100vh;background-size: 270px;display: flex;justify-content: center;width: 100%;background-repeat: no-repeat;background-position: center;position: fixed;background-position-y: 127px;"> </div><h1 style="display:flex;justify-content:center;align-items:center;height:100vh;position: fixed;width: 100%; ">Ping Monitor</h1><p style=" display: flex; justify-content: center; align-items: center; height: 110vh; position: fixed; width: 100%; opacity: 0.7; ">Reading files...</p>');
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
    // "N"
    if(e.ctrlKey && (e.which == 110 || e.which == 14) && !e.shiftKey){
      addRow();
    }

    if(e.ctrlKey && e.which == 0){
      e.preventDefault();//stoping scroll
      togglePause();
    }
  })
  $('body')[0].onresize = (e)=>{
    checkRowsNumber();
  }
  webFrame.setZoomFactor(1);
})
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
  let id = winId;
  window.localStorage.setItem('data-'+id,JSON.stringify(dataToSave));
  return JSON.stringify(dataToSave,undefined, 4);
}
function loadFromLocalStorage(){
  let id = winId;
  let dataLocal;
  if(window.localStorage.getItem('data-'+id) == null){
    dataLocal = JSON.parse(window.localStorage.getItem('data'));
  }else{
    dataLocal = JSON.parse(window.localStorage.getItem('data-'+id));
  }
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
  callback(result);
}
function checkRowsNumber(){
  if(window.innerWidth > 2100){
    $('.table').addClass('eco');
    let rowsOfRows = Math.ceil(data.rows.length / 3);
    for(i=4;i<10;i++){
      if(rowsOfRows == i){
        $('.table').addClass('h'+i);
      }else{
        $('.table').removeClass('h'+i);
      }
    }
  }else{
    if(data.rows.length == 3){
      $('.table').addClass('h3');
    }else{
      $('.table').removeClass('h3');
    }
    if(data.rows.length == 4){
      $('.table').addClass('h4');
    }else{
      $('.table').removeClass('h4');
    }
    if(data.rows.length > 5){
      $('.table').addClass('eco');
      if(data.rows.length == 6){
        $('.table').addClass('h3');
      }else{
        $('.table').removeClass('h3');
      }
      if(data.rows.length > 6 && data.rows.length < 9){
        $('.table').addClass('h4');
      }else{
        $('.table').removeClass('h4');
      }
    }else{
      $('.table').removeClass('eco');
    }
    //FOR 4K
    if(data.rows.length<6){
      $('.table').removeClass('eco');
    }
  }
  if(data.rows.length == 0){
    $('.bottom-tools').addClass('force-show')
    checkUnpausedRows()
  }else{
    $('.bottom-tools').removeClass('force-show')
  }
}
var picsDirLocal;
function readDir(callback){
  if(target == 'build'){
    picsDir = 'assets/icons';
    picsDirLocal = '../../assets/icons';
    langDataFile = 'assets/config/ua.lang'
    configFile = 'assets/config/config.json'
    soundFile = '../../assets/alarm.wav'
  }
  else if(target == 'pack'){
    picsDir = 'resources/app/assets/icons';
    picsDirLocal = 'assets/icons';
    langDataFile = 'resources/app/assets/config/ua.lang'
    configFile = 'resources/app/assets/config/config.json'
    soundFile = 'resources/app/assets/alarm.wav'
  }else{
    picsDir = 'assets/icons';
    picsDirLocal = picsDir;
    langDataFile = 'assets/config/ua.lang'
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
ipcRenderer.on('asynchronous-message', function (evt, message) {

  if(message.call == 'sendDataToWin'){
    if(message.rowsData){
      let newRowsData = message.rowsData;
      if(newRowsData == 'useLocal'){
        console.debug('Using localStorage save');
      }else if(newRowsData == 'relocateRows'){
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
        window.localStorage.setItem('data-'+winId,JSON.stringify(dataToSave));
      }else{
        console.debug('new rowData: ',newRowsData);
        //validate
        if(newRowsData.progName){
          if(newRowsData.progName == 'PingMonitor'){
            window.localStorage.setItem('data-'+winId,JSON.stringify(newRowsData))
          }
        }
      }
      //create rows
      createPage()
    }else if(typeof message.id != 'undefined'){
      // id = title_id - 1
      prevWinId = winId;
      winId = message.id;
      window.location.hash = winId;
      if(typeof message.langCode != 'undefined'){
        if(message.langCode != config.langCode){
          configSet('langCode',message.langCode);
        }
        window.location.hash = winId;
      }
    }else{
      console.error('sendDataToWin call must specify rowsData or id. Message: ',message);
    }
  }else if(message.call == 'requestInfo'){
    if(message.info){
      if(message.info == 'rowsData'){
        let text = saveToLocalStorage({saveToStorage:false});
        let id = winId;
        ipcRenderer.invoke('sendDataToMain',{call:'saveRowsToFile',rowsData:text,winId:id});
      }
    }else{
      console.error('requestInfo call must specify info parameter');
    }
  }else if(message.call == 'toggleDarkMode'){
    if(config.colorMode == 'dark'){
      configSet('colorMode','light');
    }else{
      configSet('colorMode','dark');
    }
  }else if(message.call == 'subsciption_remove'){
    console.debug(`Removing subscription in the row${message.rowUid}`,message);
    if(typeof message.rowUid != 'undefined'){
      if(data.rows.filter(r=>r.uid == message.rowUid).length >0){
        data.rows.filter(r=>r.uid == message.rowUid)[0].changeProp('isSubscribed',false)
      }
    }else{
      cosole.error('Can`t unsubscibe, rowUid was not provided')
    }
  }else if(message.call == 'data_graph_request'){
    if(typeof message.rowUid != 'undefined'){
        let __hist = data.rows.filter(r=>r.uid == message.rowUid)[0].pingHist;
        ipcRenderer.invoke('sendDataToMain',{call:'subscription_deliver',pingHist:__hist,winId:winId,rowUid:message.rowUid});
    }else{
      cosole.error('Cant unsubscibe, rowUid was not provided')
    }
  }else{
    console.error('Unknown message call: ',message.call,message);
  }
})
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
  let newRowData = config.defaultNewRow;
  let newData = new Row(newRowData.name,newRowData.picture,newRowData.pingIP,newRowData.pingUpdateTime,newRowData.isPaused)
  if(typeof lastRow != 'undefined'){
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

var configSet = (key,value)=>{
  if(config[key]){
    config[key] = value;
  }
  if(key == 'colorMode'){
    if(value == 'light'){
      $('html').addClass('light')
    }else{
      $('html').removeClass('light')
    }
  }
  if(key == 'langCode'){
    data.rows.forEach(r=>{
      r.render()
    })
  }
}
const getPath = ({dataArray})=>{
  let _ret = '';
  let _canvasWidth = 100;
  let _canvasHeight = 40;
  let _heightMargin = 5;
  let _widthMargin = _heightMargin;
  let dataLenghtLimit = config.pingHistoryTimeLimit<config.pingMiniGraphTimeLimit?config.pingHistoryTimeLimit:config.pingMiniGraphTimeLimit;
  let timeOfBegining = new Date().getTime() - dataLenghtLimit;//cut to last N min
  let dataTrimmed = dataArray.filter(dot=>{return dot.time >= timeOfBegining})
  //koof
  // if l=0|l=1 koof = 100
  // if l>1 find time diff > devide width by one milisecond
  let widthKoof = (100-(_widthMargin*2));
  if(dataTrimmed.length>1){
    //no less then timelimit
    if(dataTrimmed[dataTrimmed.length-1].time - dataTrimmed[0].time > dataLenghtLimit){
       widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataTrimmed[dataTrimmed.length-1].time - dataTrimmed[0].time)
    }else{
      widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataLenghtLimit)
    }
  }
  let maxDellay = Math.max(...dataTrimmed.map(dot=>{return dot.pingDellay}));
  let _map = (val,start1,stop1,start2,stop2)=>{
    let __a = (val-start1)/(stop1-start1)*(stop2-start2)+start2;
    return start2 < stop2 ? Math.round(Math.max(Math.min(__a, stop2), start2)*10)/10 : Math.round(Math.max(Math.min(__a, start2), stop2)*10)/10;
  }
  //generate string
  //M - move
  //L - line to the point
  //C - curve
  //H - horizontal
  //Example: M0 20.5H6.67544C6.89041 20.5 7.10397 20.4653 7.3079 20.3974L15.6026 17.6325C16.6505 17.2832 17.7832 17.8495 18.1325 18.8974L18.4379 19.8138C18.7585 20.7755 19.7478 21.3453 20.7405 21.1399L33.5 18.5
  if(dataTrimmed.length>0){
    _ret += `M${_widthMargin} ${_map(dataTrimmed[0].pingDellay,maxDellay,0,_heightMargin,_canvasHeight-_heightMargin)}`
    let _firstTime = dataTrimmed[0].time;
    let _isDrawing = true;
    dataTrimmed.forEach((dot,i)=>{
      if(i>0){
        let _x = Math.round((_widthMargin+(dot.time - _firstTime)*widthKoof)*100)/100;
        let _y = _map(dot.pingDellay,maxDellay,0,_heightMargin,_canvasHeight-_heightMargin);
        if(dot.status == 'offline' ||dot.status == 'timeout'||dot.status == 'error'){
          _ret += `M${_x} ${_y}`;
        }else{
          _ret += `L${_x} ${_y}`;
        }
      }
    })
  }
  return _ret;
}
const checkUnpausedRows = ()=>{
  let unpausedRows = data.rows.filter(r=>{
    return !r.isPaused
  })
  if(unpausedRows.length == 0){
    $('.pause-all-btn').attr('disabled','')
  }else{
    $('.pause-all-btn').removeAttr('disabled')
  }
}
