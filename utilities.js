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

module.exports = { WriteToJson, IsMod, TmpReply };
