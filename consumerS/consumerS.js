var amqp = require('amqplib/callback_api');
var fs = require('fs');
var jarray= [];
var myarray= [];

function modifyJ(msg){


    var jarray = JSON.parse(msg.content.toString());
    jarray.forEach(function (arr) {
		arr.items.sort((a, b) => (a.year > b.year) ? 1 : -1)
	});
  jarray = JSON.stringify(jarray);
    return jarray
}
amqp.connect('amqp://visitor:visitor@192.168.1.4/', function(error0, connection) {
  if (error0) {
    throw error0;
    }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertExchange('groupedex2','direct', {
      durable: false
    });


  /*  channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }*/

      channel.bindQueue('groupedq','groupedex2','first');
      channel.prefetch(1);
      channel.consume('groupedq',function (ms){

      console.log("[x] sould have received array from grouped:\n",ms.content.toString( ));

      myarray =modifyJ(ms);
      console.log("[x] now you see the modified array",myarray);
      fs.writeFile('sortedArray.json',myarray,'utf-8');

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
    var msg = fs.readFileSync('sortedArray.json','utf-8');
    channel2.assertExchange('sortedex','direct', {
      durable: false
    });
    channel2.assertQueue('sortedq', {
      exclusive: false
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }

    //channel.prefetch(1);
    channel2.bindQueue('sortedq','sortedex','third');

    channel2.publish('sortedex','third',Buffer.from(msg));
    console.log("\n\n[x] Sending my array")

    setTimeout(function() {

            connection.close();
            process.exit(0)
          }, 500);
        });
  });//createChannel
},3000);
});
