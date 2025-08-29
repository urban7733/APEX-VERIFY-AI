#!/usr/bin/env python3
"""
APEX VERIFY AI - Vertex AI Deployment Script
Deploy the world's most advanced deepfake detection pipeline to Google Cloud
"""

import os
import sys
import json
import logging
import subprocess
from pathlib import Path
from google.cloud import aiplatform
from google.cloud import storage
import google.auth

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VertexAIDeployer:
    """Deploy APEX VERIFY AI pipeline to Vertex AI with GPU acceleration."""
    
    def __init__(self):
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'apex-ai-467219')
        self.region = os.getenv('GOOGLE_CLOUD_REGION', 'us-central1')
        self.zone = os.getenv('GOOGLE_CLOUD_ZONE', 'us-central1-a')
        
        # Initialize Vertex AI
        aiplatform.init(project=self.project_id, location=self.region)
        
        # Configuration
        self.model_name = "apex-verify-ai-deepfake-detector"
        self.endpoint_name = "apex-verify-ai-endpoint"
        self.machine_type = "n1-standard-4"
        self.gpu_type = "NVIDIA_L4"
        self.gpu_count = 1
        
        logger.info(f"Initializing deployment for project: {self.project_id}")
        logger.info(f"Region: {self.region}, Zone: {self.zone}")
    
    def check_prerequisites(self):
        """Check if all prerequisites are met."""
        logger.info("Checking prerequisites...")
        
        # Check gcloud CLI
        try:
            result = subprocess.run(['gcloud', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("✓ gcloud CLI is available")
            else:
                raise Exception("gcloud CLI not working")
        except Exception as e:
            logger.error("✗ gcloud CLI not available. Please install it first.")
            return False
        
        # Check authentication
        try:
            result = subprocess.run(['gcloud', 'auth', 'list', '--filter=status:ACTIVE'], 
                                  capture_output=True, text=True)
            if 'ACTIVE' in result.stdout:
                logger.info("✓ gcloud authentication active")
            else:
                raise Exception("No active authentication")
        except Exception as e:
            logger.error("✗ gcloud authentication required. Run: gcloud auth login")
            return False
        
        # Check project access
        try:
            result = subprocess.run(['gcloud', 'config', 'get-value', 'project'], 
                                  capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                logger.info(f"✓ Project configured: {result.stdout.strip()}")
            else:
                raise Exception("No project configured")
        except Exception as e:
            logger.error("✗ No project configured. Run: gcloud config set project PROJECT_ID")
            return False
        
        # Check APIs
        required_apis = [
            'aiplatform.googleapis.com',
            'compute.googleapis.com',
            'storage.googleapis.com',
            'cloudbuild.googleapis.com'
        ]
        
        for api in required_apis:
            try:
                result = subprocess.run(['gcloud', 'services', 'list', '--enabled', 
                                       f'--filter=name:{api}'], capture_output=True, text=True)
                if api in result.stdout:
                    logger.info(f"✓ API enabled: {api}")
                else:
                    logger.warning(f"⚠ API not enabled: {api}")
                    self.enable_api(api)
            except Exception as e:
                logger.error(f"✗ Failed to check API: {api}")
                return False
        
        logger.info("✓ All prerequisites met!")
        return True
    
    def enable_api(self, api_name):
        """Enable a Google Cloud API."""
        try:
            logger.info(f"Enabling API: {api_name}")
            result = subprocess.run(['gcloud', 'services', 'enable', api_name], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"✓ API enabled: {api_name}")
            else:
                logger.error(f"✗ Failed to enable API: {api_name}")
        except Exception as e:
            logger.error(f"✗ Error enabling API {api_name}: {e}")
    
    def create_gpu_instance(self):
        """Create a GPU instance for training and inference."""
        logger.info("Creating GPU instance...")
        
        instance_name = "apex-verify-ai-gpu"
        
        # Check if instance already exists
        try:
            result = subprocess.run(['gcloud', 'compute', 'instances', 'list', 
                                   f'--filter=name:{instance_name}'], 
                                  capture_output=True, text=True)
            if instance_name in result.stdout:
                logger.info(f"✓ GPU instance already exists: {instance_name}")
                return instance_name
        except Exception:
            pass
        
        # Create GPU instance
        cmd = [
            'gcloud', 'compute', 'instances', 'create', instance_name,
            f'--zone={self.zone}',
            f'--machine-type={self.machine_type}',
            f'--accelerator=type={self.gpu_type},count={self.gpu_count}',
            '--maintenance-policy=TERMINATE',
            '--image-family=pytorch-latest-gpu',
            '--image-project=deeplearning-platform-release',
            '--boot-disk-size=100GB',
            '--boot-disk-type=pd-ssd',
            '--metadata=startup-script=#! /bin/bash\nsudo apt-get update\nsudo apt-get install -y python3-pip git',
            '--scopes=cloud-platform'
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"✓ GPU instance created: {instance_name}")
                return instance_name
            else:
                logger.error(f"✗ Failed to create GPU instance: {result.stderr}")
                return None
        except Exception as e:
            logger.error(f"✗ Error creating GPU instance: {e}")
            return None
    
    def upload_to_storage(self):
        """Upload AI pipeline code and DINOv3 model to Cloud Storage."""
        logger.info("Uploading code and DINOv3 model to Cloud Storage...")
        
        bucket_name = f"{self.project_id}-apex-verify-ai"
        
        # Create bucket if it doesn't exist
        try:
            result = subprocess.run(['gsutil', 'ls', '-b', f'gs://{bucket_name}'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                logger.info(f"Creating bucket: {bucket_name}")
                subprocess.run(['gsutil', 'mb', '-l', self.region, f'gs://{bucket_name}'])
        except Exception as e:
            logger.error(f"✗ Error with bucket: {e}")
            return None
        
        # Upload backend code
        try:
            backend_path = Path(__file__).parent
            subprocess.run(['gsutil', 'cp', '-r', str(backend_path), f'gs://{bucket_name}/'])
            logger.info(f"✓ Code uploaded to gs://{bucket_name}/backend/")
        except Exception as e:
            logger.error(f"✗ Error uploading code: {e}")
            return None
        
        # Upload DINOv3 model if available
        try:
            dinov3_model_path = Path(__file__).parent / "dinov3_model.pth"
            if dinov3_model_path.exists():
                logger.info("Uploading DINOv3 model to Cloud Storage...")
                subprocess.run(['gsutil', 'cp', str(dinov3_model_path), f'gs://{bucket_name}/models/'])
                logger.info(f"✓ DINOv3 model uploaded to gs://{bucket_name}/models/")
            else:
                logger.warning("DINOv3 model not found. Will use pre-trained version.")
        except Exception as e:
            logger.error(f"✗ Error uploading DINOv3 model: {e}")
            # Continue without DINOv3 model
        
        return bucket_name
    
    def create_custom_container(self):
        """Create a custom container for the AI pipeline."""
        logger.info("Creating custom container...")
        
        # Create Dockerfile
        dockerfile_content = """
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-devel

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    python3-pip \\
    python3-dev \\
    git \\
    wget \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY vertex_ai_requirements.txt .
RUN pip3 install --no-cache-dir -r vertex_ai_requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV GOOGLE_CLOUD_PROJECT=apex-ai-467219
ENV GOOGLE_CLOUD_REGION=us-central1

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
"""
        
        dockerfile_path = Path(__file__).parent / "Dockerfile"
        with open(dockerfile_path, 'w') as f:
            f.write(dockerfile_content)
        
        # Build and push container
        container_name = f"gcr.io/{self.project_id}/apex-verify-ai"
        tag = "latest"
        
        try:
            # Configure Docker for gcloud
            subprocess.run(['gcloud', 'auth', 'configure-docker'], check=True)
            
            # Build container
            logger.info("Building container...")
            subprocess.run([
                'docker', 'build', '-t', f'{container_name}:{tag}', '.'
            ], cwd=Path(__file__).parent, check=True)
            
            # Push container
            logger.info("Pushing container...")
            subprocess.run([
                'docker', 'push', f'{container_name}:{tag}'
            ], check=True)
            
            logger.info(f"✓ Container created: {container_name}:{tag}")
            return f"{container_name}:{tag}"
            
        except Exception as e:
            logger.error(f"✗ Error creating container: {e}")
            return None
    
    def deploy_model(self, container_uri):
        """Deploy the model to Vertex AI."""
        logger.info("Deploying model to Vertex AI...")
        
        try:
            # Create model
            model = aiplatform.Model.upload(
                display_name=self.model_name,
                artifact_uri=f"gs://{self.project_id}-apex-verify-ai/backend/",
                serving_container_image_uri=container_uri,
                serving_container_ports=[8080],
                serving_container_health_route="/health",
                serving_container_predict_route="/api/verify"
            )
            
            logger.info(f"✓ Model created: {model.name}")
            
            # Create endpoint
            endpoint = model.deploy(
                machine_type=self.machine_type,
                accelerator_type=self.gpu_type,
                accelerator_count=self.gpu_count,
                min_replica_count=1,
                max_replica_count=10,
                traffic_split={"0": 100}
            )
            
            logger.info(f"✓ Endpoint deployed: {endpoint.name}")
            logger.info(f"✓ Endpoint URL: {endpoint.predict_route}")
            
            return model, endpoint
            
        except Exception as e:
            logger.error(f"✗ Error deploying model: {e}")
            return None, None
    
    def test_endpoint(self, endpoint):
        """Test the deployed endpoint."""
        logger.info("Testing endpoint...")
        
        try:
            # Create a test image (1x1 pixel)
            import numpy as np
            from PIL import Image
            import io
            
            # Create test image
            test_img = Image.fromarray(np.zeros((100, 100, 3), dtype=np.uint8))
            img_byte_arr = io.BytesIO()
            test_img.save(img_byte_arr, format='JPEG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Test prediction
            prediction = endpoint.predict([img_byte_arr])
            logger.info(f"✓ Endpoint test successful: {prediction}")
            return True
            
        except Exception as e:
            logger.error(f"✗ Endpoint test failed: {e}")
            return False
    
    def create_monitoring(self):
        """Set up monitoring and alerting."""
        logger.info("Setting up monitoring...")
        
        try:
            # Create monitoring dashboard
            dashboard_config = {
                "displayName": "APEX VERIFY AI Dashboard",
                "gridLayout": {
                    "columns": "2",
                    "widgets": [
                        {
                            "title": "Request Rate",
                            "xyChart": {
                                "dataSets": [{
                                    "timeSeriesQuery": {
                                        "timeSeriesFilter": {
                                            "filter": f'resource.type="aiplatform_endpoint" AND resource.labels.endpoint_id="{self.endpoint_name}"'
                                        }
                                    }
                                }]
                            }
                        },
                        {
                            "title": "Response Time",
                            "xyChart": {
                                "dataSets": [{
                                    "timeSeriesQuery": {
                                        "timeSeriesFilter": {
                                            "filter": f'resource.type="aiplatform_endpoint" AND resource.labels.endpoint_id="{self.endpoint_name}"'
                                        }
                                    }
                                }]
                            }
                        }
                    ]
                }
            }
            
            # Save dashboard config
            dashboard_path = Path(__file__).parent / "monitoring_dashboard.json"
            with open(dashboard_path, 'w') as f:
                json.dump(dashboard_config, f, indent=2)
            
            logger.info("✓ Monitoring dashboard configuration created")
            return True
            
        except Exception as e:
            logger.error(f"✗ Error setting up monitoring: {e}")
            return False
    
    def deploy(self):
        """Main deployment process."""
        logger.info("🚀 Starting APEX VERIFY AI deployment to Vertex AI...")
        
        # Check prerequisites
        if not self.check_prerequisites():
            logger.error("❌ Prerequisites not met. Deployment failed.")
            return False
        
        # Create GPU instance
        instance_name = self.create_gpu_instance()
        if not instance_name:
            logger.error("❌ Failed to create GPU instance.")
            return False
        
        # Upload to storage
        bucket_name = self.upload_to_storage()
        if not bucket_name:
            logger.error("❌ Failed to upload code to storage.")
            return False
        
        # Create container
        container_uri = self.create_custom_container()
        if not container_uri:
            logger.error("❌ Failed to create container.")
            return False
        
        # Deploy model
        model, endpoint = self.deploy_model(container_uri)
        if not model or not endpoint:
            logger.error("❌ Failed to deploy model.")
            return False
        
        # Test endpoint
        if not self.test_endpoint(endpoint):
            logger.error("❌ Endpoint test failed.")
            return False
        
        # Setup monitoring
        self.create_monitoring()
        
        logger.info("🎉 APEX VERIFY AI successfully deployed to Vertex AI!")
        logger.info(f"📊 Model: {model.name}")
        logger.info(f"🌐 Endpoint: {endpoint.name}")
        logger.info(f"🔗 Predict URL: {endpoint.predict_route}")
        logger.info(f"💻 GPU Instance: {instance_name}")
        logger.info(f"📦 Storage: gs://{bucket_name}")
        
        # Save deployment info
        deployment_info = {
            "project_id": self.project_id,
            "region": self.region,
            "zone": self.zone,
            "model_name": model.name,
            "endpoint_name": endpoint.name,
            "predict_url": endpoint.predict_route,
            "gpu_instance": instance_name,
            "storage_bucket": bucket_name,
            "container_uri": container_uri,
            "deployment_timestamp": str(aiplatform.datetime.now())
        }
        
        info_path = Path(__file__).parent / "deployment_info.json"
        with open(info_path, 'w') as f:
            json.dump(deployment_info, f, indent=2)
        
        logger.info(f"📝 Deployment info saved to: {info_path}")
        return True

def main():
    """Main function."""
    deployer = VertexAIDeployer()
    
    try:
        success = deployer.deploy()
        if success:
            logger.info("✅ Deployment completed successfully!")
            sys.exit(0)
        else:
            logger.error("❌ Deployment failed!")
            sys.exit(1)
    except KeyboardInterrupt:
        logger.info("⚠️ Deployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
