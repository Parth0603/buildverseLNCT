import logging
from pymongo import MongoClient
from backend.config import settings

logger = logging.getLogger("scamradar.database")

# --- In-Memory Mock NoSQL Fallback Database Engine ---
class MockCollection:
    def __init__(self, name):
        self.name = name
        self.documents = []

    def insert_one(self, doc):
        if "_id" not in doc:
            import uuid
            doc["_id"] = str(uuid.uuid4())
        self.documents.append(doc)
        return doc

    def insert_many(self, docs):
        for doc in docs:
            self.insert_one(doc)
        return docs

    def find_one(self, query):
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if k not in doc:
                    match = False
                    break
                # Simple regex check support
                if isinstance(v, dict) and "$regex" in v:
                    pattern = v["$regex"]
                    if not isinstance(doc[k], str) or not re.search(pattern, doc[k], re.IGNORECASE):
                        match = False
                        break
                elif doc[k] != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, query=None):
        query = query or {}
        results = []
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if k == "report_count" and isinstance(v, dict) and "$gt" in v:
                    if doc.get(k, 0) <= v["$gt"]:
                        match = False
                        break
                elif k not in doc:
                    match = False
                    break
                elif doc[k] != v:
                    match = False
                    break
            if match:
                results.append(doc)
        
        # Mimic PyMongo cursor sorting capability
        class SortedResults(list):
            def sort(self, key, direction=-1):
                # Simple mock sort logic
                reverse = True if direction == -1 else False
                super().sort(key=lambda x: x.get(key, 0), reverse=reverse)
                return self
            def limit(self, count):
                return self[:count]
        
        return SortedResults(results)

    def update_one(self, filter_query, update_operations, upsert=False):
        doc = self.find_one(filter_query)
        created_at_val = None
        if not doc:
            if upsert:
                # Build mock upsert doc
                new_doc = filter_query.copy()
                if "$set" in update_operations:
                    new_doc.update(update_operations["$set"])
                if "$inc" in update_operations:
                    for k, v in update_operations["$inc"].items():
                        new_doc[k] = v
                if "$max" in update_operations:
                    new_doc.update(update_operations["$max"])
                self.insert_one(new_doc)
                return new_doc
            return None

        # Process update operators
        if "$set" in update_operations:
            doc.update(update_operations["$set"])
        if "$inc" in update_operations:
            for k, v in update_operations["$inc"].items():
                doc[k] = doc.get(k, 0) + v
        if "$max" in update_operations:
            for k, v in update_operations["$max"].items():
                doc[k] = max(doc.get(k, 0), v)
        return doc

    def count_documents(self, filter_query):
        if not filter_query:
            return len(self.documents)
        return len(self.find(filter_query))

    def aggregate(self, pipeline):
        # Mock simple scam_category sum pipeline needed for dashboard stats
        result_map = {}
        for doc in self.documents:
            cat = doc.get("scam_category", "Unknown")
            result_map[cat] = result_map.get(cat, 0) + 1
            
        return [{"_id": k, "value": v} for k, v in result_map.items()]

class MockDatabase:
    def __init__(self):
        self.message_scans = MockCollection("message_scans")
        self.url_scans = MockCollection("url_scans")
        self.audio_scans = MockCollection("audio_scans")
        self.reports = MockCollection("reports")
        self.phone_numbers = MockCollection("phone_numbers")
        self.domains = MockCollection("domains")
        self.wallets = MockCollection("wallets")

# Import re for regex lookups
import re

# --- Active Database Loader ---
try:
    logger.info("Connecting to MongoDB Atlas Cluster...")
    # Add a short connection timeout to prevent long hangs on invalid DNS
    client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
    # Trigger a call to force validation of connection immediately
    client.admin.command('ping')
    db = client[settings.MONGODB_DB_NAME]
    logger.info("Successfully connected to live MongoDB database tier!")
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}. Activating robust local in-memory Mock NoSQL fallback database.")
    db = MockDatabase()

def get_db():
    """
    FastAPI dependency yielding the active database (live MongoDB or Mock fallback).
    """
    return db
