import os
import json

# Specify the directory where your dataset is stored
dataset_directory = 'D:\leaves'

# Initialize an empty dictionary to store class labels
class_labels = {}
cnt=0
# Iterate through the subdirectories (class directories) in the dataset directory
for class_name in os.listdir(dataset_directory):
    # Check if it's a directory
    if os.path.isdir(os.path.join(dataset_directory, class_name)):
        # Use the class directory name (class_name) as the label
        # You can modify this to extract the label from the file name if needed
        class_labels[cnt] = class_name
        cnt+=1

# Save the dictionary to a JSON file
with open('class_labels.json', 'w') as json_file:
    json.dump(class_labels, json_file, indent=4)

print("Class labels saved to 'class_labels.json'")
