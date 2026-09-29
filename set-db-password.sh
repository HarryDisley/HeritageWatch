#!/bin/bash
# One-time helper: prompts for your Supabase database password (hidden input)
# and inserts it into .env in place of the TYPE_NEW_PASSWORD_HERE placeholder.
# Safe to delete after you've run it successfully.

cd "$(dirname "$0")"

read -s -p "Paste your NEW Supabase database password: " DBPASS
echo

if [ -z "$DBPASS" ]; then
  echo "No password was captured - nothing was changed. Try again."
  exit 1
fi

DBPASS="$DBPASS" python3 -c "
import os
password = os.environ['DBPASS']
with open('.env') as f:
    content = f.read()
count = content.count('TYPE_NEW_PASSWORD_HERE')
content = content.replace('TYPE_NEW_PASSWORD_HERE', password)
with open('.env', 'w') as f:
    f.write(content)
print(f'Replaced {count} placeholder(s) in .env')
"
