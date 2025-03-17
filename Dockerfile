# Stage 1: Browser and build tools installation
FROM python:3.11.7-slim-bookworm AS install-browser

RUN apt-get update && apt-get install -y --no-install-recommends \
    libexpat1=2.5.0-1+deb12u1 \
    libgssapi-krb5-2=1.20.1-2+deb12u2 \
    libk5crypto3 \
    libkrb5-3 \
    libkrb5support0 \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Python dependencies installation
FROM install-browser AS gpt-researcher-install

ENV PIP_ROOT_USER_ACTION=ignore
WORKDIR /usr/src/app

# Copy and install Python dependencies in a single layer to optimize cache usage
COPY ./requirements.txt ./requirements.txt
COPY ./multi_agents/requirements.txt ./multi_agents/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r multi_agents/requirements.txt

# Stage 3: Final stage with non-root user and app
FROM gpt-researcher-install AS gpt-researcher

# Create a non-root user with UID 10014 for security
# Create a non-root user with UID 10014 for security
RUN useradd -u 10014 -ms /bin/bash gpt-researcher \
    && mkdir -p /usr/src/app/outputs \
    && mkdir -p /usr/src/app/logs \
    && chown -R gpt-researcher:gpt-researcher /usr/src/app \
    && chmod -R 777 /usr/src/app \
    && chmod -R 777 /usr/src/app/outputs \
    && chmod -R 777 /usr/src/app/logs


# Switch to the user with UID 10014
USER 10014
WORKDIR /usr/src/app

# Copy the rest of the application files with proper ownership
COPY --chown=gpt-researcher:gpt-researcher ./ ./

# Expose the application's port
EXPOSE 8000

# Define the default command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
