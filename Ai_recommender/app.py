import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv

# --- 1. Load Environment & Connect to Database ---
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI or MONGODB_URI environment variable not found.")

try:
    client = MongoClient(MONGO_URI)
    # Connect to your specific database
    db = client["campuspulse"] 
    client.admin.command('ping')
    print("MongoDB connection successful.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

# --- 2. Helper Function to Serialize MongoDB Data ---
# We include this helper here so we don't need events.py
def serialize_mongo_data(data):
    """
    Recursively converts MongoDB data (like ObjectId and datetime) 
    into a JSON-serializable format.
    """
    if isinstance(data, list):
        return [serialize_mongo_data(item) for item in data]
    
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            # Convert _id to a simple 'id' string
            if key == "_id":
                new_dict['id'] = str(value) 
            else:
                new_dict[key] = serialize_mongo_data(value)
        return new_dict
        
    if isinstance(data, datetime):
        return data.isoformat() # Convert dates to strings
        
    if isinstance(data, ObjectId):
        return str(data) # Convert ObjectIds to strings
        
    return data

# --- 3. Initialize the Flask App & CORS ---
app = Flask(__name__)

# Get allowed origins from environment
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3001,http://localhost:5000").split(",")
# Allow requests from React app, backend, and production URLs
CORS(app, resources={r"/*": {"origins": allowed_origins}})


# --- 4. Health Check Endpoint ---
@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify service is running"""
    if db is None:
        return jsonify({"status": "unhealthy", "message": "Database connection failed"}), 500
    
    try:
        # Test database connection
        db.admin.command('ping')
        return jsonify({
            "status": "healthy",
            "message": "AI Recommendation Service is running",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "message": f"Database error: {str(e)}"
        }), 500

# --- 5. Define the Recommendation API Route ---
@app.route("/recommendations/<string:phone_number>", methods=["GET"])
def get_recommendations(phone_number):
    
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    print(f"[API] Received recommendation request for phone: {phone_number}")

    try:
        # --- Fetch User Data ---
        user = db.users.find_one({"phone": phone_number})
        
        if not user:
            print(f"[API] User not found: {phone_number}")
            return jsonify({"error": "User not found"}), 404
        
        user_interests = user.get("interests", [])
        registered_event_refs = user.get("eventsRegistered", [])
        
        # Get the IDs of events the user is already registered for
        registered_event_ids = [ref.get("eventId") for ref in registered_event_refs if ref.get("eventId")]

        print(f"[API] User interests: {user_interests}")
        print(f"[API] User already registered for event IDs: {registered_event_ids}")

        # --- Build the "Smart" MongoDB Query ---
        today = datetime.now()

        query = {
            "$and": [
                {
                    # Match events where 'tags' or 'category' matches user 'interests'
                    "$or": [
                        {"tags": {"$in": user_interests}},
                        {"category": {"$in": user_interests}}
                    ]
                },
                {"date": {"$gte": today}}, # Filter out past events
                {"status": "approved"}, # Only approved events
                {"_id": {"$nin": registered_event_ids}} # Filter out registered events
            ]
        }
        
        # --- Execute Query & Return ---
        raw_events = list(db.events.find(query).limit(10))
        
        print(f"[API] Found {len(raw_events)} raw events matching interests.")
        
        # Convert to recommendation format with scoring
        recommendations = []
        for event in raw_events:
            # Calculate match score based on interest overlap
            event_tags = event.get("tags", [])
            event_category = event.get("category", "")
            
            matching_interests = []
            score = 0.0
            
            # Check category match
            if event_category in user_interests:
                matching_interests.append(f"Category: {event_category}")
                score += 0.4
            
            # Check tag matches
            for tag in event_tags:
                if tag in user_interests:
                    matching_interests.append(f"Interest: {tag}")
                    score += 0.2
            
            # Ensure minimum score
            if score == 0:
                score = 0.3
            
            # Cap maximum score
            score = min(score, 1.0)
            
            # Build recommendation reasons
            reasons = [
                f"Matches your interest in {', '.join(matching_interests[:2])}" if matching_interests else "Based on your profile"
            ]
            
            if len(matching_interests) > 2:
                reasons.append(f"Also relates to {', '.join(matching_interests[2:4])}")
            
            # Format as recommendation object
            recommendation = {
                "event": serialize_mongo_data(event),
                "score": round(score, 2),
                "reasons": reasons,
                "matchingInterests": matching_interests
            }
            
            recommendations.append(recommendation)
        
        # Sort by score (highest first)
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        print(f"[API] Returning {len(recommendations)} formatted recommendations.")
        
        # Return in the expected format
        response = {
            "success": True,
            "data": {
                "recommendations": recommendations,
                "userInterests": user_interests,
                "totalFound": len(recommendations)
            }
        }
        
        return jsonify(response)

    except Exception as e:
        print(f"[API] Error: {e}")
        return jsonify({"error": str(e)}), 500


# --- 6. Run the Server ---
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("FLASK_ENV") != "production"
    
    print("="*50)
    print("🤖 CampusPulse AI Recommendation Service")
    print("="*50)
    print(f"Starting Flask recommendation server on port {port}")
    print(f"Health Check: http://localhost:{port}/health")
    print(f"API Endpoint: http://localhost:{port}/recommendations/<phone>")
    print(f"Environment: {os.getenv('FLASK_ENV', 'development')}")
    print("="*50)
    
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    except Exception as e:
        print(f"Failed to start server: {e}")