let video = document.getElementById("video");
let model;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Get the input and button elements
let personNameInput = document.getElementById("personName");
let captureBtn = document.getElementById("captureBtn");
let savedFacesDiv = document.getElementById("savedFaces");

// Initialize camera
const accessCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: 500, height: 400 },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    });
};

// Detect faces and draw rectangles (for visualization purposes)
const detectFaces = async () => {
  const predictions = await model.estimateFaces(video, false);
  ctx.drawImage(video, 0, 0, 500, 400);
  
  predictions.forEach((prediction) => {
    // Draw rectangle for face (optional, can be removed)
    ctx.beginPath();
    ctx.lineWidth = "4";
    ctx.strokeStyle = "yellow";
    ctx.rect(
      prediction.topLeft[0],
      prediction.topLeft[1],
      prediction.bottomRight[0] - prediction.topLeft[0],
      prediction.bottomRight[1] - prediction.topLeft[1]
    );
    ctx.stroke();
  });
};

// Capture only the face (crop face area)
const captureFace = async () => {
  const name = personNameInput.value;
  if (!name) {
    alert("Please enter a name.");
    return;
  }

  const predictions = await model.estimateFaces(video, false);
  
  if (predictions.length > 0) {
    const prediction = predictions[0]; // Assume first face is the target

    // Extract face coordinates
    const [x, y] = prediction.topLeft;
    const [x2, y2] = prediction.bottomRight;
    
    const width = x2 - x;
    const height = y2 - y;

    // Crop the face from the video feed using the coordinates
    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = width;
    faceCanvas.height = height;
    const faceCtx = faceCanvas.getContext("2d");

    // Draw the cropped face onto the faceCanvas
    faceCtx.drawImage(video, x, y, width, height, 0, 0, width, height);

    // Convert the cropped face to an image
    const faceImage = faceCanvas.toDataURL("image/png");

    // Create an image element to show the captured face
    const img = document.createElement("img");
    img.src = faceImage;
    img.width = 100;

    // Create a label with the person's name
    const label = document.createElement("p");
    label.textContent = name;

    // Append the name and image to the savedFacesDiv
    const container = document.createElement("div");
    container.appendChild(img);
    container.appendChild(label);
    savedFacesDiv.appendChild(container);

    // Clear the input field after capturing
    personNameInput.value = '';
  } else {
    alert("No face detected!");
  }
};

// Event listener to capture the face when button is clicked
captureBtn.addEventListener("click", captureFace);

// Initialize camera and face detection model
accessCamera();
video.addEventListener("loadeddata", async () => {
  model = await blazeface.load();
  setInterval(detectFaces, 40); // Detect faces every 40ms
});
