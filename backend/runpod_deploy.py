"""
RunPod Deployment Script for APEX VERIFY AI - 2025 ULTIMATE STACK
This script helps deploy the cutting-edge vision pipeline to RunPod serverless
"""

import requests
import json
import os
from typing import Dict, Any, Optional

class RunPodDeployer:
    """
    RunPod Deployment Manager for APEX VERIFY AI
    Handles deployment of the ULTIMATE 2025 cutting-edge stack
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.runpod.io/v2"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def create_pod(self, config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new RunPod instance with the ULTIMATE 2025 stack"""
        try:
            pod_config = {
                "name": config["name"],
                "imageName": "runpod/pytorch:2.0.0-py3.11-cuda12.1.0-devel-ubuntu22.04",
                "gpuTypeId": "NVIDIA GeForce RTX 4090",  # 24GB VRAM for DINOv3
                "containerDiskInGb": 100,  # 100GB for all models
                "volumeInGb": 0,
                "ports": "8000/http",
                "volumeMountPath": "/workspace",
                "env": config["environment_variables"],
                "startJupyter": False,
                "startSsh": True,
                "isPublic": False,
                "isRunpod": True
            }
            
            response = requests.post(
                f"{self.base_url}/pods",
                headers=self.headers,
                json=pod_config
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"🚀 Pod created successfully: {result.get('id')}")
                return result
            else:
                print(f"❌ Failed to create pod: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating pod: {e}")
            return None
    
    def deploy_code(self, pod_id: str, local_path: str) -> bool:
        """Deploy the ULTIMATE 2025 code to RunPod"""
        try:
            # This would typically use RunPod's file upload API
            # or SCP/SFTP to transfer files
            print(f"📤 Deploying code to pod {pod_id}...")
            print(f"📁 Local path: {local_path}")
            
            # For now, print the deployment commands
            print("""
            To deploy manually:
            1. SCP your code to the pod:
               scp -r ./backend/* root@<pod-ip>:/workspace/
            
            2. SSH into the pod:
               ssh root@<pod-ip>
            
            3. Install dependencies:
               cd /workspace
               pip install -r requirements.txt
            
            4. Download models:
               python runpod_config.py
            
            5. Start the service:
               uvicorn app.main:app --host 0.0.0.0 --port 8000
            """)
            
            return True
            
        except Exception as e:
            print(f"❌ Error deploying code: {e}")
            return False
    
    def get_pod_status(self, pod_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a RunPod instance"""
        try:
            response = requests.get(
                f"{self.base_url}/pods/{pod_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Failed to get pod status: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error getting pod status: {e}")
            return None
    
    def list_pods(self) -> Optional[list]:
        """List all RunPod instances"""
        try:
            response = requests.get(
                f"{self.base_url}/pods",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('data', [])
            else:
                print(f"❌ Failed to list pods: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error listing pods: {e}")
            return None
    
    def create_serverless_endpoint(self, config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a serverless endpoint for the ULTIMATE 2025 stack"""
        try:
            endpoint_config = {
                "name": config["name"] + "-serverless",
                "templateId": "your-template-id",  # You need to create a template first
                "gpuIds": ["your-gpu-id"],  # GPU ID from your RunPod account
                "networkVolumeId": "your-volume-id",  # For model storage
                "env": config["environment_variables"],
                "containerDiskInGb": 100,
                "maxConcurrency": 10,
                "idleTimeout": 300,
                "scaleSettings": {
                    "minInstances": 0,
                    "maxInstances": 5
                }
            }
            
            response = requests.post(
                f"{self.base_url}/serverless",
                headers=self.headers,
                json=endpoint_config
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"🚀 Serverless endpoint created: {result.get('id')}")
                return result
            else:
                print(f"❌ Failed to create serverless endpoint: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating serverless endpoint: {e}")
            return None

def main():
    """Main deployment function"""
    print("🚀 APEX VERIFY AI - RunPod Deployment")
    print("=" * 50)
    
    # Check for API key
    api_key = os.getenv('RUNPOD_API_KEY')
    if not api_key:
        print("❌ RUNPOD_API_KEY environment variable not set")
        print("Please set your RunPod API key:")
        print("export RUNPOD_API_KEY=your_api_key_here")
        return
    
    # Load configuration
    from runpod_config import get_runpod_config
    config = get_runpod_config()
    
    # Initialize deployer
    deployer = RunPodDeployer(api_key)
    
    # List existing pods
    print("📋 Existing RunPod instances:")
    pods = deployer.list_pods()
    if pods:
        for pod in pods:
            print(f"  - {pod.get('name', 'Unknown')} ({pod.get('id', 'No ID')}) - {pod.get('machine', {}).get('podStatus', 'Unknown')}")
    else:
        print("  No existing pods found")
    
    print("\n🔥 Ready to deploy ULTIMATE 2025 stack!")
    print("Choose deployment option:")
    print("1. Create new pod")
    print("2. Create serverless endpoint")
    print("3. List existing instances")
    
    choice = input("Enter choice (1-3): ")
    
    if choice == "1":
        result = deployer.create_pod(config)
        if result:
            pod_id = result.get('id')
            deployer.deploy_code(pod_id, "./backend")
    
    elif choice == "2":
        deployer.create_serverless_endpoint(config)
    
    elif choice == "3":
        pods = deployer.list_pods()
        if pods:
            for pod in pods:
                print(f"Pod: {pod.get('name')} - Status: {pod.get('machine', {}).get('podStatus')}")
        else:
            print("No pods found")

if __name__ == "__main__":
    main()
