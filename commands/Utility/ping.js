const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { EmbedColor } = require('../../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Показывает задержку бота'),
        async execute(interaction, client) {
            const ping = new EmbedBuilder()
                .setTitle(`Пинг бота`)
                .setDescription(`${interaction.client.ws.ping}ms`)
                .setColor(EmbedColor);
            await interaction.reply({ embeds: [ping] });
        },
};