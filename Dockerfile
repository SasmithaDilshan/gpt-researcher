# Stage 1: Browser and build tools installation
FROM python:3.11.4-slim-bullseye AS install-browser

# Install necessary tools
RUN apt-get update \
    && apt-get install -y gnupg wget ca-certificates --no-install-recommends \
    && wget -qO - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable chromium-driver \
    && google-chrome --version && chromedriver --version \
    && apt-get install -y --no-install-recommends firefox-esr build-essential \
    && wget https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-linux64.tar.gz \
    && tar -xvzf geckodriver-v0.33.0-linux64.tar.gz \
    && chmod +x geckodriver \
    && mv geckodriver /usr/local/bin/ \
    && rm geckodriver-v0.33.0-linux64.tar.gz \
    && rm -rf /var/lib/apt/lists/*  # Clean up apt lists to reduce image size

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

# Define user and group
ARG GROUP=gpt-researcher
ARG USER=python-gpt-researcher
ARG USER_ID=10500
ARG USER_GROUP_ID=10500

# Create a non-root user
RUN groupadd --gid ${USER_GROUP_ID} ${GROUP} && \
    useradd --uid ${USER_ID} --gid ${USER_GROUP_ID} --create-home --shell /bin/bash ${USER}

# Set ownership of the working directory
RUN mkdir -p /usr/src/app/outputs && \
    chown -R ${USER}:${GROUP} /usr/src/app && \
    chown -R ${USER}:${GROUP} /usr/src/app/outputs && \
    chmod 777 /usr/src/app/outputs

# Switch to the non-root user
USER ${USER}

WORKDIR /usr/src/app

# Copy application files
COPY --chown=${USER}:${GROUP} ./ ./

# Expose the application's port
EXPOSE 8000

# Define the default command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
