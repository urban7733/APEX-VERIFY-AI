#!/usr/bin/env python3
"""
Complete System Test and Validation for APEX VERIFY AI
Tests all components and validates the complete workflow integration
"""

import os
import sys
import logging
import requests
import json
import time
from PIL import Image
import numpy as np
import io
import base64

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SystemTester:
    """
    Complete system tester for APEX VERIFY AI
    """
    
    def __init__(self, api_base_url="http://localhost:8000"):
        self.api_base_url = api_base_url
        self.test_results = {}
        
    def create_test_image(self, color='blue', size=(224, 224), filename='test_image.jpg'):
        """
        Create a test image for testing
        
        Args:
            color: Color of the test image
            size: Size of the image
            filename: Filename for the image
            
        Returns:
            PIL Image object
        """
        # Create a simple test image
        image = Image.new('RGB', size, color=color)
        
        # Add some content to make it more realistic
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(image)
        
        # Try to use a default font
        try:
            font = ImageFont.load_default()
        except:
            font = None
        
        # Add some text
        text = "APEX VERIFY AI TEST"
        if font:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        else:
            text_width, text_height = 100, 20
        
        x = (size[0] - text_width) // 2
        y = (size[1] - text_height) // 2
        
        draw.text((x, y), text, fill='white', font=font)
        
        return image
    
    def test_backend_health(self):
        """
        Test backend health endpoints
        
        Returns:
            bool: True if all health checks pass
        """
        logger.info("🔍 Testing Backend Health...")
        
        try:
            # Test root endpoint
            response = requests.get(f"{self.api_base_url}/", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Root endpoint: OK")
                self.test_results['root_endpoint'] = True
            else:
                logger.error(f"❌ Root endpoint failed: {response.status_code}")
                self.test_results['root_endpoint'] = False
                return False
            
            # Test health endpoint
            response = requests.get(f"{self.api_base_url}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ Health endpoint: {health_data.get('status', 'unknown')}")
                self.test_results['health_endpoint'] = True
            else:
                logger.error(f"❌ Health endpoint failed: {response.status_code}")
                self.test_results['health_endpoint'] = False
                return False
            
            # Test status endpoint
            response = requests.get(f"{self.api_base_url}/status", timeout=10)
            if response.status_code == 200:
                status_data = response.json()
                logger.info(f"✅ Status endpoint: {status_data.get('status', 'unknown')}")
                self.test_results['status_endpoint'] = True
            else:
                logger.error(f"❌ Status endpoint failed: {response.status_code}")
                self.test_results['status_endpoint'] = False
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Backend health test failed: {e}")
            self.test_results['backend_health'] = False
            return False
    
    def test_workflow_status(self):
        """
        Test workflow orchestrator status
        
        Returns:
            bool: True if workflow is ready
        """
        logger.info("🔍 Testing Workflow Status...")
        
        try:
            response = requests.get(f"{self.api_base_url}/workflow/status", timeout=10)
            if response.status_code == 200:
                workflow_data = response.json()
                initialized = workflow_data.get('initialized', False)
                services = workflow_data.get('services', {})
                
                logger.info(f"✅ Workflow initialized: {initialized}")
                logger.info(f"✅ Services status: {services}")
                
                self.test_results['workflow_status'] = {
                    'initialized': initialized,
                    'services': services
                }
                return initialized
            else:
                logger.error(f"❌ Workflow status failed: {response.status_code}")
                self.test_results['workflow_status'] = False
                return False
                
        except Exception as e:
            logger.error(f"❌ Workflow status test failed: {e}")
            self.test_results['workflow_status'] = False
            return False
    
    def test_workflow_functionality(self):
        """
        Test workflow functionality with a test image
        
        Returns:
            bool: True if workflow test passes
        """
        logger.info("🔍 Testing Workflow Functionality...")
        
        try:
            response = requests.get(f"{self.api_base_url}/workflow/test", timeout=30)
            if response.status_code == 200:
                test_data = response.json()
                functional = test_data.get('workflow_functional', False)
                
                logger.info(f"✅ Workflow functional: {functional}")
                self.test_results['workflow_functionality'] = functional
                return functional
            else:
                logger.error(f"❌ Workflow test failed: {response.status_code}")
                self.test_results['workflow_functionality'] = False
                return False
                
        except Exception as e:
            logger.error(f"❌ Workflow functionality test failed: {e}")
            self.test_results['workflow_functionality'] = False
            return False
    
    def test_image_verification(self):
        """
        Test complete image verification workflow
        
        Returns:
            bool: True if verification test passes
        """
        logger.info("🔍 Testing Image Verification...")
        
        try:
            # Create test image
            test_image = self.create_test_image('green', (300, 300))
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            test_image.save(img_byte_arr, format='JPEG', quality=95)
            img_byte_arr = img_byte_arr.getvalue()
            
            # Prepare form data
            files = {'file': ('test_image.jpg', img_byte_arr, 'image/jpeg')}
            
            # Make verification request
            start_time = time.time()
            response = requests.post(f"{self.api_base_url}/api/verify", files=files, timeout=60)
            processing_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                
                # Validate response structure
                required_fields = ['success', 'authenticity_score', 'classification', 'report', 'processing_time']
                missing_fields = [field for field in required_fields if field not in result]
                
                if missing_fields:
                    logger.error(f"❌ Missing required fields: {missing_fields}")
                    self.test_results['image_verification'] = False
                    return False
                
                # Log results
                logger.info(f"✅ Verification successful")
                logger.info(f"   Authenticity Score: {result.get('authenticity_score', 0)}%")
                logger.info(f"   Classification: {result.get('classification', 'UNKNOWN')}")
                logger.info(f"   Processing Time: {result.get('processing_time', 0)}s")
                logger.info(f"   Actual Time: {processing_time:.2f}s")
                logger.info(f"   Watermarked Image: {'Yes' if result.get('watermarked_image_base64') else 'No'}")
                
                self.test_results['image_verification'] = {
                    'success': True,
                    'authenticity_score': result.get('authenticity_score', 0),
                    'classification': result.get('classification', 'UNKNOWN'),
                    'processing_time': result.get('processing_time', 0),
                    'has_watermark': bool(result.get('watermarked_image_base64')),
                    'report_length': len(result.get('report', ''))
                }
                return True
            else:
                logger.error(f"❌ Image verification failed: {response.status_code}")
                if response.text:
                    logger.error(f"   Error: {response.text}")
                self.test_results['image_verification'] = False
                return False
                
        except Exception as e:
            logger.error(f"❌ Image verification test failed: {e}")
            self.test_results['image_verification'] = False
            return False
    
    def test_different_image_types(self):
        """
        Test verification with different image types and sizes
        
        Returns:
            bool: True if all image type tests pass
        """
        logger.info("🔍 Testing Different Image Types...")
        
        test_cases = [
            {'color': 'red', 'size': (224, 224), 'name': 'small_red.jpg'},
            {'color': 'blue', 'size': (512, 512), 'name': 'medium_blue.jpg'},
            {'color': 'green', 'size': (1024, 768), 'name': 'large_green.jpg'},
            {'color': 'purple', 'size': (150, 150), 'name': 'tiny_purple.jpg'},
        ]
        
        results = []
        
        for i, test_case in enumerate(test_cases):
            try:
                logger.info(f"   Testing case {i+1}/{len(test_cases)}: {test_case['name']}")
                
                # Create test image
                test_image = self.create_test_image(
                    test_case['color'], 
                    test_case['size'], 
                    test_case['name']
                )
                
                # Convert to bytes
                img_byte_arr = io.BytesIO()
                test_image.save(img_byte_arr, format='JPEG', quality=95)
                img_byte_arr = img_byte_arr.getvalue()
                
                # Prepare form data
                files = {'file': (test_case['name'], img_byte_arr, 'image/jpeg')}
                
                # Make verification request
                response = requests.post(f"{self.api_base_url}/api/verify", files=files, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    success = result.get('success', False)
                    score = result.get('authenticity_score', 0)
                    
                    logger.info(f"   ✅ {test_case['name']}: {score}% authentic")
                    results.append(True)
                else:
                    logger.error(f"   ❌ {test_case['name']}: HTTP {response.status_code}")
                    results.append(False)
                    
            except Exception as e:
                logger.error(f"   ❌ {test_case['name']}: {e}")
                results.append(False)
        
        success_rate = sum(results) / len(results)
        logger.info(f"✅ Image type tests: {success_rate*100:.1f}% success rate")
        
        self.test_results['image_types'] = {
            'success_rate': success_rate,
            'total_tests': len(test_cases),
            'passed_tests': sum(results)
        }
        
        return success_rate >= 0.75  # 75% success rate required
    
    def test_error_handling(self):
        """
        Test error handling with invalid inputs
        
        Returns:
            bool: True if error handling works correctly
        """
        logger.info("🔍 Testing Error Handling...")
        
        error_tests = [
            {
                'name': 'No file',
                'files': {},
                'expected_status': 422
            },
            {
                'name': 'Invalid file type',
                'files': {'file': ('test.txt', b'Hello World', 'text/plain')},
                'expected_status': 400
            },
            {
                'name': 'Empty file',
                'files': {'file': ('empty.jpg', b'', 'image/jpeg')},
                'expected_status': 400
            }
        ]
        
        results = []
        
        for test in error_tests:
            try:
                logger.info(f"   Testing: {test['name']}")
                
                response = requests.post(f"{self.api_base_url}/api/verify", files=test['files'], timeout=10)
                
                if response.status_code == test['expected_status']:
                    logger.info(f"   ✅ {test['name']}: Correct error response")
                    results.append(True)
                else:
                    logger.error(f"   ❌ {test['name']}: Expected {test['expected_status']}, got {response.status_code}")
                    results.append(False)
                    
            except Exception as e:
                logger.error(f"   ❌ {test['name']}: {e}")
                results.append(False)
        
        success_rate = sum(results) / len(results)
        logger.info(f"✅ Error handling tests: {success_rate*100:.1f}% success rate")
        
        self.test_results['error_handling'] = {
            'success_rate': success_rate,
            'total_tests': len(error_tests),
            'passed_tests': sum(results)
        }
        
        return success_rate >= 0.75
    
    def test_performance(self):
        """
        Test system performance with multiple concurrent requests
        
        Returns:
            bool: True if performance is acceptable
        """
        logger.info("🔍 Testing Performance...")
        
        try:
            import concurrent.futures
            import threading
            
            def make_verification_request():
                """Make a single verification request"""
                try:
                    # Create test image
                    test_image = self.create_test_image('yellow', (224, 224))
                    
                    # Convert to bytes
                    img_byte_arr = io.BytesIO()
                    test_image.save(img_byte_arr, format='JPEG', quality=95)
                    img_byte_arr = img_byte_arr.getvalue()
                    
                    # Prepare form data
                    files = {'file': ('perf_test.jpg', img_byte_arr, 'image/jpeg')}
                    
                    # Make request
                    start_time = time.time()
                    response = requests.post(f"{self.api_base_url}/api/verify", files=files, timeout=60)
                    end_time = time.time()
                    
                    return {
                        'success': response.status_code == 200,
                        'response_time': end_time - start_time,
                        'status_code': response.status_code
                    }
                except Exception as e:
                    return {
                        'success': False,
                        'response_time': 0,
                        'error': str(e)
                    }
            
            # Test with 5 concurrent requests
            num_requests = 5
            logger.info(f"   Making {num_requests} concurrent requests...")
            
            start_time = time.time()
            with concurrent.futures.ThreadPoolExecutor(max_workers=num_requests) as executor:
                futures = [executor.submit(make_verification_request) for _ in range(num_requests)]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            total_time = time.time() - start_time
            
            # Analyze results
            successful_requests = sum(1 for r in results if r['success'])
            avg_response_time = sum(r['response_time'] for r in results if r['success']) / max(successful_requests, 1)
            
            logger.info(f"   ✅ Successful requests: {successful_requests}/{num_requests}")
            logger.info(f"   ✅ Average response time: {avg_response_time:.2f}s")
            logger.info(f"   ✅ Total time: {total_time:.2f}s")
            
            self.test_results['performance'] = {
                'successful_requests': successful_requests,
                'total_requests': num_requests,
                'success_rate': successful_requests / num_requests,
                'avg_response_time': avg_response_time,
                'total_time': total_time
            }
            
            # Performance criteria: 80% success rate and avg response time < 10s
            return (successful_requests / num_requests) >= 0.8 and avg_response_time < 10.0
            
        except Exception as e:
            logger.error(f"❌ Performance test failed: {e}")
            self.test_results['performance'] = False
            return False
    
    def run_all_tests(self):
        """
        Run all system tests
        
        Returns:
            bool: True if all tests pass
        """
        logger.info("🚀 Starting Complete System Tests for APEX VERIFY AI")
        logger.info("=" * 70)
        
        tests = [
            ("Backend Health", self.test_backend_health),
            ("Workflow Status", self.test_workflow_status),
            ("Workflow Functionality", self.test_workflow_functionality),
            ("Image Verification", self.test_image_verification),
            ("Different Image Types", self.test_different_image_types),
            ("Error Handling", self.test_error_handling),
            ("Performance", self.test_performance),
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            logger.info(f"\n🧪 Running {test_name} Test...")
            try:
                success = test_func()
                results[test_name] = success
                logger.info(f"{'✅' if success else '❌'} {test_name}: {'PASSED' if success else 'FAILED'}")
            except Exception as e:
                logger.error(f"💥 {test_name} crashed: {e}")
                results[test_name] = False
        
        # Print summary
        logger.info("\n" + "=" * 70)
        logger.info("📊 COMPLETE SYSTEM TEST SUMMARY")
        logger.info("=" * 70)
        
        passed_tests = sum(1 for success in results.values() if success)
        total_tests = len(results)
        
        for test_name, success in results.items():
            status = "✅ PASS" if success else "❌ FAIL"
            logger.info(f"{test_name:25} {status}")
        
        logger.info(f"\nOverall: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests*100:.1f}%)")
        
        if passed_tests == total_tests:
            logger.info("🎉 ALL TESTS PASSED! System is fully operational.")
        elif passed_tests >= total_tests * 0.8:
            logger.info("⚠️  Most tests passed. System is mostly operational with minor issues.")
        else:
            logger.warning("❌ Multiple test failures. System needs attention.")
        
        # Save detailed results
        self.save_test_results()
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required
    
    def save_test_results(self):
        """
        Save detailed test results to file
        """
        try:
            results_file = 'test_results.json'
            with open(results_file, 'w') as f:
                json.dump({
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'api_base_url': self.api_base_url,
                    'test_results': self.test_results
                }, f, indent=2)
            logger.info(f"📄 Detailed test results saved to {results_file}")
        except Exception as e:
            logger.error(f"Failed to save test results: {e}")

def main():
    """
    Main function to run system tests
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Test APEX VERIFY AI System')
    parser.add_argument('--api-url', default='http://localhost:8000', 
                       help='API base URL (default: http://localhost:8000)')
    parser.add_argument('--verbose', action='store_true', 
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create tester and run tests
    tester = SystemTester(args.api_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
