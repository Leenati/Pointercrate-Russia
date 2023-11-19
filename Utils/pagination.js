const { ChatInputCommandInteraction, MessageComponentInteraction } = require('discord.js');

const embeds = require('./embeds');
const request = require('./request');

const PTC_RESPONSE_ERROR = 'Pointercrate API: при запросе информации с сервера произошла ошибка.'

async function respondInteraction(interaction, page, after, title, footer) {
    const responseData = await request.getResponseJSON(`api/v2/demons/listed?limit=25&after=${(25 * (page - 1)) + after }`);
    let result = null;
    let responseError = null;
    let messageEmbed = null;
    if (!(responseData instanceof Error)) {
        messageEmbed = await embeds.getDemonlistEmbed(responseData.data, page, title, footer, after === 150);
        if (interaction instanceof MessageComponentInteraction) {
            await interaction.update(messageEmbed);
        } else {
            result = await interaction.editReply(messageEmbed);
        }
    }
    else
        responseError = responseData;
    return {
        interaction: result,
        error: responseError, 
        message: messageEmbed
    }
}

async function processInteraction(interaction, info) {
    let page = 1;
    const collectorFilter = interaction => interaction.user.id === interaction.user.id;

    if (interaction instanceof ChatInputCommandInteraction)
        await interaction.deferReply();

    let message = null;
    let response = await respondInteraction(interaction, page, info.after, info.title, info.getFooter(page));
    if (response.error != null) {
        await interaction.editReply(PTC_RESPONSE_ERROR);
    } else {
        try {
            message = response.message;
            while (true) {
                const confirmation = await response.interaction.awaitMessageComponent(
                    {
                        filter: collectorFilter,
                        time: 60000
                    });
                if (confirmation.customId === 'back')
                    page--;
                else if (confirmation.customId === 'follow')
                    page++;
                const updateResponse = await respondInteraction(confirmation, page, info.after, info.title, info.getFooter(page));
                if (updateResponse.error != null) {
                    await confirmation.update(
                        {
                            content: PTC_RESPONSE_ERROR,
                            embeds: [],
                            components: []
                        });
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

module.exports = { processInteraction }