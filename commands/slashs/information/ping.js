const Discord = require('discord.js');
const colors = require('colors/safe');

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('ping')
		.setDescription('Mostra a latência atual do bot.'),
	async execute(interaction) {
        try {
			await interaction.reply({ content: '<a:DiscordLoading:1035119091662454836>', fetchReply: true }).then(async (reply) => {
				const ping = reply.createdTimestamp - interaction.createdTimestamp;
				const pingEmbed = new Discord.EmbedBuilder()
					.setColor(0x927867)
					.setTitle('🏓 | Pong!')
					.setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: false, size: 1024, format: 'png' }))
					.addFields(
						{ name: '**Bot Latency**', value: '```ini\n [ ' + ping + 'ms ]\n```', inline: false },
						{ name: '**API Connection Latency**', value: '```ini\n [ ' + Math.round(interaction.client.ws.ping) + 'ms ]\n```', inline: false },
						)
				return await interaction.editReply({ content: '', embeds: [pingEmbed] });
			});
		}
		catch (error) {
			console.log(colors.red('Error while executing /ping command:\n', error.stack));
		}

    },
};