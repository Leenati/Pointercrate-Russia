const { SlashCommandBuilder } = require('discord.js');

const helpJson = require('../../locale/ru/help.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Показывает гайд по боту.'),
	async execute(interaction) {
		await interaction.reply({ embeds: [helpJson] });
	}
};