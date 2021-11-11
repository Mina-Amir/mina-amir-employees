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
