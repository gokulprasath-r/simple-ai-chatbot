import os
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0
)

conversations = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/")
def index():
    return {
        "home" : "welcome"
    }

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if request.session_id not in conversations:
        conversations[request.session_id] = []

    conversation = conversations[request.session_id]
    conversation.append(
        ("human", request.message)
    )

    response = llm.invoke(conversation)

    conversation.append(
        ("ai", response.content)
    )

    return {
        "response": response.content
    }
