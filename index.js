var exec = require('child_process').exec;
var path = require('path');

module.exports = function (options) {
	if(options.gitRoot === undefined) {
		throw new Error('missing option gitRoot');
	}
	else if(options.baseRoute === undefined) {
		throw new Error('missing option baseRoute');
	}
	else if(options.basePath === undefined) {
		throw new Error('missing option basePath');
	}

	var baseRoute = options.baseRoute,
		gitRoot = options.gitRoot,
		basePath = options.basePath,
		relative,
		cmd;

	return function (req, res, next) {
		var matchesRoute = baseRoute === '' || req.path.indexOf(baseRoute) === 0
		if(matchesRoute && ~~req.query.diff) {
			relative = req.path.substring(baseRoute.length);
			cmd = [
				__dirname + '/bin/diffserv-cli/src/base.py',
				path.join(process.cwd(), gitRoot),
				basePath + relative, 
				req.query.callback ? req.query.callback : '',
				req.query.version ? req.query.version : '',
				req.query.next ? req.query.next : ''
			].join(' ');

			console.log('exec: ' + cmd);
			exec(cmd, function (err, stdout, stderr) {
				if(err) {
					next(err);
				}
				else {
					res.set('Content-Type','application/javascript');
					res.send(200, stdout.toString());
				}
			});	
		}
		else {
			next();
		}
	}
};