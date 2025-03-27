from fastapi import FastAPI, APIRouter, Request, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

from backend.server.websocket_manager import WebSocketManager
from backend.server.server_utils import (
    handle_file_upload, handle_file_deletion, execute_multi_agents, handle_websocket_communication
)

# Initialize FastAPI app
app = FastAPI()

# WebSocket manager
manager = WebSocketManager()

# Middleware (Apply only to API, not WebSocket)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Template rendering
templates = Jinja2Templates(directory="./frontend")

# --- API Routers ---

api_router = APIRouter(prefix="/api/v1")

@api_router.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "report": None})

@api_router.get("/{filename}")
async def get_file(filename: str):
    # Extract only the file name after "outputs/"
    filename_only = os.path.basename(filename)  # or Path(filename).name

    # Construct the absolute path
    file_path = os.path.join("outputs", filename_only)

    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename_only)
    
    return {"error": "{file_path}"}


@api_router.post("/multi_agents")
async def run_multi_agents():
    return await execute_multi_agents(manager)

@api_router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    return await handle_file_upload(file, "/usr/src/app/outputs")

# --- WebSocket Router ---
ws_router = APIRouter(prefix="/api/v2")

@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await handle_websocket_communication(websocket, manager)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)


# --- Register Routers ---
app.include_router(api_router)
app.include_router(ws_router)

# --- Serve static files ---
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/site", StaticFiles(directory="./frontend"), name="site")
app.mount("/static", StaticFiles(directory="./frontend/static"), name="static")
