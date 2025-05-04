console.log("[virakal-player-blips] Client Resource Started.");

function Delay(ms: number): Promise<CitizenTimer> {
    return new Promise(res => setTimeout(res, ms, null));
}

function isTrueString(x: string) {
    return ['yes', 'true', 'y', '1'].includes(x.toLowerCase());
}

function isFalseString(x: string) {
    return ['no', 'false', 'n', '0', ''].includes(x.toLowerCase());
}

const BLIP_UPDATE_DELAY = GetConvarInt('virakal_blips_update_ms', 1000);
const BLIP_SIZE = GetConvarInt('virakal_blips_size_percentage', 100) / 100;
const BLIP_COLOUR = 25; // green
const BLIP_CATEGORY = 7; // other player blip

const blips: Map<number, number> = new Map();
const peds: Map<number, number> = new Map();

function l(...messages: any[]) {
    if (!isTrueString(GetConvar('virakal_blips_debug_log', 'false'))) {
        return;
    }

    for (const message of messages) {
        console.log(message);
    }
}

function createBlip(playerId: number, ped: number): number {
    l(`Creating blip for player ${playerId}, ped ${ped}`);

    const blip = AddBlipForEntity(ped);

    blips.set(playerId, blip);
    peds.set(playerId, ped);

    SetBlipNameToPlayerName(blip, playerId);
    SetBlipScale(blip, BLIP_SIZE);
    SetBlipColour(blip, BLIP_COLOUR + (playerId % 4));
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
    const showSelf = isTrueString(GetConvar('virakal_blips_show_self', 'false'));

    l('Got player list', playerList);

    for (const playerId of playerList) {
        const existingBlip = blips.get(playerId);

        if (!showSelf && playerId === GetPlayerIndex()) {
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
            // Entity exists and we don't have a blip for it yet, or the ped had changed
            l('Entity exists and we don\'t have a blip for it yet, or ped changed');
            createBlip(playerId, ped);
        } else if (existingBlip && !pedExists) {
            // Entity doesn't exist - remove the blip
            l('Entity doesn\'t exist - remove the blip');
            deleteBlip(playerId, existingBlip);
        } else {
            l('Doing nothing');
        }
    }

    await Delay(BLIP_UPDATE_DELAY);
}

setTick(updateBlips);
