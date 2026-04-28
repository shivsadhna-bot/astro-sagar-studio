import { useState, useEffect } from 'react'

const VoiceStudio = () => {
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

  // Filter voices based on search
  const filteredVoices = voices.filter(voice =>
    voice.friendly_name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    voice.short_name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    voice.locale.toLowerCase().includes(voiceSearch.toLowerCase())
  )

  // Get selected voice friendly name
  const selectedVoiceName = voices.find(v => v.short_name === selectedVoice)?.friendly_name || selectedVoice

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-slate-900 font-sans">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-[96px_1fr] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="flex flex-col items-center rounded-[32px] border border-[#E6E6E6] bg-white p-4 shadow-sm">
          <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-[0.36em] text-white">
            JT
          </div>
          <nav className="flex flex-1 flex-col items-center gap-4 text-slate-500">
            <button className="flex h-14 w-14 items-center justify-center rounded-3xl border border-transparent bg-slate-900 text-white shadow-sm transition-all hover:border-slate-200 hover:bg-slate-800">
              H
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-3xl border border-[#E6E6E6] bg-white text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900">
              V
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-3xl border border-[#E6E6E6] bg-white text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900">
              S
            </button>
          </nav>
          <div className="mt-10 space-y-1 text-center text-[11px] uppercase tracking-[0.32em] text-slate-400">
            <div>Home</div>
            <div>Voices</div>
            <div>Studio</div>
          </div>
        </aside>

        <main className="relative overflow-hidden rounded-[32px] border border-[#E6E6E6] bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-white/90 via-white/80 to-transparent" />
          <div className="relative flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-[#E6E6E6] px-10 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Voice Studio</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Professional voice creation</h1>
              </div>
              <button className="rounded-2xl border border-[#E6E6E6] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                New Recording
              </button>
            </header>

            <div className="flex flex-1 overflow-hidden px-10 py-8">
              <section className="flex-1 pr-8">
                <div className="h-full rounded-[32px] border border-[#E6E6E6] bg-[#FCFCFC] p-8 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Script</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">Text input</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Paper mode
                    </span>
                  </div>

                  <textarea
                    rows={18}
                    className="min-h-[520px] w-full resize-none bg-transparent text-lg leading-8 text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Write your script here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </section>

              <aside className="w-[380px] shrink-0">
                <div className="sticky top-8 rounded-[32px] border border-[#E6E6E6] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-6 flex items-center justify-between gap-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm uppercase tracking-[0.24em] text-slate-500">
                    <span>Agent settings</span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Beta</span>
                  </div>

                  <div className="mb-8 rounded-[26px] border border-[#E6E6E6] bg-slate-50 p-4">
                    <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.30em] text-slate-500">
                      Use my cloned agent
                    </label>
                    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
                      <span className="text-sm font-semibold text-slate-900">USE MY CLONED AGENT</span>
                      <button
                        type="button"
                        onClick={() => setUseCloned(!useCloned)}
                        aria-pressed={useCloned}
                        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer items-center rounded-full transition ${
                          useCloned ? 'bg-amber-500' : 'bg-slate-300'
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

                  <div className="mb-8 rounded-[26px] border border-[#E6E6E6] bg-slate-50 p-4">
                    <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.30em] text-slate-500">
                      Select Voice Agent
                    </label>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                        className="w-full flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <span className="text-lg font-bold">J</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Agent</p>
                            <p className={`text-sm font-semibold text-slate-900 truncate ${loading ? 'text-amber-600' : ''}`}>
                              {loading ? 'Generating...' : selectedVoiceName}
                            </p>
                          </div>
                        </div>
                        <svg className={`h-5 w-5 text-slate-400 transition ${showVoiceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>

                      {showVoiceDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6E6E6] rounded-2xl shadow-lg z-50 overflow-hidden">
                          {/* Search Input */}
                          <div className="p-3 border-b border-[#E6E6E6]">
                            <input
                              type="text"
                              placeholder="Search voices (e.g., Hindi, English)..."
                              value={voiceSearch}
                              onChange={(e) => setVoiceSearch(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E6E6E6] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                            />
                          </div>

                          {/* Voice List */}
                          <div className="max-h-64 overflow-y-auto">
                            {voicesLoading ? (
                              <div className="p-4 text-center text-slate-500">Loading voices...</div>
                            ) : filteredVoices.length === 0 ? (
                              <div className="p-4 text-center text-slate-500">No voices found</div>
                            ) : (
                              filteredVoices.map((voice) => (
                                <button
                                  key={voice.short_name}
                                  onClick={() => {
                                    setSelectedVoice(voice.short_name)
                                    setShowVoiceDropdown(false)
                                    setVoiceSearch('')
                                  }}
                                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition border-b border-[#E6E6E6] last:border-b-0 ${
                                    selectedVoice === voice.short_name ? 'bg-amber-50' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">{voice.friendly_name}</p>
                                      <p className="text-xs text-slate-500">{voice.locale}</p>
                                    </div>
                                    {selectedVoice === voice.short_name && (
                                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        <span>Stability</span>
                        <span>{stability}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stability}
                        onChange={(event) => setStability(Number(event.target.value))}
                        className="w-full cursor-pointer accent-slate-900"
                      />
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        <span>Similarity</span>
                        <span>{similarity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={similarity}
                        onChange={(event) => setSimilarity(Number(event.target.value))}
                        className="w-full cursor-pointer accent-slate-900"
                      />
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        <span>Style Exaggeration</span>
                        <span>{styleExaggeration}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={styleExaggeration}
                        onChange={(event) => setStyleExaggeration(Number(event.target.value))}
                        className="w-full cursor-pointer accent-slate-900"
                      />
                    </div>
                  </div>

                  <div className="mt-8 rounded-3xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white">
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default VoiceStudio
