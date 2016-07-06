'use strict'

const amqplib = require('amqplib');
const util = require('util');

class ErrorHelper{
	static defaultError(ex){
		console.log('ERROR in rabbit-listener: ' + util.inspect(ex, { depth: null }));
	}
}

class RabbitListener{
	constructor(options){

		if(!options)
			options = {};

		this.handleError = options.handleError || ErrorHelper.defaultError;
		this.silent = options.silent || false;

		const protocol = options.protocol || 'amqp';
		const username = options.username || 'guest';
		const password = options.password || 'guest';
		const host = options.host || 'localhost';
		const virtualHost = options.virtualHost ? '/%2F' + options.virtualHost : '';
		const port = options.port || 5672;

		this.amqp = {};
		this.amqp.host = `${protocol}://${username}:${password}@${host}${virtualHost}:${port}`;
		
		this.amqp.exchangeType = options.exchangeType || 'topic';
		this.amqp.exchangeName = options.exchangeName || 'rabbit-chat';
		this.amqp.durable = options.durable || false;

		this._connection = null;
		this._connectionTimer = null;
	}

	static rabbit(options){
		return new RabbitChatter(options);
	}

	listen(msg, properties, callback, callbackOnClose){
		let t = this;

		properties = properties || {};
		properties.appId = properties.appId || t.appId;
		properties.correlationId = properties.correlationId || uuid.v4();
		properties.timestamp = properties.timestamp || Date.now();

		callback = callback || () => {};

		t.getConnection()
			.then((channel) => {
				return channel.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, {durable: t.amqp.durable})
					.then((ok) => {
						// let publish = channel.publish(t.amqp.exchangeName, '', new Buffer(msg), properties);

						if(!t.silent) console.log("Message received in rabbit-listener: %s", msg);
			    		callback(msg);
			    		return publish;
				  	});
			})
			.then(() => { 
				clearTimeout(t._connectionTimer);
				t._connectionTimer = setTimeout(() => { t._connection.close(); t._connection = null; }, 500); 
				callbackOnClose(); 
			})
			.catch(t.handleError);
	}

	getConnection(){
		const t = this;

		if(t._connection){
			return new Promise((resolve, reject) => { resolve(t._connection.createChannel()); });
		}
		else{
			return amqplib
				.connect(t.amqp.host)
				.then((conn) => { t._connection = conn; return t._connection.createChannel(); });
		}
	}
}

module.exports= RabbitChatter;