const util = require("../utilities.js");
const fs = require("fs");
const commandTemplate = require("../commandTemplate.js");
const keyword = "blame";
const template = `>blame`;
const description = `This command blames a random user in the guild`;
const modOnly = false;
const minArgs = 0;

async function action(client, guildData, message, args) {
	message.delete();
	var guild = message.guild;
	var users = await guild.members.fetch();
	var entry = users.random();
	t = 0;
	while (entry.user.bot && t < 10) {
		t++;
		entry = users.random();
	}
	message.channel.send(`It's <@${entry.user.id}>'s fault!`);
}

var command = new commandTemplate(keyword, template, description, modOnly, minArgs, action);

module.exports = command;
