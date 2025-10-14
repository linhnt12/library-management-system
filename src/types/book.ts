export type Book = {
	id: string;
	title: string;
	bookCode: string;
	coverImage: string;
	author: {
		name: string;
		avatar: string;
	};
	publisher: {
		name: string;
		year: string;
	};
	status: 'Available' | 'Borrowed' | 'Damaged' | 'Lost';
	copies: {
		available: number;
		total: number;
	};
	resourceLink: string;
};