import { BlocksHandler } from "./blocks_handler.js";
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
    
    simulationArrayToText(grid) {
        let text = '';
    
        for (let row of grid) {
            for (let cell of row) {
                var cell_letter = BlocksHandler.getBlock(cell.blockId).getLetterSymbol();
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