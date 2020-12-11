const util = require("../utilities.js");
const fs = require("fs");
const commandTemplate = require("../commandTemplate.js");
const keyword = "remmod";
const template = `>remmod <@user>`;
const description = `This command revokes a user's moderator permissions`;
const modOnly = true;
const minArgs = 1;

async function action(client, guildData, message, args) {
	message.delete();
	var toRem = message.mentions.users.first();

	if (!toRem) {
		return util.TmpReply(message, "You must provide a moderator remove");
	}

	var id = toRem.id;

	if (id == message.guild.ownerID) {
		return util.TmpReply(message, "You can not revoke this user's moderator permissions");
	} else if (util.IsMod(id, guildData)) {
		var index = guildData.mods.indexOf(id);
		guildData.mods.splice(index, 1);
		util.WriteToJson(message, guildData);
	} else {
		return util.TmpReply(message, "This user is not a moderator");
	}

	util.TmpReply(message, `Successfully revoked ${toRem}'s moderator permissions`, 10000);
}

var command = new commandTemplate(keyword, template, description, modOnly, minArgs, action);

module.exports = command;
