const Discord = require('discord.js');
const colors = require('colors/safe');
const hooker = require('../../functions/hooker');

module.exports = {
    name: Discord.Events.ClientReady,
    once: true,
    /**
     * Bot's Initialization
     * @param {Discord.Client} client - The Discord client instance
    */
    async execute(client) {
        console.log(colors.green(`Logged in as ${client.user.tag}`));

        try {
            await updateActivity(client);

            setInterval(() => {
                updateActivity(client);
            }, 300000); // 5 minutes interval
        } catch (error) {
            await hooker.commandErrorHooker(client, 'ClientReady Event File', undefined, error);
            console.error(colors.red('An error occurred while setting bot activity:\n', error.stack));
        }
    },
};

/**
 * Function to update the bot's activity
 * @param {Discord.Client} client - The Discord client instance
 */
async function updateActivity(client) {
    const activities = [
        { name: 'Walking in the grass', type: Discord.ActivityType.Playing }
    ];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    try {
        await client.user.setActivity(randomActivity.name, { type: randomActivity.type });
        console.log(colors.blue(`Activity set to: ${randomActivity.name}`));
    } catch (error) {
        await hooker.commandErrorHooker(client, 'ClientReady Event File', 'updateActivity', error);
        console.error(colors.red('An error occurred while setting bot activity:\n', error.stack));
    }
}
