import os
import sys
from pymongo import MongoClient
import certifi

# Ensure root directory is on PATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import settings

def test_mongodb_connection():
    print("====================================================")
    print("           SCAMRADAR X - MONGODB DIAGNOSTICS         ")
    print("====================================================")
    
    uri = settings.MONGODB_URI
    db_name = settings.MONGODB_DB_NAME
    
    print(f"[*] Configured Database Name : {db_name}")
    print(f"[*] Configured Connection URI: {uri}")
    
    # Connection Strategy 1: Standard Connection
    print("\n[Strategy 1] Connecting with standard SSL verification...")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=4000)
        # Force network check using ping
        client.admin.command('ping')
        print("[+] SUCCESS: Standard connection established successfully!")
        run_crud_operations(client[db_name])
        return
    except Exception as e:
        print(f"[-] FAILED: Standard connection failed: {e}")
        
    # Connection Strategy 2: Certifi CA Bundle connection
    print("\n[Strategy 2] Retrying using certifi Root CA certs fallback...")
    try:
        client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=4000)
        client.admin.command('ping')
        print("[+] SUCCESS: Connection established successfully using certifi CA fallback!")
        run_crud_operations(client[db_name])
        return
    except Exception as e:
        print(f"[-] FAILED: Certifi connection failed: {e}")
        
    # Connection Strategy 3: SSL Bypass (For severe ISP / Proxy decryption issues)
    print("\n[Strategy 3] Retrying with SSL verification completely bypassed (Insecure)...")
    try:
        client = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=4000)
        client.admin.command('ping')
        print("[+] SUCCESS: Connection established by bypassing SSL certificate checks!")
        run_crud_operations(client[db_name])
        return
    except Exception as e:
        print(f"[-] FAILED: Insecure SSL bypass connection failed: {e}")
        
    print("\n====================================================")
    print("❌ DIAGNOSTICS CONCLUSION: MongoDB Atlas is UNREACHABLE.")
    print("Please verify that your local IP address is whitelisted")
    print("in MongoDB Atlas (Security -> Network Access -> 0.0.0.0/0).")
    print("====================================================")

def run_crud_operations(db):
    print("\n--- Running Live Write/Read Transaction Tests ---")
    try:
        # Create a test document
        test_collection = db["connection_test_logs"]
        test_doc = {
            "test_run": True,
            "message": "Connection diagnostic successful!",
            "run_at_utc": "DateTime Check"
        }
        
        # 1. Write Test
        print("[*] Step 1: Writing diagnostic document to database...")
        result = test_collection.insert_one(test_doc)
        doc_id = result.inserted_id
        print(f"[+] Write Succeeded! Document ID: {doc_id}")
        
        # 2. Read Test
        print("[*] Step 2: Reading back diagnostic document...")
        read_doc = test_collection.find_one({"_id": doc_id})
        if read_doc:
            print(f"[+] Read Succeeded! Data: {read_doc.get('message')}")
        else:
            raise Exception("Document not found after insert.")
            
        # 3. Delete Test
        print("[*] Step 3: Cleaning up diagnostic document...")
        test_collection.delete_one({"_id": doc_id})
        print("[+] Clean-up Succeeded!")
        
        print("\n====================================================")
        print("🎉 ALL TESTS PASSED: MongoDB Atlas database is 100% online!")
        print("====================================================")
        
    except Exception as e:
        print(f"[-] Transaction CRUD Test Failed: {e}")

if __name__ == "__main__":
    test_mongodb_connection()
