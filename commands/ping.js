const commandTemplate = require("../commandTemplate.js");
const keyword = "ping";
const template = `>ping`;
const description = `This command pings the bot and displays the latency`;
const modOnly = false;
const minArgs = 0;

async function action(client, guildData, message, args) {
	// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
	// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
	const m = await message.channel.send("Pinging...");
	m.edit(
		`Pong! Latency is ${
			m.createdTimestamp - message.createdTimestamp
		}ms. API Latency is ${Math.round(client.ws.ping)}ms`
	).catch((err) => {
		console.warn("Attempted to interact with a message that no longer exists");
	});
	return;
}

var command = new commandTemplate(keyword, template, description, modOnly, minArgs, action);

module.exports = command;
