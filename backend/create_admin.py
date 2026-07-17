"""Create (or promote) an admin user.

Usage:
    python create_admin.py "Admin Name" admin@example.com yourpassword
"""
import sys

from app.db import Base, SessionLocal, engine
from app.models import User
from app.security import hash_password

Base.metadata.create_all(bind=engine)


def main():
    if len(sys.argv) != 4:
        print('Usage: python create_admin.py "Name" email password')
        sys.exit(1)

    name, email, password = sys.argv[1], sys.argv[2], sys.argv[3]
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = "admin"
            user.password_hash = hash_password(password)
            user.is_active = True
            print(f"Promoted existing user {email} to admin.")
        else:
            user = User(
                name=name,
                email=email,
                password_hash=hash_password(password),
                role="admin",
            )
            db.add(user)
            print(f"Created admin user {email}.")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
