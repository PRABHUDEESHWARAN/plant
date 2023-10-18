import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    // Start the webcam when the component mounts
    if (webcamRef.current) {
      webcamRef.current.getScreenshot();
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    setSelectedFile(file);
  };

  const takeScreenshot = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setSelectedFile(imageSrc);
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
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <h1>ef-lora</h1>
      <input type="file" accept=".jpg, .jpeg, .png, .svg" name="File"onChange={handleFileSelect} />
      <button onClick={handleUpload}>Upload</button>
      <div>
        <Webcam className="WebCam" ref={webcamRef} />
        <button className="TakeSSButton" onClick={takeScreenshot}>Take Screenshot</button>

        {image && <img className="Image" src={image} alt="Screenshot" />}
        <button className="UploadButton" onClick={handleUpload}>Upload Screenshot</button>
      </div>
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