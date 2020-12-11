class Command {
	constructor(keyword, template, description, modOnly, minArgs, action) {
		this.keyword = keyword;
		this.template = template;
		this.description = description;
		this.modOnly = modOnly;
		this.minArgs = minArgs;
		this.action = action;
	}
}

module.exports = Command;
