var Graph = function(){
  this.marginTop = 4;
  this.marginBottom = this.marginTop;
  this.marginRight = this.marginTop;
  this.marginLeft = this.marginTop;
  this.isAltPressed = false;

  this.showStart = 0;//end = start+range
  this.showRange = 1000*60*30;//instead of Zoom
  this.dataRange = 0;
  // this.ctrlPressed = false;//for zoom

  this.dataArray = [];
  this.subscribedTo = {w:'none',r:'none'};

  this.construct = ({w,h,selector})=>{
    this.target = document.querySelector(selector);
    this.canvasW = w;
    this.canvasH = h;

  }
  this.create = ()=>{
    // requestData({
    //   win:-1,
    //   row:-1,
    //   callback:(dataFromMain)=>{
    //     console.log(dataFromMain)
    //   }
    // })
    this.addEventListeners();
  }
  this.render = (list)=>{
    if(typeof list == 'undefined'){
      list = ['dataArray','showStart','showRange'];
    }
    // this.koofW;
    // this.koofH;
    if(list.indexOf('subscribedTo') >-1){
      $('title').text(`Graph w${this.subscribedTo.w} r${this.subscribedTo.r}`)
    }
    if(list.indexOf('showStart') >-1 || list.indexOf('showRange') >-1){
      let _text = `Scroll: ${this.showStart}, Zoom: ${this.showRange}`;
      if(this.isAltPressed){
        $('.graph-canvas .text').text(_text)
      }else{
        $('.graph-canvas .text').text('')
      }
    }
    if(list.indexOf('dataArray') >-1 || list.indexOf('showStart') >-1|| list.indexOf('showRange') >-1){
      // console.log(this.showStart);
      let imageObj = getImage({
        dataArray:this.dataArray,
        start:this.showStart,
        range:this.showRange
      })
      //image grid is a path string
      //image legends array of <text>
      //image paths array [path]
      $('.graph-g-legends').html('');
      imageObj.text.forEach(t=>{
          let svgNS = "http://www.w3.org/2000/svg";
          let newText = document.createElementNS(svgNS,"text");
          newText.setAttributeNS(null,"x",t.x);
          newText.setAttributeNS(null,"y",t.y);
          var textNode = document.createTextNode(t.value);
          newText.appendChild(textNode);
          document.querySelector(".graph-g-legends").appendChild(newText);
      })
      $('.graph-g-grid path').attr('d',imageObj.grid)
      $('.graph-g-paths').html('')
      imageObj.paths.forEach(group=>{
        let svgNS = "http://www.w3.org/2000/svg";
        let newPath = document.createElementNS(svgNS,"path");
        newPath.setAttributeNS(null,"d",group.path);
        newPath.setAttributeNS(null,"status",group.status);
        newPath.setAttributeNS(null,"ttl",group.pingTTL);
        document.querySelector(".graph-g-paths").appendChild(newPath);
      })
      imageObj.dotts.forEach(dott=>{
        let svgNS = "http://www.w3.org/2000/svg";
        let newDott = document.createElementNS(svgNS,"circle");
        newDott.setAttributeNS(null,"cx",dott.x);
        newDott.setAttributeNS(null,"cy",dott.y);
        newDott.setAttributeNS(null,"r",'0.');
        document.querySelector(".graph-g-paths").appendChild(newDott);
      })
    }
    //TODO "no data to show" label
  }
  this.set = (param,value)=>{
    if(typeof this[param] != 'undefined'){
      if(this[param] != value){
        this[param] = value;
        if(param == 'dataArray'){
          let _min = Math.min(...this.dataArray.map(dott=>{return dott.time}))
          let _max = Math.max(...this.dataArray.map(dott=>{return dott.time}))
          this.dataRange = _max - _min;
        }
        this.render([param]);
      }
    }
  }
  this.addEventListeners = ()=>{
    $('.graph-canvas').on('mousewheel', (e)=>{
      if(e.ctrlKey){//ZOOM
        let newRange = this.showRange + (e.originalEvent.deltaY*1000);
        if(newRange<120000){
          newRange = 120000;
        }else  if(newRange>this.dataRange){
          newRange = this.dataRange
        }
        this.set('showRange',Math.round(newRange));
      }else{//SCROLL
        let newStart = this.showStart - (e.originalEvent.deltaX*1000);
        if(newStart<1){
          newStart = 0;
        }else if(newStart>(this.dataRange - this.showRange)){
          newStart = (this.dataRange - this.showRange);
        }
        this.set('showStart',Math.round(newStart));
      }
    })
    $('html').on('keydown',(e)=>{
      if(e.altKey){
        e.preventDefault()
        this.isAltPressed = true;
        this.render()
      }
    })
    $('html').on('keyup',(e)=>{
      if(!e.altKey){
        this.isAltPressed = false;
        this.render()
      }
    })
  }
}
async function requestData({win,row,callback}){
  let dataFromMain = await ipcRenderer.invoke('graphChannel',{call:'requestData',win:win,row:row});// -1 for all
  callback(dataFromMain)
}
ipcRenderer.on('graphChannel', function (evt, message) {
  if(message.call == 'deliver_data'&&typeof message.data != 'undefined'){
    let pingHist = message.data.pingHist;
    //setting any data in not subscribed for anything
    // console.log(graph.subscribedTo);
    if(graph.subscribedTo.r == 'none'){
      graph.set('dataArray',pingHist)
    }else{
      if(graph.subscribedTo.w == message.data.winId &&graph.subscribedTo.r == message.data.rowUid){
        graph.set('dataArray',pingHist)
      }else{
        console.warn('ignored the data graph was not subscribed for')
      }
    }
  }else if(message.call == 'subsciption_set'&&typeof message.data != 'undefined'){
    if(graph.subscribedTo.r != message.data.address.r){
      if(graph.subscribedTo.r != 'none'){
        //unsubscibe from previes one
        console.log(`Remowing subscription from w${graph.subscribedTo.w} r${graph.subscribedTo.r}`);
        ipcRenderer.invoke('graphChannel',{call:'subsciption_remove',winId:graph.subscribedTo.w,rowUid:graph.subscribedTo.r})
      }
      graph.set('subscribedTo',message.data.address)
      ipcRenderer.invoke('graphChannel',{call:'data_request',winId:graph.subscribedTo.w,rowUid:graph.subscribedTo.r})
    }else{
      console.debug('Subscribtion is already exist')
    }
  }else{
    console.debug('messge.data was not resived');
  }
})
const getPath = ({dataArray,start,range})=>{
  let _ret = '';
  let _canvasWidth = 100;
  let _canvasHeight = 50;
  let _heightMargin = 3;
  let _widthMargin = _heightMargin;
  let laterEnd = dataArray[dataArray.length-1].time - start;
  let earlierEnd = laterEnd - range;
  // console.log(new Date(earlierEnd),'-',new Date(laterEnd));
  let dataTrimmed = dataArray.filter(dot=>{
    return dot.time <= laterEnd && dot.time >= earlierEnd
  })
  //koof
  // if l=0|l=1 koof = 100
  // if l>1 find time diff > devide width by one milisecond
  let widthKoof = (100-(_widthMargin*2));
  if(dataTrimmed.length>1){
    //if there is more then two minutes of histiry show like there is two minutes
    if(dataTrimmed[dataTrimmed.length-1].time - dataTrimmed[0].time > 1000*60*2){
       widthKoof = (_canvasWidth -(_widthMargin*2)) / (dataTrimmed[dataTrimmed.length-1].time - dataTrimmed[0].time)
    }else{
      widthKoof = (_canvasWidth -(_widthMargin*2)) / (1000*60*2)
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
  // console.log(_ret);
  return _ret;
}

const getImage = ({dataArray,start,range})=>{
   let _ret = {
     grid:'',
     text:[],
     paths:[],
     dotts:[]
   };
   let _canvasWidth = 100;
   let _canvasHeight = 50;
   let _heightMargin = 3;
   let _widthMargin = _heightMargin;
   if(typeof dataArray[dataArray.length-1] == 'undefined'){
     console.log(dataArray)
   }
   let laterEnd = dataArray[dataArray.length-1].time - start;
   let earlierEnd = laterEnd - range;
   let dataTrimmed = dataArray.filter(dot=>{
     return dot.time <= laterEnd && dot.time >= earlierEnd
   })

   let _map = (val,start1,stop1,start2,stop2)=>{
     let __a = (val-start1)/(stop1-start1)*(stop2-start2)+start2;
     return start2 < stop2 ? Math.round(Math.max(Math.min(__a, stop2), start2)*100)/100 : Math.round(Math.max(Math.min(__a, start2), stop2)*100)/100;
   }
   let getBorders = ()=>{
     __ret = [];
     __ret.push(`M${_widthMargin} ${_heightMargin}`)
     __ret.push(`L${_widthMargin} ${_canvasHeight - _heightMargin}`)
     __ret.push(`L${_canvasWidth - _widthMargin} ${_canvasHeight - _heightMargin}`)
     __ret.push(`L${_canvasWidth - _widthMargin} ${_heightMargin}`)
     __ret.push(`L${_widthMargin} ${_heightMargin}`)
     return __ret.join('')
   }
   let getVerticalLines = ()=>{
     let __ret = {
       path:[],
       text:[]
     };
     let step = 1;
     let _showMax = Math.max(...dataTrimmed.map(dott=>{return dott.time}))
     let _showMin = Math.min(...dataTrimmed.map(dott=>{return dott.time}))
     let _showRange = _showMax - _showMin;

     let min = 1000*60;
     let hr = min*60;
     _showRange > 6*hr   ?step = hr:0;
     _showRange <= 6*hr  ?step = 30*min:0;
     _showRange < 2*hr   ?step = 10*min:0;
     _showRange < hr     ?step = 5*min:0;
     _showRange < 30*min ?step = 2*min:0;
     _showRange < 10*min ?step = min:0;
     _showRange < 2*min  ?step = 0.1*min:0;

     let roundupFirstStep = step;//defference in ms
     if(start>0){
        roundupFirstStep = Math.ceil(start/step)*step - start;
        roundupFirstStep==0?roundupFirstStep=step:0;
     }
     let vLines = []
     for(let i=0;(i*step)<_showRange+step;i++){
       let _absTime = -((i*step)+step+(Math.floor(start/step)*step))
       // this.isAltPressed
       let __ax = _absTime;
       vLines.push({
         ax:__ax,
         rx:roundupFirstStep+(i*step)
       })
     }
     for(let i=0;i<vLines.length-1;i++){
       __x = _map(vLines[i].rx,0,_showRange,_canvasWidth-_widthMargin,_widthMargin)
       __ret.path.push(`M${__x} ${_heightMargin}`)
       __ret.path.push(`L${__x} ${_canvasHeight - _heightMargin}`)
       let __val = vLines[i].ax<-_showRange-start?-_showRange-start:vLines[i].ax;
       __ret.text.push({
         x:__x,
         y:_canvasHeight-1,
         value:Math.round( (__val/1000/60) *10)/10+'m'
       })
     }
     return __ret
   }
   let getHorizontalLines = ()=>{
     let __ret = {
       path:[],
       text:[],
     };
     let showMax = 10;
     let step = 1;
     let dataMax = Math.max(...dataTrimmed.map(dott=>{return dott.pingDellay}))
     if(dataMax>10){
       showMax = 20;
       while(showMax<dataMax){
         (showMax+'').indexOf('5')==-1?showMax*=2.5:showMax*=2;
       }
       step = showMax/5;
     }
     for(i=0;i<showMax/step;i++){
       let __y = _map(i*step,0,dataMax,_canvasHeight-_heightMargin,_heightMargin)
       let __value = i*step>dataMax?dataMax:i*step;
       __ret.path.push(`M${_widthMargin} ${__y}`)
       __ret.path.push(`L${_canvasWidth - _widthMargin} ${__y}`)
       __ret.text.push({
         x:1,
         y:__y,
         value:__value
       })
     }
     return __ret
   }
   let getGroups = ()=>{
     let __ret = {
       dotts:[],
       paths:[]
     }
     let _status = ''
     let _pingTTL = ''
     let _groupIndex = -1;
     let _showMax = Math.max(...dataTrimmed.map(dott=>{return dott.time}))
     let _showMin = Math.min(...dataTrimmed.map(dott=>{return dott.time}))
     let _dellayMax = Math.max(...dataTrimmed.map(dott=>{return dott.pingDellay}))
     let _showRange = _showMax - _showMin;
     dataTrimmed.forEach(dott=>{
      if(_status !== dott.status || _pingTTL !== dott.pingTTL){
        //adding new group
        _groupIndex++
        _status = dott.status
        _pingTTL = dott.pingTTL
        __ret.paths[_groupIndex] = {
          status:_status,
          pingTTL:_pingTTL,
          dotts:[]
        }
      }else{
      }
      //adding to existing group
      __ret.paths[_groupIndex].dotts.push({
        x:_map(dott.time,_showMax,_showMin,_canvasWidth-_widthMargin,_widthMargin),
        y:_map(dott.pingDellay,0,_dellayMax,_canvasHeight-_heightMargin,_heightMargin)
      })


     })
     return __ret
   }
   let _retVLines = getVerticalLines()
   let _retHLines = getHorizontalLines()
   let _retGroups = getGroups()
   _ret.grid += getBorders()
   _ret.grid += _retVLines.path.join('')
   _ret.grid += _retHLines.path.join('')
   _ret.text = [..._ret.text,..._retHLines.text,..._retVLines.text]
   let _paths = []
   let _px=-1
   let _py=-1
   _ret.paths = _retGroups.paths.map((group,j)=>{
     let _path = ''
     group.dotts.forEach((d,i)=>{
       if(isNaN(d.x)){
         console.log(group,d);
       }
       // _path += i==0?j==0?`M${d.x} ${d.y}`:`M${d.x} ${d.y}`:`L${d.x} ${d.y}`;
       // _path += i==0?`M${d.x} ${d.y}`:`L${d.x} ${d.y}`;
       if(_px!=-1&&_py!=-1){
         _path += i==0?`M${_px} ${_py}`:`L${d.x} ${d.y}`;
         _ret.dotts.push({
           x:d.x,
           y:d.y
         })
       }else{
         _path += i==0?`M${d.x} ${d.y}`:`L${d.x} ${d.y}`;
       }

       if(i==group.dotts.length-1){
         _ret.dotts.push({
           x:d.x,
           y:d.y
         })
         _px=d.x
         _py=d.y
       }
     });
     return {path:_path,status:group.status,pingTTL:group.pingTTL}
   })


   return _ret;
 }
var graph = new Graph();
graph.construct({
 w:100,
 h:50,
 selector:'.graph-canvas'
})
graph.create();
