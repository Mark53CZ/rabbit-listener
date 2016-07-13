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

		const chatterOptions = { 
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

		const listenOptions = { 
			appId: testAppId1,
			protocol: 'amqp',
			username: 'guest',
			password: 'guest',
			host: 'localhost',
			port: 5672,
			host: 'localhost',
			exchangeName: 'TEST',
			exchangeType: 'topic',
			durable: false
		}

		
		const rabbit1 = rabbitChatter.rabbit(chatterOptions);
		const rabbit2 = rabbitListener.rabbit(listenOptions);
		const cb = () => { };

		let callbackOnCloseSpy;

		before(function () { 
			callbackOnCloseSpy = sinon.spy(cb);
		});
		after(function () { 
			//callbackOnCloseSpy.restore();
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
				        	
				        	expect(callbackOnCloseSpy.called).to.be.true;

				        	done();
							resolve();
				        }, 1000);
					},
					callbackOnCloseSpy
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
				for(let i = 0; i < numberOfMessagesToSend; i++){
					rabbit1.chat("TESTING");
				}
			}, 500);

			return new Promise((resolve, reject) => {
				rabbit2.listen((msg) => {

					msgCount++;

					clearTimeout(connectionCloseTimerId);

			        connectionCloseTimerId = setTimeout(() => { 
			        	expect(msgCount).to.equal(1000);
						expect(callbackOnCloseSpy.calledOnce).to.be.true;
			        	done();
						resolve();
			        }, 500);
				});
			})
			.catch((ex) => { throw ex; });
		});
	});
});

