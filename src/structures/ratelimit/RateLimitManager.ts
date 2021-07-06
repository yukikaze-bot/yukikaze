import { TimerManager } from '@sapphire/time-utilities';
import { Collection } from 'discord.js';
import { RateLimit } from './RateLimit';

export class RateLimitManager<K = string> extends Collection<K, RateLimit<K>> {
	public time: number;
	public limit: number;

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#sweepInterval!: NodeJS.Timer | null;

	public constructor(time: number, limit = 1) {
		super();

		this.time = time;
		this.limit = limit;
	}

	public acquire(id: K): RateLimit<K> {
		return this.get(id) || this.create(id);
	}

	public create(id: K): RateLimit<K> {
		const ratelimit = new RateLimit(this);

		this.set(id, ratelimit);
		return ratelimit;
	}

	public set(id: K, ratelimit: RateLimit<K>): this {
		if (!(ratelimit instanceof RateLimit)) throw new Error('Invalid RateLimit.');
		if (!this.#sweepInterval) this.#sweepInterval = TimerManager.setInterval(this.sweep.bind(this), 30000);

		return super.set(id, ratelimit);
	}

	public sweep(fn: (value: RateLimit<K>, key: K, collection: this) => boolean = (rl): boolean => rl.expired, thisArg?: any): number {
		const amount = super.sweep(fn, thisArg);

		if (this.size === 0) {
			TimerManager.clearInterval(this.#sweepInterval!);

			this.#sweepInterval = null;
		}

		return amount;
	}
}
