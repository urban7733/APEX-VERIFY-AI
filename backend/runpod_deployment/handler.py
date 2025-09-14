"""
Main RunPod Handler Entry Point
"""

from runpod_handler import handler

# This is the entry point for RunPod
def runpod_handler(event):
    """RunPod entry point"""
    return handler(event)
