#!/bin/bash
set -e

echo "Installing Python 3.11..."
# Render uses pyenv, so we can use it
pyenv install 3.11.9 || true
pyenv global 3.11.9
python --version

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "Build complete!"
