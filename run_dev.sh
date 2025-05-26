#!/bin/bash

# Start backend Django server
echo "Starting Django backend..."
cd b_src
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver &

# Start frontend Vue server
echo "Starting PrimeVue frontend..."
cd ../src
npm install
npm run dev &

# Keep both servers running
wait
