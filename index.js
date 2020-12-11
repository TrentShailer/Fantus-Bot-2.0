require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const prefix = ">";
const format = require("date-fns/format");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(`Serving ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
	client.user.setActivity({
		name: "Use >help",
		status: "online",
	});
});

client.on("guildCreate", (guild) => {
	// This event triggers when the bot joins a guild.
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", (guild) => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

fs.readdir("./commands/", (err, files) => {
	if (err) return console.error(err);
	files.forEach((file) => {
		let eFunction = require(`./commands/${file}`);
		let eName = file.split(".")[0];
		client.on(eName, (...args) => eFunction.run(client, ...args));
	});
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
		WriteToJson(data);
	}
	var guildIndex = data.guilds.indexOf(guildData);

	if (!IsMod(message.guild.ownerID, guildData)) {
		data.guilds[guildIndex].mods.push(message.guild.ownerID);
		WriteToJson(data);
	}

	var now = new Date();

	const args = message.content.slice(1).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	console.log(`${format(now, "dd/MM/yyyy hh:mm:ss a")} - ${message.author.username} used the ${command} command ${args.length != 0 ? `with the arguments ${args}` : ""}`);

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

	if (command === "ping") {
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const m = await message.channel.send("Ping?");
		m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
	}

	if (command === "purge") {
		if (IsMod(message.author.id, guildData)) {
			const deleteCount = parseInt(args[0], 10);
			message.delete();
			if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
				return TmpReply(message, `You must provide the number of messages to delete (2 - 100)`);
			}

			const fetched = await message.channel.messages.fetch({ limit: deleteCount });
			message.channel.bulkDelete(fetched).catch((error) => TmpReply(message, `Couldn't delete messages because of: ${error}`, 10000));
		}
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

async function WriteToJson(data) {
	const jsonToWrite = JSON.stringify(data);
	fs.writeFile("./store.json", jsonToWrite, "utf8", (err) => {});
}

function IsMod(id, guildData) {
	if (guildData.mods.includes(id)) return true;
	return false;
}

async function TmpReply(origMsg, newMsg, timeout = 4000) {
	return origMsg
		.reply(newMsg)
		.then((msg) => {
			msg.delete({ timeout: timeout });
		})
		.catch(console.error);
}

client.login(process.env.BOT_TOKEN);
