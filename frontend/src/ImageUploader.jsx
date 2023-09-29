import React, { useState, useRef,useEffect } from 'react';
import Webcam from 'react-webcam';

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    // Start the webcam when the component mounts
    if (webcamRef.current) {
      webcamRef.current.startVideo();
    }
  }, []);
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
        mode:'cors'
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
        console.error('Failed to capture screenshot.');
      }
    } else {
      console.error('Webcam not initialized.');
    }
  };
  

  return (
    <div>
      <h1>Image Classifier</h1>
      <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFileSelect} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={captureImage}>Capture Webcam Snapshot</button>
      {webcamRef.current && <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" />}
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
