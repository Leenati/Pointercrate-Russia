const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const request = require('../../Utils/request');
const embeds = require('../../Utils/embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('Топ 1 уровень в лидербордах'),

	async execute(interaction) {
		if (interaction instanceof ChatInputCommandInteraction)
			await interaction.deferReply();
		const responseData = await request.getResponseJSON('api/v2/demons/listed?limit=1&after=0');

		let message;
		if (responseData.data.length === 0) {
			message = '**Pointercrate API**: возвращено пустое значение.'
		} else {
			message = await embeds.getDemonEmbed(responseData.data[0]);
		}

		if (interaction instanceof ChatInputCommandInteraction) {
			await interaction.editReply(message);
		} else {
			await interaction.reply(message);
		}
	}
};