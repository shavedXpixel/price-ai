from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import get_google_shopping_prices

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "SerpApi Price Server is Running"}

@app.get("/search/{query}")
def search(query: str):
    # Fetch data from Google Shopping
    results = get_google_shopping_prices(query)
    
    # Sort by price (Low to High)
    # We use a helper to safely convert string prices to numbers
    def get_price(item):
        try:
            # Extract numbers only from "₹ 1,200.00" -> 1200.0
            import re
            clean_price = re.sub(r'[^\d.]', '', str(item['price']))
            return float(clean_price)
        except:
            return 99999999

    results.sort(key=get_price)
    
    return {"results": results}