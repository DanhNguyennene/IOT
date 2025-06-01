import jwt
from ...config import Config
from datetime import timedelta, datetime
import logging
import uuid
import json
ACCESS_TOKEN_EXPIRY = 3600

def create_access_token(user_data:dict,expiry:timedelta = None,refresh:bool=False):
    payload = {}
    payload['user'] = user_data
    payload['exp'] = datetime.now() + (expiry if expiry is not None else timedelta(seconds=ACCESS_TOKEN_EXPIRY))
    payload['refresh'] = refresh
    payload['jti'] = str(uuid.uuid4())

    token = jwt.encode(
        payload=payload,
        key=Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM
    )
    return token


def decode_token(token:str)->dict:
    try:
        token_data = jwt.decode(
            jwt=token,
            key=Config.JWT_SECRET,
            algorithms=[Config.JWT_ALGORITHM]
        )
        return token_data
    except jwt.PyJWTError as e:
        logging.exception(e)
        return None
    

invalid_tokens_file = 'invalid_tokens.json'
def load_invalid_tokens():
    try:
        with open(invalid_tokens_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    
def save_invalid_tokens(tokens):
    with open(invalid_tokens_file, 'w') as f:
        json.dump(tokens, f)

def is_token_valid(token_details: dict) -> bool:
    jti = token_details['jti']
    
    invalid_tokens = load_invalid_tokens()
    
    return jti not in invalid_tokens