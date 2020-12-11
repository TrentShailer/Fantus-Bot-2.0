const util = require("../utilities.js");
const commandTemplate = require("../commandTemplate.js");
const keyword = "purge";
const template = `>purge <number of messages>`;
const description = `This command mass deletes a certain number of messages (1 - 100)`;
const modOnly = true;
const minArgs = 1;

async function action(client, guildData, message, args) {
	const deleteCount = parseInt(args[0], 10);
	message.delete();
	if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
		return util.TmpReply(
			message,
			`You must provide the number of messages to delete (1 - 100)`
		);
	}

	const fetched = await message.channel.messages.fetch({ limit: deleteCount });
	message.channel
		.bulkDelete(fetched)
		.catch((error) =>
			util.TmpReply(message, `Couldn't delete messages because of: ${error}`, 10000)
		);
}

var command = new commandTemplate(keyword, template, description, modOnly, minArgs, action);

module.exports = command;
