const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, EmbedBuilder } = require('discord.js');
const hooker = require('../../../functions/hooker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays the avatar of a user.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user whose avatar you want to display')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether the response should be ephemeral')
                .setRequired(false)),
                
    /**
     * Executes the avatar command.
     * @param {CommandInteraction} interaction - The interaction that triggered the command.
     */
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const ephemeral = interaction.options.getBoolean('ephemeral') || false;
        
        try {
            // Acknowledge the interaction immediately
            await interaction.deferReply({ ephemeral: ephemeral });

            // Force fetch the user to get the latest data
            const fetchedUser = await interaction.client.users.fetch(targetUser.id, { force: true });
            const avatarUrl = fetchedUser.displayAvatarURL({ dynamic: true, size: 1024 });
            const accentColor = fetchedUser.hexAccentColor || '#0099ff'; // Fallback color if accent color is not set

            // Create an embed with the avatar
            const avatarEmbed = new EmbedBuilder()
                .setColor(accentColor)
                .setTitle(`${fetchedUser.username}'s Avatar`)
                .setImage(avatarUrl)
                .setTimestamp();

            // Edit the deferred reply with the embed
            await interaction.editReply({ embeds: [avatarEmbed] });
        } catch (error) {
            console.error(`Error occurred while executing /avatar command:`, error.stack);
            await hooker.commandErrorHooker(interaction.client, 'avatar', 'Executing avatar command', error);
            await interaction.editReply({
                content: 'There was an error executing this command. Please try again later.',
                ephemeral: true
            });
        }
    },
};
