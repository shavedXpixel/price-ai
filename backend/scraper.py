import os
from dotenv import load_dotenv
from serpapi import GoogleSearch

# 1. Load variables from .env file (for local use)
load_dotenv()

# 2. Get the key securely
API_KEY = os.getenv("SERPAPI_KEY") 

def get_google_shopping_prices(query):
    # Check if key is missing
    if not API_KEY:
        print("❌ Error: SERPAPI_KEY is missing!")
        return []

    print(f"🔍 Searching Google Shopping for: {query}...")

    params = {
        "api_key": API_KEY,  # Use the variable
        "engine": "google_shopping",
        "q": query,
        "google_domain": "google.co.in",
        "gl": "in",
        "hl": "en",
        "num": 20
    }
    # ... rest of your code remains the same ...

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        
        shopping_results = results.get("shopping_results", [])
        
        parsed_results = []
        
        for item in shopping_results:
            # Extract basic info
            name = item.get("title")
            price = item.get("price") # usually formats like "₹59,999"
            source = item.get("source") # e.g. "Flipkart", "Amazon.in"
            link = item.get("link")
            thumbnail = item.get("thumbnail")
            
            # Only keep results that have a price and a store name
            if name and price and source:
                parsed_results.append({
                    "name": name,
                    "price": price.replace("₹", "").replace(",", "").strip(), # Clean price for sorting
                    "displayPrice": price, # Keep original formatted price for UI
                    "source": source,
                    "link": link,
                    "image": thumbnail
                })
                
        print(f"✅ Found {len(parsed_results)} results from SerpApi.")
        return parsed_results

    except Exception as e:
        print(f"❌ Error talking to SerpApi: {e}")
        return []