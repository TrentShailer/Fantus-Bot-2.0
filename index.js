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
				return utilities.TmpReply(message, "This command requires moderator permissions", 10);
			}
			if (args.length < command.minArgs) {
				message.delete();
				return utilities.TmpReply(
					message,
					`This command requires at least ${command.minArgs} argument(s), provided ${args.length}`,
					10
				);
			}

			command.action(client, guildData, message, args);
		});
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

	var json = fs.readFileSync("./store.json", "utf8");
	var data = JSON.parse(json);

	var guildData = data.guilds.find((obj) => {
		return obj.guild === message.guild.id;
	});

	if (guildData == undefined) {
		guildData = { guild: message.guild.id, mods: [] };
		data.guilds.push(guildData);
		utilities.WriteToJson(data);
	}
	var guildIndex = data.guilds.indexOf(guildData);

	if (!utilities.IsMod(message.guild.ownerID, guildData)) {
		data.guilds[guildIndex].mods.push(message.guild.ownerID);
		utilities.WriteToJson(data);
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

	if (command === "help") {
		message.delete();
		(await message.author.createDM()).send(`
		**Command list**
		\`>ping\`
			This command pings the bot and returns the latency
		\`>purge <Number of messages>\`
			This command mass deletes a certain number of messages (2 - 100)
			This command requires moderator permissions
		\`>addmod <@user>\`
			This command requires moderator permissions
			This command give a user bot moderator permissions
		\`>remmod <@user>\`
			This command requires moderator permissions
			This command removes a user's bot moderator permissions
		\`>blame\`
			This command blames a random user in the guild
		`);
	}

	if (command === "addmod") {
		if (IsMod(message.author.id, guildData)) {
			message.delete();
			var toAdd = message.mentions.users.first();

			if (!toAdd) {
				return TmpReply(message, "You must provide a user to mod");
			}
			var id = toAdd.id;
			if (IsMod(id, guildData)) {
				return TmpReply(message, "This user is already a moderator");
			}
			data.guilds[guildIndex].mods.push(id);
			WriteToJson(data);
		}
	}
	if (command === "remmod") {
		if (IsMod(message.author.id, guildData)) {
			message.delete();
			var toRem = message.mentions.users.first();

			if (!toRem) {
				return TmpReply(message, "You must provide a moderator remove");
			}
			var id = toRem.id;
			if (id == message.guild.ownerID) {
				return TmpReply(message, "You can not remove this user's moderator permissions");
			} else if (IsMod(id, guildData)) {
				var index = data.guilds[guildIndex].mods.indexOf(id);
				data.guilds[guildIndex].mods.splice(index, 1);
				WriteToJson(data);
			} else {
				return TmpReply(message, "This user is not a moderator");
			}
		}
	}
	if (command === "blame") {
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
});

client.login(process.env.BOT_TOKEN);
