var amqp = require('amqplib/callback_api');
var fs = require('fs');
var jarray= [];
var myarray= [];

function SortBy(attr){
	return function(a,b){
		if( a[attr] > b[attr]){
			return 1;
		}else{
			return -1;
		}
		return 0
	}
}

function modifyJ(msg){


	var jarray = JSON.parse(msg.content.toString());
  jarray = jarray.sort(SortBy('year'));
  jarray = JSON.stringify(jarray);
	return jarray
}

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
      channel.prefetch(1);
      channel.consume('groupedq',function (ms){

      console.log("[x] sould have received array from grouped:",ms.content.toString( ));

      myarray =modifyJ(ms);
      console.log("[x] now you see the modified array",myarray);
      fs.writeFile('sortedArray.json',ms.content.toString(),'utf-8');

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
    console.log("[x] Sending my array:\n\n",msg)

    setTimeout(function() {

            connection.close();
            process.exit(0)
          }, 500);
        });
  });//createChannel
},3000);
});
