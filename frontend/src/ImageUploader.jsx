import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
// import myImage from './imgs/upload.png';



function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [image, setImage] = useState(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [label, setLabel] = useState('');
  const fileInputRef = useRef(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const webcamRef = useRef(null);


  useEffect(() => {
    // Start the webcam when the component mounts if isWebcamOn is true
    if (isWebcamOn && webcamRef.current) {
      webcamRef.current.getScreenshot();
    }
  }, [isWebcamOn]);

  const handleFileSelect = () => {
    if (!label) {
      console.error('Label is required.');
      return;
    }
  
    const input = document.getElementById('fileInput');
    const file = input.files[0];
  
    if (!file) {
      console.error('No file selected.');
      return;
    }
  
    setSelectedFile(file);
  };
  
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const enableButton = () => {
    setButtonDisabled(false);
  };
  const takeScreenshot = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    enableButton();  
    // Check if imageSrc is null or undefined before calling dataURLtoBlob
    if (imageSrc) {
      const blob = dataURLtoBlob(imageSrc);
      setSelectedFile(blob);
      setImage(imageSrc);
      setShowLabelInput(true);
    } else {
      console.error('Failed to capture screenshot.');
    }
  };
  

  const toggleWebcam = () => {
    setIsWebcamOn(!isWebcamOn);
    enableButton();
  };

const dataURLtoBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: 'image/png' }); // Change the type based on the screenshot format
};

// ... (rest of the code)


const handleLabelChange = (event) => {
  setLabel(event.target.value);
};
const handleSubmit = (event) => {
  event.preventDefault(); // Prevent the default form submission
  handleFileSelect();
  if (fileInputRef.current) {
    fileInputRef.current.click(); // Programmatically open the file selection dialog
  }
};

  const handleUpload = async () => {
    if (!selectedFile && !image) return;

    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else {
      const blob = await fetch(image).then((r) => r.blob());
      formData.append('image', blob, 'screenshot.png');
    }

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.class_name);
        setPrediction(data.class_name);
      } else {
        alert('Error:', response.statusText);
      }
    } catch (error) {
      alert('Error:', error);
    }
  };


   
   const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert the image to a File object
        const base64 = imageSrc.split(',')[1];
        const blob = new Blob([Buffer.from(base64, 'base64')], { type: 'image/png' });
        const file = new File([blob], 'webcam-snapshot.png', { type: 'image/png' });

        setSelectedFile(file);
      } else {
        alert('Failed to capture screenshot.');
      }
    } else {
      alert('Webcam not initialized.');
    }
  };
  

  return (
    <div style={{ color: 'white' }}>
      <h1>ef-lora</h1>
      <button onClick={toggleMenu} className="hamburger-button">
        &#9776; {/* This is the Unicode character for a hamburger icon */}
      </button>
      {isMenuOpen && <div>
      <input type="file" accept=".jpg, .jpeg, .png, .svg" className="File" onChange={handleFileSelect}  x />
        <button onClick={handleUpload}>Upload</button>
        <button onClick={toggleWebcam}>{isWebcamOn ? 'Deactivate Cam' : 'Activate Cam'}</button>
        <button onClick={takeScreenshot} disabled={isButtonDisabled}>Take Screenshot</button>
        <button onClick={handleUpload} >Upload Screenshot</button>
      </div>
      }
      {isWebcamOn && <Webcam className="WebCam" ref={webcamRef}/>
      }
      {image && <img className="Image" src={image} alt="Screenshot" />}
      {showLabelInput && ( // Only show the label input if showLabelInput is true
        <form onSubmit={handleSubmit}> {/* Wrap the input and button in a form */}
        <label htmlFor="labelInput" className='labelInput'>Enter the Image Name:</label>
        <input type="text" id="labelInput" value={label} onChange={handleLabelChange} />
        <button type="submit">Submit</button> {/* Add a submit button */}
      </form>
      )}
      {prediction && (
        <div>
          <h2>Prediction:</h2>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;