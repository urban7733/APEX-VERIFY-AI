"use client"

import React from 'react'
import { CheckCircle, AlertTriangle, Clock, Shield, Zap, Target, Lock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface VerificationResult {
  success: boolean
  authenticity_score: number
  classification: string
  report: string  // The structured report in the exact format requested
  processing_time: number
  confidence: number
  feature_anomalies: string[]
  model_info: {
    simple_analyzer: any
    gemini: string
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
  const getVerdictColor = (classification: string) => {
    switch (classification) {
      case 'GENUINE MEDIA':
        return 'text-green-400'
      case 'LIKELY AUTHENTIC':
        return 'text-green-300'
      case 'SUSPICIOUS':
        return 'text-yellow-400'
      case 'FAKE':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const getVerdictIcon = (classification: string) => {
    switch (classification) {
      case 'GENUINE MEDIA':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'LIKELY AUTHENTIC':
        return <CheckCircle className="w-6 h-6 text-green-300" />
      case 'SUSPICIOUS':
        return <Clock className="w-6 h-6 text-yellow-400" />
      case 'FAKE':
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      default:
        return <Clock className="w-6 h-6 text-yellow-400" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
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
            filename: 'verified_image_sealed.png'
          }),
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'verified_image_sealed.png'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          throw new Error('Download failed')
        }
      } catch (error) {
        console.error('Download failed:', error)
        alert('Failed to download sealed image. Please try again.')
      }
    }
  }

  // Parse the structured report
  const parseReport = (report: string) => {
    const lines = report.split('\n').filter(line => line.trim())
    const sections: { [key: string]: string } = {}
    let currentSection = ''
    let currentContent: string[] = []

    for (const line of lines) {
      if (line.startsWith('Apex Verify AI Analysis:')) {
        sections['header'] = line
      } else if (line.startsWith('* Authenticity Score:')) {
        sections['score'] = line
      } else if (line.startsWith('* Assessment:')) {
        sections['assessment'] = line
      } else if (line === 'The Scene in Focus') {
        currentSection = 'scene'
        currentContent = []
      } else if (line === 'The Story Behind the Picture') {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n')
        }
        currentSection = 'story'
        currentContent = []
      } else if (line === 'Digital Footprint & Source Links') {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n')
        }
        currentSection = 'footprint'
        currentContent = []
      } else if (line === 'AI Summary') {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n')
        }
        currentSection = 'summary'
        currentContent = []
      } else if (line.startsWith('Your media is verified')) {
        sections['footer'] = line
      } else if (currentSection && line.trim()) {
        currentContent.push(line)
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join('\n')
    }

    return sections
  }

  const reportSections = parseReport(result.report)

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
            <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-white/70 text-sm">
                <strong>Processing Time:</strong> {result.processing_time}s
              </p>
              <p className="text-white/70 text-sm">
                <strong>Confidence:</strong> <span className={getConfidenceColor(result.confidence)}>{(result.confidence * 100).toFixed(1)}%</span>
              </p>
              {result.image_hash && (
                <p className="text-white/70 text-sm">
                  <strong>Hash:</strong> {result.image_hash.substring(0, 16)}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Structured Report */}
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              {getVerdictIcon(result.classification)}
              <h3 className="text-2xl font-bold">Analysis Complete</h3>
            </div>
            <p className={`text-3xl font-bold ${getVerdictColor(result.classification)}`}>
              {result.classification}
            </p>
            <p className="text-4xl font-bold text-blue-400 mt-2">
              {result.authenticity_score}%
            </p>
          </div>

          {/* Assessment */}
          {reportSections.assessment && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Assessment</h3>
              <p className="text-white/90 leading-relaxed">
                {reportSections.assessment.replace('* Assessment: ', '')}
              </p>
            </div>
          )}

          {/* Scene in Focus */}
          {reportSections.scene && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">The Scene in Focus</h3>
              <p className="text-white/90 leading-relaxed">
                {reportSections.scene}
              </p>
            </div>
          )}

          {/* Story Behind the Picture */}
          {reportSections.story && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">The Story Behind the Picture</h3>
              <p className="text-white/90 leading-relaxed">
                {reportSections.story}
              </p>
            </div>
          )}

          {/* Digital Footprint */}
          {reportSections.footprint && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Digital Footprint & Source Links</h3>
              <p className="text-white/90 leading-relaxed">
                {reportSections.footprint}
              </p>
            </div>
          )}

          {/* AI Summary */}
          {reportSections.summary && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">AI Summary</h3>
              <p className="text-white/90 leading-relaxed">
                {reportSections.summary}
              </p>
            </div>
          )}

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
                Download with Apex Verify™ Seal
              </Button>
            </div>
          )}

          {/* Footer */}
          {reportSections.footer && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6 text-center">
              <p className="text-green-400 font-semibold text-lg">
                {reportSections.footer}
              </p>
            </div>
          )}
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
