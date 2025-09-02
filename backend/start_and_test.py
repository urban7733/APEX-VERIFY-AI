#!/usr/bin/env python3
"""
Start and Test Script for APEX VERIFY AI
Starts the backend server and runs comprehensive tests
"""

import os
import sys
import subprocess
import time
import logging
import requests
import signal
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SystemStarter:
    """
    System starter and tester for APEX VERIFY AI
    """
    
    def __init__(self):
        self.server_process = None
        self.api_url = "http://localhost:8000"
        self.max_wait_time = 60  # seconds
        
    def check_dependencies(self):
        """
        Check if all required dependencies are installed
        
        Returns:
            bool: True if all dependencies are available
        """
        logger.info("🔍 Checking dependencies...")
        
        required_packages = [
            'fastapi',
            'uvicorn',
            'torch',
            'torchvision',
            'transformers',
            'pillow',
            'numpy',
            'opencv-python',
            'requests'
        ]
        
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                logger.info(f"   ✅ {package}")
            except ImportError:
                logger.error(f"   ❌ {package} - not installed")
                missing_packages.append(package)
        
        if missing_packages:
            logger.error(f"❌ Missing packages: {', '.join(missing_packages)}")
            logger.error("Please install missing packages with: pip install -r requirements.txt")
            return False
        
        logger.info("✅ All dependencies are available")
        return True
    
    def check_environment(self):
        """
        Check environment configuration
        
        Returns:
            bool: True if environment is properly configured
        """
        logger.info("🔍 Checking environment configuration...")
        
        # Check for .env file
        env_file = Path('.env')
        if not env_file.exists():
            logger.warning("⚠️  .env file not found, using defaults")
            logger.info("   You can copy env.example to .env and configure your API keys")
        else:
            logger.info("   ✅ .env file found")
        
        # Check for model directory
        model_dir = Path('models')
        if not model_dir.exists():
            logger.warning("⚠️  models directory not found")
            logger.info("   Create a 'models' directory and place your DINOv3 model there")
        else:
            logger.info("   ✅ models directory found")
        
        # Check environment variables
        env_vars = [
            'GEMINI_API_KEY',
            'GOOGLE_VISION_API_KEY',
            'TINEYE_API_KEY',
            'DINOV3_MODEL_PATH'
        ]
        
        configured_vars = []
        for var in env_vars:
            if os.getenv(var):
                configured_vars.append(var)
                logger.info(f"   ✅ {var} is configured")
            else:
                logger.info(f"   ⚠️  {var} is not configured (optional)")
        
        logger.info(f"✅ Environment check complete ({len(configured_vars)}/{len(env_vars)} vars configured)")
        return True
    
    def start_server(self):
        """
        Start the FastAPI server
        
        Returns:
            bool: True if server started successfully
        """
        logger.info("🚀 Starting APEX VERIFY AI Backend Server...")
        
        try:
            # Start the server
            cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
            self.server_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for server to start
            logger.info("   Waiting for server to start...")
            for i in range(self.max_wait_time):
                try:
                    response = requests.get(f"{self.api_url}/health", timeout=2)
                    if response.status_code == 200:
                        logger.info("   ✅ Server started successfully")
                        return True
                except requests.exceptions.RequestException:
                    pass
                
                time.sleep(1)
                if i % 10 == 0 and i > 0:
                    logger.info(f"   Still waiting... ({i}s)")
            
            logger.error("   ❌ Server failed to start within timeout")
            return False
            
        except Exception as e:
            logger.error(f"❌ Failed to start server: {e}")
            return False
    
    def stop_server(self):
        """
        Stop the FastAPI server
        """
        if self.server_process:
            logger.info("🛑 Stopping server...")
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=10)
                logger.info("   ✅ Server stopped")
            except subprocess.TimeoutExpired:
                logger.warning("   ⚠️  Server didn't stop gracefully, forcing...")
                self.server_process.kill()
                self.server_process.wait()
            except Exception as e:
                logger.error(f"   ❌ Error stopping server: {e}")
    
    def run_tests(self):
        """
        Run comprehensive system tests
        
        Returns:
            bool: True if tests pass
        """
        logger.info("🧪 Running comprehensive system tests...")
        
        try:
            # Import and run the test script
            from test_complete_system import SystemTester
            
            tester = SystemTester(self.api_url)
            success = tester.run_all_tests()
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Test execution failed: {e}")
            return False
    
    def run_quick_test(self):
        """
        Run a quick functionality test
        
        Returns:
            bool: True if quick test passes
        """
        logger.info("⚡ Running quick functionality test...")
        
        try:
            # Test basic endpoints
            endpoints = ['/', '/health', '/status']
            
            for endpoint in endpoints:
                response = requests.get(f"{self.api_url}{endpoint}", timeout=5)
                if response.status_code != 200:
                    logger.error(f"   ❌ {endpoint} failed: {response.status_code}")
                    return False
                logger.info(f"   ✅ {endpoint}")
            
            # Test workflow status
            response = requests.get(f"{self.api_url}/workflow/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                initialized = data.get('initialized', False)
                logger.info(f"   ✅ Workflow status: {'Ready' if initialized else 'Not ready'}")
            else:
                logger.error(f"   ❌ Workflow status failed: {response.status_code}")
                return False
            
            logger.info("✅ Quick test passed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Quick test failed: {e}")
            return False
    
    def run(self, run_full_tests=False):
        """
        Main run method
        
        Args:
            run_full_tests: Whether to run full test suite
            
        Returns:
            bool: True if everything works
        """
        logger.info("🚀 APEX VERIFY AI - System Starter and Tester")
        logger.info("=" * 60)
        
        try:
            # Check dependencies
            if not self.check_dependencies():
                return False
            
            # Check environment
            if not self.check_environment():
                return False
            
            # Start server
            if not self.start_server():
                return False
            
            # Run tests
            if run_full_tests:
                success = self.run_tests()
            else:
                success = self.run_quick_test()
            
            if success:
                logger.info("\n🎉 System is ready and operational!")
                logger.info(f"   API URL: {self.api_url}")
                logger.info("   Frontend: http://localhost:3000")
                logger.info("   API Docs: http://localhost:8000/docs")
                
                if not run_full_tests:
                    logger.info("\n💡 To run full tests, use: python start_and_test.py --full-tests")
                
                # Keep server running
                logger.info("\n🔄 Server is running. Press Ctrl+C to stop.")
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    logger.info("\n👋 Shutting down...")
            else:
                logger.error("\n❌ System tests failed")
                return False
                
        except KeyboardInterrupt:
            logger.info("\n👋 Shutting down...")
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            return False
        finally:
            self.stop_server()
        
        return True

def main():
    """
    Main function
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Start and Test APEX VERIFY AI System')
    parser.add_argument('--full-tests', action='store_true', 
                       help='Run full test suite (default: quick test)')
    parser.add_argument('--test-only', action='store_true',
                       help='Only run tests, assume server is already running')
    parser.add_argument('--verbose', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    starter = SystemStarter()
    
    if args.test_only:
        # Only run tests
        if args.full_tests:
            success = starter.run_tests()
        else:
            success = starter.run_quick_test()
    else:
        # Start server and run tests
        success = starter.run(run_full_tests=args.full_tests)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
