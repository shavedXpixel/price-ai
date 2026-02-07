from fastapi import FastAPI
from fastapi.responses import HTMLResponse # Import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from scraper import get_google_shopping_prices
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
#  NEW: Visual "Backend Active" Page
# ---------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
@app.head("/", response_class=HTMLResponse) # <--- ADD THIS LINE
def home():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>PriceAI Backend</title>
        <style>
            body {
                background-color: #0f172a;
                color: #e2e8f0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                padding: 40px;
                border: 1px solid #334155;
                border-radius: 16px;
                background: #1e293b;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .status-dot {
                height: 15px;
                width: 15px;
                background-color: #22c55e;
                border-radius: 50%;
                display: inline-block;
                box-shadow: 0 0 0 0 rgba(34, 197, 94, 1);
                animation: pulse-green 2s infinite;
                margin-right: 10px;
            }
            @keyframes pulse-green {
                0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            h1 { font-size: 2.5rem; margin-bottom: 10px; }
            p { color: #94a3b8; margin-bottom: 30px; }
            .btn {
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: background-color 0.2s;
            }
            .btn:hover { background-color: #2563eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <div class="status-dot"></div>
                <span style="font-weight: bold; color: #22c55e; letter-spacing: 1px;">SYSTEM OPERATIONAL</span>
            </div>
            <h1>PriceAI Backend</h1>
            <p>The Search Engine API is running and ready to accept requests.</p>
            <a href="/docs" class="btn">View API Documentation</a>
        </div>
    </body>
    </html>
    """
    return html_content

@app.get("/search/{query}")
def search(query: str):
    # Fetch data from Google Shopping
    results = get_google_shopping_prices(query)
    
    # Helper to sort by price
    def get_price(item):
        try:
            # Extract numbers only from "₹ 1,200.00" -> 1200.0
            clean_price = re.sub(r'[^\d.]', '', str(item['price']))
            return float(clean_price)
        except:
            return 99999999

    results.sort(key=get_price)
    
    return {"results": results}