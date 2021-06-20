export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };
export type CustomFunctionGet<K extends string, TArgs, TReturn> = K & { __args__: TArgs; __return__: TReturn };

export const T = <TCustom = string>(k: string): CustomGet<string, TCustom> => k as CustomGet<string, TCustom>;
export const FT = <TArgs, TReturn = string>(k: string): CustomFunctionGet<string, TArgs, TReturn> => k as CustomFunctionGet<string, TArgs, TReturn>;
