//Not quite unit tests as they depend on RabbitMq to be installed

//REQUIREMENTS:
//npm install in test-dir
//RabbitMq installed locally
//Mocha

'use strict'

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const amqplib = require('amqplib');
const util = require('util');
const rabbitChatter = require('rabbit-chatter');
const rabbitListener = require('../lib/rabbit-listener.js');

describe('RabbitMq connection', () => {
	describe('Test if messages are emittet to the exchange', function() {
		this.timeout(30000);

		const testAppId1 = 'TESTAPPIDALL';

		const options = { 
			appId: testAppId1,
			protocol: 'amqp',
			username: 'guest',
			password: 'guest',
			host: 'localhost',
			port: 5672,
			silent: true,
			host: 'localhost',
			exchangeName: 'TEST',
			exchangeType: 'topic',
			durable: false
		}

		
		const rabbit1 = rabbitChatter.rabbit(options);
		const rabbit2 = rabbitListener.rabbit(options);
		
		before(function () { 
		});
		after(function () { 
		});

		it('should return the correct message in the callback',  (done) => {
			let connection; 
			let connectionCloseTimerId;
			const testContent = 'TESTING 123';
			const testCorrelationId = 'CORRELATIONIDTEST';
			
			let msgCount = 0;

			setTimeout(() => { rabbit1.chat(testContent, { correlationId: testCorrelationId }); }, 50);

			return new Promise((resolve, reject) => {
				rabbit2.listen(
					(msg) => {
						msgCount++;

						clearTimeout(connectionCloseTimerId);

				        connectionCloseTimerId = setTimeout(() => { 
				        	expect(msg.content.toString()).to.equal(testContent);
							expect(msg.properties.appId).to.equal(testAppId1);
							expect(msg.properties.correlationId).to.equal(testCorrelationId);
				        	expect(msgCount).to.equal(1);
				        	
				        	//expect(callbackOnCloseSpy.calledOnce).to.be.true();
				        }, 500);
					},
					() => { 
						done();
						resolve();
					}
				);
			})
			.catch((ex) => { throw ex; });
		});


		it('should receive 1000 messages',  (done) => {
			const numberOfMessagesToSend = 1000;

			let connection; 
			let connectionCloseTimerId;
			const testContent = 'TESTING 123';
			const testCorrelationId = 'CORRELATIONIDTEST';
			
			let msgCount = 0;

			setTimeout(() => { 
				let i = 0;
				let tmpTimer;

				tmpTimer = setInterval(() => { 
					setTimeout(() => { rabbit1.chat("TESTING"); }, 50);
					i++; 
					if(i >= numberOfMessagesToSend) 
						clearInterval(tmpTimer);
				}, 1);

					
			}, 500);

			return new Promise((resolve, reject) => {
				rabbit2.listen((msg) => {

					msgCount++;

					clearTimeout(connectionCloseTimerId);

			        connectionCloseTimerId = setTimeout(() => { 
			        	expect(msgCount).to.equal(1000);

			        	done();
						resolve();
			        }, 500);
				});
			})
			.catch((ex) => { throw ex; });
		});
	});
});

