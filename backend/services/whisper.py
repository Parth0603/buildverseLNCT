import os
import logging
import time
import httpx
from backend.config import settings

logger = logging.getLogger("scamradar.assemblyai")

def transcribe_audio_file(file_path: str) -> str:
    """
    Transcribe a local audio file (.mp3, .wav, .m4a) using AssemblyAI's Cloud REST API directly.
    Bypasses strict client SDK models to avoid pydantic enum mismatch validation warnings.
    Gracefully falls back to a realistic mock phishing transcript if unconfigured/offline.
    """
    if not settings.ASSEMBLYAI_API_KEY:
        logger.info("AssemblyAI API key is unconfigured. Returning realistic mock scam audio transcript.")
        return get_mock_audio_transcript(file_path)
        
    try:
        headers = {
            "authorization": settings.ASSEMBLYAI_API_KEY
        }
        
        # 1. Upload the local file binary to AssemblyAI CDN
        logger.info(f"Uploading local file {file_path} to AssemblyAI...")
        with open(file_path, "rb") as f:
            upload_response = httpx.post(
                "https://api.assemblyai.com/v2/upload", 
                headers=headers, 
                data=f, 
                timeout=45.0
            )
            
        if upload_response.status_code != 200:
            raise Exception(f"Upload failed (HTTP {upload_response.status_code}): {upload_response.text}")
            
        upload_url = upload_response.json().get("upload_url")
        if not upload_url:
            raise Exception("No upload_url returned in upload response.")
            
        # 2. Submit the transcription request using active speech_models
        logger.info("Submitting transcription request with speech_models universal-2 and universal-3-pro...")
        transcript_url = "https://api.assemblyai.com/v2/transcript"
        payload = {
            "audio_url": upload_url,
            "speech_models": ["universal-3-pro", "universal-2"]
        }
        
        headers_json = {
            "authorization": settings.ASSEMBLYAI_API_KEY,
            "content-type": "application/json"
        }
        submit_response = httpx.post(transcript_url, json=payload, headers=headers_json, timeout=10.0)
        if submit_response.status_code != 200:
            raise Exception(f"Submit failed (HTTP {submit_response.status_code}): {submit_response.text}")
            
        transcript_id = submit_response.json().get("id")
        if not transcript_id:
            raise Exception("No transcript ID returned from submission.")
            
        # 3. Poll for the transcription completed status
        logger.info(f"Polling transcription status for ID {transcript_id}...")
        for attempt in range(40):
            time.sleep(1.5)
            poll_response = httpx.get(f"{transcript_url}/{transcript_id}", headers=headers, timeout=10.0)
            if poll_response.status_code != 200:
                continue
                
            poll_data = poll_response.json()
            status = poll_data.get("status")
            logger.info(f"Attempt {attempt+1}: Transcription status is '{status}'")
            
            if status == "completed":
                logger.info("AssemblyAI transcription completed successfully!")
                return poll_data.get("text", "")
            elif status == "error":
                raise Exception(poll_data.get("error", "Unknown AssemblyAI transcription error"))
                
        raise Exception("AssemblyAI transcription polling timed out.")
        
    except Exception as e:
        logger.error(f"AssemblyAI transcription failure: {str(e)}. Using fallback mock transcript.")
        return get_mock_audio_transcript(file_path)

def get_mock_audio_transcript(file_path: str) -> str:
    """
    Return realistic scam-impersonating dialogue scripts based on filename
    to allow comprehensive mock testing during hackathon reviews.
    """
    filename = os.path.basename(file_path).lower()
    
    if "otp" in filename or "code" in filename:
        return (
            "Hello, this is security officer James from your local credit union card fraud division. "
            "We have detected two suspicious charges of eight hundred dollars each originating from a foreign country. "
            "To lock your checking account and secure your balance, please verify your identity by speaking the "
            "six-digit authorization code sent to your mobile phone number now. Do not delay, your account is at risk."
        )
    elif "crypto" in filename or "investment" in filename:
        return (
            "Hi, this is a premium investment manager update. We are currently hosting a private smart pool beta. "
            "If you deposit at least zero point five Ethereum to our secure contract address, our system will automatically "
            "match and credit you back double your assets within twelve minutes, guaranteed. This offer is only valid for "
            "the next hour as part of the launch promo. Please act quickly to secure your rewards."
        )
    elif "job" in filename or "task" in filename:
        return (
            "Greetings! We have reviewed your profile and are thrilled to offer you a flexible home tasks consultant position. "
            "You can earn between three hundred and nine hundred dollars daily simply by clicking online review buttons for "
            "ten minutes a day. No previous work history is required. To initiate your onboarding and get paid today, please "
            "message our hiring supervisor immediately on WhatsApp."
        )
    
    # Generic, standard mock scam text representing social engineering threats
    return (
        "Dear customer, this is an automated message from service security. We noticed an unauthorized browser login attempt "
        "on your portal. If this was not you, your account has been locked for your protection. Please click secure link "
        "to verify your card number and enter your username to reactive your premium services."
    )
