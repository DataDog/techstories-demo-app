FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy files to container
COPY . /app

USER root

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
