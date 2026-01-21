# Codebase Function Map

## Notes
- Scope: JS source in `index.js`, `bots`, `lib`, `src`, plus patches.
- Text encoding: many strings/comments appear garbled in the current encoding. Refactor: consider UTF-8 normalization.
- Global state is used heavily in `lib/litematicPrinter.js`, `src/mapart.js`, and `bots/*.js`.

## index.js
Purpose: CLI entrypoint, manages bot processes, console commands, and Discord bot.
Functions:
- checkPaths: ensure `logs` and `config/global` directories exist. Refactor: No.
- checkBotValid: validate current bot and child process. Refactor: Maybe (tight coupling to status and logging).
- handleCommand: parse console input and route to bot manager or bot child. Refactor: Yes (large switch, global state, missing var declarations).
- addConsoleEventHandler: wire readline events to command handler and close flow. Refactor: No.
- addMainProcessEventHandler: attach process signal and error handlers. Refactor: Maybe.
- handleClose: stop bots, stop Discord, exit. Refactor: Maybe.
- main: startup flow, init bots from config. Refactor: Maybe.
Inline handlers: readline completer, process `uncaughtException`, `SIGINT`, `SIGTERM`.

## jsMarcros_tabcompleter.js
Purpose: comment-only placeholder. Functions: none. Refactor: Maybe (remove or document).

## lib/containerOperation.js
Purpose: open containers and move items in/out.
Functions:
- openContainerWithTimeout: open a container block with timeout and retry; handles special container UI. Refactor: Yes (nested promise, repeated logic).
- withdraw: withdraw items from container with inventory capacity checks. Refactor: Maybe.
- deposit: deposit items into container with capacity checks. Refactor: Maybe.
- throw_slot: toss an item from a slot, closing windows as needed. Refactor: Maybe.
- name: empty stub. Refactor: Yes (remove or implement).

## lib/mcFallout.js
Purpose: server-specific utility commands (warp, tpc, tab parsing).
Functions:
- getFreeDebugStaff: open chestcommands menu to claim staff items. Refactor: Maybe.
- openPreventSpecItem: swap out "open-prevent" held items to avoid GUI issues. Refactor: Maybe.
- promiseTeleportServer: loop until teleport to target server. Refactor: Maybe (busy loop).
- teleportServer: send `/ts` and wait for server change or profile load. Refactor: Yes (complex flow, fragile regex).
- promiseWarp: wrapper to warp with timeout. Refactor: No.
- waitChangeServer: wait for server change message. Refactor: Maybe.
- waitProfileLoad: empty stub. Refactor: Yes (remove or implement).
- getPlayerServer: run `/glist` and parse which server players are on. Refactor: Maybe.
- rTextNoColor: flatten chat JSON to plain text. Refactor: Maybe.
- warp: send `/warp` and wait for forcedMove. Refactor: Maybe.
- tpc: teleport to land via GUI. Refactor: Maybe.
- sethome: set home and wait for confirmation. Refactor: Maybe.
Inline helpers: profileLoadCheck, lDcheck, itrText, onforcedMove_ (nested).

## lib/pathfinder.js
Purpose: A* flying pathfinder.
Functions:
- pathfinder.astarfly: wrapper that currently delegates to `astarV2`. Refactor: Yes (dead/legacy code retained).
- pathfinder.astarV2: main A* movement loop with target validation and retries. Refactor: Yes (global state, large function).
- astarV2FindPath: compute a short A* path, stop on unload or step limit. Refactor: Yes (performance, readability).
- astarV2Move: move along path by setting position and rate-limiting. Refactor: Maybe (movement side effects).
- getHash: hash a position for node lookup. Refactor: No.
- getRoundPos: round entity position to block coords. Refactor: No.
- movewrong: increment move error counter. Refactor: Maybe (global state).
- deathFlagSet: set death flag. Refactor: Maybe (global state).

## lib/schematic.js
Purpose: load and manage litematic/NBT schematics and bit arrays.
Functions:
- schematic.loadFromFile: dispatch to NBT or litematic loader. Refactor: Maybe.
- schematic.loadFromLitematic: parse litematic and build `sch`. Refactor: Yes (error handling, assumptions).
- schematic.loadFromNbt: parse NBT structure and build `sch`. Refactor: Yes (air palette handling, large logic).
- schematic.newSchematic: create empty `sch`. Refactor: No.
Class sch methods:
- constructor: initialize metadata and bit array. Refactor: Maybe.
- getPaletteIndex: add/find palette entry by block state. Refactor: Maybe (slow JSON compare).
- index: map x/y/z to flat index. Refactor: No.
- vec3: map index to Vec3. Refactor: No (but duplicated formulas).
- setBlock: set block and update total count. Refactor: Yes (out-of-range error, block name logic).
- getBlockPID/getBlockPIDByIndex: return palette index. Refactor: No.
- getBlock/getBlockByIndex: return palette entry. Refactor: No (duplicate name).
- changeMaterial: replace palette entry. Refactor: Maybe.
- toMineflayerID: strip `minecraft:` prefix. Refactor: No.
Class Metadata:
- constructor: compute metadata fields. Refactor: No.
Class LitematicaBitArray methods:
- constructor: init bit array with given bits per entry. Refactor: Maybe.
- setBlock: resize if needed and set entry. Refactor: Yes (size check uses bitsPerEntry, not maxEntryValue).
- setAt/getAt/getBlock: bit packing/unpacking. Refactor: Yes (complex, no bounds check).
- getValueCounts/getBackingLongArray/size: empty stubs. Refactor: Yes (remove or implement).
- resize: rebuild with new bits per entry. Refactor: Yes (uses undefined `nil` and `arraySizeIn`).
Helpers:
- outOfRange, validateInclusiveBetween, getLitematicFirstRegion, litematicParsePalette, nbtParsePalette, unSignedRightShift. Refactor: Maybe.

## lib/station.js
Purpose: restock items from station shulkers.
Functions:
- checkSupport: test if station config supports an item. Refactor: No.
- getIndexOF: find material index in station config. Refactor: No.
- restock: wrapper to oldrestock. Refactor: Yes (dead/duplicate path).
- newrestock: restock items (supports withdraw and deposit). Refactor: Yes (long, nested loops).
- oldrestock: legacy restock logic. Refactor: Yes (duplicate with newrestock).
Nested helper:
- st_restock_single: per-item restock flow. Refactor: Yes.

## lib/litematicPrinter.js
Purpose: build schematics in-game (mapart/building/redstone).
Functions:
- litematicPrinter.build_file: load schematic and dispatch by model. Refactor: Maybe.
- litematicPrinter.build_project: dispatch with preloaded schematic. Refactor: Maybe.
- litematicPrinter.progress_query: return build cache. Refactor: No.
- litematicPrinter.pause/resume/stop: control build loop flags. Refactor: Maybe (global state).
- model_mapart_build: build mapart by palette order. Refactor: Yes (very large, many globals).
- model_mapart_build.updateVisited (inner): mark placed blocks from block updates. Refactor: Yes (nested, relies on outer state).
- model_building_build: build by layers with block state handling. Refactor: Yes (very large).
- model_building_build.updateCheck (inner): update palette state from block updates. Refactor: Yes.
- model_redstone_build: stub (throws). Refactor: Yes (remove or implement).
- placeWithProperties: rotate/place blocks based on block properties. Refactor: Maybe.
- checkBlock: compare world block to palette entry with equivalence list. Refactor: Yes (global lists, partial logic).
- pos_in_box: bounds check. Refactor: No.
- hash_cfg: hash config for cache key. Refactor: No.
- save_cache: write build cache to disk. Refactor: Maybe (async fs usage).
- readConfig: read JSON file. Refactor: Maybe.
Notes: uses many globals (`build_cache`, `pause`, `stop`) and writes to bot inventory directly.

## src/logger.js
Purpose: console and file logger.
Functions:
- logger: format and emit logs, optionally to file. Refactor: Maybe (global stream, no rotation).

## src/commands/basic/index.js
Purpose: registry and init for basic command modules.
Functions:
- init: store bot/logger/mcData in shared context. Refactor: Maybe (avoid mutable shared state).

## src/commands/basic/*.js
Purpose: per-command handlers (test, task list, interact, click, help, ts, plist, info, payall, balance, xp, throw, qt, throwall, say, warp, tpc, find, exit).
Notes:
- Each module exports `{ name, identifiers, execute, longRunning }`. Refactor: Maybe (dedupe reply patterns).

## src/commands/basic/context.js
Purpose: shared context storage for basic commands.
Functions:
- initContext/getContext: set and read bot/logger/mcData. Refactor: Maybe (avoid global state).

## src/commands/basic/reply.js
Purpose: reply helper by source and not-implemented stub.
Functions:
- replyBySource/notImplemented: format responses per source. Refactor: Maybe (share across modules).

## src/mapart.js
Purpose: mapart workflows (build, open, name, copy, wrap).
Functions:
- mapart.init: load per-bot and global mapart configs. Refactor: Yes (global state, IO in init).
- mp_debug: aggregate inventory counts by item name. Refactor: Maybe.
- mp_set: set schematic filename and placement coords. Refactor: Maybe.
- mp_info: report build progress from litematicPrinter. Refactor: Maybe.
- mp_build: main build flow; parses flags, calls litematicPrinter, sends webhook. Refactor: Yes (large, multi-responsibility).
- mp_build.gen_mapartAutoFinishEmbed (inner): build auto-finish embed. Refactor: Yes (nested, heavy formatting).
- mp_build.csafe (inner): parse csafe message. Refactor: Maybe.
- mp_build.gen_mapartFinishEmbed (inner): build finish embed. Refactor: Yes.
- mp_pause/mp_resume/mp_stop: control litematicPrinter. Refactor: No.
- mp_test: restock test. Refactor: Maybe.
- mp_open: build/open mapart frames and maps. Refactor: Yes (very large).
- mp_open.openMap (inner): open and initialize one map at a remote mapart area. Refactor: Yes.
- mp_open.putMapON (inner): place filled maps into frames. Refactor: Yes.
- mp_open.findByMapId (inner): lookup map state by id. Refactor: No.
- mp_open.inv_sort (inner): move map and empty slots to desired slots. Refactor: Maybe.
- mp_open.moveToEmptySlot (inner): move item in slot to first empty slot. Refactor: Maybe.
- mp_open.getEmptySlot (inner): list empty inventory slots. Refactor: No.
- mp_open.getItemFrame (inner): find item frame entity at position. Refactor: Maybe.
- mp_name: rename maps via anvil and place back into frames. Refactor: Yes (very large).
- mp_name.getItemFrame (inner): find item frame at position. Refactor: Maybe.
- mp_material: scan a station wall and build materials list. Refactor: Yes (manual scanning, globals).
- mp_file: write materials JSON to disk. Refactor: Maybe.
- mp_copy: copy maps via cartography table and shulkers. Refactor: Yes (very large).
- mp_copy.getItemFrame (inner): find item frame at position. Refactor: Maybe.
- mp_wrap: wrap items using input/output shulkers. Refactor: Yes (large, marked deprecated in code).
- getMapItemByMapIDInInventory: find a filled map by map id. Refactor: No.
- mapCopy: copy map using cartography table; inner `mapCopyOne`. Refactor: Yes (manual slot edits).
- mapCopy.mapCopyOne (inner): simulate copy output for one map. Refactor: Yes.
- pickMapItem: pick dropped map item by id. Refactor: Maybe.
- save: write mapart config. Refactor: Maybe.
- stationRestock: legacy restock loop; inner `st_restock_single`. Refactor: Yes (duplicate of lib/station).
- taskreply/notImplemented/readConfig: shared helpers. Refactor: Yes (dedupe).

## src/modules/botinstance.js
Purpose: bot process metadata container.
Functions:
- BotInstance.constructor: initialize bot instance fields. Refactor: No.

## src/modules/botmanager.js
Purpose: manage bot child processes and state.
Methods:
- constructor: init bot list, event emitter, profiles. Refactor: Maybe.
- getBotByName/getBotByIndex/getBotNums/getCurrentBot: accessors. Refactor: No.
- getBotInstance: create or return BotInstance. Refactor: Maybe (uses array as map).
- printBotList: pretty-print status table. Refactor: Maybe.
- setCurrentBotByName/setCurrentBotByID: select current bot. Refactor: No.
- setBotStatus/setBotReloadCD/setBotCrtType/setBotChildProcess: setters. Refactor: No.
- deleteBotInstance: remove bot from list. Refactor: Maybe.
- stop: send exit to all children. Refactor: No.
- loadProfiles: load profiles.json with error reporting. Refactor: Maybe.
- registerBotChildProcessEvent: handle child error/exit/messages. Refactor: Yes (large switch, restart logic).
- initBot: validate profile and create bot. Refactor: Yes (mixes validation and creation).
- getBotFilePath: map bot type to script path. Refactor: Yes (hard-coded).
- createBot: fork child and wire handlers. Refactor: Maybe.
- getBotInfo/getBotData: query child for info. Refactor: Maybe (timeouts, error handling).

## src/modules/botstatus.js
Purpose: status constants. Functions: none. Refactor: Maybe (move to enum module).

## src/modules/colors.js
Purpose: placeholder. Functions: none. Refactor: Yes (remove or implement).

## src/modules/exitcode.js
Purpose: exit code constants and messages. Functions: none. Refactor: Maybe (normalize codes).

## src/modules/discordbot.js
Purpose: Discord bot for bot control UI.
Functions:
- DiscordBotStart: set bot manager and connect. Refactor: No.
- DiscordBotStop: set menu to inactive then destroy client. Refactor: Maybe.
- login: login with config token. Refactor: Maybe (error handling).
- addDiscordBotEventHandler: register ready and interaction handlers. Refactor: Yes (large, nested logic).
- getChannelMsgFetch: fetch message by id with error handling. Refactor: No.
- setBotMenuNotInService: disable components and update embed. Refactor: Maybe.
- generateBotMenu: build menu components and embed. Refactor: Maybe.
- generateBotMenuEmbed: build embed listing bots. Refactor: Maybe.
- generateGeneralBotControlMenu: build control panel message. Refactor: Maybe.
- generateGeneralBotControlMenuEmbed: build control panel embed. Refactor: Maybe.
- discordWhiteListCheck: check member whitelist. Refactor: No.
- noPermission: send permission error. Refactor: No.
- notImplemented: send not-implemented response. Refactor: Maybe.

## bots/generalbot.js
Purpose: bootstrap entrypoint for `GeneralBot` with dependency injection.
Functions: none (loads dependencies, constructs `GeneralBot`, starts bot). Refactor: No.

## src/bots/general/GeneralBot.js
Purpose: general bot runtime, task queue, and command dispatch (class-based).
Class:
- GeneralBot.start/createBot/registerBotEvents/handle* methods: lifecycle and event wiring. Refactor: Maybe (file still large).
- Task: task payload container. Refactor: No.
Notes: taskManager/chatManager/mapManager are instance helpers; command resolution is centralized in `resolveCommand`.

## patches/mineflayer@4.18.0.patch
Purpose: disable look packet and bot.lookAt. Refactor: Maybe (document patch usage).

## patches/minecraft-protocol@1.46.0.patch
Purpose: disable keepalive timeout error. Refactor: Maybe (document patch usage).
