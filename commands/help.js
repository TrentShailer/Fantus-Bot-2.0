const util = require("../utilities.js");
const fs = require("fs");
const commandTemplate = require("../commandTemplate.js");
const keyword = "help";
const template = `>help`;
const description = `This command displays all the bot's features`;
const modOnly = false;
const minArgs = 0;

var helpMsg = `**Command list**`;

async function action(client, guildData, message, args) {
	message.delete();
	(await message.author.createDM()).send(helpMsg);
}

var command = new commandTemplate(keyword, template, description, modOnly, minArgs, action);

module.exports = command;
