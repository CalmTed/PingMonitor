
var data = {}
data.rows = []
data.pics = {
  'server':'assets/server.svg'
}
data.statusColors = []

class Row {
  constructor(type,name,picture,pingIP,pingTime){
    this.id = 123;
    this.type = type;
    this.name = name;
    this.status = 'offline';
    this.picture = picture;

    this.pingIP = pingIP;
    this.pingTime = pingTime;

    this.packetsSent = 0;
    this.packetsResived = 0;
    this.packetsLost = 0;

    this.lastConnectionLost = 0;
    this.lastConnectionFound = 0;
    this.lastOuntOfConnenction = 0;
    this.totalOutOfConnection = 0;

    this.isDisabled = false;
    this.isPaused = false;
    this.pingTimeStrategy = {

    }
  }
  create(){

  }
  render(){

  }
  remove(){

  }
}


let newRow = new Row('server','google','server',' 172.217.193.102','20')
data.rows.push(newRow)


createPage = function(){
  var root = $('.root')
  let monitorTable = $('<div class="table"></div>')
  data.rows.forEach(
    (row) => {
      let rowTag = $(`<div class="row" rowId="${row.id}"></div>`);//${data.pics[row.picture]}
      $(rowTag).append($(`<div class="row-column"> <div class="row-picture" alt="${row.type}" style="background-image:"><svg preserveAspectRatio viewBox="0 0 10 10" stroke="red" fill="grey"  src="${data.pics[row.picture]}"></svg></div><div class="row-name">${row.name}</div></div>`));
      $(rowTag).append($(`<div class="row-column"> <div class="row-status"><span class="row-status-span">${translate(row.status)}</span></div> </div>`));
      $(rowTag).append($(`<div class="row-column"> <div class="row-ping">${translate(row.pingTime)}</div></div>`));

      $(monitorTable).append(rowTag);
  })

  root.append(monitorTable)
}
$(document).ready(function(){
  createPage();
});

translate = function(a){
  return a;
}
