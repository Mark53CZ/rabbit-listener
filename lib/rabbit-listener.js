'use strict'

const amqplib = require('amqplib');

class ErrorHelper {
    static defaultError(ex) {
        console.log('ERROR in rabbit-listener: ' + JSON.stringify(ex, null, 4));
    }
}

class RabbitListener {
    constructor(options) {

        if (!options)
            options = {};

        this.prefetch = options.prefetch || 0;
        this.handleError = options.handleError || ErrorHelper.defaultError;

        const protocol = options.protocol || 'amqp';
        const username = options.username || 'guest';
        const password = options.password || 'guest';
        const host = options.host || 'localhost';
        const virtualHost = options.virtualHost ? '/%2F' + options.virtualHost : '';
        const port = options.port || 5672;

        this.connectionTimeout = options.connectionTimeout || null;
        this.callbackOnClose = options.callbackOnClose || () => {};

        this.amqp = {};
        this.amqp.host = `${protocol}://${username}:${password}@${host}${virtualHost}:${port}`;

        this.amqp.exchangeType = options.exchangeType || 'topic';
        this.amqp.exchangeName = options.exchangeName || 'rabbit-chat';
        this.amqp.durable = options.durable || false;
        this.amqp.routingKey = options.routingKey || options.queueName || '';
        
        this._connection = null;
        this._connectionTimer = null;
    }

    static rabbit(options) {
        return new RabbitListener(options);
    }

    listen(callback) {
        let t = this;
        let connectionCloseTimerId;

        callback = callback || () => {};
        
        return t.getConnection()
            .then((channel) => {

                if(t.prefetch > 0) channel.prefetch(t.prefetch);
                
                return channel.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, { durable: t.amqp.durable })
                    .then((ok) => {
                        return channel.assertQueue(t.amqp.routingKey, { exclusive: true })
                            .then((q) => {

                                channel.bindQueue(q.queue, t.amqp.exchangeName, '');

                                return channel.consume(q.queue, (msg) => {

                                	callback(msg, t);
                                    channel.ack(msg);
                                    
                                    clearTimeout(connectionCloseTimerId);

                                    if(t.connectionTimeout != null){
                                        connectionCloseTimerId = setTimeout(() => {
                                            t.close(t);
                                       }, t.connectionTimeout);
                                    }  
                                });
                            })

                    });
            })
            .catch(t.handleError);
    }

    getConnection() {
        const t = this;
        if (t._connection) {
        	return new Promise((resolve, reject) => { resolve(t._connection.createChannel()); });
        } else {
            return amqplib
                .connect(t.amqp.host)
                .then((conn) => {
                	t._connection = conn;
                    return t._connection.createChannel();
                });
        }
    }

    close(t){
        t._connection.close();
        t._connection = null;
        t.callbackOnClose();
    }
}

module.exports = RabbitListener;
