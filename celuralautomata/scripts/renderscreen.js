function makeDiv() { return document.createElement("div"); }
function bodyAppend(element) { document.body.appendChild(element); }

function generateRandomCharacter() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  }
  
  function generateRandomCharArray() {
    const array = [];
  
    // Generate random characters for each field in the array
    for (let i = 0; i < 40; i++) {
      const row = [];
      for (let j = 0; j < 150; j++) {
        row.push(generateRandomCharacter());
      }
      array.push(row);
    }
  
    return array;
  }
  
  function arrayToString(array) {
    const text = array.map(row => {
        return row.map(char => {
            return char;
        }).join('');
      }).join('<br>') + '<br>';
    return text;
  }

  function ASCIIAnimation(speed, DOMtarget) {
    // get random array
    let currentFrame = 0
    const randomArray = generateRandomCharArray();
    const randomCharArray = arrayToString(randomArray);
    DOMtarget.innerHTML = randomCharArray;
    currentFrame++;
    this.animation = setInterval(function() {
        const randomArray = generateRandomCharArray();
        const randomCharArray = arrayToString(randomArray);
        DOMtarget.innerHTML = randomCharArray;
    }, speed);
    this.getCurrentFrame = function() {
        return currentFrame;
    }
  }
  
  ASCIIAnimation.prototype.stopAnimation = function() {
      clearInterval(this.animation);
  }


  document.body.style.textAlign = "center";
  var div1 = document.getElementById('mainScreenTextDiv');
  var anim1 = new ASCIIAnimation(100, div1);