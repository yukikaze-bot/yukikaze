export type QueryType = 'method' | 'class' | 'event' | 'classMethod' | 'module';

export const findRec = (o: any, name: string, type: QueryType, module?: string): any => {
	name = name.toLowerCase();

	if (!module) module = o?.type === 'module' ? o?.name.toLowerCase() : undefined;
	if (o?.name?.toLowerCase() === name.toLowerCase() && o?.type === type) {
		o.module = module;

		return o;
	}

	for (const prop of Object.keys(o)) {
		if (Array.isArray(o[prop])) {
			for (const entry of o[prop]) {
				const res = findRec(entry, name, type, module);

				if (res) {
					o.module = module;

					return res;
				}
			}
		}
	}
};
