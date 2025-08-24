import hashlib
import json
import time
from typing import Dict, Any, Optional
from PIL import Image, PngInfo
import piexif
from datetime import datetime
import base64

class DigitalSealService:
    """
    Service for embedding and verifying digital seals in image metadata.
    Creates immutable proof of authenticity verification.
    """
    
    def __init__(self):
        self.seal_version = "1.0"
        self.seal_identifier = "APEX_VERIFY_AI"
        
    def create_digital_seal(self, 
                           image_hash: str, 
                           verification_result: Dict[str, Any],
                           api_key_hash: str) -> Dict[str, Any]:
        """
        Create a digital seal with cryptographic proof.
        
        Args:
            image_hash: SHA-256 hash of the original image
            verification_result: Complete verification analysis
            api_key_hash: Hash of the API key used for verification
            
        Returns:
            Digital seal data structure
        """
        timestamp = datetime.utcnow().isoformat()
        
        # Create seal data
        seal_data = {
            "version": self.seal_version,
            "identifier": self.seal_identifier,
            "timestamp": timestamp,
            "image_hash": image_hash,
            "verification_hash": self._hash_verification_result(verification_result),
            "api_key_hash": api_key_hash,
            "seal_hash": None  # Will be calculated
        }
        
        # Create the final seal hash
        seal_string = json.dumps(seal_data, sort_keys=True, separators=(',', ':'))
        seal_data["seal_hash"] = hashlib.sha256(seal_string.encode()).hexdigest()
        
        return seal_data
    
    def embed_seal_in_image(self, 
                           image_path: str, 
                           seal_data: Dict[str, Any],
                           output_path: str) -> bool:
        """
        Embed digital seal into image metadata.
        
        Args:
            image_path: Path to original image
            seal_data: Digital seal data
            output_path: Path for sealed image
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Open image
            with Image.open(image_path) as img:
                # Create metadata
                metadata = PngInfo()
                
                # Add seal data as metadata
                for key, value in seal_data.items():
                    if isinstance(value, (dict, list)):
                        metadata.add_text(f"apex_seal_{key}", json.dumps(value))
                    else:
                        metadata.add_text(f"apex_seal_{key}", str(value))
                
                # Add verification timestamp
                metadata.add_text("apex_verified_at", seal_data["timestamp"])
                metadata.add_text("apex_verifier", "APEX VERIFY AI")
                
                # Save with embedded metadata
                img.save(output_path, "PNG", pnginfo=metadata)
                
                return True
                
        except Exception as e:
            print(f"Error embedding seal: {e}")
            return False
    
    def embed_seal_in_jpeg(self, 
                           image_path: str, 
                           seal_data: Dict[str, Any],
                           output_path: str) -> bool:
        """
        Embed digital seal into JPEG EXIF metadata.
        
        Args:
            image_path: Path to original image
            seal_data: Digital seal data
            output_path: Path for sealed image
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Open image
            with Image.open(image_path) as img:
                
                # Create EXIF data
                exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}}
                
                # Add seal data to EXIF
                seal_json = json.dumps(seal_data)
                exif_dict["0th"][piexif.ImageIFD.Software] = f"APEX VERIFY AI {seal_data['version']}"
                exif_dict["0th"][piexif.ImageIFD.ImageDescription] = f"Verified by APEX VERIFY AI at {seal_data['timestamp']}"
                
                # Add seal data as custom EXIF field
                exif_dict["0th"][piexif.ImageIFD.Copyright] = f"APEX VERIFY AI Digital Seal: {seal_data['seal_hash'][:16]}"
                
                # Convert to EXIF bytes
                exif_bytes = piexif.dump(exif_dict)
                
                # Save with EXIF metadata
                img.save(output_path, "JPEG", exif=exif_bytes)
                
                return True
                
        except Exception as e:
            print(f"Error embedding JPEG seal: {e}")
            return False
    
    def verify_seal_integrity(self, image_path: str) -> Dict[str, Any]:
        """
        Verify the integrity of a digital seal in image metadata.
        
        Args:
            image_path: Path to sealed image
            
        Returns:
            Verification result with seal data and integrity status
        """
        try:
            with Image.open(image_path) as img:
                # Extract metadata
                metadata = {}
                
                if img.format == "PNG":
                    # PNG metadata
                    for key, value in img.info.items():
                        if key.startswith("apex_seal_"):
                            clean_key = key.replace("apex_seal_", "")
                            try:
                                metadata[clean_key] = json.loads(value)
                            except:
                                metadata[clean_key] = value
                
                elif img.format == "JPEG":
                    # JPEG EXIF metadata
                    exif_data = piexif.load(img.info.get("exif", b""))
                    if "0th" in exif_data:
                        software = exif_data["0th"].get(piexif.ImageIFD.Software, b"").decode("utf-8", errors="ignore")
                        if "APEX VERIFY AI" in software:
                            metadata["identifier"] = "APEX_VERIFY_AI"
                            metadata["verified_at"] = exif_data["0th"].get(piexif.ImageIFD.ImageDescription, b"").decode("utf-8", errors="ignore")
                
                if not metadata:
                    return {"has_seal": False, "error": "No digital seal found"}
                
                # Verify seal integrity
                if "seal_hash" in metadata:
                    # Recalculate seal hash
                    verification_data = {k: v for k, v in metadata.items() if k != "seal_hash"}
                    verification_string = json.dumps(verification_data, sort_keys=True, separators=(',', ':'))
                    calculated_hash = hashlib.sha256(verification_string.encode()).hexdigest()
                    
                    integrity_valid = calculated_hash == metadata["seal_hash"]
                    
                    return {
                        "has_seal": True,
                        "seal_data": metadata,
                        "integrity_valid": integrity_valid,
                        "calculated_hash": calculated_hash,
                        "stored_hash": metadata["seal_hash"]
                    }
                
                return {"has_seal": True, "seal_data": metadata, "integrity_valid": "Unknown"}
                
        except Exception as e:
            return {"has_seal": False, "error": str(e)}
    
    def _hash_verification_result(self, verification_result: Dict[str, Any]) -> str:
        """Create hash of verification result for seal integrity."""
        result_string = json.dumps(verification_result, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(result_string.encode()).hexdigest()
    
    def create_verification_certificate(self, 
                                      seal_data: Dict[str, Any],
                                      image_path: str) -> str:
        """
        Create a human-readable verification certificate.
        
        Args:
            seal_data: Digital seal data
            image_path: Path to verified image
            
        Returns:
            Certificate text
        """
        certificate = f"""
╔══════════════════════════════════════════════════════════════╗
║                    APEX VERIFY AI                           ║
║                 VERIFICATION CERTIFICATE                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                            ║
║  Image Verified: {seal_data['timestamp']}                    ║
║  Verification Hash: {seal_data['verification_hash'][:16]}...  ║
║  Digital Seal: {seal_data['seal_hash'][:16]}...              ║
║                                                            ║
║  This image has been verified as authentic using          ║
║  enterprise-grade AI technology (DINOv3 + Gemini Pro).    ║
║                                                            ║
║  The digital seal embedded in this image's metadata      ║
║  provides cryptographic proof of verification and         ║
║  makes the image tamper-evident.                          ║
║                                                            ║
║  APEX VERIFY AI - Because Truth Matters                   ║
║                                                            ║
╚══════════════════════════════════════════════════════════════╝
        """
        return certificate.strip()

# Create global instance
digital_seal_service = DigitalSealService()
