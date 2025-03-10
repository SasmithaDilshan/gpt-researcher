# Stage 1: Browser and build tools installation
FROM python:3.11.4-slim-bullseye AS install-browser

# Install Chromium, Chromedriver, Firefox, Geckodriver, and build tools in one layer
RUN apt-get update && apt-get install -y \
    gnupg ca-certificates wget curl \
    && wget -qO - https://dl.google.com/linux/linux_signing_key.pub | tee /usr/share/keyrings/google-chrome-keyring.gpg > /dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/google-chrome-keyring.gpg arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable chromium-driver firefox-esr \
    && wget https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-linux64.tar.gz \
    && tar -xvzf geckodriver-v0.33.0-linux64.tar.gz \
    && chmod +x geckodriver \
    && mv geckodriver /usr/local/bin/ \
    && rm geckodriver-v0.33.0-linux64.tar.gz \
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

# Create a non-root user for security
# Create a non-privileged user without a home directory or shell
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid 10014 \
    "choreo" && \
    # Create the application directory and set permissions
    mkdir -p /usr/src/app && \
    chown -R choreo:choreo /usr/src/app && \
    # Create outputs directory and set permissions
    mkdir -p /usr/src/app/outputs && \
    chown -R choreo:choreo /usr/src/app/outputs && \
    chmod 777 /usr/src/app/outputs

# Use the above-created unprivileged user
USER 10014

WORKDIR /usr/src/app

# Copy the rest of the application files with proper ownership
# Copy the rest of the application files with proper ownership
COPY --chown=choreo:choreo ./ ./

# Expose the application's port
EXPOSE 8000

# Define the default command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]