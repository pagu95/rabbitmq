var amqp = require('amqplib/callback_api');
var fs = require('fs');


amqp.connect('amqp://localhost', function(error0, connection) {
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
      console.log("after bindQueue");
      channel.prefetch(1);
      channel.consume('groupedq',function (ms){

      console.log("[x] sould have received array from grouped:",ms.content.toString( ));
      },{
        noAck:true
      });
  //  });
  });//createChannel

  connection.createChannel(function(error1, channel2) {
    if (error1) {
      throw error1;
    }

        var msg = 'this is a test for sorted array';
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
    console.log("[x] Sending my array:\n\n",msg)

    setTimeout(function() {

            connection.close();
            process.exit(0)
          }, 500);
        });
  });//createChannel

});
