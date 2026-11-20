from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import users_collection
from google.oauth2 import id_token
from google.auth.transport import requests
import bcrypt
import os

from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests


# Load variables from .env
load_dotenv()


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    course: str
    year: str
    password: str


@router.post("/register")
def register_user(user: RegisterRequest):

    # Check if email already exists
    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Create user document
    user_data = {
        "name": user.name,
        "email": user.email,
        "course": user.course,
        "year": user.year,
        "password": hashed_password.decode("utf-8")
    }

    # Save user to MongoDB
    result = users_collection.insert_one(user_data)

    return {
        "message": "Account created successfully",
        "user_id": str(result.inserted_id)
    }


# =========================================================
# NORMAL LOGIN
# =========================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login_user(user: LoginRequest):

    # Find user by email
    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    # User not found
    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # -----------------------------------------------------
    # Check whether this is a Google-only account
    # -----------------------------------------------------

    stored_password = existing_user.get("password")

    if not stored_password:
        raise HTTPException(
            status_code=401,
            detail="This account uses Google login. Please continue with Google."
        )

    # -----------------------------------------------------
    # Check password
    # -----------------------------------------------------

    try:
        password_correct = bcrypt.checkpw(
            user.password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    except (ValueError, TypeError):
        password_correct = False

    # Wrong password
    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # -----------------------------------------------------
    # Login successful
    # -----------------------------------------------------

    return {
        "message": "Login successful",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"],
            "course": existing_user["course"],
            "year": existing_user["year"]
        }
    }


# =========================================================
# GOOGLE LOGIN
# =========================================================

class GoogleLoginRequest(BaseModel):
    credential: str


@router.post("/google")
def google_login(data: GoogleLoginRequest):

    # Get Google Client ID from .env
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not google_client_id:
        raise HTTPException(
            status_code=500,
            detail="Google Client ID is not configured"
        )

    # -----------------------------------------------------
    # Verify Google ID token
    # -----------------------------------------------------

    try:

        idinfo = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            google_client_id
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

    # -----------------------------------------------------
    # Get Google account information
    # -----------------------------------------------------

    google_id = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name")

    email_verified = idinfo.get(
        "email_verified",
        False
    )

    # -----------------------------------------------------
    # Validate Google information
    # -----------------------------------------------------

    if not google_id or not email:

        raise HTTPException(
            status_code=401,
            detail="Google account information is missing"
        )

    if not email_verified:

        raise HTTPException(
            status_code=401,
            detail="Google email is not verified"
        )

    # If Google does not provide a name
    if not name:

        name = email.split("@")[0]

    # -----------------------------------------------------
    # Check if this email already exists
    # -----------------------------------------------------

    existing_user = users_collection.find_one(
        {"email": email}
    )

    # =====================================================
    # EXISTING USER
    # =====================================================

    if existing_user:

        # Link Google account with existing account
        #
        # We only add google_id here.
        # We do NOT remove the existing password.
        # Therefore the user can continue using either:
        #
        # Email + Password
        # OR
        # Google Login
        #

        users_collection.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "google_id": google_id
                }
            }
        )

        return {
            "message": "Google login successful",
            "user": {
                "id": str(existing_user["_id"]),
                "name": existing_user.get(
                    "name",
                    name
                ),
                "email": existing_user["email"],
                "course": existing_user.get(
                    "course",
                    ""
                ),
                "year": existing_user.get(
                    "year",
                    ""
                )
            }
        }

    # =====================================================
    # NEW GOOGLE USER
    # =====================================================

    new_user = {
        "name": name,
        "email": email,
        "course": "Not specified",
        "year": "Not specified",
        "google_id": google_id,
        "auth_provider": "google"
    }

    # Save Google user to MongoDB
    result = users_collection.insert_one(
        new_user
    )

    # -----------------------------------------------------
    # Return user information
    # -----------------------------------------------------

    return {
        "message": "Google account created successfully",
        "user": {
            "id": str(result.inserted_id),
            "name": name,
            "email": email,
            "course": "Not specified",
            "year": "Not specified"
        }
    }