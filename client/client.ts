/**
 * Delay thread for the specified time
 *
 * Must be used in an async function and awaited
 *
 * ```js
 * // e.g.
 * console.log('waiting...');
 * await delay(300);
 * console.log('waited!');
 * ```
 *
 * @param ms number of milliseconds to delay for
 * @returns a promise to await to delay code execution
 */
function delay(ms: number): Promise<CitizenTimer> {
	return new Promise((res) => setTimeout(res, ms, null));
}

/**
 * Helper to convert a string convar to a boolean value, looking for true
 *
 * @param x the convar to parse
 * @returns the parsed value
 */
function isTrueString(x: string): boolean {
	return ['yes', 'true', 'y', '1'].includes(x.toLowerCase());
}

/**
 * Helper to convert a string convar to a boolean value, looking for false
 *
 * @param x the convar to parse
 * @returns the parsed value
 */
// biome-ignore lint/correctness/noUnusedVariables: might be used eventually
function isFalseString(x: string): boolean {
	return ['no', 'false', 'n', '0', ''].includes(x.toLowerCase());
}

/**
 * Convert a convar option name to an internal blip type
 *
 * @see https://github.com/citizenfx/natives/blob/master/HUD/SetBlipCategory.md
 * @param option the option name from the fxmanifest
 * @returns the number associated with the option name
 */
function getBlipCategoryFromOption(option: string): number {
	const asNumber = Number.parseInt(option);

	// Allow using a number for a custom category.
	if (asNumber > 0) {
		l('Numeric blip type configured', option, asNumber);
		return asNumber;
	}

	l('Regular blips type', option, asNumber);

	const options: { [key: string]: number } = {
		other_player: 7,
		regular_with_map_distance: 2,
		regular_no_map_distance: 1,
	};

	const chosen = options[option?.toLowerCase()];

	if (chosen !== undefined) {
		l('Converted string blips type to number', option, asNumber);
		return chosen;
	}

	console.log(`Problem with configured blip type: ${option}`);
	return 7;
}

/**
 * Turn the colour convar into an array of numbers
 *
 * @param option the convar contents
 * @returns the option parsed into a list of integers
 */
function parseBlipColours(option: string): number[] {
	try {
		const colours = option
			.split(',')
			.map((x) => Number.parseInt(x.trim(), 10))
			.filter((x) => x !== null && !Number.isNaN(x));

		if (colours.length === 0) {
			throw new Error('No colours found!');
		}

		console.log(`Initialised blips with ${colours.length} colours:`, colours);

		return colours;
	} catch {
		console.log('Error reading colours, check `virakal_blip_colours` convar.');
		return [25];
	}
}

const BLIP_CATEGORY = getBlipCategoryFromOption(
	GetConvar('virakal_blips_style', ''),
);
const BLIP_COLOURS = parseBlipColours(GetConvar('virakal_blips_colours', '25'));
const BLIP_SIZE = GetConvarInt('virakal_blips_size_percentage', 100) / 100;
const BLIP_SPRITE = GetConvarInt('virakal_blips_sprite', -1);
const BLIP_UPDATE_DELAY = GetConvarInt('virakal_blips_update_ms', 1000);
const LOGGING_ENABLED = isTrueString(
	GetConvar('virakal_blips_debug_log', 'false'),
);
const SHOW_SELF = isTrueString(GetConvar('virakal_blips_show_self', 'false'));

const blips = new Map<number, number>();
const peds = new Map<number, number>();

/**
 * Call console.log if logging is enabled
 *
 * @param messages the messages to log
 */
// biome-ignore lint/suspicious/noExplicitAny: the message can be anything
function l(...messages: any[]): void {
	if (!LOGGING_ENABLED) {
		return;
	}

	for (const message of messages) {
		console.log(message);
	}
}

/**
 * Choose a blip colour for the given player
 *
 * @param playerId the player ID
 * @returns a blip colour for the player
 */
function getBlipColour(playerId: number): number {
	return BLIP_COLOURS[playerId % BLIP_COLOURS.length];
}

/**
 * Create a blip for the given player
 *
 * Also records the player's ped so we can detect if it changed later
 *
 * @param playerId the ID of the player to create the blip for
 * @param ped the player's ped
 * @returns the blip ID
 */
function createPlayerBlip(playerId: number, ped: number): number {
	l(`Creating blip for player ${playerId}, ped ${ped}`);

	const blip = AddBlipForEntity(ped);

	blips.set(playerId, blip);
	peds.set(playerId, ped);

	if (BLIP_SPRITE > -1) {
		SetBlipSprite(blip, BLIP_SPRITE);
	}

	SetBlipScale(blip, BLIP_SIZE);
	SetBlipColour(blip, getBlipColour(playerId));
	SetBlipCategory(blip, BLIP_CATEGORY);
	SetBlipNameToPlayerName(blip, playerId);

	return blip;
}

/**
 * Remove a player's blip
 *
 * @param playerId the player ID to remove the blip for
 * @param blip the blip to remove
 */
function deletePlayerBlip(playerId: number, blip: number): void {
	l(`Deleting blip ${blip} for ${playerId}`);

	RemoveBlip(blip);
	blips.delete(playerId);
}

/**
 * Check if the player's ped has changed since we last recorded it
 *
 * This happens if a player changes to another model, for example.
 *
 * @param playerId the player ID to check for
 * @param ped the player's current ped
 * @returns whether the ped has changed since we last saw it
 */
function pedHasChanged(playerId: number, ped: number): boolean {
	const oldPed = peds.get(playerId);
	return ped !== oldPed;
}

/**
 * Create and remove blips as needed
 */
async function updateBlips(): Promise<void> {
	const playerList = GetActivePlayers();

	l('Got player list', playerList);

	for (const playerId of playerList) {
		const existingBlip = blips.get(playerId);

		if (!SHOW_SELF && playerId === GetPlayerIndex()) {
			// Don't make a blip for ourselves
			l(`skipping ${playerId} because its me!`);

			if (existingBlip) {
				deletePlayerBlip(playerId, existingBlip);
			}

			continue;
		}

		const ped = GetPlayerPed(playerId);
		const pedExists = DoesEntityExist(ped);

		l(`Blip stored for ${playerId} is #${existingBlip}`);
		l(`Player ped for ${playerId} is ${ped}`);
		l(`Ped exists? ${pedExists ? 'y' : 'n'}`);

		if (pedExists && (!existingBlip || pedHasChanged(playerId, ped))) {
			l("Entity exists and we don't have a blip for it yet, or ped changed");
			createPlayerBlip(playerId, ped);
		} else if (existingBlip && !pedExists) {
			l("Entity doesn't exist - remove the blip");
			deletePlayerBlip(playerId, existingBlip);
		} else {
			l('Doing nothing');
		}
	}

	// Wait for the delay time to save on server load
	await delay(BLIP_UPDATE_DELAY);
}

// Run the update blips code on tick
setTick(updateBlips);
