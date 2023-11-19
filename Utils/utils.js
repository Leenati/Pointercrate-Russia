module.exports = {
	getUserNameBanned(user) {
		return user.banned ? `__${user.name}__` : user.name;
	},
	getTextStyleByPosition(text, position) {
		return position <= 75 ? `**${text}**` : position > 150 ? text : `*${text}*`;
	},

	isNullOrUndefined(value) {
		return value == null || value == undefined;
	}
};