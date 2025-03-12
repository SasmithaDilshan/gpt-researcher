# Stage 1: Browser and build tools installation
FROM choreocontrolplane.azurecr.io/ubuntu:20.04 AS builder

# Install Chromium, Chromedriver, Firefox, Geckodriver, and build tools in one layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3.9=3.9.5-3ubuntu0~20.04.1 \
      python3-pip=20.0.2-5ubuntu1.10 \
      python3.9-venv=3.9.5-3ubuntu0~20.04.1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    python3.9 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

# Stage 2: Python dependencies installation
FROM install-browser AS gpt-researcher-install

ENV PIP_ROOT_USER_ACTION=ignore


# Copy and install Python dependencies in a single layer to optimize cache usage
COPY ./requirements.txt ./requirements.txt
COPY ./multi_agents/requirements.txt ./multi_agents/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r multi_agents/requirements.txt

# Stage 3: Final stage with non-root user and app
FROM gpt-researcher-install AS gpt-researcher

FROM choreocontrolplane.azurecr.io/ubuntu:20.04

ARG GROUP=ai
ARG USER=python-ai
ARG USER_ID=10500
ARG USER_GROUP_ID=10500

RUN groupadd --system --gid ${USER_GROUP_ID} ${GROUP} && \
    useradd --system --create-home --home-dir /home/${USER} --no-log-init --gid ${USER_GROUP_ID} --uid ${USER_ID} ${USER} && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      python3.9=3.9.5-3ubuntu0~20.04.1 \
      python3.9-venv=3.9.5-3ubuntu0~20.04.1 \
      libncurses6=6.2-0ubuntu2.1 \
      libncursesw6=6.2-0ubuntu2.1 \
      libtinfo6=6.2-0ubuntu2.1 \
      ncurses-base=6.2-0ubuntu2.1 \
      ncurses-bin=6.2-0ubuntu2.1 \
      perl-base=5.30.0-9ubuntu0.5 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /usr/src/app


COPY --from=builder --chown=${USER}:${GROUP} /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# sources
COPY --chown=${USER}:${GROUP} assistant/application/ assistant/application/


USER ${USER_GROUP_ID}

EXPOSE 8000

# Define the default command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
