
export type Column<T> = {
	key: keyof T | string;
	header: string;
	render?: (item: T) => React.ReactNode;
	sortable?: boolean;
};