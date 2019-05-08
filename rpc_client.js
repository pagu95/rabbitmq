var amqp = require('amqplib/callback_api');

//var args = process.argv.slice(2);
/*
        if(myarray.length != 0){
                console.log("myarray is not 0");
            channel.sendToQueue('rpc_queue',
        Buffer.from(myarray),{
          correlationId: correlationId,
          replyTo: q.queue
        });
        }else{console.log ("myarray is indeed 0")}
    */


function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

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
      var entry = {items: []};
      entry[key] = array[i][key];
      entry.items.push(array[i]);
      result.push(entry);
    }
  }
  return result;
}
var myarray = [];
var num = 1;

/*
if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}*/
/*if(myarray.length != 0){
                console.log("myarray is not 0");
            channel.sendToQueue('rpc_queue',
        Buffer.from(myarray),{
          correlationId: correlationId,
          replyTo: q.queue
        });
        }else{console.log ("myarray is indeed 0")}
*/

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      var correlationId = generateUuid();
	    
	    
      console.log(' [x] Requesting json array code(%d)', num);

      channel.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == correlationId) {
          console.log(' [.] Got %s\n', msg.content.toString());
          	
		myarray = modifyJ(msg);
		console.log("[.] Table modified to:",myarray)

	    setTimeout(function() { 
            connection.close(); 
            process.exit(0) 
          }, 500);
        }
      }, {
        noAck: true
      });
	console.log("\n\n[.] Table:",myarray)

      channel.sendToQueue('rpc_queue',
        Buffer.from(num.toString()),{ 
          correlationId: correlationId, 
          replyTo: q.queue 
	});
    });
  });
});
