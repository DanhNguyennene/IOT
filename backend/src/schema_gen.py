from pymongo import MongoClient

def create_schema():
    client = MongoClient("mongodb://localhost:27017")
    db = client["QQ"] 

    device_schema = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["ID", "Humidity", "Light", "Temperature", "placeID"],
            "properties": {
                "ID": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "Humidity": {
                    "bsonType": "number",
                    "description": "must be a number and is required"
                },
                "Light": {
                    "bsonType": "number",
                    "description": "must be a number and is required"
                },
                "Temperature": {
                    "bsonType": "object",
                    "required": ["time", "value"],
                    "properties": {
                        "time": {
                            "bsonType": "date",
                            "description": "must be a date and is required"
                        },
                        "value": {
                            "bsonType": "number",
                            "description": "must be a number and is required"
                        }
                    },
                    "description": "temperature object containing time and value"
                },
                "placeID": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                }
            }
        }
    }

    user_schema = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["userId", "username","email","role", "faceID", "password", "createdAt"],
            "properties": {
                "userId": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "gender": {
                    "bsonType": "string",
                    "description": "must be a string and is not required"
                },
                "username": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "email": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "role": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "faceID": {
                    "type": "array",
                    "items": { "type": "number" },
                    "description": "Numerical vector representing FaceID (e.g., [0.12, -0.45, 0.78, ...])"
                },
                "password": {
                    "bsonType": "string",
                    "description": "must be a string (hash or profile data) and is required"
                },
                "authorizedDevices": {
                    "bsonType": "array",
                    "items": {"bsonType": "string"},
                    "description": "must be an array of device IDs (strings)"
                },
                "createdAt": {
                    "bsonType": "date",
                    "description": "must be a date and is required"
                }
            }
        }
    }
    if "user" in db.list_collection_names():
        db.drop_collection("user")
    if "record_device" in db.list_collection_names():
        db.drop_collection("record_device")
    db.create_collection(
        'user', 
        validator=user_schema
    )
    # Pass the schema directly to the validator paramer
    db.create_collection(
        "record_device",
        validator=device_schema
    )
    print("Collection with schema created successfully")


create_schema()
