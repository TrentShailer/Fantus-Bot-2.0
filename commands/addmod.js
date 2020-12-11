const util = require("../utilities.js");
const fs = require("fs");
const commandTemplate = require("../commandTemplate.js");
const keyword = "addmod";
const template = `>addmod <@user>`;
const description = `This command give a user moderator permissions`;
const modOnly = true;
const minArgs = 1;

async function action(client, guildData, message, args) {
	message.delete();
	var toAdd = message.mentions.users.first();

	if (!toAdd) {
		return util.TmpReply(message, "You must provide a user to mod");
	}
	var id = toAdd.id;
	if (util.IsMod(id, guildData)) {
		return util.TmpReply(message, "This user is already a moderator");
	}

	guildData.mods.push(id);
	util.WriteToJson(message, guildData);

	util.TmpReply(message, `${toAdd} is now a moderator`, 10000);
}

var command = new commandTemplate(keyword, template, description, modOnly, minArgs, action);

module.exports = command;
