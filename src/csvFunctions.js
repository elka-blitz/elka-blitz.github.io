export const textDownload = (data, title) => {
	// Feed in stringified JSON data
	const blob = new Blob([data], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	var date = new Date();
	link.download = `title_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${date.getTime()}.txt`
	link.click();
};
