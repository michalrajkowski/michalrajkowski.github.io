// Get the button element and popup element
const popupButton = document.getElementById("popupButton");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

// Function to display the popup when button is clicked
popupButton.addEventListener("click", function() {
  popup.style.display = "block";
});

// Function to close the popup when close button is clicked
closePopup.addEventListener("click", function() {
  popup.style.display = "none";
});

// Close the popup if user clicks outside of it
window.addEventListener("click", function(event) {
  if (event.target == popup) {
    popup.style.display = "none";
  }
});
