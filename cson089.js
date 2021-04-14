function showHome() {
	document.getElementById("home").style.display = "block";
	document.getElementById("staff").style.display = "none";
	document.getElementById("courses").style.display = "none";
	document.getElementById("infographic").style.display = "none";
} 

function showStaff() {
	document.getElementById("home").style.display = "none";
	document.getElementById("staff").style.display = "block";
	document.getElementById("courses").style.display = "none";
	document.getElementById("infographic").style.display = "none";

	const fetchPromise = fetch(encodeURI("https://dividni.com/cors/CorsProxyService.svc/proxy?url=https://unidirectory.auckland.ac.nz/rest/search?orgFilter=MATHS"),
	{ 
		headers : {
			"Accept" : "application/json",
		},
	}
	);
	const streamPromise = fetchPromise.then((response) => response.json());

	streamPromise.then( (staffData) => {createTableHTML(staffData);});
}

function showCourses() {
	document.getElementById("home").style.display = "none";
	document.getElementById("staff").style.display = "none";
	document.getElementById("courses").style.display = "block";
	document.getElementById("infographic").style.display = "none";

	const fetchPromise = fetch(encodeURI("https://api.test.auckland.ac.nz/service/courses/v2/courses?subject=MATHS&year=2020&size=500"),
	{ 
		headers : {
			"Accept" : "application/json",
		},
	}
	);
	const streamPromise = fetchPromise.then((response) => response.json());

	streamPromise.then( (courseData) => {createCourseHTML(courseData);});
}


function showInfo() {
	document.getElementById("home").style.display = "none";
	document.getElementById("staff").style.display = "none";
	document.getElementById("courses").style.display = "none";
	document.getElementById("infographic").style.display = "block";

	const fetchPromise = fetch(encodeURI("https://cws.auckland.ac.nz/qz20/Quiz2020ChartService.svc/g"),
		{
			headers : {
				"Accept" : "application/json",
			},
	});
	
	const streamPromise = fetchPromise.then((response) => response.json());

	streamPromise.then( (data) => infographic(data));
}

// creating the table of staff
function createTableHTML(data) {
	let picURL = "https://unidirectory.auckland.ac.nz/people/imageraw/";
	let vcardURL = "https://unidirectory.auckland.ac.nz/people/vcard/";

	// appending headers
	tableHTML = "<tr><th></th><th>Name</th><th>Position</th><th>Email Address</th><th>Phone Number (Extension)</th><th>Contact Details</th></tr>";

	let upi1 = /[A-z]{3}[0-9]{3}/;
	let upi2 = /[A-z]{4}[0-9]{3}/;

	const createHTML = (data1) => {	

		tableHTML += "<tr>";
		
		// if imageId exists, find correct UPI and retrieve photo
		let upi;
		if (data1.imageId != undefined) {
			data1.profileUrl.forEach( (element) => {if (upi1.test(element))upi = element;});
			tableHTML = tableHTML + "<td><img src='" + picURL + upi + "/" + data1.imageId + "/biggest'></td>";
		} else {
			tableHTML = tableHTML + "<td></td>";
		}

		// if staff member has title, then concatenate to staff member's name
		let title = "";
		if (data1.title != undefined) title = data1.title;
		// with many different versions of "names", concatenating firstname and lastname was done instead
		tableHTML = tableHTML + "<td>" + title + " " + data1.firstname + " " + data1.lastname + "</td>";
		
		// retrieving their job title and adding it to the table 
		tableHTML = tableHTML + "<td>";
		data1.jobtitles.forEach((jobtitle) => {tableHTML = tableHTML + "<br>" + jobtitle + "<br>";})
		tableHTML = tableHTML + "</td>";
		
		// create email address and allow instant emailing
		tableHTML = tableHTML + "<td><a href='mailto:" + data1.emailAddresses[0] + "'>" + data1.emailAddresses[0] + "</a></td>";
		
		// retrieve phone number (and add link) if staff member has phone number, N/A otherwise
		if (data1.extn != undefined) {
			// assumption is that we must dial the general number and then enter the extension
			tableHTML = tableHTML + "<td><a href='tel:+6493737599'>" + "+64 9 373 7599  Extension: " + data1.extn +"</a></td>";
		} else {
			tableHTML = tableHTML + "<td>N/A</td>";	
		}

		// allow download of contact details
		tableHTML = tableHTML + "<td><a href='" + vcardURL + upi + "'>Save Contact Details</a></td>";

		tableHTML += "</tr>";
	};

	data.list.forEach(createHTML);

	document.getElementById("staffTable").innerHTML = tableHTML;
}

// creating the table of courses
function createCourseHTML(data) {

	// initialising table
	courseHTML = "<tr><th>Subject Code</th><th>Title</th><th>Description</th><th>Requirements</th>";
	
	const createHTML = (data1) => {
		courseHTML += "<tr>";
		courseHTML = courseHTML + "<td><a onclick='showCourseInfo(" + data1.catalogNbr + ")'>" + data1.subject + " " + data1.catalogNbr + "</a></td>";
		courseHTML = courseHTML + "<td><h4>" + data1.titleLong + "</h4></td>";

		description = data1.description;
		prereq = "";
		if (description != undefined) {
			index = description.indexOf("Prerequisite:");
		} else {
			index = -1;
			description = "<em>No description available for this course.</em><br>Please contact the Maths Department for more information.";
		}
		
		if (index != -1) {
			description = data1.description.substr(0, index - 1);
			prereq = data1.description.substr(index, data1.description.length-1);
		}

		courseHTML = courseHTML + "<td>" + description + "</td>";
		// MATHS 190 has requirement == ".", have given it a general requirement.
		if ((data1.rqrmntDescr == undefined && prereq == "")|(data1.rqrmntDescr == ".")) {
			courseHTML = courseHTML + "<td>No prerequisites specified. Please consult Maths Department for more information.</td>";	
		} else if (prereq == ""){
			courseHTML = courseHTML + "<td>" + data1.rqrmntDescr + "</td>";
		} else {
			courseHTML = courseHTML + "<td>" + prereq + "<br><br>" + data1.rqrmntDescr + "</td>";
		};
		courseHTML += "</tr></a>";
	}

	data.data.forEach(createHTML);

	//subject catalogNbr rqrmntDescr titleLong description level
	document.getElementById("courseTable").innerHTML = courseHTML;
}

// fetching API for the course information
function showCourseInfo(number) {
	let URL = "https://api.test.auckland.ac.nz/service/classes/v1/classes?year=2020&subject=MATHS&size=500&catalogNbr=" + number;
	const fetchPromise = fetch(encodeURI(URL),
	{ 
		headers : {
			"Accept" : "application/json",
		},
	}
	);
	const streamPromise = fetchPromise.then((response) => response.json());

	streamPromise.then( (courseData) => {courseInfoHTML(courseData)}) ; 
}

// creating the pop-up window of the table of course information (meeting times if existent)
function courseInfoHTML(data1){

	courseHTML = "";
	const createHTML = (data2) => {
		if (courseHTML == "") {
			courseHTML = courseHTML + "<button type='button' onclick='closeWindow()'>Close Window</button><div id='coursetitle'><h2>" + data2.acadOrg + data2.catalogNbr + "<h4>" + data2.classDescr + "</h4></div>";
			courseHTML += "<table>";
		}

		if (data2.meetingPatterns.length != 0) {
			courseHTML = courseHTML + "<tr rowspan='" + data2.meetingPatterns.length + "'>";
			courseHTML = courseHTML + "<td rowspan='" + data2.meetingPatterns.length + "'>" + data2.classNbr + "</td>";
			courseHTML = courseHTML + "<td rowspan='" + data2.meetingPatterns.length + "'>" + data2.classSection + "</td>";
			courseHTML = courseHTML + "<td rowspan='" + data2.meetingPatterns.length + "'>" + data2.component + "</td>";

			data2.meetingPatterns.forEach( (data3) => {
				if (data3.length != 0) {
					courseHTML = courseHTML + "<td>" + data3.startDate + "  -  " + data3.endDate + "</td>";
					courseHTML = courseHTML + "<td>" + data3.daysOfWeek + "</td>";
					courseHTML = courseHTML + "<td>" + data3.startTime + "  -  " + data3.endTime + "</td>";
					courseHTML = courseHTML + "<td>" + data3.location + "</td>";
					courseHTML = courseHTML + "</tr>";
				}		
			});

		} else {
			courseHTML += "<tr>";
			courseHTML = courseHTML + "<td>" + data2.classNbr + "</td>";
			courseHTML = courseHTML + "<td>" + data2.classSection + "</td>";
			courseHTML = courseHTML + "<td>" + data2.component + "</td>";
			courseHTML = courseHTML + "<td colspan='4'>No meeting information available.</td></tr>";
		}
	};

	data1.data.forEach(createHTML);

	if (data1.data.length == 0 | data1.data == undefined) {
		courseHTML += "<button type='button' onclick='closeWindow()'>Close Window</button>";
		courseHTML += "<div id='coursetitle'><h3>No course meeting information available.<br>Contact department for further details.</h3></div>";
		document.getElementById("courseInfo").style.height = "100px";
	}
	courseHTML += "</table>";

	document.getElementById("courseInfo").innerHTML = courseHTML;
	document.getElementById("coursetitle").style.opacity = "0.3";
	document.getElementById("courseTable").style.opacity = "0.3";
	document.getElementById("courseInfo").style.display = "block";
}

// closing the pop-up window
function closeWindow() {
	document.getElementById("courseInfo").style.display = "none";
	document.getElementById("courseInfo").style.height = "600px";
	document.getElementById("coursetitle").style.opacity = "1";
	document.getElementById("courseTable").style.opacity = "1";
}

// creating the infographic
function infographic(data) {
	count = 1;
	x = 5;
	y = 5;

	mySvg = "";

	const createInfograph = (data) => {		
		stat = data;
		mySvg = mySvg + "<svg><text x='" + x + "' y='" + (y+20) + "' stroke='black' font-size='20px'>" + count + "</text><svg>"
		x += 30;
		while (stat >= 10) {
			mySvg = mySvg + "<svg><use xlink:href='#mathSymbol' x='" + x + "' y='" + y + "' style='opacity:1.0'></svg>\n";
			stat -= 10;
			x += 30;
		}
		mySvg = mySvg + "<svg><defs><clipPath id='myClip" + count +"'><rect x='" + x + "' y='" + y + "' height='30' width='" + (30 * (stat/10)) + "'/></clipPath></defs>";
		mySvg = mySvg + "<g clip-path='url(#myClip" + count + ")'><use xlink:href='#mathSymbol' x='" + x + "' y='" + y + "' style='opacity:1.0'></g></svg>\n";

		x = 5; 
		y += 30;
		count += 1;

	}	
	data.forEach(createInfograph);
	document.getElementById("numbers").innerHTML = "<h2>Data retrieved: " + JSON.stringify(data) + "</h2>";
	document.getElementById("infograph2").innerHTML = mySvg;
}



