import { useState, useEffect } from 'react'

const VoiceStudio = () => {
  const [currentPage, setCurrentPage] = useState('voice-studio')
  const [useCloned, setUseCloned] = useState(true)
  const [stability, setStability] = useState(82)
  const [similarity, setSimilarity] = useState(67)
  const [styleExaggeration, setStyleExaggeration] = useState(45)
  const [text, setText] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('hi-IN-MadhurNeural')
  const [voiceSearch, setVoiceSearch] = useState('')
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false)
  const [voicesLoading, setVoicesLoading] = useState(true)
  const [contentTopic, setContentTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('http://localhost:8001/voices')
        if (!response.ok) {
          throw new Error('Failed to fetch voices')
        }
        const data = await response.json()
        setVoices(data.voices)
        console.log(`Loaded ${data.count} voices`)
      } catch (error) {
        console.error('Error fetching voices:', error)
      } finally {
        setVoicesLoading(false)
      }
    }
    
    fetchVoices()
  }, [])

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert('Please enter some text')
      return
    }

    setLoading(true)
    try {
      // Map sliders to TTS parameters (0-100 range to -50 to +50 range)
      const rateValue = Math.round((stability - 50) / 2) // -25 to +25
      const pitchValue = Math.round((similarity - 50) / 2) // -25 to +25
      
      const rate = `${rateValue >= 0 ? '+' : ''}${rateValue}%`
      const pitch = `${pitchValue >= 0 ? '+' : ''}${pitchValue}Hz`

      const formData = new FormData()
      formData.append('text', text)
      formData.append('voice', selectedVoice)
      formData.append('rate', rate)
      formData.append('pitch', pitch)

      const response = await fetch('http://localhost:8001/speak', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate audio')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      
      // Auto-play the audio
      const audio = new Audio(url)
      audio.play().catch(err => console.error('Autoplay failed:', err))
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating audio: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!contentTopic.trim()) {
      alert('Please enter a topic')
      return
    }

    setContentLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: contentTopic }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data.content)
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating content: ' + error.message)
    } finally {
      setContentLoading(false)
    }
  }

  // Voice name mapping function
  const getProfessionalVoiceName = (voiceId) => {
    const voiceMappings = {
      'hi-IN-MadhurNeural': 'Male Hindi',
      'hi-IN-SwaraNeural': 'Female Hindi',
      'en-US-AriaNeural': 'Female English (US)',
      'en-US-ZiraNeural': 'Female English (US)',
      'en-GB-SoniaNeural': 'Female English (UK)',
      'en-GB-RyanNeural': 'Male English (UK)',
      // Add more mappings as needed
    }
    return voiceMappings[voiceId] || voiceId
  }

  // Filter voices based on search
  const filteredVoices = voices.filter((v) => {
    const voiceName = (v && v.name) ? v.name.toLowerCase() : ''
    const searchTerm = (voiceSearch || '').toLowerCase()
    return voiceName.includes(searchTerm)
  })

  // Get selected voice friendly name
  const selectedVoiceName = (() => {
    const activeVoice = voices.find((voice) => {
      const shortName = String(voice?.short_name ?? voice?.name ?? voice?.Name ?? voice?.id ?? '')
      return shortName === selectedVoice
    })

    return (
      getProfessionalVoiceName(selectedVoice) ||
      String(activeVoice?.friendly_name ?? activeVoice?.display_name ?? activeVoice?.Name ?? '') ||
      selectedVoice
    )
  })()

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="flex flex-col rounded-[32px] bg-[#1A1A1A] border border-slate-900/20 p-6 shadow-2xl text-white">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white">Astro Sagar</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Studio</h2>
          </div>
          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'dashboard' ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">🏠</span>
              <div>
                <div className="font-semibold">Dashboard</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('content')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'content' ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-semibold">Content</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('voice-studio')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'voice-studio' ? 'bg-gradient-to-r from-indigo-600/20 to-violet-500/20 ring-1 ring-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">🎙️</span>
              <div>
                <div className="font-semibold">Voice Studio</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('ai-voice-enhance')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'ai-voice-enhance' ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-semibold">AI Voice Enhance</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('face-sync')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'face-sync' ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">👄</span>
              <div>
                <div className="font-semibold">Face Sync tool</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('video-editor')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'video-editor' ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">💬</span>
              <div>
                <div className="font-semibold">Video Editor</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('history')}
              className={`flex items-start gap-4 rounded-3xl p-4 text-left transition hover:bg-white/10 ${currentPage === 'history' ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-semibold">History</div>
              </div>
            </button>
          </nav>
        </aside>

        <main className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 shadow-2xl">
          <div className="relative flex h-full flex-col">
            {currentPage === 'dashboard' && (
              <>
                <header className="flex items-center justify-between border-b border-white/10 px-10 py-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white">Dashboard</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Welcome to Astro Sagar Studio</h1>
                  </div>
                </header>
                <div className="flex-1 p-10">
                  <div className="text-center text-white">
                    <h2 className="text-2xl mb-4">Dashboard Coming Soon</h2>
                    <p>Overview of your projects and recent activity</p>
                  </div>
                </div>
              </>
            )}

            {currentPage === 'content' && (
              <>
                <div className="px-10 py-8">
                  <div className="max-w-4xl">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Astro Sagar Studio | History</p>
                    <h1 className="mt-3 text-[28px] font-bold text-black">Content Writer</h1>
                  </div>
                </div>
                <div className="flex flex-1 flex-col overflow-hidden px-10 pb-10">
                  <section className="flex-1 rounded-[32px] border border-slate-200/70 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)] p-8">
                    <div className="mb-8">
                      <p className="text-[14px] uppercase tracking-[0.24em] text-slate-500">Topic</p>
                      <h2 className="mt-2 text-[20px] font-bold text-black">Enter your astrology topic</h2>
                    </div>

                    <div className="mb-8 rounded-[32px] border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-[20px] font-bold text-black">Generated Content</h3>
                          <p className="mt-2 text-[16px] leading-[1.6] text-slate-600">Your output will appear here after generation.</p>
                        </div>
                        <div className="flex gap-3 self-end">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-900"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-900"
                          >
                            Download
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 max-h-[420px] overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 text-[16px] leading-[1.6] text-black">
                        {generatedContent ? (
                          <pre className="whitespace-pre-wrap">{generatedContent}</pre>
                        ) : (
                          <p className="text-[16px] leading-[1.6] text-slate-600">Generated content will show here once the topic is submitted.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <input
                        type="text"
                        className="flex-1 min-w-0 rounded-full border border-black px-5 py-4 text-[16px] text-black outline-none placeholder:text-slate-400"
                        placeholder="e.g., Mars in Aries transit effects"
                        value={contentTopic}
                        onChange={(e) => setContentTopic(e.target.value)}
                      />
                      <button
                        onClick={handleGenerateContent}
                        disabled={contentLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-[14px] font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span>✨</span>
                        {contentLoading ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  </section>
                </div>
              </>
            )}

            {currentPage === 'voice-studio' && (
              <>
                <header className="flex items-center justify-between border-b border-white/10 px-10 py-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white">Voice Studio</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Professional voice creation</h1>
                  </div>
                  <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                    New Recording
                  </button>
                </header>

                <div className="flex flex-1 overflow-hidden px-10 py-8">
                  <section className="flex-1 pr-8">
                    <div className="h-full rounded-[32px] border border-white/10 bg-black/20 backdrop-blur-sm p-8 shadow-2xl">
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white">Script</p>
                          <h2 className="mt-2 text-2xl font-semibold text-white">Text input</h2>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                          Paper mode
                        </span>
                      </div>

                      <textarea
                        rows={18}
                        className="min-h-[520px] w-full resize-none bg-transparent text-lg leading-8 text-white outline-none placeholder:text-gray-500"
                        placeholder="Write your script here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                    </div>
                  </section>

                  <aside className="w-[380px] shrink-0">
                    <div className="sticky top-8 rounded-[32px] border border-white/10 bg-black/20 backdrop-blur-sm p-6 shadow-2xl">
                      <div className="mb-6 flex items-center justify-between gap-3 rounded-3xl bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.24em] text-white">
                        <span>Agent settings</span>
                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-amber-400">Beta</span>
                      </div>

                      <div className="mb-8 rounded-[26px] border border-white/10 bg-black/20 p-4">
                        <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.30em] text-white">
                          Use my cloned agent
                        </label>
                        <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/10 p-4 shadow-sm">
                          <span className="text-sm font-semibold text-white">USE MY CLONED AGENT</span>
                          <button
                            type="button"
                            onClick={() => setUseCloned(!useCloned)}
                            aria-pressed={useCloned}
                            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer items-center rounded-full transition ${
                              useCloned ? 'bg-amber-500' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                useCloned ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="mb-8 rounded-[26px] border border-white/10 bg-black/20 p-4">
                        <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.30em] text-white">
                          Select Voice Agent
                        </label>
                        
                        <div className="relative">
                          <button
                            onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                            className="w-full flex items-center justify-between gap-3 rounded-3xl bg-white/10 p-4 shadow-sm hover:bg-white/20 transition"
                          >
                            <div className="flex items-center gap-3 flex-1 text-left">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                <span className="text-lg font-bold">🎙️</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-[0.2em] text-white">Agent</p>
                                <p className={`text-sm font-semibold text-white truncate ${loading ? 'text-amber-400' : ''}`}>
                                  {loading ? 'Generating...' : selectedVoiceName}
                                </p>
                              </div>
                            </div>
                            <svg className={`h-5 w-5 text-white transition ${showVoiceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </button>

                          {showVoiceDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                              {/* Search Input */}
                              <div className="p-3 border-b border-white/10">
                                <input
                                  type="text"
                                  placeholder="Search voices (e.g., Hindi, English)..."
                                  value={voiceSearch}
                                  onChange={(e) => setVoiceSearch(e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/10 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 text-white placeholder-[#9CA3AF]"
                                />
                              </div>

                              {/* Voice List */}
                              <div className="max-h-64 overflow-y-auto">
                                {voicesLoading ? (
                                  <div className="p-4 text-center text-white">Loading voices...</div>
                                ) : filteredVoices.length === 0 ? (
                                  <div className="p-4 text-center text-white">No voices found</div>
                                ) : (
                                  filteredVoices.map((voice) => {
                                    const voiceId = voice.short_name || voice.name || voice.id
                                    const displayName = getProfessionalVoiceName(voiceId)
                                    return (
                                      <button
                                        key={voiceId}
                                        onClick={() => {
                                          setSelectedVoice(voiceId)
                                          setShowVoiceDropdown(false)
                                          setVoiceSearch('')
                                        }}
                                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition border-b border-white/10 last:border-b-0 ${
                                          selectedVoice === voiceId ? 'bg-amber-500/20' : ''
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-semibold text-white">{displayName}</p>
                                            <p className="text-xs text-white">{voice.locale || voice.Locale}</p>
                                          </div>
                                          {selectedVoice === voiceId && (
                                            <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </div>
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-white">
                            <span>Stability</span>
                            <span>{stability}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={stability}
                            onChange={(event) => setStability(Number(event.target.value))}
                            className="w-full cursor-pointer accent-white"
                          />
                        </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-white">
                            <span>Similarity</span>
                            <span>{similarity}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={similarity}
                            onChange={(event) => setSimilarity(Number(event.target.value))}
                            className="w-full cursor-pointer accent-white"
                          />
                        </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-white">
                            <span>Style Exaggeration</span>
                            <span>{styleExaggeration}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={styleExaggeration}
                            onChange={(event) => setStyleExaggeration(Number(event.target.value))}
                            className="w-full cursor-pointer accent-white"
                          />
                        </div>
                      </div>

                      <div className="mt-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white">
                        <button
                          onClick={handleGenerate}
                          disabled={loading}
                          className="w-full disabled:opacity-50"
                        >
                          {loading ? 'Generating...' : 'Ready to generate'}
                        </button>
                      </div>

                      {audioUrl && (
                        <div className="mt-6">
                          <audio controls className="w-full">
                            <source src={audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </>
            )}

            {(currentPage === 'ai-voice-enhance' || currentPage === 'face-sync' || currentPage === 'video-editor' || currentPage === 'history') && (
              <>
                <header className="flex items-center justify-between border-b border-white/10 px-10 py-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white">{currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Coming Soon</h1>
                  </div>
                </header>
                <div className="flex-1 p-10">
                  <div className="text-center text-white">
                    <h2 className="text-2xl mb-4">{currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Feature</h2>
                    <p>This feature is under development</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default VoiceStudio
