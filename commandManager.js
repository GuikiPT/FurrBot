const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const colors = require('colors/safe');
const moment = require('moment');
const prompt = require('prompt');
require('dotenv').config({});
require('better-logging')(console, {
    format: ctx => `${colors.gray(`[${moment().format('HH:mm:ss')}]`)} ${colors.gray(`[${moment().format('DD/MM/YYYY')}]`)} ${ctx.type} » ${ctx.msg}`,
    saveToFile: __dirname + `/logs/slash-deployer/${moment().format('YYYY')}/${moment().format('MM')}/${moment().format('DD')}.log`,
    color: {
        base: colors.gray,
        type: {
            debug: colors.green,
            info: colors.blue,
            log: colors.white,
            error: colors.red,
            warn: colors.yellow,
        },
    },
});

// Check if BotToken exists
if (!process.env.BotToken) {
    console.error(colors.red('BotToken is missing in the environment variables.'));
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await promptUser();
    await client.destroy();
    process.exit(0);
});

// Function to load commands from the commands folder
async function loadCommands() {
    const commands = [];
    const slashFolders = fs.readdirSync(__dirname + '/commands/slashs');
    for (const folder of slashFolders) {
        const slashFiles = fs.readdirSync(__dirname + `/commands/slashs/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of slashFiles) {
            const slash = require(__dirname + `/commands/slashs/${folder}/${file}`);
            if ('data' in slash && 'execute' in slash) {
                commands.push(slash.data.toJSON());
            } else {
                console.info(`[WARNING] The command ${slash.data} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
}

// Function to register commands
async function registerCommands(guildId = null) {
    const commands = await loadCommands();
    const rest = new REST({ version: '10' }).setToken(process.env.BotToken);

    try {
        if (guildId) {
            console.log(`Started refreshing ${commands.length} guild-specific (/) commands.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} guild-specific (/) commands.`);
        } else {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        }
    } catch (error) {
        console.error(colors.red('An error occurred while registering commands:\n', error.stack));
    }
}

// Function to delete a single command
async function deleteSingleCommand(commandName, guildId = null) {
    const rest = new REST({ version: '10' }).setToken(process.env.BotToken);

    try {
        const commands = guildId 
            ? await rest.get(Routes.applicationGuildCommands(client.user.id, guildId))
            : await rest.get(Routes.applicationCommands(client.user.id));

        const command = commands.find(cmd => cmd.name === commandName);
        if (!command) {
            console.log(`No command found with name: ${commandName}`);
            return;
        }

        const route = guildId 
            ? Routes.applicationGuildCommand(client.user.id, guildId, command.id)
            : Routes.applicationCommand(client.user.id, command.id);

        await rest.delete(route);
        console.log(`Successfully deleted command: ${commandName}`);
    } catch (error) {
        console.error(colors.red('An error occurred while deleting the command:\n', error.stack));
    }
}

// Function to delete all commands
async function deleteAllCommands(guildId = null) {
    const rest = new REST({ version: '10' }).setToken(process.env.BotToken);

    try {
        if (guildId) {
            await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
            console.log('Successfully deleted all guild-specific application commands.');
        } else {
            await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
            console.log('Successfully deleted all application commands.');
        }
    } catch (error) {
        console.error(colors.red('An error occurred while deleting all commands:\n', error.stack));
    }
}

// Function to prompt user for action
async function promptUser() {
    prompt.start();

    const { action } = await prompt.get({
        name: 'action',
        description: 'What would you like to do? (registerGlobal, registerTestGuild, deleteSingleGlobal, deleteSingleTestGuild, deleteAllGlobal, deleteAllTestGuild)',
        required: true
    });

    let commandName;
    if (action.startsWith('deleteSingle')) {
        const response = await prompt.get({
            name: 'commandName',
            description: 'Enter the command name to delete (if applicable):',
            required: true
        });
        commandName = response.commandName;
    }

    let guildId;
    if (action.endsWith('TestGuild')) {
        const response = await prompt.get({
            name: 'guildId',
            description: 'Enter the test guild ID:',
            required: true
        });
        guildId = response.guildId;
    }

    if (action === 'registerGlobal') {
        await registerCommands();
    } else if (action === 'registerTestGuild') {
        await registerCommands(guildId);
    } else if (action === 'deleteSingleGlobal') {
        await deleteSingleCommand(commandName);
    } else if (action === 'deleteSingleTestGuild') {
        await deleteSingleCommand(commandName, guildId);
    } else if (action === 'deleteAllGlobal') {
        const confirm = await prompt.get({
            name: 'confirmDelete',
            description: 'Are you sure you want to delete all global commands? (yes/no)',
            required: true
        });
        if (confirm.confirmDelete.toLowerCase() === 'yes') {
            await deleteAllCommands();
        } else {
            console.log(colors.green('Deletion of all global commands canceled.'));
        }
    } else if (action === 'deleteAllTestGuild') {
        const confirm = await prompt.get({
            name: 'confirmDelete',
            description: 'Are you sure you want to delete all test guild commands? (yes/no)',
            required: true
        });
        if (confirm.confirmDelete.toLowerCase() === 'yes') {
            await deleteAllCommands(guildId);
        } else {
            console.log(colors.green('Deletion of all test guild commands canceled.'));
        }
    } else {
        console.log(colors.yellow('Invalid action specified.'));
    }
}

client.login(process.env.BotToken);