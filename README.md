# ServerMods

A collection of mods for the Screeps server that allow you to get up and running faster.

Designed to allow you to skip straight to fully built rooms and test your code (eg military code) with friends & allies.

### fillStorage.js
Keeps all storages at a constant level with enough energy & minerals to be going on with.
All deposited resources are lost (levels are kept constant)

### gcl20.js
All players are always GCL20.

### instantConstructions.js
Construction sites finish the same tick that they are placed.

### instantRCL8.js
All room controllers instantly upgrade to RCL8.

### noNukerCooldown.js
Nukers have zero cooldown and are always ready to fire.

### safeMode.js
Infinite safemode activations with no cooldown.

### quickSpawn.js (WIP)
Spawning creeps takes 1 tick only.

### creepCommands.js (WIP)
A collection of commands that can be used to control many aspects of the current room. Any creep present can .say commands to:

   * Repair arbitrary structures by arbitrary amounts
   * Upgrade/Downgrade the current room's controller by a given amount (WIP)
   * Activate/Deactivate safemode, change/reset cooldown, change number of activiations (WIP)
   * Destroy creeps/structures at position
   * Force a mineral to regen or change type (any type, incl T3)
   * Boost a creep at position with any mineral (WIP)
   * Spawn invaders, optionally boosted (WIP)
   * Fill a structure or creep with a specific resource (WIP)
   * Instantly fill all towers in room
   * Instantly fill all spawns & extensions in room
   * Adjust the hits of all walls at once (eg set to 300m, 10k, etc)
   
