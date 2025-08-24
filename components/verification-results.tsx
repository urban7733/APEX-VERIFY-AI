"use client"

import React from 'react'
import { CheckCircle, AlertTriangle, Clock, Shield, Zap, Target, Lock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface VerificationResult {
  authenticity_score: number
  verdict: string
  confidence: string
  analysis: {
    model_used: string
    processing_time_ms: number
    anomalies_detected: number
  }
  technical_details: {
    dinov3_features: string
    gemini_analysis: string
    final_score: number
  }
  recommendations: string[]
  metadata?: {
    filename: string
    file_size_bytes: number
    processing_pipeline: string
  }
  digital_seal?: {
    seal_id: string
    sealed_at: string
    sealed_image_path: string
    certificate: string
  }
  image_hash?: string
  seal_status?: string
}

interface VerificationResultsProps {
  result: VerificationResult
  previewUrl: string | null
  onReset: () => void
}

export function VerificationResults({ result, previewUrl, onReset }: VerificationResultsProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'REAL':
        return 'text-green-400'
      case 'LIKELY_REAL':
        return 'text-green-300'
      case 'UNCERTAIN':
        return 'text-yellow-400'
      case 'FAKE':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'REAL':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'LIKELY_REAL':
        return <CheckCircle className="w-6 h-6 text-green-300" />
      case 'UNCERTAIN':
        return <Clock className="w-6 h-6 text-yellow-400" />
      case 'FAKE':
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      default:
        return <Clock className="w-6 h-6 text-yellow-400" />
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'text-green-400'
      case 'MEDIUM':
        return 'text-yellow-400'
      case 'LOW':
        return 'text-red-400'
      default:
        return 'text-white/70'
    }
  }

  const handleDownloadSealed = async () => {
    if (result.digital_seal?.sealed_image_path) {
      try {
        const response = await fetch('/api/download-sealed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sealed_image_path: result.digital_seal.sealed_image_path,
            filename: result.metadata?.filename ? `${result.metadata.filename.replace(/\.[^/.]+$/, '')}_sealed.png` : 'sealed_image.png'
          }),
        })

        if (!response.ok) {
          throw new Error('Download failed')
        }

        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.metadata?.filename ? `${result.metadata.filename.replace(/\.[^/.]+$/, '')}_sealed.png` : 'sealed_image.png'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

      } catch (error) {
        console.error('Download failed:', error)
        alert('Failed to download sealed image. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Verification Results</h2>
        <Button
          variant="outline"
          onClick={onReset}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Verify Another Image
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Preview */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Analyzed Image</h3>
          <div className="relative">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Analyzed image"
                width={400}
                height={400}
                className="rounded-lg object-cover w-full border border-white/10"
              />
            )}
            {result.metadata && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/70 text-sm">
                  <strong>File:</strong> {result.metadata.filename}
                </p>
                <p className="text-white/70 text-sm">
                  <strong>Size:</strong> {(result.metadata.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                </p>
                {result.image_hash && (
                  <p className="text-white/70 text-sm">
                    <strong>Hash:</strong> {result.image_hash.substring(0, 16)}...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Verdict */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              {getVerdictIcon(result.verdict)}
              <h3 className="text-2xl font-bold">Verdict</h3>
            </div>
            <p className={`text-3xl font-bold ${getVerdictColor(result.verdict)}`}>
              {result.verdict}
            </p>
            <p className={`text-white/70 mt-2 ${getConfidenceColor(result.confidence)}`}>
              Confidence: {result.confidence}
            </p>
          </div>

          {/* Score */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Authenticity Score</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {result.authenticity_score}%
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${result.authenticity_score}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-white/60">
                {result.authenticity_score >= 95 ? 'Excellent' : 
                 result.authenticity_score >= 80 ? 'Good' : 
                 result.authenticity_score >= 60 ? 'Fair' : 'Poor'}
              </div>
            </div>
          </div>

          {/* Digital Seal Status */}
          {result.digital_seal && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-green-400">Digital Seal Applied</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Seal ID:</span>
                  <span className="text-white font-mono">{result.digital_seal.seal_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Sealed At:</span>
                  <span className="text-white">{new Date(result.digital_seal.sealed_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <span className="text-green-400 font-semibold">Immutable</span>
                </div>
              </div>
              <Button
                onClick={handleDownloadSealed}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sealed Image
              </Button>
            </div>
          )}

          {/* Technical Details */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Technical Analysis</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Processing Time:</span>
                <span className="text-white">{result.analysis.processing_time_ms}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Anomalies Detected:</span>
                <span className="text-white">{result.analysis.anomalies_detected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">DINOv3 Features:</span>
                <span className="text-white">{result.technical_details.dinov3_features}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Gemini Analysis:</span>
                <span className="text-white">{result.technical_details.gemini_analysis}</span>
              </div>
            </div>
          </div>

          {/* AI Models Used */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">AI Models Used</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-white/90">DINOv3 Feature Extraction</span>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-white/90">Gemini Pro Vision Analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white/90">Authenticity Scoring</span>
              </div>
              {result.digital_seal && (
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="text-white/90">Digital Seal Embedding</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/90 text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Analysis completed using enterprise-grade AI technology
        </p>
        {result.digital_seal && (
          <p className="text-green-400 text-sm mt-1">
            🔒 Image digitally sealed and tamper-evident
          </p>
        )}
        <p className="text-white/30 text-xs mt-1">
          APEX VERIFY AI • Trust in Digital Content
        </p>
      </div>
    </div>
  )
}
