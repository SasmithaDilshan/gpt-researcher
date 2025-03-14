# Stage 1: Browser and build tools installation
FROM python:3.11.7-slim-bookworm AS install-browser

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
RUN useradd -u 10014 -ms /bin/bash tempuser && \
    chown -R tempuser:tempuser /usr/src/app && \
    # Add these lines to create and set permissions for outputs directory
    mkdir -p /usr/src/app/outputs && \
    chown -R tempuser:tempuser /usr/src/app/outputs && \
    chmod 777 /usr/src/app/outputs && \
    # Create logs directory and set permissions
    mkdir -p /usr/src/app/logs && \
    chown -R tempuser:tempuser /usr/src/app/logs && \
    chmod 777 /usr/src/app/logs

# Switch to the user with UID 10014
USER 10014
WORKDIR /usr/src/app

# Copy the rest of the application files with proper ownership
COPY --chown=tempuser:tempuser ./ ./

# Expose the application's port
EXPOSE 8000

# Define the default command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
