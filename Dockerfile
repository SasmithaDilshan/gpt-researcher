# Stage 1: Browser and build tools installation
FROM python:3.11.7-slim-bookworm AS install-browser

RUN apt-get update && apt-get install -y --no-install-recommends \
    libexpat1=2.5.0-1+deb12u1 \
    libgssapi-krb5-2=1.20.1-2+deb12u2 \
    libk5crypto3 \
    libkrb5-3 \
    libkrb5support0 \
    fontconfig \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

RUN apt update && apt install -y \
    libgirepository1.0-dev \
    gir1.2-pango-1.0 \
    gobject-introspection \
    libcairo2-dev \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Fix Fontconfig writable cache issue
RUN mkdir -p /var/cache/fontconfig && chmod -R 777 /var/cache/fontconfig

# Stage 2: Python dependencies installation
FROM install-browser AS gpt-researcher-install

ENV PIP_ROOT_USER_ACTION=ignore
WORKDIR /usr/src/app

# Copy and install Python dependencies
COPY ./requirements.txt ./requirements.txt
COPY ./multi_agents/requirements.txt ./multi_agents/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r multi_agents/requirements.txt

# Stage 3: Final stage with non-root user and app
FROM gpt-researcher-install AS gpt-researcher

# Create a non-root user with UID 10014
RUN useradd -u 10014 -ms /bin/bash gpt-researcher \
    && mkdir -p /usr/src/app/outputs \
    && mkdir -p /usr/src/app/logs \
    && mkdir -p /var/cache/fontconfig \
    && chown -R gpt-researcher:gpt-researcher /usr/src/app \
    && chown -R gpt-researcher:gpt-researcher /var/cache/fontconfig \
    && chmod -R 777 /usr/src/app \
    && chmod -R 777 /usr/src/app/outputs \
    && chmod -R 777 /usr/src/app/logs \
    && chmod -R 777 /var/cache/fontconfig

# Switch to the user with UID 10014
USER 10014
WORKDIR /usr/src/app

# Copy the rest of the application files
COPY --chown=gpt-researcher:gpt-researcher ./ ./

# Expose application ports
EXPOSE 8000 9090


# Define the default command to run the application
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 & uvicorn main:app --host 0.0.0.0 --port 9090"]
