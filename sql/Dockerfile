FROM mariadb:11.7.2

# Copy backup script
COPY ./backup/backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Configure the cronjob
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*
RUN echo "5 4 * * * /usr/local/bin/backup.sh > /proc/1/fd/1 2>/proc/1/fd/2" >> /etc/crontab