import os
import sys
import csv
from datetime import datetime

# Add parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from extensions import db
from auth.models import User

def init_db():
    app = create_app()
    with app.app_context():
        # Drop all tables and recreate them
        db.drop_all()
        db.create_all()
        
        # Read seed data from CSV
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'etsr_users.csv'))
        print(f'Reading seed data from: {csv_path}')
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                user = User(
                    id=int(row['user_id']),
                    full_name=row['name'],
                    email=row['email'],
                    phone=row['phone'],
                    created_at=datetime.strptime(row['created_at'], '%Y-%m-%d %H:%M:%S')
                )
                db.session.add(user)
        
        # Commit all changes
        db.session.commit()
        print('Database initialized and seed data loaded!')
        
        # Print some stats
        print(f'Total users loaded: {User.query.count()}')
        print('\nFirst 5 users:')
        for user in User.query.order_by(User.id).limit(5):
            print(f'ID: {user.id}, Name: {user.full_name}, Email: {user.email}, Phone: {user.phone}, Created: {user.created_at}')

if __name__ == '__main__':
    init_db()