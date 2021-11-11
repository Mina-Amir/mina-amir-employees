// Helper function to transform data from string to object
function getArrayOfObjectsData(array) {
	let arrayOfData = [];
	for (let i = 0; i < array.length; i++) {
		let singleRowData = array[i];
		singleRowData = singleRowData.split(',');
		let rowDataObject = {
			empID: singleRowData[0],
			projectID: singleRowData[1],
			dateFrom: singleRowData[2],
			dateTo: singleRowData[3].toLowerCase() === 'null' ? moment().format('YYYY-MM-DD') : singleRowData[3],
		};
		arrayOfData.push(rowDataObject);
	}
	return arrayOfData;
}

// Receive the text file from user input
async function loadFile(e) {
	let file = e.target.files[0];
	if (file) {
		let text = await file.text();
		let rowsData = text.split('\r\n');
		let data = getArrayOfObjectsData(rowsData);
	}
}

// Attach an event listener to detect the file uploaded by the user
document.getElementById('users-file').addEventListener('change', loadFile);
