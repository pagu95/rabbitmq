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
      console.log("after bindQueue");
      channel.prefetch(1);
      channel.consume('originalq',function (msg){

      console.log("[x] sould have received array from original:",msg.content.toString( ));
      },{
        noAck:true
      });
  //  });
  });//createChannel

  connection.createChannel(function(error1, channel2) {
    if (error1) {
      throw error1;
    }

        var msg = 'this is a test for grouped array';
    channel2.assertExchange('groupedex','direct', {
      durable: false
    });
    channel2.assertQueue('groupedq', {
      exclusive: false
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }

    //channel.prefetch(1);
    channel2.bindQueue('groupedq','groupedex','second');

    channel2.publish('groupedex','second',Buffer.from(msg));
    console.log("[x] Sending my array:\n\n",msg)

    setTimeout(function() {

            connection.close();
            process.exit(0)
          }, 500);
        });
  });//createChannel

});
