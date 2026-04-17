type EndpointResult<T> = PromiseSettledResult<T | null>;

export type EndpointLifecycle<T> = {
	enabled: boolean;
	result: EndpointResult<T>;
	setValue: (value: T) => void;
	setError: (message: string | null) => void;
	errorFallback: string;
};
