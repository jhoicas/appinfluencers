#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for production use.
Run this script and copy the output to your .env file or Digital Ocean environment variables.
"""

import secrets
import string

def generate_secret_key(length=64):
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*(-_=+)"
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    return secret_key

if __name__ == "__main__":
    print("=" * 80)
    print("🔐 SECRET_KEY Generator")
    print("=" * 80)
    print()
    print("Generated SECRET_KEY (copy this to your environment):")
    print()
    print(generate_secret_key())
    print()
    print("=" * 80)
    print("⚠️  IMPORTANT: Never commit this key to version control!")
    print("=" * 80)
