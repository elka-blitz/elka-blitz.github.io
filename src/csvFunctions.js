// export const csvMaker = (data) => {
// 	const rows = [];
// 	const headers = Object.keys(data);
// 	rows.push(headers.join(','));

// 	const values = Object.values(data).join(',');
// 	rows.push(values);

// 	return rows.join('\n');
// };

export const downloadCSV = (data) => {
	const blob = new Blob([data], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	var date = new Date();
	link.download = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${date.getTime()}.txt`
	link.click();
};