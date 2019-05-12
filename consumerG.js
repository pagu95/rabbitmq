var amqp = require('amqplib/callback_api');
var fs = require('fs');
var jarray= [];

function modifyJ(msg){


	var jarray = JSON.parse(msg.content.toString());
        jarray = groupBy('color',jarray);
        jarray = JSON.stringify(jarray);
	return jarray
}

function groupBy(key, array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var added = false;
    for (var j = 0; j < result.length; j++) {
      if (result[j][key] == array[i][key]) {
        result[j].items.push(array[i]);
        added = true;
        break;
      }
    }
    if (!added) {
      var entry = {items: [] };
      entry[key] = array[i][key];
      entry.items.push(array[i]);
      result.push(entry);
    }
  }
  return result;
}

var myarray = [];

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
    }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertExchange('originalex2','direct', {
      durable: false
    });


  /*  channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }*/

      channel.bindQueue('originalq','originalex2','first');
      channel.prefetch(1);
      channel.consume('originalq',function (msg){

      console.log("[x] sould have received array from original:",msg.content.toString( ));

      myarray = modifyJ(msg);
      console.log("[x] now you see the modified array",myarray);
      fs.writeFile('groupedArray.json',myarray,'utf-8');

      },{
        noAck:true
      });
  //  });
  });//createChannel


setTimeout(function(){
  connection.createChannel(function(error1, channel2) {
    if (error1) {
      throw error1;
    }
    var msg = fs.readFileSync('groupedArray.json','utf-8');
    channel2.assertExchange('groupedex','direct', {
      durable: false
    });
    channel2.assertQueue('groupedq', {
      exclusive: false
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }

    channel2.bindQueue('groupedq','groupedex','second');

    channel2.publish('groupedex','second',Buffer.from(msg));
    console.log("[x] Sending my array:\n\n",msg)

    setTimeout(function() {

            connection.close();
            process.exit(0)
          }, 500);
        });
  });//createChannel
},300);
});
