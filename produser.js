var amqp = require('amqplib/callback_api');
var fs = require('fs');
var myarray = [];

myarray.push({
    "id": 1,
    "color": "blue",
    "model_name": "ford",
    "year": 2016
},{
    "id": 2,
    "color": "red",
    "model_name": "Fiat",
    "year": 2016
}, {
    "id": 3,
    "color": "blue",
    "model_name": "Maruti",
    "year": 2016
}, {
    "id": 4,
    "color": "red",
    "model_name": "Fiat",
    "year": 2016
}, {
    "id": 5,
    "color": "red",
    "model_name": "tata",
    "year": 2016
});

myarray = JSON.stringify(myarray);
var test = '';

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      var msg = ('this is a test for original array');

      channel.assertExchange('originalex','direct', {
        durable: false
      });

      channel.assertQueue('originalq', {
        exclusive: false
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }

      //channel.prefetch(1);
      channel.bindQueue('originalq','originalex','first');

      channel.publish('originalex','first',Buffer.from (msg));
      console.log("[x] Sending my array:\n\n",msg)

          });
        });//createChannel

          connection.createChannel(function(error1, channel2) {
            if (error1) {
              throw error1;
            }
            channel2.assertExchange('sortedex2','direct', {
              durable: false
            });

    channel2.assertQueue('sortedq', {
      exclusive: false
    }, function(error2, q) {
        if (error2) {
          throw error2;
        }
        console.log('waiting sorted')
        channel2.bindQueue('sortedq','sortedex2','third');
        //console.log("inside bindQueue");
        channel2.prefetch(1);
        channel2.consume('sortedq',function (msg){

        console.log("[x] sould have received array from sorted",msg);
        test = msg;
      },{
        noAck:true
      });
      /*if(test.length > 0){setTimeout(function() {

              connection.close();
              process.exit(0)
            }, 500);}*/
    });
  });//createChannel

});//createConnection
