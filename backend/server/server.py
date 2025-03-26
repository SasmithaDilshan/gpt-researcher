from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

from backend.server.websocket_manager import WebSocketManager
from backend.server.server_utils import (
    handle_file_upload, handle_file_deletion, execute_multi_agents, handle_websocket_communication
)

# Separate FastAPI apps
api_app = FastAPI()
ws_app = FastAPI()

# WebSocket manager
manager = WebSocketManager()

# Middleware (Apply only to API, not WebSocket)
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Template rendering
templates = Jinja2Templates(directory="./frontend")

# --- REST API Endpoints (Base Path: /api/v1) ---

@api_app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "report": None})

@api_app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join("/usr/src/app/outputs", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    return {"error": "File not found"}

@api_app.get("/files/")
async def list_files():
    files = os.listdir("/usr/src/app/outputs")
    return {"files": files}

@api_app.post("/api/multi_agents")
async def run_multi_agents():
    return await execute_multi_agents(manager)

@api_app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    return await handle_file_upload(file, "/usr/src/app/outputs")

@api_app.delete("/files/{filename}")
async def delete_file(filename: str):
    return await handle_file_deletion(filename, "/usr/src/app/outputs")

# --- WebSocket Endpoints (Base Path: /ws) ---

@ws_app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await handle_websocket_communication(websocket, manager)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

# --- Main FastAPI App ---
app = FastAPI()

# Mount API & WebSocket apps with different base paths
app.mount("/api/v1", api_app)
app.mount("/api/v2", ws_app)

# Serve static files
app.mount("/outputs", StaticFiles(directory="/usr/src/app/outputs"), name="outputs")
app.mount("/site", StaticFiles(directory="./frontend"), name="site")
app.mount("/static", StaticFiles(directory="./frontend/static"), name="static")
