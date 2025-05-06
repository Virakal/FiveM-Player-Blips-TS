fx_version 'cerulean'
game 'gta5'

author 'Virakal'
description 'Simple script for adding blips to other players'
version '1.0.0'

fxdk_watch_command 'yarn' {'watch'}
fxdk_build_command 'yarn' {'build'}

client_script 'dist/client.js'
server_script 'dist/server.js'

convar_category 'Blip options' {
    'Customise blip appearance',
    {
        { 'Blip scale', '$virakal_blips_size_percentage', 'CV_COMBI', 100, 1, 500 },
        {
            'Blip colours - separated by a comma - see https://docs.fivem.net/docs/game-references/blips/#blip-colors',
            '$virakal_blips_colours',
            'CV_STRING',
            '7,8,9,10,11,25,26,27,28,29,30,24',
        },
        { 'Blip type', '$virakal_blips_style', 'CV_MULTI', {
            'other_player',
            'regular_with_map_distance',
            'regular_no_map_distance',
        }},
    }
}

convar_category 'Internal options' {
    'Customise internals',
    {
        { 'Enable debug logging', '$virakal_blips_debug_log', 'CV_BOOL', false },
        { 'Update interval (milliseconds)', '$virakal_blips_update_ms', 'CV_INT', 1000 },
        { 'Show personal blip', '$virakal_blips_show_self', 'CV_BOOL', false },
    }
}
