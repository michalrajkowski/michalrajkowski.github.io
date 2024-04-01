import { Simulation } from "./simulation.js"
import { BlocksHandler } from "./blocks_handler.js"
export { Block, Air, Sand, Iron, Water}
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