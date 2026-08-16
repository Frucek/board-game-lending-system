FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY proto ./proto

RUN mkdir -p /data && \
    chgrp -R 0 /data && \
    chmod -R g+rwX /data

EXPOSE 50051

CMD ["python", "-m", "app.server"]