from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db  # ✅ import db from extensions

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # ✅ Initialize extensions here
    db.init_app(app)

    # ✅ Import blueprints after db.init_app
    from auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="")

    @app.route("/health")
    def health():
        from auth.models import User  # import inside function
        email1 = "data"
        if User.query.filter_by(email=email1).first():
            return jsonify({"error": "User already exists"}), 409
        else:
            return jsonify({"status": "OK"}), 200

    @app.route("/")
    def index():
        return jsonify({"message": "User Authentication Service is running"}), 200

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        from auth import models  # ensure models are imported before creating tables
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
