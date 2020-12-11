require("dotenv").config();
const events = require("events");
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const prefix = ">";
const format = require("date-fns/format");
const utilities = require("./utilities");

const commandHandler = new events.EventEmitter();

fs.readdir("./commands", (err, files) => {
	files.forEach((file) => {
		var command = require(`./commands/${file}`);
		commandHandler.on(command.keyword, (client, guildData, message, args) => {
			if (command.modOnly && !utilities.IsMod(message.author.id, guildData)) {
				message.delete();
				return utilities.TmpReply(
					message,
					"This command requires moderator permissions",
					10000
				);
			}
			if (args.length < command.minArgs) {
				message.delete();
				return utilities.TmpReply(
					message,
					`This command requires at least ${command.minArgs} argument(s), provided ${args.length}`,
					10000
				);
			}

			command.action(client, guildData, message, args);
		});
		utilities.helpMsg += `\n\`${command.template}\`\n	${command.description}${
			command.modOnly ? `\n	This command requires moderator permissions` : ""
		}	`;
	});
});

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(
		`Serving ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
	);
	client.user.setActivity({
		name: "Use >help",
		status: "online",
	});
});

client.on("guildCreate", (guild) => {
	// This event triggers when the bot joins a guild.
	console.log(
		`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
	);
});

client.on("guildDelete", (guild) => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

client.on("message", async (message) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	var guildData = utilities.FetchGuildData(message);

	if (!utilities.IsMod(message.guild.ownerID, guildData)) {
		guildData.mods.push(message.guild.ownerID);
		utilities.WriteToJson(message, guildData);
	}

	var now = new Date();

	const args = message.content.slice(1).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	console.log(
		`${format(now, "dd/MM/yyyy hh:mm:ss a")} - ${
			message.author.username
		} used the ${command} command ${args.length != 0 ? `with the arguments ${args}` : ""}`
	);

	commandHandler.emit(command, client, guildData, message, args);
});

client.login(process.env.BOT_TOKEN);
