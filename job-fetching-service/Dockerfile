FROM python:3.10

WORKDIR /app
COPY . /app
ENV PYTHONPATH=/app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "main.py"]