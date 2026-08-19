FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt requirements-full.txt ./
RUN pip install --no-cache-dir -r requirements-full.txt
COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
