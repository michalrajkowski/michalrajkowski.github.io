import { Simulation } from "./simulation.js"
import { BlocksHandler } from "./blocks_handler.js"
export { Block, Air, Sand, Iron, Water, Cloud, Vortex, LivingMatter, Spawner, Fish, Meat, Seed, GrowthCone_Bamboo, Bamboo_Up, Bamboo_Flower, KineticBall, Bamboo_Chopped, Fire,
Fire_2,Fire_3,Fire_4, Human, Human_2, Pipe_Input_Output, Pipe, Pipe_THICC, Pipe_UR, Pipe_DR, Pipe_UL, Pipe_DL, Pipe_UD, Pipe_LR, Pipe_NR, Pipe_NL, Pipe_NU, Pipe_ND,
Pipe_UR_THICC, Pipe_DR_THICC, Pipe_UL_THICC, Pipe_DL_THICC, Pipe_UD_THICC, Pipe_LR_THICC, Pipe_NR_THICC, Pipe_NL_THICC, Pipe_NU_THICC, Pipe_ND_THICC, Totem, IdeaMark, IdeaMark_Thinking}
class Block{
    static letter_symbol = "X"
    static letter_color = "#ffffff"
    static block_name = "basic block"
    static block_desc = "basic block description"
    static can_be_swaped = false
    static density = 0
    static is_food = false
    static visible_in_inspector = true
    static is_burnable = false
    static burn_rate = 1.0
    static is_pipe = false
    static is_thicc_pipe = false
    static is_idea = false
    static is_human = false

    static getLetterSymbol(){
        return this.letter_symbol
    }

    static simulateBlock(x, y, grid){
        
    }
}

class KineticBall extends Block{
    static letter_symbol = "○"
    static block_name = "Kinetic Ball"
    static block_desc = "Bounces like crazy"
    static gravity_rate = 0.5
    static x_start_force_min = 5
    static y_start_force_min = 5
    static x_start_force_max = 15
    static y_start_force_max = 15


    static tryToMove(o_x, o_y, d_x, d_y, grid){

    }

    static tryMoveInAxis(o_x, o_y, grid, axis_string){
        console.log("Try to move")
        let x = o_x
        let y = o_y
        if (axis_string == 'x'){
            let n_x = o_x + (grid[y][x].force.x > 0 ? 1 : -1);
            console.log(n_x - o_x)
            if (!Simulation.isInGrid(n_x, y, grid)){
                grid[y][x].force.x *= -1
                return
            }
            if(grid[y][n_x].blockId != BlocksHandler.getBlockId(Air)){
                grid[y][x].force.x *= -1
                return
            }
            let temp = grid[y][n_x]
            grid[y][n_x] = grid[y][x]
            grid[y][x] = temp
        }else{
            let n_y = o_y + (grid[y][x].force.y > 0 ? 1 : -1);
            if (!Simulation.isInGrid(x, n_y, grid)){
                if (Math.sign(grid[y][x].force.y) < 0){
                    grid[y][x].force.y *= -1
                    return
                }else{
                    grid[y][x].force.y = 0
                    grid[y][x].force.x = 0
                }
                return
            }
            if(grid[n_y][x].blockId != BlocksHandler.getBlockId(Air)){
                if (Math.sign(grid[y][x].force.y) < 0){
                    grid[y][x].force.y *= -1
                    return
                }else{
                    grid[y][x].force.y = 0
                    grid[y][x].force.x = 0
                }
                return
            }
            let temp = grid[n_y][x]
            grid[n_y][x] = grid[y][x]
            grid[y][x] = temp
        }
    }
    static preSimulationHook(x,y,grid){
        let this_cell = grid[y][x]
        if (this_cell.force.x == 0 && this_cell.force.y == 0){
            this_cell.force.x = Math.random()*this.x_start_force_max* (Math.random()> 0.5 ? 1 : -1);
            this_cell.force.y = Math.random()*this.y_start_force_max*(-1)
        }
    }

    static postSimulationHook(x,y,grid){

    }
    static kinematicBehaviour(x,y,grid){
        // Try to move in directions:
        // Decide if to move X or Y:
        let this_cell = grid[y][x]
        console.log(this_cell.force)
        let primaryAxis, secondaryAxis;
        let frame_count;
        if (Math.abs(this_cell.force.x) > Math.abs(this_cell.force.y)) {
            primaryAxis = 'x';
            secondaryAxis = 'y';
            frame_count = Math.floor(Math.abs(this_cell.force.x) / Math.abs(this_cell.force.y));
        } else {
            primaryAxis = 'y';
            secondaryAxis = 'x';
            frame_count = Math.floor(Math.abs(this_cell.force.y) / Math.abs(this_cell.force.x));
        }
        if (Math.abs(this_cell.force.x) < 0.0001){
            secondaryAxis = 'y'
            primaryAxis = 'y'
        }
        if ((Simulation.getInstance().getRealFrames() % frame_count) == 0) {
            this.tryMoveInAxis(x,y,grid,secondaryAxis)
        } else {
            this.tryMoveInAxis(x,y,grid,primaryAxis)
        }
        // Slow movement?
        if (this_cell.force.y != 0){
            this_cell.force.y += this.gravity_rate
        }
    }
    static simulateBlock(x, y, grid){
        this.preSimulationHook(x,y,grid)
        this.kinematicBehaviour(x,y,grid)
        this.postSimulationHook(x,y,grid)
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

class Fish extends Block{
    static letter_symbol = "∝"
    static letter_color = "#ff792b"
    static block_name = "Fish"
    static block_desc = "Swims in water"
    static density = 400
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

    static checkIfWaterClose(o_x, o_y, grid){
        for(let n_x = o_x - 1; n_x <= o_x + 1; n_x++){
            for(let n_y = o_y - 1; n_y <= o_y + 1; n_y++){
                // Check if it is inside grid!
                if (!Simulation.isInGrid(n_x, n_y, grid)){
                    continue
                }
                if (BlocksHandler.getBlock(grid[n_y][n_x].blockId).block_name == "Water") {
                    return [n_y, n_x]
                }
            }
        }
        return [-1, -1]
    }

    static randomLog2(){
        const startCategory = 6.5;
        const stepSize = 0.5;
        let num = Math.random() * 100;
        let log2_num = Math.log2(num)
        const index = Math.floor((log2_num) / stepSize);
        return index > 0 ? index : 13;
    }

    static reversedRandomLog2(){
        let index = this.randomLog2()
        index -=13
        index = Math.abs(index)
        return index
    }

    static nextRasterizedPoint(x1,y1,x2,y2){
        let dx = x2 - x1
        let dy = y2 - y1
        if (Math.abs(dx) > Math.abs(dy)){
            return [Math.sign(dx)+x1, y1]
        }else{
            return [x1,Math.sign(dy)+y1]
        }
    }

    static simulateBlock(x, y, grid){
        // Check if water close
        let [water_y, water_x] = this.checkIfWaterClose(x,y,grid)

        if (water_y == -1 && water_x == -1){
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
            // this means we are laying on the ground?

            // jump up in agony + rng to DIE.
            if (Math.random() < 0.05){
                // DIE
                let this_cell = grid[y][x];
                this_cell.reset()
                // Spawn Meat
                this_cell.blockId = BlocksHandler.getBlockId(Meat);
                this_cell.done = true
                return
            }
            // Do a flop!
            if(this.tryMove(x,y, x, y-1, grid)){
                grid[y][x].done = true;
            }
            return
        }
        
        // Random Swimmer algorithm man

        // checks if has current swim directions
        let swim_directions = {
            x: grid[y][x].force.x,
            y: grid[y][x].force.y
        };
        if (swim_directions.x == 0 && swim_directions.y == 0){
            // there is not a swim direction
            // so generate new one:
            let r_x = this.reversedRandomLog2()
            let r_y = this.reversedRandomLog2()
            let sign_x = Math.random() < 0.5 ? -1 : 1
            let sign_y = Math.random() < 0.5 ? -1 : 1
            let n_x = r_x * sign_x + x
            let n_y = r_y * sign_y + y

            if (!Simulation.isInGrid(n_x, n_y, grid)){
                return;
            }

            if (grid[n_y][n_x].blockId == BlocksHandler.getBlockId(Water)){
                grid[y][x].force.x = n_x
                grid[y][x].force.y = n_y
            }
            return
        }

        // Swimming in direction:
        // - check if already at the direction?
        if (x == grid[y][x].force.x && y == grid[y][x].force.y){
            grid[y][x].force.x = 0
            grid[y][x].force.y = 0
            return
        }
        // Swim in the direction:
        let [nextSwimStep_x, nextSwimStep_y] = this.nextRasterizedPoint(x,y,grid[y][x].force.x, grid[y][x].force.y)
        if(this.tryMove(x,y, nextSwimStep_x, nextSwimStep_y, grid)){
            grid[y][x].done = true;
            return
        }else{
            grid[y][x].force.x = 0
            grid[y][x].force.y = 0
            return
        }

        // if there is fish brain logic
        // - looking for food 
        // - procreate?
        
    }
}

class Meat extends Block{
    static letter_symbol = "⊕"
    static letter_color = "#f01d55"
    static block_name = "Meat"
    static block_desc = "Is source of food"
    static density = 500
    static can_be_swaped = true
    static is_food = true

    
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

class Seed extends KineticBall{
    static letter_symbol = "⊚"
    static letter_color = "#3d2613"
    static block_name = "Seed"
    static block_desc = "Add a bit of water to create a plant"
    static density = 390
    static can_be_swaped = true
    static visible_in_inspector = true
    static is_burnable = true
    static burn_rate = 0.5
    
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

    static checkIfWaterClose(o_x, o_y, grid){
        for(let n_x = o_x - 1; n_x <= o_x + 1; n_x++){
            for(let n_y = o_y - 1; n_y <= o_y + 1; n_y++){
                // Check if it is inside grid!
                if (!Simulation.isInGrid(n_x, n_y, grid)){
                    continue
                }
                if (BlocksHandler.getBlock(grid[n_y][n_x].blockId).block_name == "Water") {
                    return [n_y, n_x]
                }
            }
        }
        return [-1, -1]
    }

    static simulateBlock(x, y, grid){
        let this_cell = grid[y][x]
        if(this_cell.force.x == -1 && this_cell.force.y == -1){
            this_cell.force.x = Math.random()*this.x_start_force_max* (Math.random()> 0.5 ? 1 : -1);
            this_cell.force.y = Math.random()*this.y_start_force_max*(-1)
        }
        if(this_cell.force.x != 0 || this_cell.force.y != 0){
            this.kinematicBehaviour(x,y,grid)
            return
        }
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

        // If contact with water, grow plant!
        let [water_y, water_x] = this.checkIfWaterClose(x,y,grid)
        if (water_x == -1 && water_y == -1){
            return
        }
        // FOUND WATER!!!
        grid[y][x].reset()
        grid[y][x].blockId = BlocksHandler.getBlockId(GrowthCone_Bamboo)

    }
}

class GrowthCone_Bamboo extends Block{
    static letter_symbol = "^"
    static letter_color = "#3d2613"
    static block_name = "GrowthCone"
    static block_desc = ""
    static density = 390
    static can_be_swaped = true
    static visible_in_inspector = false
    static is_burnable = true
    static burn_rate = 1.0
    
    static checkIfNotOccupied(x,y,grid){
        if (!Simulation.isInGrid(x, y, grid)){
            return false;
        }
        if (grid[y][x].blockId != BlocksHandler.getBlockId(Air) && grid[y][x].blockId != BlocksHandler.getBlockId(Water)){
            return false
        }
        return true
    }

    static simulateBlock(x, y, grid){
        // Try to grow upward?
        // Growth slower / randomizer
        if (Math.random() > 0.1){
            return
        }

        // Can grow - choose option:
        let rand_result = Math.random()
        
        // Option 1. Grow up
        if (rand_result < 0.8){
            if(!this.checkIfNotOccupied(x,y-1,grid)){
                return
            }
            grid[y-1][x].reset()
            grid[y-1][x].blockId = BlocksHandler.getBlockId(GrowthCone_Bamboo)
            grid[y][x].reset()
            grid[y][x].blockId = BlocksHandler.getBlockId(Bamboo_Up)
            //Try to go up
            return
        }

        // Option 2. Turn into flower?
        if (rand_result >= 0.8){
            grid[y][x].reset()
            grid[y][x].blockId = BlocksHandler.getBlockId(Bamboo_Flower)
            return
        }

    }
}

class Bamboo_Up extends Block{
    static letter_symbol = "|"
    static letter_color = "#0d540f"
    static visible_in_inspector = false
    static density = 390
    static is_burnable = true
    static burn_rate = 0.1
    
    static simulateBlock(x,y,grid){
        if (!Simulation.isInGrid(x, y+1, grid)){
            return
        }
        console.log(`${x} ${y}`)
        console.log(`${x} ${y+1}`)
        console.log(`${grid[y+1][x].blockId}`)
        let block_here = BlocksHandler.getBlock(grid[y][x].blockId)
        let block_below = BlocksHandler.getBlock(grid[y+1][x].blockId)
        if(block_below.density >= block_here.density){
            console.log("No break?")
            return
        }
        console.log("BREAKS!")
        console.log(grid[y+1][x].blockId)
        console.log(grid[y][x].blockId)
        // breaks!
        grid[y][x].reset()
        grid[y][x].blockId = BlocksHandler.getBlockId(Bamboo_Chopped)
    }
}

class Bamboo_Chopped extends Block{
    static letter_symbol = "−"
    static letter_color = "#43751a"
    static visible_in_inspector = false
    static density = 250
    static can_be_swaped = true
    static is_burnable = true
    static burn_rate = 0.2

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

class Bamboo_Flower extends Block{
    static letter_symbol = "\""
    static letter_color = "#52f041"
    static visible_in_inspector = false
    static density = 390
    static is_burnable = true
    static burn_rate = 1.0

    static simulateBlock(x,y,grid){
        if(Math.random() < 0.0002){
            // Spawn seed?
            // check if above is fine
            if (!Simulation.isInGrid(x, y-1, grid)){
                return
            }
            if(grid[y-1][x].blockId != BlocksHandler.getBlockId(Air)){
                return
            }
            grid[y-1][x].reset()
            grid[y-1][x].blockId = BlocksHandler.getBlockId(Seed)
            grid[y-1][x].force.x = -1
            grid[y-1][x].force.y = -1
        }else{
            if (!Simulation.isInGrid(x, y+1, grid)){
                return
            }
            console.log(`${x} ${y}`)
            console.log(`${x} ${y+1}`)
            console.log(`${grid[y+1][x].blockId}`)
            let block_here = BlocksHandler.getBlock(grid[y][x].blockId)
            let block_below = BlocksHandler.getBlock(grid[y+1][x].blockId)
            if(block_below.density >= block_here.density){
                console.log("No break?")
                return
            }
            console.log("BREAKS!")
            console.log(grid[y+1][x].blockId)
            console.log(grid[y][x].blockId)
            // breaks!
            grid[y][x].reset()
            grid[y][x].blockId = BlocksHandler.getBlockId(Bamboo_Chopped)
        }
    }
}

class Fire extends Block{
    static letter_symbol = "█"
    static letter_color = "#ff580a"
    static block_name = "Fire"
    static block_desc = "Burn things down!"
    static visible_in_inspector = false
    static density = 390
    static visible_in_inspector = true

    static simulateBlock(x, y, grid){
    // try to burn all neighbours
        let [new_x, new_y] = this.preSimulationHook(x,y,grid)

        x=new_x
        y=new_y

        for (let n_x = x - 1; n_x <= x+1; n_x++){
            for(let n_y = y - 1; n_y <= y+1; n_y++){
                if (n_x == x && n_y == y){
                    continue;
                }
                if (!Simulation.isInGrid(n_x, n_y, grid)){
                    continue
                }
                // get block
                // check if it is burnable
                // try to burn based on burning rate
                let next_block = BlocksHandler.getBlock(grid[n_y][n_x].blockId)
                if(next_block.is_burnable != true){
                    continue
                }
                // BURN! BURN! BURN!
                if(Math.random() > next_block.burn_rate){
                    continue
                }
                grid[n_y][n_x].reset()
                grid[n_y][n_x].blockId = BlocksHandler.getBlockId(Fire)
                grid[n_y][n_x].done = true
            }
        }

        // Try to get extinguished?
        this.postSimulationHook(x,y,grid)
    }

    static postSimulationHook(x,y,grid){
        grid[y][x].blockId = BlocksHandler.getBlockId(Fire_2)
    }

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
        }if (!Simulation.isInGrid(n_x, n_y, grid)){
            return;
        }
        // check if it is a pipe
        //next_block = BlocksHandler.getBlock(grid[n_y][n_x])
        //if (!next_block instanceof Pipe){
        //    return
        //}

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

    static preSimulationHook(x, y, grid){
        // try to fall down
        if(this.tryMove(x,y, x, y+1, grid)){
            grid[y][x].done = true;
            return [x,y+1]
        }
        // try to move left
        if(this.tryMove(x,y, x-1, y+1, grid)){
            grid[y][x].done = true;
            return [x-1,y+1]
        }
        // try to move right
        if(this.tryMove(x,y, x+1, y+1, grid)){
            grid[y][x].done = true;
            return [x+1,y+1]
        }
        return [x,y]
    }
}

class Fire_2 extends Fire{
    static letter_symbol = "▓"
    static visible_in_inspector=false
    static postSimulationHook(x,y,grid){
        grid[y][x].blockId = BlocksHandler.getBlockId(Fire_3)
    }
}

class Fire_3 extends Fire{
    static letter_symbol = "▒"
    static visible_in_inspector=false
    static postSimulationHook(x,y,grid){
        grid[y][x].blockId = BlocksHandler.getBlockId(Fire_4)
    }
}

class Fire_4 extends Fire{
    static letter_symbol = "░"
    static visible_in_inspector=false
    static postSimulationHook(x,y,grid){
        grid[y][x].blockId = BlocksHandler.getBlockId(Cloud)
    }
}

class Human extends Block{
    static letter_symbol = "☻"
    static letter_color = "#ffffff"
    static block_name = "Human"
    static block_desc = "Complex inteligent life form. Has ideas and follows them"
    static visible_in_inspector = true;
    static is_human = true
    static density = 310

    static handle_physics(x,y,grid){
        // falls down if there is not a filled space below.
        // after fall damage?
        // take mark with you?

        if (!(Simulation.isInGrid(x, y+1, grid))){
            return
        }

        let block_below = BlocksHandler.getBlock(grid[y+1][x].blockId)
        if (block_below.density >= this.density){
            return
        }

        // we are falling!!
        // TODO: fall down and move your questionmark!
        
        // swap human and cell below
        [grid[y][x], grid[y+1][x]] = [grid[y+1][x], grid[y][x]];
        // also swap idea if exists?
        if (!(Simulation.isInGrid(x, y-1, grid))){
            return
        }
        let block_above = BlocksHandler.getBlock(grid[y-1][x].blockId)
        if (!block_above.is_idea){
            return false
        }
        [grid[y][x], grid[y-1][x]] = [grid[y-1][x], grid[y][x]];

    }

    static try_to_follow_idea(x,y,grid){
        if (!(Simulation.isInGrid(x, y-1, grid))){
            return false
        }
        let block_above = BlocksHandler.getBlock(grid[y-1][x].blockId)
        if (!block_above.is_idea){
            return false
        }

        return true
    }

    static follow_idea(x,y,grid){
        
    }

    static try_create_idea(x,y,grid, idea_mark_id){
        if (!(Simulation.isInGrid(x, y-1, grid))){
            return false
        }
        if (grid[y-1][x].blockId != BlocksHandler.getBlockId(Air)){
            return false
        }

        grid[y-1][x].blockId = idea_mark_id
        return true
    }

    static try_chaotic_walk(x,y,grid){
        // rng move left or right?
        let move_unit_modifier = Math.random() < 0.5 ? -1 : 1;
        if ((Simulation.isInGrid(x + move_unit_modifier, y, grid) == true)){
            if (grid[y][x+ move_unit_modifier].blockId == BlocksHandler.getBlockId(Air)){
                var temp = grid[y][x+ move_unit_modifier]
                grid[y][x + move_unit_modifier] = grid[y][x]
                grid[y][x] = temp
                grid[y][x].done = true
                grid[y][x+move_unit_modifier].done = true
                return
            }
        }
        
        move_unit_modifier = move_unit_modifier*(-1)
        if ((Simulation.isInGrid(x + move_unit_modifier, y, grid) == true)){
            if (grid[y][x+ move_unit_modifier].blockId == BlocksHandler.getBlockId(Air)){
                var temp = grid[y][x+ move_unit_modifier]
                grid[y][x + move_unit_modifier] = grid[y][x]
                grid[y][x] = temp
                grid[y][x].done = true
                grid[y][x+move_unit_modifier].done = true
                return
            }
        }
    }

    static simulateBlock(x, y, grid){
        // handle physics
        this.handle_physics(x,y,grid)

        // try to think?
        let can_follow_idea = this.try_to_follow_idea(x,y,grid)

        if (can_follow_idea){
            this.follow_idea(x,y,grid)
            return
        }

        // We dont have idea!

        // Try to create thinking idea
        let created_default_idea = this.try_create_idea(x,y,grid, BlocksHandler.getBlockId(IdeaMark_Thinking))
        if (created_default_idea){
            return
        }

        // Try wantering chaoticly (we are so lost?)
        this.try_chaotic_walk(x,y,grid)

        // We cant even move?!
    }
}

class Human_2 extends Human{
    static letter_symbol = "∏"
    static block_name = "Human v2"
    static block_desc = "Different tribe of human that is in conflict with the full-color one"
}

class IdeaMark extends Block{
    static letter_symbol = "!"
    static letter_color = "#ffffff"
    static is_idea = true
    static visible_in_inspector = false

    // Vanish if not human below (or totem?)
    static vanish_this(x,y,grid){
        grid[y][x].reset()
        return
    }
    
    static simulateBlock(x, y, grid){
        // vanish if block below is not human
        let cell_below = grid[y+1][x]
        if (!(Simulation.isInGrid(x, y+1, grid))){
            this.vanish_this(x,y,grid)
            return
        }
        let block_below = BlocksHandler.getBlock(cell_below.blockId)
        if (!block_below.is_human){
            this.vanish_this(x,y,grid)
            return
        }

    }
}
class IdeaMark_Thinking extends IdeaMark{
    static letter_symbol = "?"
}

class Totem extends Block{
    static letter_symbol = "∏"
    static letter_color = "#ffffff"
    static block_name = "Totem"
    static block_desc = ""
    static visible_in_inspector = false;

    handle_physics(){
        // falls down if there is not a filled space below.
        // after fall damage?
        // take mark with you?
    }

    static simulateBlock(x, y, grid){
        // handle physics

        // handle human "state?"

        // perform strategies

        // choose strategies

    }
}

class Pipe_Input_Output extends Block{
    static letter_symbol = "V"
    static letter_color = "#ffffff"
    static can_be_swaped = false
    static block_name = "Pipe I/O"
    static block_desc = "Works as Input if above pipe, and output if left/right/below"
    static density = 999
    static simulateBlock(x, y, grid){
        // if pipe below - try to insert block above me to it!
        let n_y = y+1
        let n_x = x
        if (!Simulation.isInGrid(n_x, n_y, grid)){
            return;
        }
        // check if it is a pipe
        let next_block = BlocksHandler.getBlock(grid[n_y][n_x].blockId)
        if (next_block.is_pipe == false){
            return
        }
        if (!(grid[n_y][n_x].force.x == 0 && grid[n_y][n_x].force.y == 0)){
            return
        }
        // We found pipe which can be fed!
        // check block above
        let b_y = y-1
        let b_x = x
        if (!Simulation.isInGrid(b_x, b_y, grid)){
            return;
        }
        // check if it is sth else than air
        let block_below = BlocksHandler.getBlock(grid[b_y][b_x].blockId)
        let cell_below = grid[b_y][b_x]
        console.log(cell_below.blockId)
        if (cell_below.blockId == BlocksHandler.getBlockId(Air) || block_below.is_pipe || cell_below.blockId == BlocksHandler.getBlockId(Pipe_Input_Output)){
            return
        }
        // Block is valid!
        // Pipe the block
        // - insert its id inside the pump, make it occupied
        // - delete block above
        const block_id = grid[b_y][b_x].blockId
        grid[n_y][n_x].done = true
        grid[n_y][n_x].force.x = -1
        grid[n_y][n_x].force.y = block_id
        // thick the pipe
        grid[n_y][n_x].blockId = BlocksHandler.getBlockId(Pipe_THICC)
        Pipe_THICC.pipe_idle_behaviour(n_x, n_y, grid)
        grid[b_y][b_x].reset()
        console.log("Sucked block")
    }
}

class Pipe extends Block{
    static letter_symbol = "┼"
    static letter_color = "#1b3612"
    static can_be_swaped = false
    static block_name = "Pipe"
    static block_desc = "Transport blocks from one edge to the other. Requires Pipe I/O blocks to work"
    static density = 999
    static is_pipe = true
    static simulateBlock(x, y, grid){
        // if idle - choose pipe shape
        
        // if not idle : transport block

        //-1 / blockid - is transporting block
        // 0 / 0 - idle
        // 1 / 1 - occupied helper? (or some move counter?)
        let this_cell = grid[y][x]
        
        // Pipe Idle behaviour
        if (this_cell.force.x == 0 && this_cell.force.y == 0){
            this.pipe_idle_behaviour(x,y,grid)
            return
        }

        // Transport block behaviour.
        // the force.y value is the transported block id.
        if (this_cell.force.x == -1){
            this.pipe_transport_behaviour(x,y,grid)
            return
        }

        // Pipe filler behaviour?
        this.pipe_filler_behaviour(x,y,grid)
    }
    static find_valve_or_pipe(x,y,grid){
        if (!(Simulation.isInGrid(x,y,grid))){
            return false
        }
        let this_block = BlocksHandler.getBlock(grid[y][x].blockId)
        let this_cell = grid[y][x]
        if (this_block.is_pipe || this_cell.blockId == BlocksHandler.getBlockId(Pipe_Input_Output)){
            return true
        }
        return false
    }

    static pipe_idle_behaviour(x,y,grid){
        // change my type to correct pipe type:
        if (this.is_thicc_pipe == false){
            // find all nei pipes
            let nei_pipes = [false,false,false,false]
            nei_pipes[0] = this.find_valve_or_pipe(x,y-1,grid)
            nei_pipes[1] = this.find_valve_or_pipe(x+1,y,grid)
            nei_pipes[2] = this.find_valve_or_pipe(x,y+1,grid)
            nei_pipes[3] = this.find_valve_or_pipe(x-1,y,grid)
            // take from dict based on nei flags

            switch (JSON.stringify(nei_pipes)) {
                // wszystkie trójki
                case JSON.stringify([false, true, true, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_NU)
                    break;
                case JSON.stringify([true, false, true, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_NR)
                    break;
                case JSON.stringify([true, true, false, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_ND)
                    break;
                case JSON.stringify([true, true, true, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_NL)
                    break;
                // All bents
                case JSON.stringify([true, true, false, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_UR)
                    break;
                case JSON.stringify([true, false, true, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_UD)
                    break;
                case JSON.stringify([true, false, false, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_UL)
                    break;
                case JSON.stringify([false, true, true, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_DR)
                    break;
                case JSON.stringify([false, true, false, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_LR)
                    break;
                case JSON.stringify([false, false, true, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_DL)
                    break;
                // Special case if not fall into anything
                default:
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe)
                    break
            }
        }else{
            let nei_pipes = [false,false,false,false]
            nei_pipes[0] = this.find_valve_or_pipe(x,y-1,grid)
            nei_pipes[1] = this.find_valve_or_pipe(x+1,y,grid)
            nei_pipes[2] = this.find_valve_or_pipe(x,y+1,grid)
            nei_pipes[3] = this.find_valve_or_pipe(x-1,y,grid)
            // take from dict based on nei flags

            switch (JSON.stringify(nei_pipes)) {
                case JSON.stringify([false, true, true, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_NU_THICC);
                    break;
                case JSON.stringify([true, false, true, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_NR_THICC);
                    break;
                case JSON.stringify([true, true, false, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_ND_THICC);
                    break;
                case JSON.stringify([true, true, true, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_NL_THICC);
                    break;
                // All bents
                case JSON.stringify([true, true, false, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_UR_THICC);
                    break;
                case JSON.stringify([true, false, true, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_UD_THICC);
                    break;
                case JSON.stringify([true, false, false, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_UL_THICC);
                    break;
                case JSON.stringify([false, true, true, false]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_DR_THICC);
                    break;
                case JSON.stringify([false, true, false, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_LR_THICC);
                    break;
                case JSON.stringify([false, false, true, true]):
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_DL_THICC);
                    break;
                // Special case if not fall into anything
                default:
                    grid[y][x].blockId = BlocksHandler.getBlockId(Pipe_THICC);
                    break;
            }            
        }

    }

    static pipe_filler_behaviour(x,y,grid){
        // check if still pointing to the correct point
        // if not delete itself
        let pointing_x = grid[y][x].force.x
        let pointing_y = grid[y][x].force.y
        if(grid[pointing_y][pointing_x].force.x == -1){
            return
        }

        // it is not an occupied/transporter pipe. Delete my fake spot
        grid[y][x].force.x = 0
        grid[y][x].force.y = 0
    }

    static pipe_transport_behaviour(x,y,grid){
        // look for exits left / right / down
        const exit_directions = [
            [0, 1],  // Down
            [-1, 0], // Left
            [1, 0]   // Right
        ];
        
        for (let i = 0; i < exit_directions.length; i++) {
            console.log(`Iteration: ${i}`)
            const n_x = x + exit_directions[i][0];
            const n_y = y + exit_directions[i][1];
            console.log(`${n_x}, ${n_y}`)
            // Check if the new position is within bounds
            if (!Simulation.isInGrid(n_x, n_y, grid)){
                continue;
            }
            //
            if (grid[n_y][n_x].blockId != BlocksHandler.getBlockId(Pipe_Input_Output)){
                continue
            }
            // if pipe_I/O found, pump_out the item
            const p_x = n_x + exit_directions[i][0];
            const p_y = n_y + exit_directions[i][1];
            if (!Simulation.isInGrid(p_x, p_y, grid)){
                continue;
            }
            // Check if not occupied
            if (grid[p_y][p_x].blockId != BlocksHandler.getBlockId(Air)){
                continue
            }
            // Pump it out here!
            console.log(`I am ${x} ${y}. Block will be thrown away ${p_x} ${p_y} (${p_x - x},${p_y - y})`)
            const piped_block_id = Math.round(grid[y][x].force.y) 
            grid[p_y][p_x].blockId = piped_block_id
            grid[p_y][p_x].done = true

            // Clear the pipe!
            grid[y][x].blockId = BlocksHandler.getBlockId(Pipe)
            grid[y][x].force.x = x
            grid[y][x].force.y = y
            return
        }

        // Look for pipes up / right / left / down
        
        // If pipe is not occupied:
        // - (1) change that pipe type and content
        // - (2) make it busy
        // - (3) change itself to normal
        // - (4) create empty fake slot on itself (pointing to the new liquid slot)
        const pipes_directions = [
            [0, -1], // Up
            [0, 1],  // Down
            [-1, 0], // Left
            [1, 0]   // Right
        ];
        
        for (let i = 0; i < pipes_directions.length; i++) {
            console.log(`Iteration PIPES: ${i}`)
            const n_x = x + pipes_directions[i][0];
            const n_y = y + pipes_directions[i][1];
            
            // check if empty and if it is a pipe and if pipe can transport:
            if (!Simulation.isInGrid(n_x, n_y, grid)){
                continue;
            }
            console.log(`can inspect place`)
            // check if it is a pipe
            let next_block = BlocksHandler.getBlock(grid[n_y][n_x].blockId)
            if (!(next_block.is_pipe)){
                continue
            }
            console.log(`Pipe Exists`)
            if (!(grid[n_y][n_x].force.x == 0 && grid[n_y][n_x].force.y == 0)){
                continue
            }
            console.log(`Optimal force`)
            // bingo! do the important stuff
            // (1) change that pipe type and content
            grid[n_y][n_x].force.x = grid[y][x].force.x
            grid[n_y][n_x].force.y = grid[y][x].force.y

            // TODO: change pipe appearance to THICC
            grid[n_y][n_x].blockId = BlocksHandler.getBlockId(Pipe_THICC)
            Pipe_THICC.pipe_idle_behaviour(n_x, n_y, grid)

            // (2) change it to busy
            grid[n_y][n_x].done = true

            // (3) change itself to normal
            // TODO: UNTHIC MYSELF
            grid[y][x].blockId = BlocksHandler.getBlockId(Pipe)
            Pipe.pipe_idle_behaviour(x, y, grid)

            // (4) create empty fake slot on itself (pointing to the new liquid slot)
            grid[y][x].force.x = n_x
            grid[y][x].force.y = n_y
            return
        }

    }
}
class Pipe_THICC extends Pipe{
    static letter_symbol = "║"
    static visible_in_inspector = false       
    static is_thicc_pipe = true
}

class Pipe_UR extends Pipe{
    static letter_symbol = "└"
    static visible_in_inspector = false       
}

class Pipe_DR extends Pipe{
    static letter_symbol = "┌"
    static visible_in_inspector = false       
}

class Pipe_UL extends Pipe{
    static letter_symbol = "┘"
    static visible_in_inspector = false       
}

class Pipe_DL extends Pipe{
    static letter_symbol = "┐"
    static visible_in_inspector = false       
}

class Pipe_UD extends Pipe{
    static letter_symbol = "│"
    static visible_in_inspector = false       
}

class Pipe_LR extends Pipe{
    static letter_symbol = "─"
    static visible_in_inspector = false       
}

class Pipe_NR extends Pipe{
    static letter_symbol = "┤"
    static visible_in_inspector = false       
}

class Pipe_NL extends Pipe{
    static letter_symbol = "├"
    static visible_in_inspector = false       
}

class Pipe_NU extends Pipe{
    static letter_symbol = "┬"
    static visible_in_inspector = false       
}

class Pipe_ND extends Pipe{
    static letter_symbol = "┴"
    static visible_in_inspector = false       
}

class Pipe_UR_THICC extends Pipe_THICC {
    static letter_symbol = "╚"; // Thicker version of "└"
    static visible_in_inspector = false;       
}

class Pipe_DR_THICC extends Pipe_THICC {
    static letter_symbol = "╔"; // Thicker version of "┌"
    static visible_in_inspector = false;       
}

class Pipe_UL_THICC extends Pipe_THICC {
    static letter_symbol = "╝"; // Thicker version of "┘"
    static visible_in_inspector = false;       
}

class Pipe_DL_THICC extends Pipe_THICC {
    static letter_symbol = "╗"; // Thicker version of "┐"
    static visible_in_inspector = false;       
}

class Pipe_UD_THICC extends Pipe_THICC {
    static letter_symbol = "║"; // Thicker version of "│"
    static visible_in_inspector = false;       
}

class Pipe_LR_THICC extends Pipe_THICC {
    static letter_symbol = "═"; // Thicker version of "─"
    static visible_in_inspector = false;       
}

class Pipe_NR_THICC extends Pipe_THICC {
    static letter_symbol = "╣"; // Thicker version of "┤"
    static visible_in_inspector = false;       
}

class Pipe_NL_THICC extends Pipe_THICC {
    static letter_symbol = "╠"; // Thicker version of "├"
    static visible_in_inspector = false;       
}

class Pipe_NU_THICC extends Pipe_THICC {
    static letter_symbol = "╦"; // Thicker version of "┬"
    static visible_in_inspector = false;       
}

class Pipe_ND_THICC extends Pipe_THICC {
    static letter_symbol = "╩"; // Thicker version of "┴"
    static visible_in_inspector = false;       
}

