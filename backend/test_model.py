#!/usr/bin/env python3
"""
Simple test script to verify the Hugging Face model integration works correctly.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from PIL import Image
import numpy as np
from models.simple_analyzer import SimpleAnalyzer

def test_analyzer():
    """Test the SimpleAnalyzer with a sample image."""
    print("Testing SimpleAnalyzer with Hugging Face model...")
    
    try:
        # Initialize the analyzer
        analyzer = SimpleAnalyzer()
        
        # Get model info
        model_info = analyzer.get_model_info()
        print(f"Model Info: {model_info}")
        
        # Create a simple test image (RGB, 224x224)
        test_image = Image.new('RGB', (224, 224), color='red')
        
        # Analyze the image
        result = analyzer.analyze_image(test_image)
        
        print(f"Analysis Result:")
        print(f"  Authenticity Score: {result['authenticity_score']}%")
        print(f"  Classification: {result['classification']}")
        print(f"  Confidence: {result['confidence']}")
        print(f"  Feature Anomalies: {result['feature_anomalies']}")
        print(f"  Image Info: {result['image_info']}")
        
        print("\n✅ Test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_analyzer()
    sys.exit(0 if success else 1)
