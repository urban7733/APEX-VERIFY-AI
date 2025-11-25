/**
 * Perceptual Hash (pHash) Implementation
 * 
 * Uses difference hash (dHash) algorithm:
 * 1. Resize image to 9x8 grayscale
 * 2. Compare adjacent horizontal pixels
 * 3. Generate 64-bit hash (16 hex characters)
 * 
 * This hash survives compression, resizing, and minor edits.
 */

import sharp from "sharp"

const HASH_SIZE = 8 // 8x8 = 64 bits

/**
 * Calculate perceptual hash (dHash) from image buffer
 * Returns 16-character hex string
 */
export async function calculatePhash(imageBuffer: Buffer): Promise<string> {
  try {
    // Resize to 9x8 grayscale (9 width to get 8 horizontal differences)
    const { data } = await sharp(imageBuffer)
      .grayscale()
      .resize(HASH_SIZE + 1, HASH_SIZE, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Calculate difference hash
    let hash = BigInt(0)
    let bitPosition = 0

    for (let y = 0; y < HASH_SIZE; y++) {
      for (let x = 0; x < HASH_SIZE; x++) {
        const leftPixel = data[y * (HASH_SIZE + 1) + x]
        const rightPixel = data[y * (HASH_SIZE + 1) + x + 1]

        // If left pixel is brighter than right, set bit to 1
        if (leftPixel > rightPixel) {
          hash |= BigInt(1) << BigInt(bitPosition)
        }
        bitPosition++
      }
    }

    // Convert to 16-character hex string (64 bits = 16 hex chars)
    return hash.toString(16).padStart(16, "0")
  } catch (error) {
    console.error("[pHash] Failed to calculate hash:", error)
    throw new Error("Failed to calculate perceptual hash")
  }
}

/**
 * Calculate Hamming distance between two hashes
 * Returns number of differing bits (0 = identical, 64 = completely different)
 */
export function hammingDistance(hash1: string, hash2: string): number {
  const h1 = BigInt("0x" + hash1)
  const h2 = BigInt("0x" + hash2)
  
  // XOR to find differing bits
  let xor = h1 ^ h2
  let distance = 0
  
  // Count set bits (Brian Kernighan's algorithm)
  while (xor > 0) {
    xor &= xor - BigInt(1)
    distance++
  }
  
  return distance
}

/**
 * Check if two hashes are visually similar
 * Threshold: ≤10 bits different out of 64 (≈85% similar)
 */
export function areHashesSimilar(hash1: string, hash2: string, threshold = 10): boolean {
  return hammingDistance(hash1, hash2) <= threshold
}

