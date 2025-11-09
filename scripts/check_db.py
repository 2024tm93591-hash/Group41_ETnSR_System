import os
import sys

# Add parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from auth.models import User

def main():
    app = create_app()
    with app.app_context():
        print('DB URI:', app.config.get('SQLALCHEMY_DATABASE_URI'))
        count = User.query.count()
        print('Users in DB:', count)
        print('First 5 users:')
        for u in User.query.order_by(User.id).limit(5):
            print(u.id, u.email, u.full_name, u.phone, u.created_at)

if __name__ == '__main__':
    main()
