import { Block, Air, Sand, Iron, Water, Vortex, LivingMatter, Spawner, Cloud, Fish, Meat, Seed, GrowthCone_Bamboo, Bamboo_Up, Bamboo_Flower, KineticBall, Bamboo_Chopped, Fire,
Fire_2,Fire_3,Fire_4, Human, Human_2, Pipe_Input_Output, Pipe, Pipe_THICC,
Pipe_UR, Pipe_DR, Pipe_UL, Pipe_DL, Pipe_UD, Pipe_LR, Pipe_NR, Pipe_NL, Pipe_NU, Pipe_ND,
Pipe_UR_THICC, Pipe_DR_THICC, Pipe_UL_THICC, Pipe_DL_THICC, Pipe_UD_THICC, Pipe_LR_THICC, Pipe_NR_THICC, Pipe_NL_THICC, Pipe_NU_THICC, Pipe_ND_THICC,
Totem, IdeaMark, IdeaMark_Thinking} from './blocks.js'

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
        15: Bamboo_Chopped,
        16: Fire,
        17: Fire_2,
        18: Fire_3,
        19: Fire_4,
        20: Human,
        21: Human_2,
        22: Pipe_Input_Output,
        23: Pipe,
        24: Pipe_THICC,
        25: Pipe_UR,
        26: Pipe_DR,
        27: Pipe_UL,
        28: Pipe_DL,
        29: Pipe_UD,
        30: Pipe_LR,
        31: Pipe_NR,
        32: Pipe_NL,
        33: Pipe_NU,
        34: Pipe_ND,
        35: Pipe_UR_THICC,
        36: Pipe_DR_THICC,
        37: Pipe_UL_THICC,
        38: Pipe_DL_THICC,
        39: Pipe_UD_THICC,
        40: Pipe_LR_THICC,
        41: Pipe_NR_THICC,
        42: Pipe_NL_THICC,
        43: Pipe_NU_THICC,
        44: Pipe_ND_THICC,
        45: Totem,
        46: IdeaMark,
        47: IdeaMark_Thinking
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
