FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install requests
COPY . .

EXPOSE 8000

# Define the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start the application using the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]