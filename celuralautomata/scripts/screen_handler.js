import { BlocksHandler } from "./blocks_handler.js";
import { Block, Air, Sand, Iron, Water, Vortex, LivingMatter, Spawner, Cloud, Fish, Meat, Seed, GrowthCone_Bamboo, Bamboo_Up, Bamboo_Flower, KineticBall, Bamboo_Chopped, Fire,
    Fire_2,Fire_3,Fire_4, Human, Human_2, Pipe_Input_Output, Pipe, Pipe_THICC,
    Pipe_UR, Pipe_DR, Pipe_UL, Pipe_DL, Pipe_UD, Pipe_LR, Pipe_NR, Pipe_NL, Pipe_NU, Pipe_ND,
    Pipe_UR_THICC, Pipe_DR_THICC, Pipe_UL_THICC, Pipe_DL_THICC, Pipe_UD_THICC, Pipe_LR_THICC, Pipe_NR_THICC, Pipe_NL_THICC, Pipe_NU_THICC, Pipe_ND_THICC,
    Totem, IdeaMark, IdeaMark_Thinking, IdeaMark_WanderInDirection, IdeaMark_JoinTribe} from './blocks.js'
import { Simulation } from "./simulation.js";
export class ScreenHandler{
    static render_colors=false
    constructor(render_colors=false){
        if (!ScreenHandler.instance) {
            ScreenHandler.instance = this;
            ScreenHandler.render_colors=render_colors
            this.onStart();
        }
        return ScreenHandler.instance;
    }

    onStart(){
        document.body.style.textAlign = "center";
        this.div1 = document.getElementById('mainScreenTextDiv');
    }

    refreshScreen(grid) {
        let screen_text = this.simulationArrayToText(grid);
        this.drawOnScreen(screen_text);
    }

    getLetterFromForce(x, y) {
        // Create a unique index based on x and y
        const index = (x + y) % 26; // Ensure the index is within the range of 0-25
        
        // Convert the index to an uppercase letter
        return String.fromCharCode(65 + index); // 65 is the Unicode code point for 'A'
    }
    
    simulationArrayToText(grid) {
        let text = '';
    
        for (let row of grid) {
            for (let cell of row) {
                // special case
                // check if it is human 
                var cell_letter = BlocksHandler.getBlock(cell.blockId).getLetterSymbol();
                let is_human = (cell.blockId == BlocksHandler.getBlockId(Human))
                
                if (is_human){
                    const how_often_show = 100
                    const for_how_long = 20
                    console.log(Simulation.getInstance().getRealFrames())
                    if ((Simulation.getInstance().getRealFrames() % how_often_show) < for_how_long){
                        if (cell.force.x == 0 && cell.force.y == 0){
                            cell_letter = '0'
                        }else{
                            cell_letter = this.getLetterFromForce(cell.force.x, cell.force.y);
                        }
                    }
                }
                var cell_color = BlocksHandler.getBlock(cell.blockId).letter_color;
                if (ScreenHandler.render_colors){
                    text += `<span style="color: ${cell_color};">${cell_letter}</span>`;
                }else{
                    text+=cell_letter
                }
            }
    
            text += '<br>';
        }
    
        return text;
    }
    
    drawOnScreen(text) {
        // Instead of updating the innerHTML directly,
        // consider using a document fragment for better performance
        let fragment = document.createRange().createContextualFragment(text);
        this.div1.innerHTML = '';
        this.div1.appendChild(fragment);
    }
}