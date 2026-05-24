export const days_ago = (days: number) => {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
};