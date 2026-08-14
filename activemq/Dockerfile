FROM apache/activemq-classic:6.1.6

USER root

RUN apt-get update \
    && apt-get install -y netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY activemq.xml /opt/apache-activemq/conf/activemq.xml