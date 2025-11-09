FROM mcr.microsoft.com/mssql/server:2019-latest

# Switch to root to install packages
USER root

# Install curl and other prerequisites
RUN apt-get update \
    && apt-get install -y curl apt-transport-https gnupg2 \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Create initialization directory
RUN mkdir -p /docker-entrypoint-initdb.d && \
    chown -R mssql:root /docker-entrypoint-initdb.d

# Copy initialization script and make it executable
COPY init.sql /docker-entrypoint-initdb.d/
RUN chown mssql:root /docker-entrypoint-initdb.d/init.sql

# Create entrypoint script
RUN echo '#!/bin/bash\n\
/opt/mssql/bin/sqlservr & \n\
sleep 30\n\
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -i /docker-entrypoint-initdb.d/init.sql\n\
wait' > /custom-entrypoint.sh && \
    chmod +x /custom-entrypoint.sh

USER mssql
CMD /custom-entrypoint.sh