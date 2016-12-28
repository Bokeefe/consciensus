/* jshint esversion:6 */

/*
	This is our extensible storage object. We've written it so that we can
	replace any parts of it in the future with calls to file system or mongo
	without too much effort.
*/

var fs = require("fs");

var users = fs.readFileSync("./user_storage.json");
users = JSON.parse(users);

var projects = fs.readFileSync("./project_storage.json");
projects = JSON.parse(projects);



function Storage() {

	/*
		Takes in a user object to store, and stores
		it in the users array
	*/
	this.addUser = (user, cb) => {
		users.push(user);
		this.saveUsers();
		if (cb) {
			cb();
		}
	};

	this.addProject = (project, cb)  => {
		// cb = callback
		projects.push(project);
		this.saveProjects();
		if (cb) {
			cb();
		}
	};

	this.getAllProjects = (cb) => {
		// cb = callback
		cb(projects);
	};

	this.getProjectByName = (name, cb) => {
		for (var p of projects) {
			if (p.name === name) {
				cb(p);
			}
		}
	};

	this.getProjectsByUser = (name, cb) => {
		var arr = [];
		for (var p of projects) {
			if (p.author === name) {
				arr.push(p);
			}
		}
		cb(arr);
	};

	this.voteOnProject = (project_name, user_name, cb) => {
		this.getProjectByName(project_name, (p) => {
			if (p.votes.includes(user_name)) {
				cb(false);
				return;
			} else {
				p.votes.push(user_name);
				this.saveProjects();
				cb(p);
				return;
			}
		});
	};

	/*
		Takes in a username string and returns the user
		with that username
	*/
	this.getUserByUsername = (name, cb) => {
		for (var u of users) {
			if (u.username === name) {
				cb(u);
			}
		}
	};

	this.checkForUser = (name, cb) => {
		for (var u of users) {
			if (u.username === name) {
				cb(false);
				return;
			}
		}
		cb(true);
	};

	this.saveProjects = (cb) => {
		fs.writeFile("./project_storage.json", JSON.stringify(projects), (err) => {
			if(err) {
				console.log(err);
				if(cb){cb(false);}
			} else {
				if(cb){cb(true);}
			}
		});
	};

	this.saveUsers = (cb) => {
		fs.writeFile("./user_storage.json", JSON.stringify(users), (err) => {
			if(err) {
				console.log(err);
			}
		});
	};
}

module.exports = Storage;
