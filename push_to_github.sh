#!/bin/bash
# Usage: ./push_to_github.sh <github-repo-ssh-or-https-url> "commit message"
if [ -z "$1" ]; then
  echo "Usage: $0 <repo-url> [commit-message]"
  exit 1
fi
REPO_URL="$1"
COMMIT_MSG="${2:-Initial commit}"
git init
git add .
git commit -m "$COMMIT_MSG"
git branch -M main
git remote add origin "$REPO_URL"
git push -u origin main
