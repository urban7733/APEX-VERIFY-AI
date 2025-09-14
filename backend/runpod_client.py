"""
RunPod Client for APEX VERIFY AI - 2025 ULTIMATE STACK
This client connects to your RunPod serverless endpoint
"""

import requests
import base64
import json
import os
from typing import Dict, Any, Optional
from PIL import Image
import io

class RunPodClient:
    """
    RunPod Client for APEX VERIFY AI
    Connects to your serverless endpoint and processes images
    """
    
    def __init__(self, api_key: str, endpoint_id: str):
        self.api_key = api_key
        self.endpoint_id = endpoint_id
        self.base_url = f"https://api.runpod.ai/v2/{endpoint_id}"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    
    def process_image(self, image: Image.Image, filename: str = "image.jpg", 
                     pipeline: str = "beast") -> Dict[str, Any]:
        """
        Process image through your RunPod ULTIMATE 2025 stack
        
        Args:
            image: PIL Image object
            filename: Original filename
            pipeline: "ultra" or "beast" (default: "beast")
            
        Returns:
            Analysis results from RunPod
        """
        try:
            # Convert image to base64
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG')
            img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
            
            # Prepare request data
            data = {
                "input": {
                    "image_base64": img_base64,
                    "filename": filename,
                    "pipeline": pipeline,  # "ultra" or "beast"
                    "action": "verify_image"
                }
            }
            
            # Send request to RunPod
            response = requests.post(
                f"{self.base_url}/run",
                headers=self.headers,
                json=data,
                timeout=300  # 5 minutes for complex analysis
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_response(result)
            else:
                return {
                    "success": False,
                    "error": f"RunPod API error: {response.status_code} - {response.text}",
                    "authenticity_score": 0,
                    "classification": "ERROR"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"RunPod client error: {str(e)}",
                "authenticity_score": 0,
                "classification": "ERROR"
            }
    
    def _parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse RunPod response"""
        try:
            # RunPod returns the result in the 'output' field
            if 'output' in response:
                output = response['output']
                return {
                    "success": output.get('success', True),
                    "authenticity_score": output.get('authenticity_score', 0),
                    "classification": output.get('classification', 'UNKNOWN'),
                    "report": output.get('report', ''),
                    "processing_time": output.get('processing_time', 0),
                    "confidence": output.get('confidence', 0),
                    "model_info": output.get('model_info', {}),
                    "runpod_status": response.get('status', 'unknown')
                }
            else:
                return {
                    "success": False,
                    "error": "Invalid RunPod response format",
                    "authenticity_score": 0,
                    "classification": "ERROR"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Response parsing error: {str(e)}",
                "authenticity_score": 0,
                "classification": "ERROR"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test connection to RunPod endpoint"""
        try:
            # Send a simple test request
            data = {
                "input": {
                    "action": "health_check"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/run",
                headers=self.headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "connected",
                    "endpoint": self.endpoint_id,
                    "response": response.json()
                }
            else:
                return {
                    "status": "error",
                    "endpoint": self.endpoint_id,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "endpoint": self.endpoint_id,
                "error": str(e)
            }
    
    def get_endpoint_status(self) -> Dict[str, Any]:
        """Get RunPod endpoint status"""
        try:
            response = requests.get(
                f"{self.base_url}/status",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "status": "error",
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

# Your RunPod configuration - uses environment variables
RUNPOD_API_KEY = os.getenv('RUNPOD_API_KEY', 'your_runpod_api_key_here')
RUNPOD_ENDPOINT_ID = os.getenv('RUNPOD_ENDPOINT_ID', 'zhgaq30ncgov4p')

def create_runpod_client() -> RunPodClient:
    """Create RunPod client with your configuration"""
    return RunPodClient(RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID)

def test_runpod_connection():
    """Test your RunPod endpoint"""
    client = create_runpod_client()
    
    print("🔥 Testing RunPod ULTIMATE 2025 Stack Connection...")
    print(f"Endpoint: {RUNPOD_ENDPOINT_ID}")
    
    # Test connection
    result = client.test_connection()
    print(f"Connection Status: {result['status']}")
    
    if result['status'] == 'connected':
        print("✅ RunPod endpoint is ready!")
        
        # Test with a sample image
        test_image = Image.new('RGB', (224, 224), color='blue')
        analysis = client.process_image(test_image, "test_image.jpg", "beast")
        
        print(f"🔥 Test Analysis Results:")
        print(f"  Success: {analysis.get('success', False)}")
        print(f"  Score: {analysis.get('authenticity_score', 0)}%")
        print(f"  Classification: {analysis.get('classification', 'UNKNOWN')}")
        print(f"  Processing Time: {analysis.get('processing_time', 0)}s")
        
    else:
        print(f"❌ Connection failed: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    test_runpod_connection()
