import cv2
import numpy as np
import requests
import time
import sys
import os

API_URL = "http://127.0.0.1:8000/ps/draw_stroke"

def image_to_strokes(image_path, scale_factor=1.0):
    if not os.path.exists(image_path):
        print(f"Error: Image '{image_path}' not found.")
        return

    print(f"Loading image {image_path}...")
    img = cv2.imread(image_path)
    
    if img is None:
        print("Error: Could not read the image. Is it a valid image file?")
        return

    # Resize if needed to fit PS canvas better
    if scale_factor != 1.0:
        img = cv2.resize(img, (0, 0), fx=scale_factor, fy=scale_factor)

    print("Extracting edges and contours...")
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply slight blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Canny edge detection
    edges = cv2.Canny(blurred, threshold1=50, threshold2=150)
    
    # Find contours
    contours, hierarchy = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"Found {len(contours)} raw contours. Filtering and simplifying...")
    
    valid_strokes = []
    
    for cnt in contours:
        # Filter out very small noise (less than 5 points)
        if len(cnt) < 5:
            continue
            
        # Simplify contour to reduce points (epsilon = 2.0)
        epsilon = 2.0 # Higher means fewer points, less accuracy
        approx = cv2.approxPolyDP(cnt, epsilon, closed=False)
        
        # We need at least 2 points to make a stroke
        if len(approx) < 2:
            continue
            
        points = []
        for pt in approx:
            x, y = pt[0]
            points.append({"x": float(x), "y": float(y)})
            
        valid_strokes.append(points)
        
    print(f"Ready to draw {len(valid_strokes)} strokes in Photoshop!")
    
    input("Press Enter to begin the drawing process in Photoshop...")
    
    success_count = 0
    for i, stroke_points in enumerate(valid_strokes):
        payload = {
            "points": stroke_points,
            "stroke_name": f"Stroke_{i}"
        }
        
        try:
            res = requests.post(API_URL, json=payload, timeout=5)
            if res.status_code == 200:
                success_count += 1
            else:
                print(f"Failed to draw stroke {i}: {res.text}")
        except Exception as e:
            print(f"Connection error on stroke {i}: {e}")
            
        # Add a tiny sleep so PS doesn't choke on thousands of requests instantly
        time.sleep(0.05)
        
        if (i + 1) % 10 == 0:
            print(f"Progress: {i + 1} / {len(valid_strokes)} strokes drawn...")

    print(f"Finished! Successfully drawn {success_count} / {len(valid_strokes)} strokes.")


if __name__ == "__main__":
    print("===========================================")
    print("🎨 AI Image Replicator (OpenCV -> Photoshop)")
    print("===========================================")
    print("Make sure:")
    print("1. main.py API server is running on port 8000")
    print("2. Photoshop is open with a blank document (match image size)")
    print("3. Brush tool is selected with a fine tip (e.g. 2px)")
    print("===========================================")
    
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
    else:
        img_path = input("Enter the absolute path to your image file (e.g. D:/test.jpg): ").strip()
        # Remove quotes if dragged and dropped
        img_path = img_path.strip('"').strip("'")
        
    image_to_strokes(img_path)
