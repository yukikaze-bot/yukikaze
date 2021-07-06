import type { RateLimitManager } from './RateLimitManager';

export class RateLimit<K> {
	public remaining!: number;
	public expires!: number;
	private readonly manager: RateLimitManager<K>;

	public constructor(manager: RateLimitManager<K>) {
		this.manager = manager;

		this.reset();
	}

	public get expired(): boolean {
		return this.remainingTime === 0;
	}

	public get limited(): boolean {
		return !(this.remaining > 0 || this.expired);
	}

	public get remainingTime(): number {
		return Math.max(this.expires - Date.now(), 0);
	}

	public consume(): this {
		if (this.limited) throw new Error('Ratelimited');
		if (this.expired) this.reset();

		this.remaining--;
		return this;
	}

	public reset(): this {
		return this.resetRemaining().resetTime();
	}

	public resetRemaining(): this {
		this.remaining = this.manager.limit;

		return this;
	}

	public resetTime(): this {
		this.expires = Date.now() + this.manager.time;

		return this;
	}
}
