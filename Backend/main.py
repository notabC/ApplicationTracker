from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# In-memory cache to store items
cache = {}
item_id_counter = 1

# Pydantic model for request body
class ItemBase(BaseModel):
    name: str
    description: str

class Item(ItemBase):
    id: int

# Root route
@app.get("/")
def read_root():
    return {"Hello": "World"}

# Create an item (C in CRUD)
@app.post("/items/", response_model=Item)
def create_item(item: ItemBase):
    global item_id_counter
    item_data = {
        "id": item_id_counter,
        "name": item.name,
        "description": item.description,
    }
    cache[item_id_counter] = item_data
    item_id_counter += 1
    return item_data

# Read all items (R in CRUD)
@app.get("/items/", response_model=list[Item])
def read_items():
    return list(cache.values())

# Read a single item by ID (R in CRUD)
@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int):
    item = cache.get(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Update an item (U in CRUD)
@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemBase):
    if item_id not in cache:
        raise HTTPException(status_code=404, detail="Item not found")
    updated_item = {
        "id": item_id,
        "name": item.name,
        "description": item.description,
    }
    cache[item_id] = updated_item
    return updated_item

# Delete an item (D in CRUD)
@app.delete("/items/{item_id}", response_model=Item)
def delete_item(item_id: int):
    if item_id not in cache:
        raise HTTPException(status_code=404, detail="Item not found")
    deleted_item = cache.pop(item_id)
    return deleted_item