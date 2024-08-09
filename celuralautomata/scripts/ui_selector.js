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

        const button_picture = document.createElement('button');
        button_picture.textContent = 'Picture'; // Set button text
        button_picture.classList.add('panel-button');
        // Add event listener to the button
        button_picture.addEventListener('click', () => {
            // Call the clearScreen() method of this.simulation
            const inputElement = document.getElementById('imageInput');
            inputElement.click();
        });

        // Append the button to the panel
        clearScreenPanel.appendChild(button_picture);

        //Image load handling:
        // Event listener for file input change
        document.getElementById('imageInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                loadImageFromFile(file);
            }
        });


        const panel = document.getElementById('elementsButtonPanel');
        const blockDict = BlocksHandler.blockDict;
        Object.entries(blockDict).forEach(([key, value]) => {
            // console.log(value)
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

function findClosestNumber(number, array) {
    let closestNumber = array[0];
    let minDifference = Math.abs(number - closestNumber);
    let closestIndex = 0;

    for (let i = 1; i < array.length; i++) {
        const difference = Math.abs(number - array[i]);

        if (difference < minDifference) {
            closestNumber = array[i];
            minDifference = difference;
            closestIndex = i;
        }
    }

    return { closestNumber, closestIndex };
}

function paintDataOnScreen(modifiedImgDataUrl, pixelColors){
    const symbols_dict = [32,96,160,224];
    const symbols_to_elements_id = [0,4,3,2]
    const width = pixelColors.length / 40;
    const startX = Math.floor(100 - width / 2);
    
    for (let i = 0; i < pixelColors.length; i++) {
        const { closestNumber, closestIndex } = findClosestNumber(pixelColors[i], symbols_dict);
        
        const element_id = symbols_to_elements_id[closestIndex]
        let sim_y = Math.floor(i / width)
        let sim_x = i - sim_y*width + startX
        // narysowanie w symulacji tego czegoś!
        Simulation.instance.spawnExactElement(sim_x, sim_y, element_id);
    }

    //rerender screen!
    ScreenHandler.instance.refreshScreen(Simulation.instance.cellGrid);
}

function loadImageFromFile(file){
    asyncLoadImageFromFile(file, 4)
    .then(({ modifiedImgDataUrl, pixelColors }) => {
        // Call your function here or perform any other operations
        paintDataOnScreen(modifiedImgDataUrl, pixelColors)
    })
    .catch(error => {
        console.error("Error loading image:", error);
    });
}

function ditherImage(imageData, numColors) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Convert the image to grayscale
    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = brightness;
    }

    // Dithering
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const oldPixel = data[index];
            const newPixel = Math.round(oldPixel * (numColors - 1) / 255) * (255 / (numColors - 1));
            const quantError = oldPixel - newPixel;
            data[index] = data[index + 1] = data[index + 2] = newPixel;

            // Diffuse the error
            if (x < width - 1) {
                data[index + 4] += quantError * 7 / 16;
            }
            if (x > 0 && y < height - 1) {
                data[index + width * 4 - 4] += quantError * 3 / 16;
            }
            if (y < height - 1) {
                data[index + width * 4] += quantError * 5 / 16;
            }
            if (x < width - 1 && y < height - 1) {
                data[index + width * 4 + 4] += quantError * 1 / 16;
            }
        }
    }

    return imageData;
}

function asyncLoadImageFromFile(file, numColors) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let newWidth;
        let pixelColors = []; // Array to store pixel colors

        reader.onload = function() {
            const img = new Image();
            img.onload = function() {
                // Calculate the aspect ratio
                const aspectRatio = img.width / img.height;

                // Calculate the width while maintaining the aspect ratio
                newWidth = Math.round(40 * aspectRatio);

                // Create a canvas element
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Resize the canvas
                canvas.width = newWidth;
                canvas.height = 40;

                // Draw the image onto the canvas, resizing it
                ctx.drawImage(img, 0, 0, newWidth, canvas.height);

                // Get the image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Convert the image to black and white
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg; // Red
                    data[i + 1] = avg; // Green
                    data[i + 2] = avg; // Blue

                    // Save pixel color to array
                }

                // Apply dithering with the specified number of colors
                const ditheredImageData = ditherImage(imageData, numColors);
                for (let i = 0; i < ditheredImageData.data.length; i += 4) {
                    const avg = ditheredImageData.data[i]
                    pixelColors.push(avg);
                }
                // Put the modified image data back onto the canvas
                ctx.putImageData(ditheredImageData, 0, 0);

                // Get the data URL of the modified image
                const modifiedImgDataUrl = canvas.toDataURL('image/png');

                console.log(`${modifiedImgDataUrl}`)
                // Resolve the promise once all operations are completed
                resolve({ modifiedImgDataUrl, pixelColors});
            };

            img.src = reader.result;
        };

        // Error handling for FileReader
        reader.onerror = function(error) {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}