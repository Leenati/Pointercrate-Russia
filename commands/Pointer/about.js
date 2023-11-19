const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const aboutJson = require('../../locale/ru/about.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Информация о разработке бота'),
	async execute(interaction) {

        const row = new ActionRowBuilder()
		const followButton = new ButtonBuilder()
			.setLabel('Донат')
			.setURL('https://boosty.to/leenati')
			.setStyle(ButtonStyle.Link)
	
		row.addComponents(followButton);

		await interaction.reply({ embeds: [aboutJson], components: [row] });
	}
};