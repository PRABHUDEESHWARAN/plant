import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image

# Define the class labels if available (replace with your own class labels)
class_labels = ["Alpinia Galanga",
     "Amaranthus Viridis",
     "Artocarpus Heterophyllus",
     "Azadirachta Indica",
     "Basella Alba",
     "Brassica Juncea",
     "Carissa Carandas",
     "Citrus Limon",
     "Ficus Auriculata",
     "Ficus Religiosa",
     "Hibiscus Rosa-sinensis",
     "Jasminum",
     "Mangifera Indica",
     "Mentha",
     "Moringa Oleifera",
     "Muntingia Calabura",
     "Murraya Koenigii",
     "Nerium Oleander",
     "Nyctanthes Arbor-tristis",
     "Ocimum Tenuiflorum",
     "Piper Betle",
     "Plectranthus Amboinicus",
     "Pongamia Pinnata",
     "Psidium Guajava",
     "Punica Granatum",
    "Santalum Album",
     "Syzygium Cumini",
     "Syzygium Jambos",
     "Tabernaemontana Divaricata",
     "Trigonella Foenum-graecum"]

# Load the pre-trained ResNet model
model = models.resnet18(pretrained=False)  # Set pretrained to False if you don't want the pre-trained weights
num_classes = len(class_labels)  # Number of classes
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)  # Modify the final classification layer
model.load_state_dict(torch.load('resnet_model.pth'))  # Load the trained model weights
model.eval()  # Set the model to evaluation mode

# Define the image transformation for inference (should match your training preprocessing)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),  # ImageNet mean and std
])

# Load and preprocess an image for inference
image_path = 'vethalai.jpg'
image = Image.open(image_path).convert('RGB')
input_tensor = transform(image).unsqueeze(0)  # Add batch dimension

# Perform inference
with torch.no_grad():
    output = model(input_tensor)

# Get the predicted class label
_, predicted_class = torch.max(output, 1)
predicted_label = class_labels[predicted_class.item()]

# Print the predicted label
print(f'Predicted Class: {predicted_label}')
