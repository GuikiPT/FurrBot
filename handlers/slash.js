const fs = require('fs');
const { promisify } = require('util');
const colors = require('colors/safe');
const hooker = require('../functions/hooker');

// Promisify the fs.readdir and fs.readFile functions
const readdir = promisify(fs.readdir);

/**
 * Function to load and register slash commands for the Discord client.
 * @param {Discord.Client} client - The Discord client instance.
 */
module.exports = async function (client) {
    try {
        // Read all folders in the commands/slashs directory
        const slashFolders = await readdir(__dirname + '/../commands/slashs');

        // Loop through each folder in the commands/slashs directory
        for (const folder of slashFolders) {
            // Read all JavaScript files in the current folder
            const slashFiles = (await readdir(__dirname + `/../commands/slashs/${folder}`)).filter(file => file.endsWith('.js'));
            
            // Loop through each file in the current folder
            for (const file of slashFiles) {
                const slashPath = __dirname + `/../commands/slashs/${folder}/${file}`;
                try {
                    // Import the slash command module
                    const slash = require(slashPath);
                    
                    // Check if the command has required properties
                    if ('data' in slash && 'execute' in slash) {
                        // Register the slash command
                        client.slashCommands.set(slash.data.name, slash);
                        console.log(`Loaded slash command '${slash.data.name}'`);
                    } else {
                        // Log a warning if the command is missing required properties
                        await hooker.commandErrorHooker(client, 'slash handler -> ' + slashPath, 'Loading ' + slashPath + ' file.', `[WARNING] The slash command at ${slashPath} is missing a required "data" or "execute" property.`);
                        console.warn(colors.yellow(`[WARNING] The slash command at ${slashPath} is missing a required "data" or "execute" property.`));
                    }
                } catch (error) {
                    // Log any errors that occur during command registration
                    console.error(colors.red(`Error occurred while loading slash command at ${slashPath}:\n`, error.stack));
                }
            }
        }
    } catch (error) {
        // Log any errors that occur during the loading process
        await hooker.commandErrorHooker(client, 'slash handler loader', 'Loading slash handler file', error);
        console.error(colors.red('Error occurred during slash command loading:\n', error.stack));
    }
};
