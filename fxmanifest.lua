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
    { 'Blip scale', '$virakal_blips_size_percentage', 'CV_COMBI', 100, 1, 500 }
    { 'Blip type', '$virakal_blips_style', 'CV_MULTI', 100, {
        'other_player',
        'regular_with_map_distance',
        'regular_no_map_distance',
    }}
}

convar_category 'Internal options' {
    'Customise internals',
    {
        { 'Enable debug logging', '$virakal_blips_debug_log', 'CV_BOOL', false },
        { 'Update interval (milliseconds)', '$virakal_blips_update_ms', 'CV_INT', 1000 },
        { 'Show personal blip', '$virakal_blips_show_self', 'CV_BOOL', false },
    }
}
