var port = 5671;
var user = 'guest';
var pass = 'guest';

switch (arguments[0]) {

case 'create_exchange':
	if (arguments.length < 4) {
		print('create_exchange arguments: server, exchange, type, optional vhost.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	type = arguments[3];
	vhost = (arguments.length > 4) ? arguments[4] : '/';
	connect(); create_ex(); close();
	break;

case 'delete_exchange':
	if (arguments.length < 3) {
		print('delete_exchange arguments: server, exchange, optional vhost.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	vhost = (arguments.length > 3) ? arguments[3] : '/';
	connect(); delete_ex(); close();
	break;

case 'create_queue':
	if (arguments.length < 4) {
		print('create_queue arguments: server, exchange, queue, optional routing_key, optional vhost.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	queue = arguments[3];
	key = (arguments.length > 4) ? arguments[4] : null;
	vhost = (arguments.length > 5) ? arguments[5] : '/';
	connect(); create_q(); close();
	break;

case 'delete_queue':
	if (arguments.length < 3) {
		print('delete_queue arguments: server, queue, optional vhost.');
		quit();
	}
	server = arguments[1];
	queue = arguments[2];
	vhost = (arguments.length > 3) ? arguments[3] : '/';
	connect(); delete_q(); close();
	break;

case 'delete_queues':
	if (arguments.length < 2) {
		print('delete_queues arguments: server, optional vhost.');
		print('delete_queues takes lines of queue names as standard input.');
		quit();
	}
	server = arguments[1];
	vhost = (arguments.length > 2) ? arguments[2] : '/';
	connect(); delete_qs(); close();
	break;

case 'create_bind':
	if (arguments.length < 5) {
		print('create_bind arguments: server, exchange, queue, routing_key, optional vhost.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	queue = arguments[3];
	key = arguments[4];
	vhost = (arguments.length > 5) ? arguments[5] : '/';
	connect(); create_bind(); close();
	break;

case 'delete_bind':
	if (arguments.length < 5) {
		print('delete_bind arguments: server, exchange, queue, routing_key, optional vhost.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	queue = arguments[3];
	key = arguments[4];
	vhost = (arguments.length > 5) ? arguments[5] : '/';
	connect(); delete_bind(); close();
	break;

case 'inject_msg':
	if (arguments.length < 5) {
		print('inject_msg arguments: server, exchange, msg_key, msg_data, optional vhost.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	msg_key = arguments[3];
	msg_data = arguments[4];
	vhost = (arguments.length > 5) ? arguments[5] : '/';
	connect(); inject_msg(); close();
	break;

case 'inject_msgs':
	if (arguments.length < 4) {
		print('inject_msgs arguments: server, exchange, msg_key, optional vhost.');
		print('inject_msgs takes lines of message data as standard input.');
		quit();
	}
	server = arguments[1];
	exchange = arguments[2];
	msg_key = arguments[3];
	vhost = (arguments.length > 4) ? arguments[4] : '/';
	connect(); inject_msgs(); close();
	break;

case 'remove_msg':
	if (arguments.length < 3) {
		print('remove_msg arguments: server, queue, optional vhost.');
		quit();
	}
	server = arguments[1];
	queue = arguments[2];
	vhost = (arguments.length > 3) ? arguments[3] : '/';
	connect(); remove_msg(); close();
	break;

default:
	print('Commands: create_exchange, delete_exchange,');
	print('          create_queue, delete_queue, delete_queues,');
	print('          create_bind, delete_bind,');
	print('          inject_msg, inject_msgs,');
	print('          remove_msg.');
	quit();
}

function connect() {
	var f = new com.rabbitmq.client.ConnectionFactory();
	f.setHost(server);
	f.setPort(port);
	f.setUsername(user);
	f.setPassword(pass);
	f.setVirtualHost(vhost);

	conn = f.newConnection();
	chan = conn.createChannel();
}

function create_ex() {
	chan.exchangeDeclare(exchange, type, true);
}

function delete_ex() {
	chan.exchangeDelete(exchange);
}

function create_q() {
	chan.queueDeclare(queue, true, false, false, null);
	if (key) chan.queueBind(queue, exchange, key);
}

function delete_q() {
	chan.queueDelete(queue);
}

function delete_qs() {
	var input = new java.io.BufferedReader(new java.io.InputStreamReader(
	                                           java.lang.System['in']));
	while ((q = input.readLine()) != null) chan.queueDelete(q);
}

function create_bind() {
	chan.queueBind(queue, exchange, key);
}

function delete_bind() {
	chan.queueUnbind(queue, exchange, key);
}

function inject_msg() {
	chan.basicPublish(exchange, msg_key, null,
	                  (new java.lang.String(msg_data)).getBytes());
}

function inject_msgs() {
	var input = new java.io.BufferedReader(new java.io.InputStreamReader(
	                                           java.lang.System['in']));
	while ((msg_data = input.readLine()) != null)
		chan.basicPublish(exchange, msg_key, null, msg_data.getBytes());
}

function remove_msg() {
	var res = chan.basicGet(queue, true);
	for (header in Iterator(res.getProps().getHeaders().entrySet()))
		print(header.getKey() + ": " + header.getValue());
	print(java.lang.String(res.getBody()));
}

function close() {
	chan.close();
	conn.close();
}
