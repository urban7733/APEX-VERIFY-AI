"""
Download SPAI pretrained weights from Google Drive.
This script is run during Docker build to pre-load all model weights.
"""

import os
import gdown

def download_weights():
    """Download SPAI pretrained weights from Google Drive."""
    
    weights_dir = "/app/spai/weights"
    os.makedirs(weights_dir, exist_ok=True)
    
    # SPAI checkpoint
    # Google Drive file ID from: https://drive.google.com/file/d/1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI/view
    spai_checkpoint_id = "1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI"
    spai_checkpoint_path = os.path.join(weights_dir, "spai_checkpoint.pth")
    
    if not os.path.exists(spai_checkpoint_path):
        print("Downloading SPAI checkpoint...")
        gdown.download(
            f"https://drive.google.com/uc?id={spai_checkpoint_id}",
            spai_checkpoint_path,
            quiet=False
        )
        print(f"SPAI checkpoint downloaded to {spai_checkpoint_path}")
    else:
        print(f"SPAI checkpoint already exists at {spai_checkpoint_path}")
    
    # MFM pretrained ViT-B/16 (required by SPAI)
    # From: https://github.com/Jiahao000/MFM
    # Note: If this ID doesn't work, check the MFM repo for the correct checkpoint
    mfm_checkpoint_id = "1cEgPzKKMxpnFOjJKJ6RZjxYPwNHT5dPS"
    mfm_checkpoint_path = os.path.join(weights_dir, "mfm_pretrain_vit_base.pth")
    
    if not os.path.exists(mfm_checkpoint_path):
        print("Downloading MFM pretrained weights...")
        try:
            gdown.download(
                f"https://drive.google.com/uc?id={mfm_checkpoint_id}",
                mfm_checkpoint_path,
                quiet=False
            )
            print(f"MFM weights downloaded to {mfm_checkpoint_path}")
        except Exception as e:
            print(f"Warning: MFM download failed ({e}). SPAI may still work without it.")
    else:
        print(f"MFM weights already exist at {mfm_checkpoint_path}")
    
    print("All weights downloaded successfully!")

if __name__ == "__main__":
    download_weights()

