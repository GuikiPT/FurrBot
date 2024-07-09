const fs = require('fs');
const colors = require('colors/safe');
const hooker = require('../functions/hooker');

/**
 * Function to load and register events for the Discord client.
 * @param {Discord.Client} client - The Discord client instance.
 */
module.exports = async function (client) {
    // Read all folders in the events directory
    const eventFolders = fs.readdirSync(__dirname + '/../events');

    // Loop through each folder in the events directory
    for (const folder of eventFolders) {
        // Read all JavaScript files in the current folder
        const eventFiles = fs.readdirSync(__dirname + `/../events/${folder}`).filter(file => file.endsWith('.js'));
        
        // Loop through each file in the current folder
        for (const file of eventFiles) {
            // Import the event module
            const event = require(__dirname + `/../events/${folder}/${file}`);
            
            // Check if the event should be triggered once or multiple times
            if (event.once) {
                try {
                    // Register a one-time event listener
                    client.once(event.name, (...args) => event.execute(...args));
                    console.log(`Loaded event '${event.name}' (once)`);
                } catch (error) {
                    // Handle any errors that occur during event registration
                    await hooker.commandErrorHooker(client, 'event handler -> ' + event.name, 'Loading ' + event.name + ' file.', error);
                    console.error(colors.red(`Error occurred while loading event '${event.name}' (once):`, error.stack));
                }
            } else {
                try {
                    // Register a recurring event listener
                    client.on(event.name, (...args) => event.execute(...args));
                    console.log(`Loaded event '${event.name}'`);
                } catch (error) {
                    // Handle any errors that occur during event registration
                    await hooker.commandErrorHooker(client, 'event handler loader', 'Loading event handler file', error);
                    console.error(colors.red(`Error occurred while loading event '${event.name}':`, error.stack));
                }
            }
        }
    }
};
