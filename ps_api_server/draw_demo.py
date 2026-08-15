import requests
import math
import time

API_URL = "http://127.0.0.1:8000"

def draw_star(center_x, center_y, outer_radius, inner_radius, points=5):
    """Generate coordinates for a star and send to PS API to draw it."""
    print("Generating star coordinates...")
    path_points = []
    angle_step = math.pi / points
    
    # Start at the top
    start_angle = -math.pi / 2
    
    for i in range(points * 2 + 1):
        r = outer_radius if i % 2 == 0 else inner_radius
        a = start_angle + i * angle_step
        x = center_x + r * math.cos(a)
        y = center_y + r * math.sin(a)
        path_points.append({"x": x, "y": y})
        
    print(f"Generated {len(path_points)} points. Sending to Photoshop...")
    
    # Send the drawing request
    payload = {
        "points": path_points,
        "stroke_name": "AI Star"
    }
    
    response = requests.post(f"{API_URL}/ps/draw_stroke", json=payload)
    if response.status_code == 200:
        print("Success! Photoshop has drawn the star.")
    else:
        print("Error:", response.text)

def draw_spiral(center_x, center_y, max_radius, turns=5, points_per_turn=20):
    """Generate coordinates for a spiral and send to PS API."""
    print("Generating spiral coordinates...")
    path_points = []
    total_points = turns * points_per_turn
    
    for i in range(total_points):
        # Progress from 0 to 1
        t = i / (total_points - 1)
        r = t * max_radius
        a = t * turns * 2 * math.pi
        
        x = center_x + r * math.cos(a)
        y = center_y + r * math.sin(a)
        path_points.append({"x": x, "y": y})
        
    print(f"Generated {len(path_points)} points. Sending to Photoshop...")
    
    payload = {
        "points": path_points,
        "stroke_name": "AI Spiral"
    }
    
    response = requests.post(f"{API_URL}/ps/draw_stroke", json=payload)
    if response.status_code == 200:
        print("Success! Photoshop has drawn the spiral.")
    else:
        print("Error:", response.text)

if __name__ == "__main__":
    print("===========================================")
    print("🤖 Photoshop Robotic Painter - Demo Script")
    print("===========================================")
    print("Make sure:")
    print("1. main.py API server is running on port 8000")
    print("2. Photoshop is open with a blank document")
    print("3. You have selected a Brush tool and chosen a color/size")
    print("===========================================")
    
    input("Press Enter to draw a Star...")
    draw_star(center_x=300, center_y=300, outer_radius=150, inner_radius=60)
    
    time.sleep(1)
    
    input("Press Enter to draw a Spiral...")
    draw_spiral(center_x=600, center_y=300, max_radius=150)
    
    print("Demo completed!")
