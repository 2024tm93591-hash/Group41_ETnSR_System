from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest, Unauthorized
from passlib.hash import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid

auth_bp = Blueprint("auth", __name__)

from extensions import db
from auth.models import User, RevokedToken


def create_token(payload, expires_seconds):
    now = datetime.utcnow()
    jti = str(uuid.uuid4())
    exp_time = now + timedelta(seconds=expires_seconds)

    # ✅ Force sub to be a string if it exists
    if "sub" in payload:
        payload["sub"] = str(payload["sub"])

    token = jwt.encode(
        {
            **payload,
            "iat": now,
            "exp": exp_time,
            "jti": jti,
            "iss": current_app.config["JWT_ISSUER"]
        },
        current_app.config["SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"]
    )
    return token, jti



def decode_token(token, verify_exp=True):
    try:
        options = {"verify_exp": verify_exp}
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=[current_app.config["JWT_ALGORITHM"]],
            options=options,
            issuer=current_app.config["JWT_ISSUER"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Token expired")
    except jwt.InvalidTokenError as e:
        raise Unauthorized(f"Invalid token: {str(e)}")
    
def is_revoked(jti):
    return RevokedToken.query.filter_by(jti=jti).first() is not None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    email1 = (data.get("email") or "").strip().lower()
    password = data.get("password")
    full_name = data.get("full_name", "")

    if not email1 or not password:
        raise BadRequest("Email and password required")

    if User.query.filter_by(email=email1).first():
        return jsonify({"error": "User already exists"}), 409

   #  pw_hash = bcrypt.hash(password)
    pw_hash = password  # temporary for testing

    user = User(email=email1, password_hash=pw_hash, full_name=full_name)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User created",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }), 201

@auth_bp.route("/check", methods=["POST"])
def check():
        print("test")
        return jsonify({"status": "Checked"}), 200

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        raise BadRequest("email and password required")

    user = User.query.filter_by(email=email).first()
    # if not user or not password:    
    if not (user.password_hash == password):    
        raise Unauthorized("invalid credentials")

    access_payload = {"sub": user.id, "type": "access"}
    refresh_payload = {"sub": user.id, "type": "refresh"}

    access_token, access_jti = create_token(access_payload, current_app.config["ACCESS_TOKEN_EXPIRES"])
    refresh_token, refresh_jti = create_token(refresh_payload, current_app.config["REFRESH_TOKEN_EXPIRES"])

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": current_app.config["ACCESS_TOKEN_EXPIRES"]
    })

@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    data = request.json or {}
    token = data.get("refresh_token")
    if not token:
        raise BadRequest("refresh_token required")
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise Unauthorized("not a refresh token")
    jti = payload.get("jti")
    if is_revoked(jti):
        raise Unauthorized("token revoked")
    user_id = payload.get("sub")
    # issue new access token
    access_payload = {"sub": user_id, "type": "access"}
    access_token, access_jti = create_token(access_payload, current_app.config["ACCESS_TOKEN_EXPIRES"])
    return jsonify({"access_token": access_token, "expires_in": current_app.config["ACCESS_TOKEN_EXPIRES"]})

def require_auth():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise Unauthorized("missing authorization header")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    print(payload)
    if payload.get("type") != "access":
        raise Unauthorized("not an access token")
    jti = payload.get("jti")
    if is_revoked(jti):
        raise Unauthorized("token revoked")
    return payload

@auth_bp.route("/me", methods=["GET"])
def me():
    payload = require_auth()
    user_id = payload.get("sub")
    user = User.query.get(user_id)
    if not user:
        raise Unauthorized("user not found")
    return jsonify({"id": user.id, "email": user.email, "full_name": user.full_name})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    # revoke current token (access) so it can't be used
    payload = require_auth()
    jti = payload.get("jti")
    revoked = RevokedToken(jti=jti)
    db.session.add(revoked)
    db.session.commit()
    return jsonify({"message": "logged out"})

@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    payload = require_auth()
    user = User.query.get(payload.get("sub"))
    data = request.json or {}
    old = data.get("old_password")
    new = data.get("new_password")
    if not old or not new:
        raise BadRequest("old_password and new_password required")
    if not (old == user.password_hash):
        raise Unauthorized("old password incorrect")
    user.password_hash = new
    db.session.commit()
    return jsonify({"message": "password changed"})
