# Use official Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y wget unzip


# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Run the scraper
CMD ["python", "main.py"]