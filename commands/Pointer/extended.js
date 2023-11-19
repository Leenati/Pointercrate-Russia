const { SlashCommandBuilder } = require('discord.js');

const pagination = require('../../Utils/pagination');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('extended')
		.setDescription('Экстендед лист демонов (76 - 150)'),
	async execute(interaction) {
		await pagination.processInteraction(interaction,
			{
				after: 75,
				title: 'Экстендед лист',
				getFooter: function (page) {
					return `Страница ${page} из 3`;
				}
			}
		);
	}
};