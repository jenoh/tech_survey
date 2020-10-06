require('dotenv').config();
let Parser = require('rss-parser');
let parser = new Parser();
var handlebars = require('handlebars');
var fs = require('fs');
const nodemailer = require('nodemailer');

var readHTMLFile = function (path, callback) {
	fs.readFile(path, {
		encoding: 'utf-8'
	}, function (err, html) {
		if (err) {
			throw err;
		} else {
			callback(null, html);
		}
	});
};
handlebars.registerHelper('print_title', function () {
	return this.title
})
handlebars.registerHelper('print_pubDate', function () {
	return this.pub_date
})
handlebars.registerHelper('print_link', function () {
	return this.link
})
handlebars.registerHelper('print_description', function () {
	return this.link
})

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.MAIL_FROM,
		pass: process.env.MAIL_PASS
	}
});

async function sendMail(posts) {
	readHTMLFile(__dirname + '/email.html', function (err, html) {
		var template = handlebars.compile(html);
		var replacements = {
			posts: posts
		};
		var htmlToSend = template(replacements);
		var mailOptions = {
			from: process.env.MAIL_FROM,
			to: process.env.MAIL_TO,
			subject: 'Reddit news',
			html: htmlToSend
		};
		transporter.sendMail(mailOptions, (err, data) => {
			if (err) {
				console.log(err)
				return console.log('Error occurs');
			}
			return console.log('Email sent!!!');
		});
	});
}

(async () => {

	let feed = await parser.parseURL('https://www.reddit.com/r/softwaredevelopment/.rss');
	var posts = [];
	await feed.items.forEach(async function (item) {
		try {
			var post = {
				title: item.title,
				reddit_id: item.id,
				link: item.link,
				pub_date: item.pubDate,
				store_date: Date.now()
			};
			posts.push(post)
		} catch (error) {
			console.error(error);
		}
	});
	await sendMail(posts)
})();