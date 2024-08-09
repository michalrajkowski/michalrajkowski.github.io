// Define the Simulation class
import { Cell } from './main.js';
import { ScreenHandler } from './screen_handler.js';
import { BlocksHandler } from './blocks_handler.js';
import { UISelector } from './ui_selector.js';

export class Simulation {
    constructor() {
        if (!Simulation.instance) {
            // Initialize the simulation state
            this.width = 0;
            this.height = 0;
            this.cellGrid = [];
            Simulation.instance = this;
            this.screenhandler = new ScreenHandler();
            this.absolute_frame = 0
            this.real_frame = 0
            console.log("Simulation created!")
        }
        return Simulation.instance;
    }

    // Method to set up the simulation
    setup(width, height) {
        this.width = width;
        this.height = height;
        this.cellGrid = this.createCellGrid(width, height);
        this.screenhandler.refreshScreen(this.cellGrid);
    }

    static isInGrid(x, y, grid) {
        const width = grid[0].length;
        const height = grid.length;
        return x >= 0 && x < width && y >= 0 && y < height;
    }
    
    isInLocalGrid(x, y, grid) {
        const width = grid[0].length;
        const height = grid.length;
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    clearScreen(){
        var grid = this.cellGrid
        const width = grid[0].length;
        const height = grid.length;

        for (let y = 0; y < height; y++) {
            // Iterate over each cell in the row
            for (let x = 0; x < width; x++) {
                const this_cell = grid[y][x];
                this_cell.reset()
            }
        }
    }

    simulateFrame() {
        this.absolute_frame+=1
        if (this.absolute_frame%UISelector.frames_per_tick != 0){
            return
        }
        this.real_frame+=1

        // real simulation
        var grid = this.cellGrid
        const width = grid[0].length;
        const height = grid.length;

        // Change a random blockId in the first row to 1
        /*
        const randomX = Math.floor(Math.random() * width);
        const firstRow = grid[0];
        firstRow[randomX].blockId = 1;
        */
    
        // Iterate over each row
        for (let y = 0; y < height; y++) {
            // Iterate over each cell in the row
            for (let x = 0; x < width; x++) {
                const this_cell = grid[y][x];
                const this_block = BlocksHandler.getBlock(this_cell.blockId);
                if (!this_cell.done){
                    this_block.simulateBlock(x, y, this.cellGrid)
                    this_cell.done = true
                }
            }
        }

        //draw on screen?
        this.screenhandler.refreshScreen(this.cellGrid);
        this.resetCellDone()
    }

    resetCellDone(){
        var grid = this.cellGrid
        const width = grid[0].length;
        const height = grid.length;
        for (let y = 0; y < height; y++) {
            // Iterate over each cell in the row
            for (let x = 0; x < width; x++) {
                grid[y][x].done = false
            }
        }
    }

    // Method to get the current simulation instance
    static getInstance() {
        return Simulation.instance || new Simulation();
    }

    getRealFrames(){
        return this.real_frame
    }

    spawnExactElement(x,y,elementId){
        this.cellGrid[y][x].reset()
        this.cellGrid[y][x].blockId=elementId
    }

    spawnElement(x,y) {
        let id_to_spawn = UISelector.returnSelectedBlock()
        let radius = UISelector.returnSelectedBrush()
        
        if (radius==1){
            if (!this.isInLocalGrid(x, y, this.cellGrid)){
                return
            }
            this.cellGrid[y][x].reset()
            this.cellGrid[y][x].blockId=id_to_spawn
            return
        }
   
        // Calculate the square of the radius for comparison
        const radiusSquared = radius * radius;
    
        // Determine the bounds for the loop iterations
        const startX = Math.max(0, x - radius);
        const endX = Math.min(this.cellGrid[0].length - 1, x + radius);
        const startY = Math.max(0, y - radius);
        const endY = Math.min(this.cellGrid.length - 1, y + radius);
    
        // Iterate over the square area
        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                // Calculate the squared distance from the center (x, y)
                const dx = i - x;
                const dy = j - y;
                const distanceSquared = dx * dx + dy * dy;
    
                // Check if the cell falls within the circle
                if (distanceSquared <= radiusSquared) {
                    // Reset the cell and set the block ID
                    if (!this.isInLocalGrid(i, j, this.cellGrid)){
                        continue
                    }
                    this.cellGrid[j][i].reset();
                    this.cellGrid[j][i].blockId = id_to_spawn;
                }
            }
        }
    }



    // Function to create a 2D array of cells
    createCellGrid(width, height) {
        var grid = [];
        for (var y = 0; y < height; y++) {
            var row = [];
            for (var x = 0; x < width; x++) {
                // For empty cells, push null
                row.push(new Cell(x,y));
            }
            grid.push(row);
        }
        return grid;
    }

}