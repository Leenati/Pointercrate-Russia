const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    MessageComponentInteraction
} = require('discord.js');

const request = require('../../Utils/request');
const embeds = require('../../Utils/embeds');

const PTC_RESPONSE_ERROR = 'Pointercrate API: при попытке получить топ игроков произошла ошибка.'

async function respondInteraction(interaction, page) {
    const responseData = await request.getResponseJSON(`api/v1/players/ranking/?limit=25&after=${25 * (page - 1)}`);
    let result = null;
    let responseError = null;
    let messageEmbed = null;
    if (!(responseData instanceof Error)) {
        const rankingData = await embeds.getRankingEmbed(responseData, page);
        messageEmbed = rankingData.message;
        if (rankingData.content != null) {
            responseError = rankingData.content;
        } else if (interaction instanceof MessageComponentInteraction) {
            await interaction.update(messageEmbed);
        } else {
            result = await interaction.editReply(messageEmbed);
        }
    }
    else
        responseError = PTC_RESPONSE_ERROR;
    return {
        interaction: result,
        error: responseError,
        message: messageEmbed
    }
}

async function execute(interaction) {
    let pageNumber = interaction.options.getInteger('page', false);
    let page = 1;

    const collectorFilter = interaction => interaction.user.id === interaction.user.id;

    if (pageNumber != null && pageNumber != undefined) {
        page = pageNumber;
        if (page <= 0) {
            page = 1;
        }
    }
    if (interaction instanceof ChatInputCommandInteraction)
        await interaction.deferReply();

    let message = null;
    let response = await respondInteraction(interaction, page);
    if (response.error != null) {
        await interaction.editReply(response.error);
    } else {
        try {
            message = response.message;
            while (true) {
                const confirmation = await response.interaction.awaitMessageComponent(
                    {
                        filter: collectorFilter,
                        time: 60000
                    }
                );
                if (confirmation.customId === 'back')
                    page--;
                else if (confirmation.customId === 'follow')
                    page++;
                const updateResponse = await respondInteraction(confirmation, page);
                if (updateResponse.error != null) {
                    await confirmation.update(
                        {
                            content: updateResponse.error,
                            embeds: [],
                            components: []
                        }
                    );
                    break;
                }
                else
                    message = updateResponse.message;
            }
        } catch (e) {
            console.log(e);
            try {
                await interaction.editReply(
                    {
                        embeds: [message.embeds[0]],
                        components: []
                    }
                );
            } catch (err) {
                
            }
        }
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ranking')
		.setDescription('Показывает топ игроков.')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Номер страницы. (По 15 игроков на страницу)')),
	execute
};