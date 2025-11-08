from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    # allow nullable password_hash for seeded users without passwords
    password_hash = db.Column(db.String(255), nullable=True)
    full_name = db.Column(db.String(255))
    # phone column added to match seed CSV
    phone = db.Column(db.String(32))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class RevokedToken(db.Model):
    __tablename__ = "revoked_tokens"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), unique=True, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, default=datetime.utcnow)
