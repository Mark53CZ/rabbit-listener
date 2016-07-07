'use strict'

const amqplib = require('amqplib');
const util = require('util');

class ErrorHelper {
    static defaultError(ex) {
        console.log('ERROR in rabbit-listener: ' + util.inspect(ex, { depth: null }));
    }
}

class RabbitListener {
    constructor(options) {

        if (!options)
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

    static rabbit(options) {
        return new RabbitListener(options);
    }

    listen(callback, callbackOnClose) {
        let t = this;
        let connectionCloseTimerId;

        callback = callback || () => {};
        callbackOnClose = callbackOnClose || () => {};

        return t.getConnection()
            .then((channel) => {
                return channel.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, { durable: t.amqp.durable })
                    .then((ok) => {
                        return channel.assertQueue('', { exclusive: true })
                            .then((q) => {

                                channel.bindQueue(q.queue, t.amqp.exchangeName, '');

                                return channel.consume(q.queue, (msg) => {

                                	callback(msg);
                                    clearTimeout(connectionCloseTimerId);

                                    connectionCloseTimerId = setTimeout(() => {
                                        t._connection.close();
                                        t._connection = null;
                                        callbackOnClose();
                                    }, 500);

                                }, { noAck: true });
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
}

module.exports = RabbitListener;
