#!/usr/bin/env bash
# Cleanup merged branches
# Deletes all branches that have been merged into main (both local and remote)
# Excludes: main, master, and the current branch

set -euo pipefail

MAIN_BRANCH="main"
CURRENT_BRANCH=$(git branch --show-current)

echo "Fetching latest from origin..."
git fetch origin --prune

echo ""
echo "=== Merged remote branches ==="
MERGED_REMOTE=$(git branch -r --merged "origin/$MAIN_BRANCH" | grep -v "origin/$MAIN_BRANCH" | grep -v "origin/master" | grep -v "HEAD" | sed 's|origin/||' | grep -v "^[[:space:]]*$" || true)

if [ -z "$MERGED_REMOTE" ]; then
  echo "No merged remote branches to delete."
else
  echo "The following remote branches are merged into $MAIN_BRANCH:"
  echo "$MERGED_REMOTE" | while read -r branch; do
    echo "  - $branch"
  done

  echo ""
  read -rp "Delete these remote branches? [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo "$MERGED_REMOTE" | while read -r branch; do
      branch=$(echo "$branch" | xargs)
      if [ "$branch" = "$CURRENT_BRANCH" ]; then
        echo "Skipping current branch: $branch"
        continue
      fi
      echo "Deleting remote branch: $branch"
      git push origin --delete "$branch" || echo "  Failed to delete: $branch"
    done
  else
    echo "Skipped remote branch deletion."
  fi
fi

echo ""
echo "=== Merged local branches ==="
MERGED_LOCAL=$(git branch --merged "$MAIN_BRANCH" 2>/dev/null | grep -v "^\*" | grep -v "$MAIN_BRANCH" | grep -v "master" | xargs || true)

if [ -z "$MERGED_LOCAL" ]; then
  echo "No merged local branches to delete."
else
  echo "The following local branches are merged into $MAIN_BRANCH:"
  for branch in $MERGED_LOCAL; do
    echo "  - $branch"
  done

  echo ""
  read -rp "Delete these local branches? [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    for branch in $MERGED_LOCAL; do
      echo "Deleting local branch: $branch"
      git branch -d "$branch" || echo "  Failed to delete: $branch"
    done
  else
    echo "Skipped local branch deletion."
  fi
fi

echo ""
echo "Cleanup complete."
