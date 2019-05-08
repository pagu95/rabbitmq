var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

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
	var queue = 'rpc_queue';

    channel.assertQueue(queue, {
      durable: false
    });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(queue, function reply(msg) {
      var n = 0;  

      console.log(" [.]i got -> (%d)", parseInt(msg.content.toString()));
	var r = 0;
	    if( parseInt(msg.content.toString()) == 1){

		r = myarray;
	 	r = JSON.stringify(myarray);
	    }else {console.log("different code")}

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(r), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
