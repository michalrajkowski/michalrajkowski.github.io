import { Block, Air, Sand, Iron, Water} from './blocks.js'

export class BlocksHandler {

    static blockDict = {
        0: Air,
        1: Sand,
        2: Iron,
        3: Water,
    };

    // Define a static method to retrieve string for a given number
    static getBlock(number) {
        return this.blockDict[number] 
    }
}
