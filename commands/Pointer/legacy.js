const { SlashCommandBuilder } = require('discord.js');

const pagination = require('../../Utils/pagination');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('legacy')
		.setDescription('Legacy лист демонов (151+).'),
	async execute(interaction) {
		await pagination.processInteraction(interaction,
			{
				after: 150,
				title: 'Легаси лист',
				getFooter: function (page) {
					return `Страница ${page}`;
				}
			}
		);
	}
};