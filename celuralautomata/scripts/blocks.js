import { Simulation } from "./simulation.js"
import { BlocksHandler } from "./blocks_handler.js"
export { Block, Air, Sand, Iron, Water, Cloud, Vortex, LivingMatter, Spawner, Fish, Meat, Seed, GrowthCone_Bamboo, Bamboo_Up, Bamboo_Flower, KineticBall, Bamboo_Chopped}
class Block{
    static letter_symbol = "X"
    static letter_color = "#ffffff"
    static block_name = "basic block"
    static block_desc = "basic block description"
    static can_be_swaped = false
    static density = 0
    static is_food = false
    static visible_in_inspector = true

    static getLetterSymbol(){
        return this.letter_symbol
    }

    static simulateBlock(x, y, grid){
        
    }
}

class KineticBall extends Block{
    static letter_symbol = "○"
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