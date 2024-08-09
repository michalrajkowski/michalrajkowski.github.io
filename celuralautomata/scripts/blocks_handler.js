import { Block, Air, Sand, Iron, Water, Vortex, LivingMatter, Spawner, Cloud, Fish, Meat, Seed, GrowthCone_Bamboo, Bamboo_Up, Bamboo_Flower, KineticBall} from './blocks.js'

export class BlocksHandler {
    static blockDict = {
        0: Air,
        1: Sand,
        2: Iron,
        3: Water,
        4: Cloud, 
        5: Vortex,
        6: LivingMatter,
        7: Spawner,
        8: Fish,
        9: Meat,
        10: Seed,
        11: GrowthCone_Bamboo,
        12: Bamboo_Up,
        13: Bamboo_Flower,
        14: KineticBall,
    };

    // Define a static method to retrieve string for a given number
    static getBlock(number) {
        return this.blockDict[number] 
    }

    static getBlockId(blockName) {
        for (const [key, value] of Object.entries(this.blockDict)) {
            if (value === blockName) {
                return key;
            }
        }
        return null; // Return null if the block is not found
    }
}
