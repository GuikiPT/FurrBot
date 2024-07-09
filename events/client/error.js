const Discord = require('discord.js');
const colors = require('colors/safe');
const hooker = require('../../functions/hooker');

module.exports = {
    name: Discord.Events.Error,
    once: false,
    /**
     * Function to execute when an error event is emitted
     * @param {Error} error - The error object
     */
    async execute(error) {
        // Log the error using hooker for custom error handling
        await hooker.commandErrorHooker(null, 'Error Event File', undefined, error);
        // Output the error stack to the console
        console.error(colors.red(error.stack || error));
    },
};
