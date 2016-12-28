/* jshint esversion:6*/

/*
	This is the front-end javascript for our website. It handles displaying the
	projects to the user. You can think of this as the "view" of the site.
*/

/*
	This function takes in a project (object with name, author, description, and
	votes array), and returns a DOM element clone of the project template. (An
	HTML element that we can append to the page later).
*/
function createProjectHMTL(project) {
	// clone the template
	var projectDiv = $('#project_template').clone();
	// remove the id (only one thing with each id)
	projectDiv.removeAttr("id");
	// set name, author, and description
	projectDiv.find(".project_name").text(project.name);
	projectDiv.find(".project_author").text(project.author);
	projectDiv.find(".project_description").text(project.description);
	projectDiv.find(".vote_count").text("Votes: " + project.votes.length);
	// show this clone of the template (template is hidden by default)
	projectDiv.show();

	var buttonEl = projectDiv.find(".project_vote");
		buttonEl.click(onVoteClick);



	// return a reference to the clone
	return projectDiv;
}

function onVoteClick(evt) {
	var buttonEl = $(evt.target);
	var projectName = buttonEl.siblings("h3").text();
	var vote_count = buttonEl.siblings(".vote_count");
	$.post("/api/vote", {name: projectName}, function(res) {
		if (res.voted) {
			buttonEl.text("Voted!");
			buttonEl.attr("disabled", "disabled");
			vote_count.text("Votes: " + res.votes);
		}
	});
}

function arrangeByVotes(projects) {

	var max = projects.length;

	while (max > 0) {
		var temp;
		for (var i = 0; i < max - 1; i++) {
			if (projects[i].votes.length < projects[i + 1].votes.length) {
				temp = projects[i];
				projects[i] = projects[i + 1];
				projects[i + 1] = temp;
			}
		}
		max--;
	}
	return projects;
}

function arrangeByTime(projects) {

	var max = projects.length;

	while (max > 0) {
		var temp;
		for (var i = 0; i < max - 1; i++) {
			if (projects[i].created < projects[i + 1].created) {
				temp = projects[i];
				projects[i] = projects[i + 1];
				projects[i + 1] = temp;
			}
		}
		max--;
	}
	return projects;
}

function getRandom(projects) {
	$("#random1").text("Loading Projects...");
	$.get('/api/projects', function(res) {
		// res here is what we ("res.send") on the backend
		if (res.length === 0) {
			$('#random1').text("No projects!");
		} else {
			var projects = res;
			var stop = Math.min(projects.length, 5);
			$('#random1').text("");
			for (var i = 0; i < stop; i++) {
				var rando = Math.floor(Math.random() * projects.length);
				var proj = projects.splice(rando, 1);
				proj = proj[0];
				$('#random1').append(createProjectHMTL(proj));
			}
			stop = Math.min(projects.length, 5);
			$('#random2').text("");
			for (var i = 0; i < stop; i++) {
				rando = Math.floor(Math.random() * projects.length);
				proj = projects.splice(rando, 1);
				proj = proj[0];
				$('#random2').append(createProjectHMTL(proj));
			}
			
		}
	}, 'json'); //'json' = auto parse as json
}

function getProjectsMain() {
	$('#projects').text("Loading Projects...");
	$('#newest').text("Loading Projects...");

	$.get('/api/projects', function(res) {
		// res here is what we ("res.send") on the backend
		if (res.length === 0) {
			$('#projects').text("No projects!");
		} else {
			var projects = arrangeByVotes(res);
			var stop = Math.min(projects.length, 5);
			$('#projects').text("");
			for (var i = 0; i < stop; i++) {
				$('#projects').append(createProjectHMTL(projects[i]));
			}

			projects = arrangeByTime(res);
			stop = Math.min(projects.length, 5);
			$('#newest').text("");
			for (var i = 0; i < stop; i++) {
				$('#newest').append(createProjectHMTL(projects[i]));
			}
		}
	}, 'json'); //'json' = auto parse as json
}


function getMine() {
	$("#main").css("display", "none");
	$("#random").css("display", "none");
	$("#submitProj").css("display", "none");
	$("#mine").css("display", "block");
	$("#mine1").text("Loading Projects...");
	$.get("/api/mine", function(res) {
		if(res === "none found") {
			$("#mine1").text("No Projects Found");
		} else {
			$("#mine1").text("");
			for (var i = 0; i < res.length / 2; i++) {
			$("#mine1").append(createProjectHMTL(res[i]));
		}
			for (i; i < res.length; i++) {
				$("#mine2").append(createProjectHMTL(res[i]));
			}
		}
	});
}

/*
	On page load...
*/
$(document).ready(function() {

	/*
		Get all of the projects from the server via AJAX. Uses the
		"/api/projects" endpoint. If the response is an empty array, display
		"No projects!". Otherwise we build the projects into HTML and display
		them on the page.
	*/
	getProjectsMain();
	$("#get_random").click(function() {
		$("#main").css("display", "none");
		$("#mine").css("display", "none");
		$("#random").css("display", "block");
		$("#submitProj").css("display", "none");
		getRandom();
	});

	$("#yourProjects").click(function() {
		getMine();
	});

	$("#addProj").click(function() {
		$("#main").css("display", "none");
		$("#mine").css("display", "none");
		$("#random").css("display", "none");
		$("#submitProj").css("display", "block");
	});

	$("#logout").click(function () {
		$.get("/api/logout", function(res) {
			document.location = "/";
		});
	});
	/*
		When we click on the "send new project" button...
	*/
	$('#send_new_project').click(function() {
		// gather our data
		var project = {
			name: $('#new_project_name').val(),
			description: $('#new_project_description').val()
		};
		$('#new_project_name').val("");
		$('#new_project_description').val("");
		// send our data to the server by POSTing it to /api/project.
		// note that the second argument here will become res.body on the server
		$.post('/api/project', project, function(res) {
			$('#projects').append(createProjectHMTL(res));
			$('#' + res.name).click(onVoteClick);
			getMine();
		}, 'json');
	});
});
