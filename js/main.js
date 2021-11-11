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

// Helper function to loop through projects and detect team mates that have worked together on the same projects
function getRepeatedProjects(array) {
	// get all projects IDs
	let projectIDsArray = array.map((item) => item.projectID);
	// filter the duplicated projects IDs
	let duplicatedProjectIDs = projectIDsArray.filter((item, index) => projectIDsArray.indexOf(item) === index);
	// get the employees of each project
	let employeesOfProjects = duplicatedProjectIDs.map((projectID) => {
		return array.filter((item) => item.projectID === projectID);
	});
	// filter out the project that have one employee or less
	employeesOfProjects = employeesOfProjects.filter((items) => items.length > 1);
	// looking for team mates that have worked together
	let filterdEmployees = [];
	employeesOfProjects.forEach((employeesOfSingleProject) => {
		let tempEmployeesArray = [];
		for (let i = 0; i < employeesOfSingleProject.length; i++) {
			let employee = employeesOfSingleProject[i];
			for (let j = 0; j < employeesOfSingleProject.length; j++) {
				let tempEmployee = employeesOfSingleProject[j];
				// see if an employee start date or end date falls between another employee start date or end date
				if (tempEmployee.empID !== employee.empID) {
					if (
						moment(employee.dateFrom, 'YYYY-MM-DD').isBetween(
							tempEmployee.dateFrom,
							tempEmployee.dateTo,
							undefined,
							'[]'
						) ||
						moment(employee.dateTo).isBetween(tempEmployee.dateFrom, tempEmployee.dateTo, undefined, '[]')
					) {
						// calculating the days spent working on the same project between two employees
						if (
							moment(employee.dateFrom, 'YYYY-MM-DD').isBetween(
								tempEmployee.dateFrom,
								tempEmployee.dateTo,
								undefined,
								'[]'
							) &&
							moment(employee.dateTo).isBetween(tempEmployee.dateFrom, tempEmployee.dateTo, undefined, '[]')
						) {
							let numberOfDaysWorkingWithTeamMate = moment(employee.dateTo, 'YYYY-MM-DD').diff(
								moment(employee.dateFrom, 'YYYY-MM-DD'),
								'days'
							);
							tempEmployeesArray.push({
								employee: employee,
								otherEmployee: tempEmployee,
								daysWorkedTogether: numberOfDaysWorkingWithTeamMate,
							});
						} else if (
							moment(employee.dateFrom, 'YYYY-MM-DD').isBetween(
								tempEmployee.dateFrom,
								tempEmployee.dateTo,
								undefined,
								'[]'
							)
						) {
							let numberOfDaysWorkingWithTeamMate = moment(tempEmployee.dateTo, 'YYYY-MM-DD').diff(
								moment(employee.dateFrom, 'YYYY-MM-DD'),
								'days'
							);
							tempEmployeesArray.push({
								employee: employee,
								otherEmployee: tempEmployee,
								daysWorkedTogether: numberOfDaysWorkingWithTeamMate,
							});
						} else {
							let numberOfDaysWorkingWithTeamMate = moment(tempEmployee.dateTo, 'YYYY-MM-DD').diff(
								moment(employee.dateTo, 'YYYY-MM-DD'),
								'days'
							);
							tempEmployeesArray.push({
								employee: employee,
								otherEmployee: tempEmployee,
								daysWorkedTogether: numberOfDaysWorkingWithTeamMate,
							});
						}
					}
				}
			}
		}
		filterdEmployees.push(tempEmployeesArray);
	});
	console.log('Employees that have worked together for each project', filterdEmployees);
	return filterdEmployees;
}

// Helper function to create HTML tags and add text to them
function createHTMLTags(tag, text = '') {
	let HTMLTag = document.createElement(tag);
	if (text !== '') {
		HTMLTag.textContent = text;
	}
	return HTMLTag;
}

// Create HTML table of the final result
function createTableForData(array) {
	let table = createHTMLTags('table');
	let tHead = createHTMLTags('thead');
	let headerRow = createHTMLTags('tr');
	let firstColumnTitle = createHTMLTags('th', 'Employee ID #1');
	let secondColumnTitle = createHTMLTags('th', 'Employee ID #2');
	let thirdColumnTitle = createHTMLTags('th', 'ProjectID');
	let forthColumnTitle = createHTMLTags('th', 'Days worked');
	headerRow.append(firstColumnTitle, secondColumnTitle, thirdColumnTitle, forthColumnTitle);
	tHead.appendChild(headerRow);
	let tBody = createHTMLTags('tbody');
	for (let i = 0; i < array.length; i++) {
		let mostWorkedTogether = array[i].reduce((prev, current) =>
			prev.daysWorkedTogether > current.daysWorkedTogether ? prev : current
		);
		console.log('team mates that have worked together the most for each project', mostWorkedTogether);
		let dataRow = createHTMLTags('tr');
		let employeeOne = createHTMLTags('td', mostWorkedTogether.employee.empID);
		let employeeTwo = createHTMLTags('td', mostWorkedTogether.otherEmployee.empID);
		let ProjectID = createHTMLTags('td', mostWorkedTogether.employee.projectID);
		let numberOfDays = createHTMLTags('td', mostWorkedTogether.daysWorkedTogether);
		dataRow.append(employeeOne, employeeTwo, ProjectID, numberOfDays);
		tBody.appendChild(dataRow);
	}
	table.append(tHead, tBody);
	document.body.appendChild(table);
}

// Receive the text file from user input
async function loadFile(e) {
	let file = e.target.files[0];
	if (file) {
		let text = await file.text();
		let rowsData = text.split('\r\n');
		let data = getArrayOfObjectsData(rowsData);
		let teamMates = getRepeatedProjects(data);
		createTableForData(teamMates);
	}
}

// Attach an event listener to detect the file uploaded by the user
document.getElementById('users-file').addEventListener('change', loadFile);
