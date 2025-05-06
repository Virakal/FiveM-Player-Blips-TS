# Virakal Player Blips

A simple resource for [FiveM](https://fivem.net/) written in [TypeScript](https://www.typescriptlang.org/) that adds map blips to all players.

## I Can't See Everybody

Currently, with [OneSync: Infinity](https://docs.fivem.net/docs/scripting-reference/onesync/) enabled this script can only add blips for users near to you. Set onesync to `legacy` or `off` to see everybody on the map but make sure you understand the implications of doing so!

## Options

The script is configured using [convars](https://docs.fivem.net/docs/scripting-reference/convars/). These can be changed in `server.cfg` using the `setr` command, e.g.
```lua
setr virakal_blips_colours 14,15,15
```
and sometimes through your admin control panel.

You will need to restart the resource with `restart virakal-player-blips` for the changes to take effect.

### Blip Scale
> `virakal_blips_size_percentage`

Default: `100`

Adjust the scale of the blips. 100% by default - i.e. normal size. Do not include the % sign.

### Blip Colours
> `virakal_blips_colours`

Default: `7,8,9,10,11,25,26,27,28,29,30,24`

A comma-separated list of colour IDs to select from. You can get the IDs from [the FiveM docs](https://docs.fivem.net/docs/game-references/blips/#blip-colors).

If you want all blips to be the same colour, just set one number with no commas.

### Blip Type
> `virakal_blips_style`

The type of blip determines how the blip shows on the list on the right-hand side of the full map. By default it uses the other player category which works the same as GTA: Online.

Other options are `regular_with_map_distance` which shows the players like regular blips, e.g. the barbers, but shows the distance to them.

`regular_no_map_distance` is the same as the above but with no distance.

Default: `other_player`

### Blip Sprite
> `virakal_blips_sprite`

Override the sprite used by the blip. The sprites can be found in the [FiveM docs](https://docs.fivem.net/docs/game-references/blips/#blips).

Setting it to `-1` uses the default logic, which is a regular circle which shows an up or down arrow if the player is above or below you.

Default: `-1`

### Others

Check the [fxmanifest](fxmanifest.lua) for all configuration options.

## Other Languages

I have older versions made in [C#](https://github.com/Virakal/FiveM-Player-Blips-CS) and [Lua](https://github.com/Virakal/FiveM-Player-Blips).
