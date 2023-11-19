const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require('discord.js');

const request = require('../../Utils/request')
const embeds = require('../../Utils/embeds')

const PTC_RESPONSE_ERROR = '**Pointercrate API**: страна не имеет статистики по игрокам.'

async function processLeaderboardByCountry(response, confirmation, interaction, collectorFilter) {
    let page = 0;
    const country_code = confirmation.values[0]
    let responseJson = await request.getLeaderboardByCountry(null, country_code)
    if (responseJson.players.length === 0) {
        await confirmation.update(
            {
                content: PTC_RESPONSE_ERROR,
                embeds: [],
                components: [],
                ephemeral: true,
            }
        );
        return
    }

    let message = null;
    try {
        page = 0;
        message = embeds.getLeaderboardCountryEmbed(responseJson.players, page, 
            `${country_code}`.toLowerCase(), responseJson.next);
        await confirmation.update(message);

        while (true) {
            confirmation = await response.awaitMessageComponent(
                {
                    filter: collectorFilter,
                    time: 60000
                }
            );

            let url = null
            if (confirmation.customId === 'back') {
                page--;
                url = responseJson.prev
            } else if (confirmation.customId === 'follow') {
                page++;
                url = responseJson.next
            }

            responseJson = await request.getLeaderboardByCountry(url, country_code)
            if (responseJson.players.length === 0) {
                await confirmation.update(
                    {
                        content: PTC_RESPONSE_ERROR,
                        embeds: [],
                        components: []
                    }
                );
                return
            }
            message = embeds.getLeaderboardCountryEmbed(responseJson.players, page, 
                `${country_code}`.toLowerCase(), responseJson.next);
            await confirmation.update(message);
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

async function execute(interaction) {
    let page = 1;

    try {
        if (interaction instanceof ChatInputCommandInteraction)
            await interaction.deferReply();
        while (true) {
            let response = await interaction.editReply(embeds.getCountryEmbed(page));

            const collectorFilter = i => i.user.id === interaction.user.id;
            let confirmation = await response.awaitMessageComponent(
                {
                    filter: collectorFilter,
                    time: 60000
                }
            );

            if (confirmation.customId === 'back')
                page--;
            else if (confirmation.customId === 'follow')
                page++;
            else if (confirmation.customId === 'country') {
                await processLeaderboardByCountry(response, confirmation, interaction, collectorFilter)
                break;
            }
            await confirmation.update(embeds.getCountryEmbed(page));
        }
    } catch (e) {
        console.log(e)
        try {
            await interaction.editReply(
                {
                    content: 'Страна из меню не выбрана.',
                    embeds: [],
                    components: [],
                    ephemeral: true
                }
            );
        } catch (err) {
            
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('countrystats')
        .setDescription('Показывает топы игрков по странам.'),
    execute
};