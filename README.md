# rabbit-listener

Listens for messages in RabbitMQ. 

* Fully compatible with [rabbit-chatter](https://www.npmjs.com/package/rabbit-chatter)
* Easy to use and fast to implement
* Stable
* Very few dependencies
* Build upon [amqplib](https://www.npmjs.com/package/amqplib)

# Usage

Use [npm](https://www.npmjs.com/) to install the module:

```
	npm install rabbit-listener
```

Then use `require()` to load it in your code:

```javascript
	var rabbitListener = require('rabbit-listener');
```

Initialize a new instance:

```javascript
	var rabbit = rabbitListener.rabbit(options);
```

And then you can start listening for messages:

```javascript
	rabbit.listen(function(msg){
		console.log('Message received: ' + msg.content.toString());		
	});
```

You will need to have RabbitMQ up and running for this to work.

Rabbit.listen takes a callback as parameter and that callback will retrieve the message object as parameter.
I've printet the msg object from the tests and it looks like this:

```json
{
    "fields": {
        "consumerTag": "amq.ctag-Y85cFepeqYK75qtz0iDrbg",
        "deliveryTag": 1,
        "redelivered": false,
        "exchange": "TEST",
        "routingKey": ""
    },
    "properties": {
        "headers": {},
        "correlationId": "CORRELATIONIDTEST",
        "timestamp": 1468420458017,
        "appId": "TESTAPPIDALL"
    },
    "content": {
        "type": "Buffer",
        "data": [
            84,
            69,
            83,
            84,
            73,
            78,
            71,
            32,
            49,
            50,
            51
        ]
    }
}
```

To read the content-property, just call .toString as in the example.

## Options

You can of course provide options for setting up amqplib in rabbit-listener.

### protocol

String

Default: 'amqp'

The protocol used to communicate with RabbitMQ (or perhaps another message queue?).


### host

String

Default: 'localhost'

The URI of the server that hosts the RabbitMQ.


### virtualHost

String

Default: ''

Used if RabbitMQ is configured with a virtual host.


### port

Number

Default: 5672

The port that is open for connections to RabbitMQ.

### username

String

Default: 'guest'

Use this if credentials is required.


### password

String

Default: 'guest'

Use this if credentials is required.


### exchangeType

String

Default: 'topic'

The topic for the exchange.


### exchangeName

String

Default: 'rabbit-chat'

The name of the exchange.

### connectionTimeout

Number or null

Default: null

Set the number of miliseconds before the connections closes automatically. Send null in order to keep connection open.

### callbackOnClose

Function

Default: An empty function

Specify a function that should be called when the connection is closed

# Tests

To run tests on this module, make sure that the modules for the tests are installed

```
	npm install rabbit-listener --dev
```

Then run:

```
	npm test
```

NOTICE: The test is not unit test but tests the functionality for submitting to RabbitMQ. So RabbitMQ is required to be installed locally in order to run the tests.

#Release notes

* 1.0.0 - First working version


#Futher reading

Further documentation the topics according to this module:

* [RabbitMQ](https://www.rabbitmq.com/documentation.html) [Tutorial](https://www.rabbitmq.com/getstarted.html)
* [amqplib](https://www.npmjs.com/package/amqplib)

#Keywords

* rabbitmq
* listener
* amqp
* amqplib
* message queue
* service bus

# License

The MIT License (MIT)

Copyright (c) 2016 Thorbjørn Gliese Jelgren (The Right Foot, www.therightfoot.dk)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

