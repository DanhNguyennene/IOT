from fastapi import APIRouter, HTTPException, Depends
from typing import List
import os
import json
from datetime import datetime
from pathlib import Path
from ..auth.auth_bearer import JWTBearer

router = APIRouter()

def get_all_commands():
    base_dir = Path(__file__).parent.parent.parent
    voice_control_dir = base_dir / "ai" / "voice-control" / "logs"
    all_commands = []

    # Walk through all date directories
    for date_dir in voice_control_dir.glob("*/"):
        if not date_dir.is_dir():
            continue
            
        commands_file = date_dir / "commands.json"
        if commands_file.exists():
            try:
                with open(commands_file, 'r') as f:
                    commands = json.load(f)
                    # Add the date to the commands
                    for cmd in commands:
                        cmd['date'] = date_dir.name
                    all_commands.extend(commands)
            except Exception as e:
                print(f"Error reading {commands_file}: {e}")

    return all_commands

@router.get("/")
async def get_commands():
    try:
        commands = get_all_commands()
        # Sort by time_recorded in descending order
        commands.sort(key=lambda x: datetime.strptime(x['time_recorded'], "%Y-%m-%d %H:%M:%S"), reverse=True)
        return commands
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-new-files")
async def check_new_files():
    try:
        base_dir = Path(__file__).parent.parent.parent
        voice_control_dir = base_dir / "ai" / "voice-control" / "logs"
        audio_dir = base_dir / "frontend" / "public" / "audio"
        
        # Ensure audio directory exists
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        # Get all existing commands
        existing_commands = get_all_commands()
        processed_files = {cmd['audio_file'] for cmd in existing_commands}
        
        # Find new WAV files
        new_commands = []
        for date_dir in voice_control_dir.glob("*/"):
            if not date_dir.is_dir():
                continue
                
            for wav_file in date_dir.glob("*.wav"):
                if wav_file.name not in processed_files:
                    # Create command object for new file
                    command = {
                        "transcribed_text": "",  # Will be filled by transcription service
                        "time_recorded": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "audio_file": wav_file.name,
                        "duration_seconds": 0,  # Will be filled by audio processing
                        "label": "unknown",  # Will be filled by classification
                        "date": date_dir.name
                    }
                    new_commands.append(command)
                    
                    # Copy WAV file to public/audio directory
                    target_path = audio_dir / wav_file.name
                    if not target_path.exists():
                        import shutil
                        shutil.copy2(wav_file, target_path)
        
        return {"new_files": new_commands}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 