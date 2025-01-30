from typing import Dict, Any, Type
from typing_extensions import TypedDict
import types
import os
import getpass
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from fastapi.middleware.cors import CORSMiddleware
from langchain.tools import StructuredTool

# Pydantic model for field definition
class FieldDefinition(BaseModel):
    field_type: str
    description: str

# Pydantic model for tool definition
class ToolDefinition(BaseModel):
    name: str = Field(..., description="Name of the tool")
    description: str = Field(..., description="Description of the tool's functionality")
    fields: Dict[str, Dict[str, str]] = Field(..., description="Dictionary of field definitions")

def create_typed_dict(name: str, description: str, fields: Dict[str, tuple[Type, str]]) -> Type[TypedDict]:
    """
    Create a dynamic TypedDict with specified fields.
    
    Args:
        name (str): Name of the TypedDict class
        description (str): Description of the TypedDict
        fields (Dict[str, tuple[Type, str]]): Dictionary of field names mapped to (type, description) tuples
    
    Returns:
        Type[TypedDict]: A new TypedDict subclass
    """
    annotations = {
        field_name: field_type
        for field_name, (field_type, _) in fields.items()
    }
    
    namespace = {
        '__annotations__': annotations,
        '__doc__': description,
        '_field_descriptions': {
            field_name: desc
            for field_name, (_, desc) in fields.items()
        }
    }
    
    return types.new_class(
        name,
        (TypedDict,),
        {},
        lambda ns: ns.update(namespace)
    )

# Type mapping from string to actual types
TYPE_MAPPING = {
    "int": int,
    "str": str,
    "float": float,
    "bool": bool
}

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set API Key for Groq
if not os.environ.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = getpass.getpass("Enter API key for Groq: ")

# Initialize global variables
user_defined_tools = []
tools = []
llm = ChatGroq(model="llama3-8b-8192")
llm_with_tools = None

def update_llm_tools():
    """Update the LLM with the current set of tools."""
    global llm_with_tools
    llm_with_tools = llm.bind_tools(tools)

@app.post("/define_tool/")
async def define_tool(tool_definition: ToolDefinition):

    try:
        # Convert field definitions to the correct format
        processed_fields = {}
        for field_name, field_info in tool_definition.fields.items():
            if field_info["field_type"] not in TYPE_MAPPING:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported type: {field_info['field_type']}. Supported types are: {list(TYPE_MAPPING.keys())}"
                )
            processed_fields[field_name] = (
                TYPE_MAPPING[field_info["field_type"]],
                field_info["description"]
            )

        # Create the TypedDict for the tool
        new_tool = create_typed_dict(
            tool_definition.name,
            tool_definition.description,
            processed_fields
        )

        # Define a dummy function (this can be replaced with actual functionality)
        def dummy_function(**kwargs):
            return f"Executed {tool_definition.name} with inputs: {kwargs}"

        # Create a valid LangChain tool
        langchain_tool = StructuredTool.from_function(
            func=dummy_function,
            name=tool_definition.name,
            description=tool_definition.description
        )

        # Add the tool in correct format
        user_defined_tools.append({
            "name": tool_definition.name,
            "description": tool_definition.description,
            "fields": {k: {"type": v[0].__name__, "description": v[1]} for k, v in processed_fields.items()}
        })
        tools.append(langchain_tool)  # Add the valid tool object

        # Update the LLM with the new tool
        update_llm_tools()

        return {
            "message": "Tool defined successfully",
            "tool": {
                "name": tool_definition.name,
                "description": tool_definition.description,
                "fields": {k: {"type": v[0].__name__, "description": v[1]} for k, v in processed_fields.items()}
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/list_tools/")
async def list_tools():
    return {"tools": user_defined_tools}

@app.get("/")
def home():
    return {"message": "Welcome to the AI-powered tool server!"}

@app.get("/invoke/")
def invoke_tool(query: str):
    """
    Invoke the AI model with the given query.
    """
    if not llm_with_tools:
        raise HTTPException(status_code=400, detail="No tools have been defined yet")
    response = llm_with_tools.invoke(query)
    print(response)
    return {"query": query, "response": response}
