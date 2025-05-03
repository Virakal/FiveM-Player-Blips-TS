console.log("[virakal-player-blips] Client Resource Started.");

function Delay(ms: number): Promise<CitizenTimer> {
    return new Promise(res => setTimeout(res, ms, null));
}

const BLIP_UPDATE_DELAY = 1000;
const BLIP_CULL_DELAY = 10000;
const BLIP_SIZE = 1;
const BLIP_COLOUR = 25; // green
const BLIP_CATEGORY = 7; // other player blip
const DEBUG_LOG = true;

const blips: Map<number, number> = new Map();

function l(...messages: any[]) {
    if (!DEBUG_LOG) {
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
    SetBlipNameToPlayerName(blip, playerId);
    SetBlipScale(blip, BLIP_SIZE);
    SetBlipColour(blip, BLIP_COLOUR);
    SetBlipCategory(blip, BLIP_CATEGORY);

    return blip;
}

function deleteBlip(playerId: number, blip: number) {
    l(`Deleting blip ${blip} for ${playerId}`);

    RemoveBlip(blip);
    blips.delete(playerId);
}

async function updateBlips() {
    const playerList = GetActivePlayers();

    l('Got player list', playerList);
    
    for (const playerId of playerList) {
        if (playerId === GetPlayerIndex()) {
            // Don't make a blip for ourselves
            l(`skipping ${playerId} because its me!`);
            continue;
        }
        
        const existingBlip = blips.get(playerId);
        const ped = GetPlayerPed(playerId);
        const pedExists = DoesEntityExist(ped);

        l(`Blip stored for ${playerId} is #${existingBlip}`);
        l(`Player ped for ${playerId} is ${ped}`);
        l(`Ped exists? ${pedExists ? 'y' : 'n'}`);

        if (!existingBlip && pedExists) {
            // Entity exists and we don't have a blip for it yet
            createBlip(playerId, ped);
            l('Entity exists and we don\'t have a blip for it yet');
        } else if (existingBlip && !pedExists) {
            // Entity doesn't exist - remove the blip
            l('Entity doesn\'t exist - remove the blip');
            deleteBlip(playerId, existingBlip);
        }
    }

    await Delay(BLIP_UPDATE_DELAY);
}

async function cullBlips() {
    l(`Culling blip list`, blips);

    for (const [playerId, blip] of blips.entries()) {
        const ped = GetPlayerPed(playerId);

        l(`Maybe culling player ${playerId} with blip ${blip} on ped ${ped}`);

        if (!DoesEntityExist(ped)) {
            l(`Yes, culling ${ped} blip ${blip} for ${playerId}`);
            deleteBlip(playerId, blip);
        } else {
            l(`No, not culling ${ped} blip ${blip} for ${playerId}`);
        }
    }

    await Delay(BLIP_CULL_DELAY);
}

setTick(updateBlips);
setTick(cullBlips);