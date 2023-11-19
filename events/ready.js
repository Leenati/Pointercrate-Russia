const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		try {
			client.user.setStatus('idle');
			client.user.setActivity('Pointercrate', { type: ActivityType.Watching });
			console.log(`Выполен вход как: ${client.user.tag}`);
			
			// Здесь вы можете продолжить синхронизацию моделей и другие операции с базой данных.
		} catch (error) {
			console.error('Невозможно подключить к базе данных:', error);
		}
	},
};