FROM apache/activemq-classic:6.1.6

USER root

RUN apt-get update \
    && apt-get install -y netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY activemq.xml /opt/apache-activemq/conf/activemq.xml

RUN chgrp -R 0 /opt/apache-activemq && chmod -R g=u /opt/apache-activemq

ENV ACTIVEMQ_OPTS_MEMORY="-Xms64M -Xmx256M"