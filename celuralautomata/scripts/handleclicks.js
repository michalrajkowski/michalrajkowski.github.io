import { Simulation } from "./simulation.js";
import { UISelector } from "./ui_selector.js";

export class HandleClicks {
  constructor(simulation) {
    this.simulation = simulation;
    this.x = 0
    this.y = 0
    this.onStart();
  }

  onStart() {
    this.textBlock = document.getElementById('mainScreenTextDiv');
    this.holdTimer;

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this); // Bind handleMouseMove to the class instance

    this.textBlock.addEventListener('click', this.handleClick);
    this.textBlock.addEventListener('mouseover', this.handleMouseOver);
    this.textBlock.addEventListener('mousedown', this.handleMouseDown);
    this.textBlock.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove); // Add mousemove event listener
  }

  handleClick(event) {
    const rect = this.textBlock.getBoundingClientRect();
    const charWidth = this.textBlock.clientWidth / 200;
    const charHeight = this.textBlock.clientHeight / 40;

    const x = Math.floor((this.x - rect.left) / charWidth);
    const y = Math.floor((this.y - rect.top) / charHeight);

    if (x >= 0 && x < 200 && y >= 0 && y < 40) {
      this.simulation.spawnElement(x, y);
    }
  }

  handleMouseOver(event) {
    if (event.target.classList.contains('hoverable')) {
      event.target.style.cursor = 'pointer';
    } else {
      event.target.style.cursor = 'default';
    }
  }

  handleMouseDown(event) {
    this.holdTimer = setInterval(() => {
      const rect = this.textBlock.getBoundingClientRect();
      const charWidth = this.textBlock.clientWidth / 200;
      const charHeight = this.textBlock.clientHeight / 40;

      const x = Math.floor((this.x - rect.left) / charWidth);
      const y = Math.floor((this.y - rect.top) / charHeight);

      if (x >= 0 && x < 200 && y >= 0 && y < 40) {
        this.simulation.spawnElement(x, y);
      }
    }, 10);
  }

  handleMouseUp(event) {
    clearInterval(this.holdTimer);
  }

  handleMouseMove(event) {
    this.x = event.clientX
    this.y = event.clientY
  }
}
