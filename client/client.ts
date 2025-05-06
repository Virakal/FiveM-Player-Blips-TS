function delay(ms: number): Promise<CitizenTimer> {
    return new Promise(res => setTimeout(res, ms, null));
}

function isTrueString(x: string) {
    return ['yes', 'true', 'y', '1'].includes(x.toLowerCase());
}

function isFalseString(x: string) {
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
    const options: { [key: string]: number } = {
        other_player: 7,
        regular_with_map_distance: 2,
        regular_no_map_distance: 1,
    };

    return options[option?.toLowerCase()] ?? 7;
}

function parseBlipColours(option: string): number[] {
    try {
        const colours = option.split(',')
            .map((x) => Number.parseInt(x.trim(), 10))
            .filter((x) => x !== null && !isNaN(x));

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

const BLIP_CATEGORY = getBlipCategoryFromOption(GetConvar('virakal_blips_style', ''));
const BLIP_COLOURS = parseBlipColours(GetConvar('virakal_blips_colours', '25'));
const BLIP_SIZE = GetConvarInt('virakal_blips_size_percentage', 100) / 100;
const BLIP_UPDATE_DELAY = GetConvarInt('virakal_blips_update_ms', 1000);
const LOGGING_ENABLED = isTrueString(GetConvar('virakal_blips_debug_log', 'false'));
const SHOW_SELF = isTrueString(GetConvar('virakal_blips_show_self', 'false'));

const blips = new Map<number, number>();
const peds = new Map<number, number>();

function l(...messages: any[]) {
    if (!LOGGING_ENABLED) {
        return;
    }

    for (const message of messages) {
        console.log(message);
    }
}

function getBlipColour(playerId: number): number {
    return BLIP_COLOURS[playerId % BLIP_COLOURS.length];
}

function createBlip(playerId: number, ped: number): number {
    l(`Creating blip for player ${playerId}, ped ${ped}`);

    const blip = AddBlipForEntity(ped);

    blips.set(playerId, blip);
    peds.set(playerId, ped);

    SetBlipNameToPlayerName(blip, playerId);
    SetBlipScale(blip, BLIP_SIZE);
    SetBlipColour(blip, getBlipColour(playerId));
    SetBlipCategory(blip, BLIP_CATEGORY);

    return blip;
}

function deleteBlip(playerId: number, blip: number) {
    l(`Deleting blip ${blip} for ${playerId}`);

    RemoveBlip(blip);
    blips.delete(playerId);
}

function pedHasChanged(playerId: number, ped: number): boolean {
    const oldPed = peds.get(playerId);
    return ped !== oldPed;
}

async function updateBlips() {
    const playerList = GetActivePlayers();

    l('Got player list', playerList);

    for (const playerId of playerList) {
        const existingBlip = blips.get(playerId);

        if (!SHOW_SELF && playerId === GetPlayerIndex()) {
            // Don't make a blip for ourselves
            l(`skipping ${playerId} because its me!`);

            if (existingBlip) {
                deleteBlip(playerId, existingBlip);
            }

            continue;
        }

        const ped = GetPlayerPed(playerId);
        const pedExists = DoesEntityExist(ped);

        l(`Blip stored for ${playerId} is #${existingBlip}`);
        l(`Player ped for ${playerId} is ${ped}`);
        l(`Ped exists? ${pedExists ? 'y' : 'n'}`);

        if (
            pedExists
            && (!existingBlip || pedHasChanged(playerId, ped))
        ) {
            l('Entity exists and we don\'t have a blip for it yet, or ped changed');
            createBlip(playerId, ped);
        } else if (existingBlip && !pedExists) {
            l('Entity doesn\'t exist - remove the blip');
            deleteBlip(playerId, existingBlip);
        } else {
            l('Doing nothing');
        }
    }

    await delay(BLIP_UPDATE_DELAY);
}

setTick(updateBlips);
