import { Block, Air, Sand, Iron, Water, Vortex, LivingMatter, Spawner} from './blocks.js'

export class BlocksHandler {

    static blockDict = {
        0: Air,
        1: Sand,
        2: Iron,
        3: Water,
        4: Vortex,
        5: LivingMatter,
        6: Spawner,
    };

    // Define a static method to retrieve string for a given number
    static getBlock(number) {
        return this.blockDict[number] 
    }
}
