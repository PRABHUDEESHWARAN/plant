import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import json

# Load the class labels (replace with your own class labels)
with open('class_labels.json', 'r') as f:
    class_labels = json.load(f)

# Load the pre-trained MobileNet model
model = models.mobilenet_v2(pretrained=False)  # Set pretrained to False if you don't want the pre-trained weights
num_classes = len(class_labels)  # Number of classes
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)  # Modify the final classification layer
model.load_state_dict(torch.load('m2.pth'))  # Load the trained model weights
model.eval()  # Set the model to evaluation mode

# Define the image transformation for inference (should match your training preprocessing)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),  # ImageNet mean and std
])

# Load and preprocess an image for inference
image_path = 'leaves\\vethalai.jpg'
image = Image.open(image_path).convert('RGB')
input_tensor = transform(image).unsqueeze(0)  # Add batch dimension

# Perform inference
with torch.no_grad():
    output = model(input_tensor)

# Get the predicted class label
_, predicted_class = torch.max(output, 1)
print(str(predicted_class.item()))
predicted_label = class_labels[str(predicted_class.item())]

# Print the predicted label
print(f'Predicted Class: {predicted_label}')
