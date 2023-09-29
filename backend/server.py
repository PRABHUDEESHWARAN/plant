from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import json,os,io
app=Flask(__name__)
CORS(app)
CORS(app, origins=["http://localhost:3000"])  # Replace with the actual origin of your React app
# Load the class labels (replace with your own class labels)
with open('training_and_detection/class_labels.json', 'r') as f:
    class_labels = json.load(f)

# Load the pre-trained MobileNet model
model = models.mobilenet_v2(pretrained=False)  # Set pretrained to False if you don't want the pre-trained weights
num_classes = len(class_labels)  # Number of classes
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)  # Modify the final classification layer
model.load_state_dict(torch.load('models/m2.pth'))  # Load the trained model weights
model.eval()  # Set the model to evaluation mode

 # Define the image transformation for inference (should match your training preprocessing)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),  # ImageNet mean and std
])


@app.route('/')
def home():
    return "hello world"


@app.route('/predict', methods=['GET','POST'])
def predict():
    try:
    # Receive image file from the frontend
        file = request.files['image']
    
    # Ensure that the received file is an image
        if file and allowed_file(file.filename):
            # Read and preprocess the image
            image = Image.open(file.stream).convert('RGB')
            image = transform(image).unsqueeze(0)
        
            # Perform inference
            with torch.no_grad():
                output = model(image)
        
            # Get the predicted class index
            _, predicted_class = torch.max(output, 1)
            predicted_label = class_labels[str(predicted_class.item())]
            print(predicted_label)
            return jsonify({'class_name': predicted_label})
        else:
            return jsonify({'error': 'Invalid file or file type'})

    except Exception as e:
        return jsonify({'error': str(e)})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)