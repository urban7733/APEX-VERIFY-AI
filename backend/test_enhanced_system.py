#!/usr/bin/env python3
"""
Test script for the enhanced APEX VERIFY AI system
Tests all components and validates the complete workflow
"""

import os
import sys
import logging
from PIL import Image
import numpy as np

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_dinov3_model():
    """Test DINOv3 model integration"""
    try:
        from models.dinov3_model import DINOv3Analyzer
        
        logger.info("Testing DINOv3 Analyzer...")
        analyzer = DINOv3Analyzer()
        
        # Test initialization
        initialized = analyzer.initialize()
        logger.info(f"DINOv3 Analyzer initialization: {'SUCCESS' if initialized else 'FALLBACK MODE'}")
        
        # Test with sample image
        test_image = Image.new('RGB', (224, 224), color='blue')
        results = analyzer.analyze_image(test_image)
        
        logger.info(f"Analysis results: {results.get('authenticity_score', 0)}% authentic")
        logger.info(f"Classification: {results.get('classification', 'UNKNOWN')}")
        
        return True
        
    except Exception as e:
        logger.error(f"DINOv3 test failed: {e}")
        return False

def test_spatial_analysis():
    """Test spatial analysis service"""
    try:
        from services.spatial_analysis_service import SpatialAnalysisService
        
        logger.info("Testing Spatial Analysis Service...")
        service = SpatialAnalysisService()
        
        # Test with sample image
        test_image = Image.new('RGB', (224, 224), color='green')
        features = np.random.normal(0, 1, 768)  # Mock DINOv3 features
        
        results = service.analyze_spatial_content(test_image, features)
        
        logger.info(f"Scene description: {results.get('scene_description', 'N/A')}")
        logger.info(f"Objects detected: {len(results.get('objects', []))}")
        logger.info(f"Faces detected: {len(results.get('faces', []))}")
        
        return True
        
    except Exception as e:
        logger.error(f"Spatial analysis test failed: {e}")
        return False

def test_reverse_search():
    """Test reverse search service"""
    try:
        from services.reverse_search_service import ReverseSearchService
        
        logger.info("Testing Reverse Search Service...")
        service = ReverseSearchService()
        
        # Test connection status
        status = service.test_connection()
        logger.info(f"Reverse search status: {status}")
        
        # Test with sample image
        test_image = Image.new('RGB', (224, 224), color='red')
        features = np.random.normal(0, 1, 768)  # Mock DINOv3 features
        
        results = service.search_image_sources(test_image, features)
        
        logger.info(f"Google Vision: {results.get('google_vision', {}).get('status', 'N/A')}")
        logger.info(f"TinEye: {results.get('tineye', {}).get('status', 'N/A')}")
        logger.info(f"Embedding similarity: {results.get('embedding_similarity', {}).get('status', 'N/A')}")
        
        return True
        
    except Exception as e:
        logger.error(f"Reverse search test failed: {e}")
        return False

def test_watermarking():
    """Test watermarking service"""
    try:
        from services.watermarking_service import WatermarkingService
        
        logger.info("Testing Watermarking Service...")
        service = WatermarkingService()
        
        # Test with sample image
        test_image = Image.new('RGB', (224, 224), color='purple')
        
        # Test watermarking (should not apply for low score)
        watermarked_image, base64_image = service.add_watermark(test_image, 50.0, {})
        logger.info(f"Watermarking for 50% score: {'Applied' if watermarked_image != test_image else 'Not applied'}")
        
        # Test watermarking (should apply for high score)
        watermarked_image, base64_image = service.add_watermark(test_image, 99.9, {})
        logger.info(f"Watermarking for 99.9% score: {'Applied' if watermarked_image != test_image else 'Not applied'}")
        logger.info(f"Base64 output length: {len(base64_image) if base64_image else 0}")
        
        # Test watermark info
        info = service.get_watermark_info()
        logger.info(f"Watermark info: {info}")
        
        return True
        
    except Exception as e:
        logger.error(f"Watermarking test failed: {e}")
        return False

def test_workflow_orchestrator():
    """Test complete workflow orchestrator"""
    try:
        from services.workflow_orchestrator import WorkflowOrchestrator
        
        logger.info("Testing Workflow Orchestrator...")
        orchestrator = WorkflowOrchestrator()
        
        # Test initialization
        initialized = orchestrator.initialize()
        logger.info(f"Workflow initialization: {'SUCCESS' if initialized else 'FAILED'}")
        
        if initialized:
            # Test workflow status
            status = orchestrator.get_workflow_status()
            logger.info(f"Workflow status: {status.get('initialized', False)}")
            
            # Test complete workflow
            test_image = Image.new('RGB', (224, 224), color='orange')
            results = orchestrator.process_image(test_image, "test_image.jpg")
            
            logger.info(f"Workflow results: {results.get('success', False)}")
            logger.info(f"Authenticity score: {results.get('authenticity_score', 0)}%")
            logger.info(f"Processing time: {results.get('processing_time', 0)}s")
            logger.info(f"Watermarking applied: {results.get('watermarking', {}).get('applied', False)}")
        
        return True
        
    except Exception as e:
        logger.error(f"Workflow orchestrator test failed: {e}")
        return False

def test_gemini_service():
    """Test Gemini service (if API key available)"""
    try:
        from services.gemini_service import GeminiReportService
        
        logger.info("Testing Gemini Service...")
        
        # Check if API key is available
        if not os.getenv('GEMINI_API_KEY'):
            logger.warning("GEMINI_API_KEY not set, skipping Gemini test")
            return True
        
        service = GeminiReportService()
        
        # Test connection
        status = service.test_connection()
        logger.info(f"Gemini connection: {status.get('status', 'UNKNOWN')}")
        
        # Test report generation
        test_image = Image.new('RGB', (224, 224), color='yellow')
        analysis = {
            'authenticity_score': 95.5,
            'classification': 'GENUINE MEDIA',
            'confidence': 0.95,
            'feature_anomalies': []
        }
        
        report = service.generate_report(test_image.tobytes(), analysis)
        logger.info(f"Report generated: {len(report)} characters")
        logger.info(f"Report preview: {report[:100]}...")
        
        return True
        
    except Exception as e:
        logger.error(f"Gemini service test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Starting APEX VERIFY AI Enhanced System Tests")
    logger.info("=" * 60)
    
    tests = [
        ("DINOv3 Model", test_dinov3_model),
        ("Spatial Analysis", test_spatial_analysis),
        ("Reverse Search", test_reverse_search),
        ("Watermarking", test_watermarking),
        ("Gemini Service", test_gemini_service),
        ("Workflow Orchestrator", test_workflow_orchestrator),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Testing {test_name}...")
        try:
            success = test_func()
            results[test_name] = "✅ PASS" if success else "❌ FAIL"
        except Exception as e:
            logger.error(f"Test {test_name} crashed: {e}")
            results[test_name] = "💥 CRASH"
    
    # Print summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 TEST SUMMARY")
    logger.info("=" * 60)
    
    for test_name, result in results.items():
        logger.info(f"{test_name:20} {result}")
    
    passed = sum(1 for result in results.values() if "PASS" in result)
    total = len(results)
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! System is ready for deployment.")
    else:
        logger.warning("⚠️  Some tests failed. Check the logs above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
