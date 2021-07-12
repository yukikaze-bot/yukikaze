import type { Awaited } from '@sapphire/utilities';
import { TypedEmitter } from 'tiny-typed-emitter';
import { RequestTypes } from '@utils/Constants';
import { Collection } from 'discord.js';
import Redis from 'ioredis';

interface Events {
	timeout: (id: string) => Awaited<void>;
	error: (err: any) => Awaited<void>;
}

interface Options {
	type: RequestTypes;
	timeout: number;
}

export class Timers extends TypedEmitter<Events> {
	private readonly requests = new Collection<string, Options>();
	private readonly startChannel = 'timers#start';
	private readonly stopChannel = 'timers#stop';
	private readonly expiredChannel = '__keyevent@0__:expired';
	private readonly pub: Redis.Redis;
	private readonly sub: Redis.Redis;

	public constructor(url: string) {
		super();

		const onError = (err?: any) => {
			if (err) this.emit('error', err);
		};

		this.pub = new Redis(url);
		this.sub = new Redis(url);

		this.pub.on('ready', this._pubReady.bind(this));
		this.sub.subscribe([this.startChannel, this.stopChannel], onError);
		this.sub.subscribe(this.expiredChannel, onError);
		this.sub.on('message', this._handleMessage.bind(this));
		this.pub.on('error', onError);
		this.sub.on('error', onError);
	}

	public async start(id: string, timeout: number) {
		this.requests.set(id, {
			type: RequestTypes.START_TIMER,
			timeout
		});

		await this.pub.setex(`timers#${id}`, timeout, 1);
	}

	public async stop(id: string) {
		if (this.requests.has(id)) this.requests.delete(id);
		else this.pub.publish(this.stopChannel, id);

		await this.pub.del(`timers#${id}`);
	}

	public async remaining(id: string) {
		const ttl = await this.pub.ttl(`timers#${id}`);

		if (ttl === -2) return null;

		return ttl;
	}

	private _pubReady() {
		this.pub.config('SET', 'notify-keyspace-events', 'Ex');
	}

	private _handleExpire(msg: string) {
		const keyArr = msg.split('timers#');

		if (keyArr.length > 1 && this.requests.has(keyArr[1])) {
			this.requests.delete(keyArr[1]);
			this.emit('timeout', keyArr[1]);
		}
	}

	private _handleStop(id: string) {
		if (this.requests.has(id)) this.requests.delete(id);
	}

	private _handleMessage(channel: string, msg: string) {
		switch (channel) {
			case this.expiredChannel:
				this._handleExpire(msg);
				break;
			case this.stopChannel:
				this._handleStop(msg);
				break;
		}
	}
}
