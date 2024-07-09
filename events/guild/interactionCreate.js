const Discord = require('discord.js');
const colors = require('colors/safe');
const hooker = require('../../functions/hooker');

module.exports = {
    name: Discord.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            const command = await interaction.client.slashCommands.get(interaction.commandName);
    
            if (!command) return;
    
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                await hooker.commandErrorHooker(interaction.client, 'InteractionCreate Event File', undefined, error);
                console.error(colors.red(error.stack || error));
            }
        }
        if (interaction.isChatInputCommand()) {
            const command = await interaction.client.slashCommands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                await hooker.commandErrorHooker(interaction.client, 'InteractionCreate Event File', undefined, error);
                console.error(colors.red(error.stack || error));
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    },
};