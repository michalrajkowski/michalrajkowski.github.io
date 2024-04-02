import { Simulation } from "./simulation.js";
import { BlocksHandler } from "./blocks_handler.js";
import { HandleClicks } from "./handleclicks.js";
import { UISelector } from "./ui_selector.js";
//Main game loop

//Initialize everything
// - create screen array
// - fill with something?

//Game update

// Define a Cell object constructo
export class Cell {
    constructor(x, y, blockId=0, forceX=0, forceY=0, used_this_iteration=false) {
        this.position = { x: x, y: y };
        this.blockId = blockId;
        this.force = { x: forceX, y: forceY };
        this.done = false;
        this.used_this_iteration = used_this_iteration
    }

    reset(){
        this.blockId=0
        this.forceX=0
        this.forceY=0
        this.used_this_iteration=false
        this.done=false
    }
}

function onStart(){
    // Create a 2D array of cells
    var width = 5; // Width of the grid
    var height = 5; // Height of the grid
    var cellGrid = createCellGrid(width, height);
}

function myFunction(simulation) {
    simulation.simulateFrame();
}

//Create simulation and start the simulation
var simulation = new Simulation()
var uiselector = new UISelector(simulation)
var handleClicks = new HandleClicks(simulation);
simulation.setup(200, 40)

setInterval(() => {
    myFunction(simulation);
}, 10);
