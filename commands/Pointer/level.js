const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} = require('discord.js');

const request = require('../../Utils/request');
const embed = require('../../Utils/embeds');
const utils = require('../../Utils/utils');

const COUNT_LIST_ELEMENTS = 15;

function getDemonPosition(pos) {
	return `\`${`${pos}`.padStart(2, '0')}\``
}

function getListEmbed(demons, begin) {
	let description = '';
	let list_count = 0;

	const comboBox = new StringSelectMenuBuilder()
		.setCustomId('demon')
		.setPlaceholder('Выберите демон')

	for (let i = begin; i < demons.length && i < begin + COUNT_LIST_ELEMENTS; i++) {
		const demon = demons[i];
		list_count++;
		description += `${getDemonPosition(i + 1)} - ${demon.name} *от ${demon.publisher.name}*\n`;
		comboBox.addOptions(new StringSelectMenuOptionBuilder()
			.setLabel(`${demon.name} от ${demon.publisher.name}`)
			.setValue(`${i}`)
		);
	}

	const listEmbed = new EmbedBuilder()
		.setColor(0x2F3136)
		.setAuthor(embed.author)
		.setTitle('Demons')
		.setDescription(description)
		.setTimestamp()
		.setFooter({ text: `Pointercrate Russia` });

	let buttonsComponent = new ActionRowBuilder();
	if (demons.length > COUNT_LIST_ELEMENTS) {
		const backButton = new ButtonBuilder()
			.setCustomId('back')
			.setLabel('←')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(begin < COUNT_LIST_ELEMENTS)
		const followButton = new ButtonBuilder()
			.setCustomId('follow')
			.setLabel('→')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(list_count < COUNT_LIST_ELEMENTS || begin + COUNT_LIST_ELEMENTS >= demons.length)

		buttonsComponent.addComponents(backButton, followButton);
	}

	let comboboxComponent = new ActionRowBuilder();
	comboboxComponent.addComponents(comboBox);

	return buttonsComponent.components.length == 0 ?
		{
			embeds: [listEmbed],
			components: [comboboxComponent]
		} :
		{
			embeds: [listEmbed],
			components: [buttonsComponent, comboboxComponent]
		}
}

async function getDemonJSON(value) {
	let query = (typeof value === 'number') ? `api/v2/demons/listed?limit=1&after=${--value}` :
		`api/v2/demons/?name_contains=${value.trim().toLowerCase().replace(' ', '+')}`;
	const responseData = await request.getResponseJSON(query);
	if (responseData instanceof Error) {
		return {
			error: true
		}
	} else {
		return {
			error: false,
			data: responseData.data
		}
	}
}

async function waitResponseMessage(interaction, demonJson) {
	let begin = 0;
	let response = await interaction.editReply(getListEmbed(demonJson.data, begin));
	try {
		while (true) {
			const collectorFilter = i => i.user.id === interaction.user.id;
			let confirmation = await response.awaitMessageComponent(
				{
					filter: collectorFilter,
					time: 60000
				}
			);

			if (confirmation.customId === 'back') {
				begin -= COUNT_LIST_ELEMENTS;
			} else if (confirmation.customId === 'follow') {
				begin += COUNT_LIST_ELEMENTS;
			} else if (confirmation.customId === 'demon') {
				await confirmation.update(await embed.getDemonEmbed(demonJson.data[parseInt(confirmation.values[0])]))
				break;
			}
			await confirmation.update(getListEmbed(demonJson.data, begin))
		}
	} catch (e) {
		console.log(e)
		try {
			await interaction.editReply(
				{
					content: 'Игрок в меню не выбран.',
					embeds: [],
					components: [],
					ephemeral: true
				}
			);
		} catch (err) {
			
		}
	}
}

async function responseMessage(interaction, option) {
	let demonJson = await getDemonJSON(option)
	if (demonJson.error || 'message' in demonJson.data /* response error */) {
		await interaction.editReply('**Pointercrate API**: при запросе информации об уровне произошла ошибка.')
	} else if (demonJson.data.length === 1) {
		await interaction.editReply(await embed.getDemonEmbed(demonJson.data[0]))
	} else if (demonJson.data.length === 0) {
		await interaction.editReply('**Pointercrate API**: название или позиция уровня не существует.')
	} else {
		await waitResponseMessage(interaction, demonJson)
	}
}

async function getUserInputOption(interaction) {
	let option = interaction.options.getString('name', false);
	if (utils.isNullOrUndefined(option)) {
		option = interaction.options.getInteger('position', false)
		if (!utils.isNullOrUndefined(option) && option < 0) {
			option = 1;
		}
	}
	return option;
}

async function execute(interaction) {
	const option = await getUserInputOption(interaction);
	if (utils.isNullOrUndefined(option)) {
		await interaction.reply(`Вы ввели не все значения.`);
	} else {
		try {
			if (interaction instanceof ChatInputCommandInteraction)
				await interaction.deferReply();
			await responseMessage(interaction, option)
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Информация о уровне по его поцизии / названию.')
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('Позиция уровня (1 - 200)'))
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Название уровня')),
	execute
};