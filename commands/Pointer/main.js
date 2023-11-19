const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../Utils/embeds');
const request = require('../../Utils/request');
const pagination = require('../../Utils/pagination');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('main')
		.setDescription('Мейн лист демонов (1 - 75)'),
	async execute(interaction) {
		await pagination.processInteraction(interaction,
			{
				after: 0,
				title: 'Мейн лист',
				getFooter: function (page) {
					return `Страница ${page} из 3`;
				}
			}
		);
	}
};