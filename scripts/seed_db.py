import sys
import os

# ensure project root is on sys.path so imports like `app` and `auth` work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from extensions import db
from auth.models import User
import csv
from datetime import datetime
import os


def seed_database(csv_path: str):
    app = create_app()
    with app.app_context():
        # create tables if not exist
        db.create_all()

        # clear existing users so seed is deterministic
        db.session.query(User).delete()
        db.session.commit()

        rows = []
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for r in reader:
                # parse fields from CSV
                try:
                    created = datetime.strptime(r.get('created_at', '').strip(), '%Y-%m-%d %H:%M:%S')
                except Exception:
                    created = None

                user = User(
                    id=int(r.get('user_id')) if r.get('user_id') else None,
                    full_name=r.get('name'),
                    email=r.get('email'),
                    phone=r.get('phone'),
                    password_hash=None,
                    created_at=created,
                    is_active=True,
                )
                rows.append(user)

        if rows:
            db.session.bulk_save_objects(rows)
            db.session.commit()
            print(f"Inserted {len(rows)} users from {csv_path}")
        else:
            print("No rows to insert")


if __name__ == '__main__':
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'etsr_users.csv')
    csv_path = os.path.abspath(csv_path)
    if not os.path.exists(csv_path):
        print('CSV file not found:', csv_path)
    else:
        seed_database(csv_path)
