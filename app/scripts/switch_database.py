#!/usr/bin/env python3
"""
Database Configuration Helper Script

Easily switch between PostgreSQL and MySQL without manual editing.
Usage:
    python scripts/switch_database.py postgresql
    python scripts/switch_database.py mysql
"""

import sys
import os
import re
from pathlib import Path

# Supported databases
SUPPORTED_DBS = {
    'postgresql': {
        'url_prefix': 'postgresql://',
        'driver': 'asyncpg==0.29.0',
        'docker_image': 'postgres:16-alpine',
        'description': 'PostgreSQL (recommended)'
    },
    'mysql': {
        'url_prefix': 'mysql://',
        'driver': 'aiomysql==0.2.0',
        'docker_image': 'mysql:8.0',
        'description': 'MySQL'
    }
}


def update_file(filepath, replacements):
    """Update file with regex replacements."""
    if not os.path.exists(filepath):
        print(f"  ⚠️  File not found: {filepath}")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False


def switch_to_database(db_type):
    """Switch database configuration to specified type."""
    db_type = db_type.lower()
    
    if db_type not in SUPPORTED_DBS:
        print(f"❌ Unsupported database: {db_type}")
        print(f"   Supported: {', '.join(SUPPORTED_DBS.keys())}")
        return False
    
    db_config = SUPPORTED_DBS[db_type]
    print(f"\n🔄 Switching to {db_config['description']}...\n")
    
    # 1. Update requirements.txt
    print("📝 Updating requirements.txt...")
    req_updates = []
    
    if db_type == 'postgresql':
        # Enable PostgreSQL driver, disable MySQL
        req_updates = [
            (r'# asyncpg==0\.29\.0', 'asyncpg==0.29.0'),
            (r'aiomysql==0\.2\.0', '# aiomysql==0.2.0'),
            (r'PyMySQL==1\.1\.0', '# PyMySQL==1.1.0'),
        ]
    else:  # mysql
        # Enable MySQL drivers, disable PostgreSQL
        req_updates = [
            (r'asyncpg==0\.29\.0', '# asyncpg==0.29.0'),
            (r'# aiomysql==0\.2\.0', 'aiomysql==0.2.0'),
            (r'# PyMySQL==1\.1\.0', 'PyMySQL==1.1.0'),
        ]
    
    if update_file('app/requirements.txt', req_updates):
        print("  ✅ requirements.txt updated")
    
    # 2. Update .env.example
    print("📝 Updating .env.example...")
    if db_type == 'postgresql':
        env_updates = [
            (r'# (DATABASE_URL=postgresql://.*)', r'\1'),
            (r'(DATABASE_URL=mysql://.*)', r'# \1'),
        ]
    else:  # mysql
        env_updates = [
            (r'(DATABASE_URL=postgresql://.*)', r'# \1'),
            (r'# (DATABASE_URL=mysql://.*)', r'\1'),
        ]
    
    if update_file('app/.env.example', env_updates):
        print("  ✅ .env.example updated")
    
    # 3. Update docker-compose.yml
    print("📝 Updating docker-compose.yml...")
    if db_type == 'postgresql':
        compose_updates = [
            # Enable PostgreSQL, disable MySQL
            (r'  # PostgreSQL Database.*?\n  # db:.*?- influencers_network\n  \n  # MySQL Database.*?\n  db:.*?- influencers_network',
             r'''  # PostgreSQL Database (default)
  db:
    image: postgres:16-alpine
    container_name: influencers_db
    environment:
      POSTGRES_USER: influencers_user
      POSTGRES_PASSWORD: influencers_password
      POSTGRES_DB: db_appinfluencers
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U influencers_user -d db_appinfluencers"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - influencers_network
  
  # MySQL Database (optional - uncomment to use instead of PostgreSQL)
  # db:''', 
             re.DOTALL),
            # Update DATABASE_URL
            (r'DATABASE_URL: mysql://.*',
             r'DATABASE_URL: postgresql://influencers_user:influencers_password@db:5432/db_appinfluencers'),
            # Update volumes
            (r'volumes:\n  # postgres_data:.*?mysql_data:.*?driver: local',
             r'''volumes:
  postgres_data:
    driver: local
  # mysql_data:
  #   driver: local''',
             re.DOTALL),
        ]
    else:  # mysql
        compose_updates = [
            # Similar pattern for MySQL
            (r'DATABASE_URL: postgresql://.*',
             r'DATABASE_URL: mysql://influencers_user:influencers_password@db:3306/db_appinfluencers'),
        ]
    
    if update_file('docker-compose.yml', compose_updates):
        print("  ✅ docker-compose.yml updated")
    
    # 4. Update .do/app.yaml
    print("📝 Updating .do/app.yaml...")
    if db_type == 'postgresql':
        do_updates = [
            (r'engine: MYSQL', 'engine: PG'),
            (r'version: "8"', 'version: "16"'),
            (r'name: db-mysql', 'name: db-postgres'),
            (r'\${db-mysql\.DATABASE_URL}', '${db-postgres.DATABASE_URL}'),
        ]
    else:  # mysql
        do_updates = [
            (r'engine: PG', 'engine: MYSQL'),
            (r'version: "16"', 'version: "8"'),
            (r'name: db-postgres', 'name: db-mysql'),
            (r'\${db-postgres\.DATABASE_URL}', '${db-mysql.DATABASE_URL}'),
        ]
    
    if update_file('.do/app.yaml', do_updates):
        print("  ✅ .do/app.yaml updated")
    
    print(f"\n✅ Successfully switched to {db_config['description']}!\n")
    print("📋 Next steps:")
    print(f"  1. Update app/.env with your {db_type} credentials")
    print(f"  2. Run: pip install -r app/requirements.txt")
    print(f"  3. Run: docker-compose down -v && docker-compose up --build")
    print(f"  4. Run: alembic upgrade head")
    print()
    
    return True


def main():
    if len(sys.argv) != 2:
        print("🗄️  Database Configuration Helper\n")
        print("Usage:")
        print("  python scripts/switch_database.py <database>")
        print("\nSupported databases:")
        for db_name, config in SUPPORTED_DBS.items():
            print(f"  - {db_name:12} {config['description']}")
        print()
        sys.exit(1)
    
    db_type = sys.argv[1]
    
    if not switch_to_database(db_type):
        sys.exit(1)


if __name__ == '__main__':
    main()
