export const textDownload = (data, title) => {
	// Feed in stringified JSON data
	const blob = new Blob([data], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	let date = new Date();
	let human_readable_time = date.toISOString()
	link.download = `${title}_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${human_readable_time}.txt`
	link.click();
};
