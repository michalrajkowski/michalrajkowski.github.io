import { BlocksHandler } from "./blocks_handler.js";
import { Simulation } from "./simulation.js";
import { ScreenHandler } from "./screen_handler.js";

export class UISelector{
    static selectedBlock=0
    static brushRadius=1
    static frames_per_tick=5
    constructor(simulation){
        this.simulation=simulation
        this.onStart()

    }

    onStart() {
        let startButtons = [];

        const clearScreenPanel = document.getElementById('clearScreen');

        // Create a button element
        const button = document.createElement('button');
        button.textContent = 'Clear Screen'; // Set button text
        button.classList.add('panel-button');
        // Add event listener to the button
        button.addEventListener('click', () => {
            // Call the clearScreen() method of this.simulation
            this.simulation.clearScreen();
        });

        // Append the button to the panel
        clearScreenPanel.appendChild(button);

        const button_clr = document.createElement('button');
        button_clr.textContent = 'Colors'; // Set button text
        button_clr.title = 'Be careful with this option. It might lag the hell out of your pc! O_o';
        button_clr.classList.add('panel-button');
        // Add event listener to the button
        button_clr.addEventListener('click', () => {
            // Call the clearScreen() method of this.simulation
            ScreenHandler.render_colors = !ScreenHandler.render_colors
        });

        // Append the button to the panel
        clearScreenPanel.appendChild(button_clr);

        const panel = document.getElementById('elementsButtonPanel');
        const blockDict = BlocksHandler.blockDict;
        Object.entries(blockDict).forEach(([key, value]) => {
            const button = document.createElement('button');
            button.classList.add('panel-button');

            // Create a span element for the color and symbol
            const span = document.createElement('span');
            span.textContent = value.letter_symbol;
            span.style.color = value.letter_color;

            // Append the span to the button
            button.appendChild(span);

            button.addEventListener('click', () => {
                UISelector.selectedBlock=key
            });
            panel.appendChild(button);

            if (value.letter_symbol=='S'){
                startButtons.push(button)
            }
        });

        const brushPanel = document.getElementById('brushesPanel');
        const brushDict = {
            1: 'S', // Small
            2: 'M', // Medium
            3: 'L',  // Large
            5: 'XL'  // Large
        };

        // Create brush buttons
        Object.entries(brushDict).forEach(([radius, symbol]) => {
            const button = document.createElement('button');
            button.classList.add('panel-button');

            // Create a span element for the symbol
            const span = document.createElement('span');
            span.textContent = symbol;
            // Optionally, you can apply different styles based on the radius here

            // Append the span to the button
            button.appendChild(span);

            // Add click event listener to set brush radius
            button.addEventListener('click', () => {
                UISelector.brushRadius = parseInt(radius); // Convert radius to integer
            });

            // Append button to brush panel
            brushPanel.appendChild(button);

            if (symbol=='S'){
                startButtons.push(button)
            }
        });

        const timePanel = document.getElementById('timePanel');
        const timeDict = {
            1: 'x4', // Small
            2: 'x2', // Medium
            5: 'x1',  // Large
            10: 'x0.5',
            20: 'x0.2',
            50: 'x0.1',
            99999999999999: 'PAUSE',
        };

        // Create brush buttons
        Object.entries(timeDict).forEach(([key, symbol]) => {
            const button = document.createElement('button');
            button.classList.add('panel-button');

            // Create a span element for the symbol
            const span = document.createElement('span');
            span.textContent = symbol;
            // Optionally, you can apply different styles based on the radius here

            // Append the span to the button
            button.appendChild(span);

            // Add click event listener to set brush radius
            button.addEventListener('click', () => {
                UISelector.frames_per_tick = key; // Convert radius to integer
            });

            // Append button to brush panel
            timePanel.appendChild(button);

            if (symbol=='x1'){
                startButtons.push(button)
            }
        });

        // Get the panels
        const elementsPanel = document.getElementById('elementsButtonPanel');
        const brushesPanel = document.getElementById('brushesPanel');
        const timePanelNew = document.getElementById('timePanel');

        // Add click event listeners to buttons in elements panel
        elementsPanel.addEventListener('click', handleButtonClick);

        // Add click event listeners to buttons in brushes panel
        brushesPanel.addEventListener('click', handleButtonClick);

        timePanelNew.addEventListener('click', handleButtonClick);

        this.onLateStart(startButtons)
    }

    onLateStart(startButtons){
        console.log(startButtons)
        // Press start values
        document.addEventListener('DOMContentLoaded', function() {
            startButtons.forEach(button => {
                button.click();
            });
        });

    }

    static updateSelectedBlockUI() {
        // Get the selected block
        const namePanel = document.getElementById('blockName');
        const descriptionPanel = document.getElementById('blockDescription');
        const selectedBlock = BlocksHandler.blockDict[UISelector.selectedBlock];
        namePanel.innerText=selectedBlock.block_name
        descriptionPanel.innerText=selectedBlock.block_desc
    }

    static returnSelectedBlock(){
        return UISelector.selectedBlock
    }

    static returnSelectedBrush(){
        return UISelector.brushRadius
    }
}

// Function to handle button click
function handleButtonClick(event) {
    const button = event.target.closest('.panel-button');
    if (button) {
        // Remove 'selected' class from all buttons in the same panel
        const buttons = button.parentElement.querySelectorAll('.panel-button');
        buttons.forEach(btn => btn.classList.remove('selected'));

        // Add 'selected' class to the clicked button
        button.classList.add('selected');

        // Check if the clicked button belongs to the block buttons
        if (button.parentElement.id === 'elementsButtonPanel') {
            // Additional method for block buttons
            UISelector.updateSelectedBlockUI()
        }
    }
}