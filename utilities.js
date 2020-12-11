const fs = require("fs");

// Function to write data to a guild's json file
async function WriteToJson(message, guildData) {
	const jsonToWrite = JSON.stringify(guildData);
	fs.writeFile(`./guilds/${message.guild.id}.json`, jsonToWrite, "utf8", (err) => {});
}

// Function to check if a given user is a moderator or not
function IsMod(id, guildData) {
	if (guildData.mods.includes(id)) return true;
	return false;
}

// Function to allow for easy management of temporary messages
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

// Function to find the guild's .json file and create it if it doesn't exist
function FetchGuildData(message) {
	if (!fs.existsSync(`./guilds/${message.guild.id}.json`)) {
		var json = `{"mods": ["${message.guild.ownerID}"]}`;
		fs.writeFileSync(`./guilds/${message.guild.id}.json`, json, "utf8");
		return JSON.parse(json);
	}

	var json = fs.readFileSync(`./guilds/${message.guild.id}.json`, "utf8");
	return JSON.parse(json);
}

// The help message base before the commands each add their data to it
var helpMsg = `**Command list**`;

module.exports = { WriteToJson, IsMod, TmpReply, FetchGuildData, helpMsg };
