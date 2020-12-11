const fs = require("fs");

async function WriteToJson(message, guildData) {
	const jsonToWrite = JSON.stringify(guildData);
	fs.writeFile(`./guilds/${message.guild.id}.json`, jsonToWrite, "utf8", (err) => {});
}

function IsMod(id, guildData) {
	if (guildData.mods.includes(id)) return true;
	return false;
}

async function TmpReply(origMsg, newMsg, timeout = 4000) {
	origMsg
		.reply(newMsg)
		.then((msg) => {
			msg.delete({ timeout: timeout }).catch((err) => {
				console.warn("Attempted to interact with a message that no longer exists");
			});
		})
		.catch((err) => {
			console.warn("Attempted to interact with a message that no longer exists");
		});
	return;
}

function FetchGuildData(message) {
	if (!fs.existsSync(`./guilds/${message.guild.id}.json`)) {
		var json = `{"mods": ["${message.guild.ownerID}"]}`;
		fs.writeFileSync(`./guilds/${message.guild.id}.json`, json, "utf8");
		return JSON.parse(json);
	}

	var json = fs.readFileSync(`./guilds/${message.guild.id}.json`, "utf8");
	return JSON.parse(json);
}

module.exports = { WriteToJson, IsMod, TmpReply, FetchGuildData };
