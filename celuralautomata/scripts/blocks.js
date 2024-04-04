import { Simulation } from "./simulation.js"
import { BlocksHandler } from "./blocks_handler.js"
export { Block, Air, Sand, Iron, Water, Cloud, Vortex, LivingMatter, Spawner}
class Block{
    static letter_symbol = "X"
    static letter_color = "#ffffff"
    static block_name = "basic block"
    static block_desc = "basic block description"
    static can_be_swaped = false
    static density = 0

    static getLetterSymbol(){
        return this.letter_symbol
    }

    static simulateBlock(x, y, grid){
        
    }
}

class Air extends Block{
    static letter_symbol = "."
    static can_be_swaped = true
    static block_name = "Air"
    static block_desc = "Blank space"
    static density = 0
    static simulateBlock(x, y, grid){
        
    }
}

class Iron extends Block{
    static letter_symbol = "#"
    static letter_color = "#999999"
    static can_be_swaped = false
    static block_name = "Iron"
    static block_desc = "Can not move. Blocks other blocks"
    static density = 999
    static simulateBlock(x, y, grid){
        
    }
}

class Sand extends Block{
    static letter_symbol = "S"
    static letter_color = "#ffff00"
    static block_name = "Sand"
    static block_desc = "Falls with gravity"
    static density = 500
    static can_be_swaped = true

    
    static tryMove(o_x,o_y, n_x, n_y,grid){
        if (!Simulation.isInGrid(n_x, n_y, grid)){
            return false;
        }
        // get element
        const this_cell = grid[n_y][n_x];
        const this_block = BlocksHandler.getBlock(this_cell.blockId);
        const original_cell = grid[o_y][o_x];
        const original_block = BlocksHandler.getBlock(original_cell.blockId);

        if (!this_block.can_be_swaped){
            return false;
        }

        //compare density
        //compare density
        if (!(this_block.density < original_block.density)){
            return
        }

        // swap blocks
        var temp = grid[n_y][n_x]
        grid[n_y][n_x] = grid[o_y][o_x]
        grid[o_y][o_x] = temp

        return true;
    }

    static simulateBlock(x, y, grid){
        // try to fall down
        if(this.tryMove(x,y, x, y+1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move left
        if(this.tryMove(x,y, x-1, y+1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move right
        if(this.tryMove(x,y, x+1, y+1, grid)){
            grid[y][x].done = true;
            return
        }
    }
}

class Water extends Block{
    static letter_symbol = "*"
    static letter_color = "#10afb2"
    static block_name = "Water"
    static block_desc = "Basic fluid"
    static can_be_swaped = true
    static density = 300

    
    static tryMove(o_x,o_y, n_x, n_y,grid){
        if (!Simulation.isInGrid(n_x, n_y, grid)){
            return false;
        }
        // get element
        const this_cell = grid[n_y][n_x];
        const this_block = BlocksHandler.getBlock(this_cell.blockId);
        const original_cell = grid[o_y][o_x];
        const original_block = BlocksHandler.getBlock(original_cell.blockId);

        if (!this_block.can_be_swaped){
            return false;
        }

        //compare density
        if (!(this_block.density < original_block.density)){
            return
        }

        // swap blocks
        var temp = grid[n_y][n_x]
        grid[n_y][n_x] = grid[o_y][o_x]
        grid[o_y][o_x] = temp

        return true;
    }

    static simulateBlock(x, y, grid){
        // try to fall down
        if(this.tryMove(x,y, x, y+1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move left
        if(this.tryMove(x,y, x-1, y+1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move right
        if(this.tryMove(x,y, x+1, y+1, grid)){
            grid[y][x].done = true;
            return
        }

        var randomDir = Math.random() < 0.5 ? 1 : -1;

        if(this.tryMove(x,y, x+randomDir, y, grid)){
            grid[y][x].done = true;
            return
        }

        if(this.tryMove(x,y, x-randomDir, y, grid)){
            grid[y][x].done = true;
            return
        }
    }
}

class Cloud extends Block{
    static letter_symbol = "~"
    static letter_color = "#ffffff"
    static block_name = "Cloud"
    static block_desc = "Basic fluid but falls upward?"
    static can_be_swaped = true
    static density = 10

    
    static tryMove(o_x,o_y, n_x, n_y,grid){
        if (!Simulation.isInGrid(n_x, n_y, grid)){
            return false;
        }
        // get element
        const this_cell = grid[n_y][n_x];
        const this_block = BlocksHandler.getBlock(this_cell.blockId);
        const original_cell = grid[o_y][o_x];
        const original_block = BlocksHandler.getBlock(original_cell.blockId);

        if (!this_block.can_be_swaped){
            return false;
        }

        //compare density
        if (!(this_block.density < original_block.density)){
            return
        }

        // swap blocks
        var temp = grid[n_y][n_x]
        grid[n_y][n_x] = grid[o_y][o_x]
        grid[o_y][o_x] = temp

        return true;
    }

    static simulateBlock(x, y, grid){
        // try to fall down
        if(this.tryMove(x,y, x, y-1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move left
        if(this.tryMove(x,y, x-1, y-1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move right
        if(this.tryMove(x,y, x+1, y-1, grid)){
            grid[y][x].done = true;
            return
        }

        var randomDir = Math.random() < 0.5 ? 1 : -1;

        if(this.tryMove(x,y, x+randomDir, y, grid)){
            grid[y][x].done = true;
            return
        }

        if(this.tryMove(x,y, x-randomDir, y, grid)){
            grid[y][x].done = true;
            return
        }
    }
}

class Spawner extends Block{
    static letter_symbol = "¥"
    static can_be_swaped = false
    static block_name = "Spawner"
    static block_desc = "Copies block above it and spawns it below. If spawner above, spawns at increased rates. "
    static density = 0
    static letter_color = "#707070";

    static simulateBlock(x, y, grid){
        // if block below is not empty:
        if (!Simulation.isInGrid(x, y+1, grid)){
            return false;
        }
        let cell_below = grid[y+1][x];
        let block_below = BlocksHandler.getBlock(cell_below.blockId);
        if (block_below.block_name == "Spawner"){
            return
        }
        
        let spawn_chance = 0.05

        // Take block above
        let ny = y-1
        
        // if block above == spawner, multiply chance by two and take block above
        // do this until you find other block.
        while(true){
            if (!Simulation.isInGrid(x, ny, grid)){
                return false
            }

            const this_cell = grid[ny][x];
            const this_block = BlocksHandler.getBlock(this_cell.blockId);
            if (this_block.block_name != "Spawner"){
                break;
            }
            spawn_chance*=2

            ny-=1
        }
        
        // then do math to check if random float smaller than chance
        if ( Math.random() > spawn_chance){
            return
        }
        
        // if it is smaller create block below as copied block
        if(cell_below.blockId == grid[ny][x].blockId){
            return
        }
        cell_below.reset()
        cell_below.blockId = grid[ny][x].blockId
        cell_below.done = true
    }
}

class Vortex extends Block{
    static letter_symbol = "×"
    static can_be_swaped = false
    static block_name = "Vortex"
    static block_desc = "Sucks all blocks into the void"
    static density = 0
    static letter_color = "#430868"

    static disapearBlock(x,y,grid){
        if (!Simulation.isInGrid(x, y, grid)){
            return false;
        }
        const this_cell = grid[y][x];
        const this_block = BlocksHandler.getBlock(this_cell.blockId);
        if (this_block.block_name != "Air" && this_block.block_name != "Vortex"){
            this_cell.reset()
        }
    }

    static simulateBlock(x, y, grid){
        if ( Math.random() > 0.2){
            return
        }
        Vortex.disapearBlock(x-1,y+1,grid)
        Vortex.disapearBlock(x,y+1,grid)
        Vortex.disapearBlock(x+1,y+1,grid)
        Vortex.disapearBlock(x-1,y,grid)
        Vortex.disapearBlock(x+1,y,grid)
        Vortex.disapearBlock(x-1,y-1,grid)
        Vortex.disapearBlock(x,y-1,grid)
        Vortex.disapearBlock(x+1,y-1,grid)
    }
}

class LivingMatter extends Block {
    static letter_symbol = "æ";
    static can_be_swapped = false;
    static block_name = "Living Matter";
    static block_desc = "Merges together into bigger organism.";
    static density = 1000;
    static letter_color = "#83c92e";

    static fallingTryToMove(o_x,o_y, n_x, n_y,grid){
        if (!Simulation.isInGrid(n_x, n_y, grid)){
            return false;
        }
        // get element
        const this_cell = grid[n_y][n_x];
        const this_block = BlocksHandler.getBlock(this_cell.blockId);
        const original_cell = grid[o_y][o_x];
        const original_block = BlocksHandler.getBlock(original_cell.blockId);

        if (!this_block.can_be_swaped){
            return false;
        }

        //compare density
        //compare density
        if (!(this_block.density < 400)){
            return
        }

        // swap blocks
        var temp = grid[n_y][n_x]
        grid[n_y][n_x] = grid[o_y][o_x]
        grid[o_y][o_x] = temp

        return true;
    }

    static simulateBlock(x, y, grid){
        if ( Math.random() > 0.1){
            this.regularFallMove(x,y,grid)
        }else{
            this.crawlingMove(x,y,grid)
        }
    }

    static regularFallMove(x, y, grid){
        // try to fall down
        if(this.fallingTryToMove(x,y, x, y+1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move left
        if(this.fallingTryToMove(x,y, x-1, y+1, grid)){
            grid[y][x].done = true;
            return
        }
        // try to move right
        if(this.fallingTryToMove(x,y, x+1, y+1, grid)){
            grid[y][x].done = true;
            return
        }
    }

    static crawlingMove(x, y, grid) {
        const moveOffsets = [];
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx !== 0 || dy !== 0) {
                    moveOffsets.push({ dx, dy });
                }
            }
        }
        
        moveOffsets.sort(() => Math.random() - 0.5);

        for (const { dx, dy } of moveOffsets) {
            if (LivingMatter.tryToMove(x, y, x + dx, y + dy, grid)) {
                break; 
            }
        }
    }

    static tryToMove(o_x, o_y, x, y, grid) {
        if (!Simulation.isInGrid(x, y, grid)){
            return false;
        }
        // get element
        const this_cell = grid[y][x];
        const this_block = BlocksHandler.getBlock(this_cell.blockId);
        const original_cell = grid[o_y][o_x];
        const original_block = BlocksHandler.getBlock(original_cell.blockId);

        //compare density
        if (!(this_block.density < original_block.density)){
            return false;
        }

        //can be swapped but check if new cell is next to any LivingMatter cell:
        if(!LivingMatter.livingMatterNeighbourhood(o_x, o_y, x, y, grid)){
            return false;
        }
    }

    static livingMatterNeighbourhood(o_x, o_y, x, y, grid){
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx !== 0 || dy !== 0) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx == o_x && ny == o_y){
                        continue
                    }
                    if (Simulation.isInGrid(nx, ny, grid)) {
                        if (BlocksHandler.getBlock(grid[ny][nx].blockId).block_name == "Living Matter") {
                            // swap blocks
                            var temp = grid[y][x]
                            grid[y][x] = grid[o_y][o_x]
                            grid[o_y][o_x] = temp
                            return true; 
                        }
                    }
                }
            }
        }
        return false; 
    }
}