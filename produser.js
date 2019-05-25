var amqp = require('amqplib/callback_api');
var fs = require('fs');
var myarray = [];


myarray.push({
    "id": 1,
    "color": "blue",
    "model_name": "Ford",
    "year": 2019
},{
    "id": 2,
    "color": "red",
    "model_name": "Fiat",
    "year": 2007
}, {
    "id": 3,
    "color": "blue",
    "model_name": "Maruti",
    "year": 2015
}, {
    "id": 4,
    "color": "green",
    "model_name": "Fiat",
    "year": 2019
}, {
    "id": 5,
    "color": "red",
    "model_name": "Ata",
    "year": 2013
},{
    "id": 7,
    "color": "green",
    "model_name": "Fiat",
    "year": 2020
},{
    "id": 8,
    "color": "red",
    "model_name": "Audi",
    "year": 2012
});

myarray = JSON.stringify(myarray);

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }


      channel.assertExchange('originalex','direct', {
        durable: false
      });

      channel.assertQueue('originalq', {
        exclusive: false
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }

      channel.bindQueue('originalq','originalex','first');

      channel.publish('originalex','first',Buffer.from (myarray));
      console.log("[x] Sending my array\n\n")



      channel.assertExchange('sortedex2','direct', {
        durable: false
      });

    /*  channel.assertQueue('groupedq',{
        exclusive: false
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }
      });*/

      channel.assertQueue('sortedq', {
        exclusive: false
      }, function(error2, q) {
          if (error2) {
            throw error2;
          }
          console.log('waiting sorted')
          channel.bindQueue('sortedq','sortedex2','third');
          channel.prefetch(1);
          channel.consume('sortedq',function (msg){

          console.log("[x] sould have received array from sorted:\n",msg.content.toString());
          fs.writeFile('finalarray.json',msg.content.toString(),'utf-8');
          },{
          noAck:true
        });
/*setTimeout(function() {

        connection.close();
        process.exit(0)
      }, 500);*/
});

          });
        });//createChannel

        /*  connection.createChannel(function(error1, channel2) {

  });//createChannel
*/
});//createConnection
