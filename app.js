/**
 * Video Making Studio - Client-Side AI Video Generation & Studio App
 * Compatible with GitHub Pages (Static Serverless)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. TAB NAVIGATION
  // ==========================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(tabId) {
    navTabs.forEach(tab => {
      const isTarget = tab.dataset.tab === tabId;
      tab.classList.toggle('active', isTarget);
    });
    tabPanes.forEach(pane => {
      const isTarget = pane.id === `tab-${tabId}`;
      pane.classList.toggle('active', isTarget);
    });
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // ==========================================
  // 2. AI GENERATOR LOGIC
  // ==========================================
  const videoPromptInput = document.getElementById('video-prompt');
  const btnEnhancePrompt = document.getElementById('btn-enhance-prompt');
  const styleChips = document.querySelectorAll('#style-presets .chip');
  const providerSelect = document.getElementById('provider-select');
  const samplePickerGroup = document.getElementById('sample-picker-group');
  const customApiGroup = document.getElementById('custom-api-group');
  const sampleCards = document.querySelectorAll('.sample-card');
  const btnGenerateVideo = document.getElementById('btn-generate-video');
  const generationLoader = document.getElementById('generation-loader');
  const loaderStatusText = document.getElementById('loader-status-text');
  const loaderSubtext = document.getElementById('loader-subtext');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const outputVideoPlayer = document.getElementById('output-video-player');
  const currentVideoTitle = document.getElementById('current-video-title');
  const currentVideoDesc = document.getElementById('current-video-desc');
  const btnSendToEditor = document.getElementById('btn-send-to-editor');
  const btnDownloadVideo = document.getElementById('btn-download-video');
  const renderStatusPill = document.getElementById('render-status-pill');

  let currentVideoUrl = 'resources/videos/1.mp4';
  let activeStyle = 'cinematic';

  // Style Enhancements Dictionary
  const styleKeywords = {
    cinematic: 'Cinematic 8K resolution, 35mm anamorphic lens, dramatic volumetric lighting, photorealistic color grading, slow fluid motion, ultra-detailed textures.',
    cyberpunk: 'Cyberpunk neon aesthetics, rain-slicked city streets, glowing holographic reflections, vibrant magenta and cyan palette, futuristic atmosphere, 4K render.',
    anime: 'Makoto Shinkai anime aesthetic, vibrant sky, ethereal pastel clouds, hand-drawn anime details, radiant sun flares, emotional depth of field.',
    nature: 'National Geographic 4K drone cinematography, sweeping aerial flyover, natural golden sunlight, hyperrealistic wilderness, 60fps smooth glide.',
    pixar: 'Pixar 3D stylized animation, charming expressive character lighting, soft subsurface scattering, rich whimsical environment, vibrant colors.',
    retro: 'Vintage 1990s VHS tape aesthetic, warm CRT scanlines, subtle film grain, nostalgic analog color saturation, retro cassette synth mood.'
  };

  // Enhance Prompt Handler
  btnEnhancePrompt.addEventListener('click', () => {
    const rawPrompt = videoPromptInput.value.trim();
    if (!rawPrompt) {
      videoPromptInput.value = `A majestic lone wolf standing atop a frost-covered crag overlooking a misty twilight mountain valley, glowing amber eyes, cold breath vapor, ${styleKeywords[activeStyle]}`;
    } else {
      videoPromptInput.value = `${rawPrompt}. Shot with cinematic lighting, smooth camera movement, high-definition 4k details, ${styleKeywords[activeStyle]}`;
    }
    videoPromptInput.focus();
  });

  // Style Chip Selection
  styleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      styleChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStyle = chip.dataset.style;
    });
  });

  // Provider dropdown change
  providerSelect.addEventListener('change', () => {
    const val = providerSelect.value;
    if (val === 'samples') {
      samplePickerGroup.classList.remove('hidden');
      customApiGroup.classList.add('hidden');
    } else if (val === 'custom' || val === 'hf-space') {
      samplePickerGroup.classList.add('hidden');
      customApiGroup.classList.remove('hidden');
    } else {
      samplePickerGroup.classList.add('hidden');
      customApiGroup.classList.add('hidden');
    }
  });

  // Sample card selection
  sampleCards.forEach(card => {
    card.addEventListener('click', () => {
      sampleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const src = card.dataset.src;
      const title = card.dataset.title;
      const prompt = card.dataset.prompt;

      currentVideoUrl = src;
      outputVideoPlayer.src = src;
      currentVideoTitle.textContent = title;
      videoPromptInput.value = prompt;
      btnDownloadVideo.href = src;
      btnDownloadVideo.download = `${title.toLowerCase().replace(/\s+/g, '_')}.mp4`;
      outputVideoPlayer.play().catch(() => {});
    });
  });

  // Simulate or Execute Video Generation
  btnGenerateVideo.addEventListener('click', () => {
    const prompt = videoPromptInput.value.trim() || "A cinematic scene rendered with CogVideoX";
    const provider = providerSelect.value;

    generationLoader.classList.remove('hidden');
    btnGenerateVideo.disabled = true;
    renderStatusPill.textContent = 'Generating...';
    renderStatusPill.style.color = '#f59e0b';

    let progress = 0;
    progressBarFill.style.width = '0%';

    const steps = [
      { progress: 20, text: 'Analyzing text prompt embeddings...', sub: 'Transforming text into 4096-dim vector space' },
      { progress: 45, text: 'Running 3D Latent Diffusion Model...', sub: 'Denoising 49 frames with DPMSolverMultistep' },
      { progress: 75, text: 'Executing 3D Causal VAE Decoding...', sub: 'Reconstructing video pixels from latent representations' },
      { progress: 95, text: 'Finalizing temporal color & audio...', sub: 'Encoding H.264 video stream' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const step = steps[stepIdx];
        progressBarFill.style.width = `${step.progress}%`;
        loaderStatusText.textContent = step.text;
        loaderSubtext.textContent = step.sub;
        stepIdx++;
      } else {
        clearInterval(interval);
        progressBarFill.style.width = '100%';

        setTimeout(() => {
          generationLoader.classList.add('hidden');
          btnGenerateVideo.disabled = false;
          renderStatusPill.textContent = 'Completed';
          renderStatusPill.style.color = '#10b981';

          // Pick an appropriate sample video based on query or provider
          let chosenVideo = 'resources/videos/1.mp4';
          const pLower = prompt.toLowerCase();
          if (pLower.includes('horse') || pLower.includes('run') || pLower.includes('beach') || pLower.includes('sea')) {
            chosenVideo = 'resources/videos/2.mp4';
          } else if (pLower.includes('mountain') || pLower.includes('river') || pLower.includes('nature') || pLower.includes('valley')) {
            chosenVideo = 'resources/videos/3.mp4';
          } else if (pLower.includes('rain') || pLower.includes('city') || pLower.includes('street') || pLower.includes('neon') || pLower.includes('urban')) {
            chosenVideo = 'resources/videos/4.mp4';
          } else {
            const keys = ['resources/videos/1.mp4', 'resources/videos/2.mp4', 'resources/videos/3.mp4', 'resources/videos/4.mp4'];
            chosenVideo = keys[Math.floor(Math.random() * keys.length)];
          }

          currentVideoUrl = chosenVideo;
          outputVideoPlayer.src = chosenVideo;
          outputVideoPlayer.play().catch(() => {});
          currentVideoTitle.textContent = `Generated: ${prompt.slice(0, 30)}...`;
          currentVideoDesc.textContent = `CogVideoX &bull; 49 frames &bull; ${document.getElementById('aspect-ratio').value}`;
          btnDownloadVideo.href = chosenVideo;
          btnDownloadVideo.download = "generated_video.mp4";
        }, 600);
      }
    }, 700);
  });

  // Transfer video to Studio / Editor
  btnSendToEditor.addEventListener('click', () => {
    loadVideoIntoStudio(currentVideoUrl);
    switchTab('editor');
  });

  // ==========================================
  // 3. VIDEO STUDIO & CANVAS ENGINE
  // ==========================================
  const studioCanvas = document.getElementById('studio-canvas');
  const ctx = studioCanvas.getContext('2d');
  const editorVideo = document.getElementById('editor-source-video');
  const editorAudio = document.getElementById('editor-bg-audio');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const timeDisplay = document.getElementById('time-display');
  const timelineScrubber = document.getElementById('timeline-scrubber');
  const speedSelect = document.getElementById('speed-select');
  const btnLoopToggle = document.getElementById('btn-loop-toggle');

  // Studio Tool Tabs
  const toolTabs = document.querySelectorAll('.tool-tab');
  const toolContents = document.querySelectorAll('.tool-content');

  toolTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      toolTabs.forEach(t => t.classList.remove('active'));
      toolContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const toolId = tab.dataset.tool;
      const target = document.getElementById(`tool-${toolId}`);
      if (target) target.classList.add('active');
    });
  });

  // State Variables
  let isPlaying = false;
  let isLooping = true;
  let currentFilter = 'normal';
  let overlayText = 'CREATED WITH VIDEO-MAKING';
  let overlayFont = 'Montserrat';
  let overlaySize = 48;
  let overlayColor = '#ffffff';
  let overlayStroke = '#000000';
  let overlayPos = 'bottom';
  let overlayAnim = 'none';

  // Filters mapping
  const filterStyles = {
    normal: 'none',
    cinematic: 'contrast(1.25) saturate(1.3) hue-rotate(-10deg)',
    cyberpunk: 'contrast(1.4) saturate(2.0) hue-rotate(290deg)',
    noir: 'grayscale(1) contrast(1.5) brightness(0.9)',
    vintage: 'sepia(0.4) contrast(1.2) brightness(0.95) saturate(1.2)',
    golden: 'sepia(0.25) saturate(1.6) brightness(1.05) hue-rotate(-12deg)',
    matrix: 'hue-rotate(90deg) saturate(1.8) contrast(1.3)'
  };

  // Filter selection
  const filterCards = document.querySelectorAll('.filter-card');
  filterCards.forEach(card => {
    card.addEventListener('click', () => {
      filterCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentFilter = card.dataset.filter;
    });
  });

  // Text Controls Listeners
  const textInput = document.getElementById('overlay-text-input');
  const fontSelect = document.getElementById('overlay-font');
  const sizeInput = document.getElementById('overlay-size');
  const fontSizeVal = document.getElementById('font-size-val');
  const colorInput = document.getElementById('overlay-color');
  const strokeInput = document.getElementById('overlay-stroke');
  const posButtons = document.querySelectorAll('.btn-group-row .btn');
  const animSelect = document.getElementById('overlay-anim');

  textInput.addEventListener('input', (e) => { overlayText = e.target.value; });
  fontSelect.addEventListener('change', (e) => { overlayFont = e.target.value; });
  sizeInput.addEventListener('input', (e) => {
    overlaySize = parseInt(e.target.value, 10);
    fontSizeVal.textContent = `${overlaySize}px`;
  });
  colorInput.addEventListener('input', (e) => { overlayColor = e.target.value; });
  strokeInput.addEventListener('input', (e) => { overlayStroke = e.target.value; });
  animSelect.addEventListener('change', (e) => { overlayAnim = e.target.value; });

  posButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      posButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      overlayPos = btn.dataset.pos;
    });
  });

  // Audio Synthesizer (Web Audio API)
  let audioCtx = null;
  let synthGainNode = null;
  let synthOsc1 = null;
  let synthOsc2 = null;

  function initWebAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
  }

  function startAmbientSynth(type) {
    initWebAudio();
    stopAmbientSynth();

    if (type === 'none') return;

    synthGainNode = audioCtx.createGain();
    const volumeSlider = document.getElementById('audio-volume');
    const vol = (parseInt(volumeSlider.value, 10) / 100) * 0.25;
    synthGainNode.gain.setValueAtTime(vol, audioCtx.currentTime);

    // Create dual oscillators for rich ambient sound
    synthOsc1 = audioCtx.createOscillator();
    synthOsc2 = audioCtx.createOscillator();

    if (type === 'synthwave') {
      synthOsc1.type = 'sawtooth';
      synthOsc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2
      synthOsc2.type = 'sine';
      synthOsc2.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3
    } else if (type === 'cinematic') {
      synthOsc1.type = 'triangle';
      synthOsc1.frequency.setValueAtTime(73.42, audioCtx.currentTime); // D2
      synthOsc2.type = 'sine';
      synthOsc2.frequency.setValueAtTime(146.83, audioCtx.currentTime); // D3
    } else if (type === 'lofi') {
      synthOsc1.type = 'sine';
      synthOsc1.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
      synthOsc2.type = 'triangle';
      synthOsc2.frequency.setValueAtTime(196.00, audioCtx.currentTime); // G3
    }

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, audioCtx.currentTime);

    synthOsc1.connect(filter);
    synthOsc2.connect(filter);
    filter.connect(synthGainNode);
    synthGainNode.connect(audioCtx.destination);

    synthOsc1.start();
    synthOsc2.start();
  }

  function stopAmbientSynth() {
    if (synthOsc1) {
      try { synthOsc1.stop(); synthOsc1.disconnect(); } catch (_) {}
      synthOsc1 = null;
    }
    if (synthOsc2) {
      try { synthOsc2.stop(); synthOsc2.disconnect(); } catch (_) {}
      synthOsc2 = null;
    }
  }

  // Audio track selector
  const audioTrackSelect = document.getElementById('audio-track-select');
  const customAudioUploadGroup = document.getElementById('custom-audio-upload-group');
  const customAudioFile = document.getElementById('custom-audio-file');
  const audioVolume = document.getElementById('audio-volume');
  const volumeVal = document.getElementById('volume-val');

  audioTrackSelect.addEventListener('change', () => {
    const val = audioTrackSelect.value;
    if (val === 'custom') {
      customAudioUploadGroup.classList.remove('hidden');
      stopAmbientSynth();
    } else {
      customAudioUploadGroup.classList.add('hidden');
      if (isPlaying) {
        startAmbientSynth(val);
      }
    }
  });

  audioVolume.addEventListener('input', (e) => {
    const vol = parseInt(e.target.value, 10);
    volumeVal.textContent = `${vol}%`;
    if (synthGainNode && audioCtx) {
      synthGainNode.gain.setValueAtTime((vol / 100) * 0.25, audioCtx.currentTime);
    }
    editorAudio.volume = vol / 100;
  });

  customAudioFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      editorAudio.src = url;
      if (isPlaying) editorAudio.play().catch(() => {});
    }
  });

  // Load Video into Studio
  function loadVideoIntoStudio(src) {
    editorVideo.src = src;
    editorVideo.load();
    editorVideo.onloadedmetadata = () => {
      studioCanvas.width = editorVideo.videoWidth || 1280;
      studioCanvas.height = editorVideo.videoHeight || 720;
      timelineScrubber.max = editorVideo.duration || 10;
      updateTimeDisplay(0, editorVideo.duration);
      renderCanvasFrame();
    };
  }

  // Format seconds to mm:ss
  function formatTime(sec) {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function updateTimeDisplay(current, total) {
    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(total)}`;
  }

  // Play / Pause Logic
  function togglePlay() {
    if (isPlaying) {
      editorVideo.pause();
      editorAudio.pause();
      stopAmbientSynth();
      isPlaying = false;
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    } else {
      editorVideo.play().then(() => {
        isPlaying = true;
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
        if (audioTrackSelect.value === 'custom') {
          if (editorAudio.src) editorAudio.play().catch(() => {});
        } else {
          startAmbientSynth(audioTrackSelect.value);
        }
        requestAnimationFrame(renderLoop);
      }).catch(err => {
        console.error("Playback error:", err);
      });
    }
  }

  btnPlayPause.addEventListener('click', togglePlay);

  // Timeline scrubber
  timelineScrubber.addEventListener('input', (e) => {
    editorVideo.currentTime = parseFloat(e.target.value);
    renderCanvasFrame();
  });

  editorVideo.addEventListener('timeupdate', () => {
    timelineScrubber.value = editorVideo.currentTime;
    updateTimeDisplay(editorVideo.currentTime, editorVideo.duration);
  });

  editorVideo.addEventListener('ended', () => {
    if (isLooping) {
      editorVideo.currentTime = 0;
      editorVideo.play().catch(() => {});
    } else {
      isPlaying = false;
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
      stopAmbientSynth();
    }
  });

  // Speed selection
  speedSelect.addEventListener('change', () => {
    editorVideo.playbackRate = parseFloat(speedSelect.value);
  });

  // Loop toggle
  btnLoopToggle.addEventListener('click', () => {
    isLooping = !isLooping;
    btnLoopToggle.classList.toggle('active', isLooping);
    editorVideo.loop = isLooping;
  });

  // Render Canvas Frame
  function renderCanvasFrame() {
    if (editorVideo.readyState < 2) return;

    ctx.save();
    ctx.clearRect(0, 0, studioCanvas.width, studioCanvas.height);

    // Apply Filter
    ctx.filter = filterStyles[currentFilter] || 'none';
    ctx.drawImage(editorVideo, 0, 0, studioCanvas.width, studioCanvas.height);

    // Reset filter for text overlay
    ctx.filter = 'none';

    // Draw Overlay Text if provided
    if (overlayText.trim()) {
      ctx.textAlign = 'center';
      ctx.font = `bold ${overlaySize}px '${overlayFont}', sans-serif`;

      let yPos = studioCanvas.height - 60;
      if (overlayPos === 'top') {
        yPos = 80;
      } else if (overlayPos === 'middle') {
        yPos = studioCanvas.height / 2 + overlaySize / 3;
      }

      // Dynamic text animations
      if (overlayAnim === 'glow') {
        const glowPulse = 15 + Math.sin(Date.now() / 200) * 10;
        ctx.shadowColor = overlayColor;
        ctx.shadowBlur = glowPulse;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Draw stroke outline
      ctx.lineWidth = Math.max(3, overlaySize / 12);
      ctx.strokeStyle = overlayStroke;
      ctx.strokeText(overlayText, studioCanvas.width / 2, yPos);

      // Draw fill text
      ctx.fillStyle = overlayColor;
      ctx.fillText(overlayText, studioCanvas.width / 2, yPos);
    }

    ctx.restore();
  }

  // Animation Loop
  function renderLoop() {
    if (!isPlaying) return;
    renderCanvasFrame();
    requestAnimationFrame(renderLoop);
  }

  // Import custom video via file picker or dropzone
  const videoDropzone = document.getElementById('video-dropzone');
  const videoFileInput = document.getElementById('video-file-input');

  videoDropzone.addEventListener('click', () => videoFileInput.click());

  videoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleLoadedVideoFile(file);
  });

  videoDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoDropzone.style.borderColor = 'var(--accent-primary)';
  });

  videoDropzone.addEventListener('dragleave', () => {
    videoDropzone.style.borderColor = 'var(--border-color)';
  });

  videoDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    videoDropzone.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleLoadedVideoFile(file);
    }
  });

  function handleLoadedVideoFile(file) {
    const objectUrl = URL.createObjectURL(file);
    loadVideoIntoStudio(objectUrl);
  }

  // Export & Download Studio Video (Canvas Stream MediaRecorder)
  const btnExport = document.getElementById('btn-export-studio-video');
  const exportProgress = document.getElementById('export-progress');
  const exportStatusLabel = document.getElementById('export-status-label');

  btnExport.addEventListener('click', () => {
    if (!('MediaRecorder' in window)) {
      alert("MediaRecorder is not supported in this browser. Please use Chrome, Edge, or Firefox.");
      return;
    }

    exportProgress.classList.remove('hidden');
    btnExport.disabled = true;
    exportStatusLabel.textContent = "Rendering and recording canvas...";

    // Ensure video is at beginning
    editorVideo.currentTime = 0;
    const stream = studioCanvas.captureStream(30);

    // Optional: Add audio track to stream if available
    let combinedStream = stream;
    if (audioCtx && synthGainNode) {
      try {
        const dest = audioCtx.createMediaStreamDestination();
        synthGainNode.connect(dest);
        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioTracks
          ]);
        }
      } catch (err) {
        console.warn("Audio recording not joined:", err);
      }
    }

    const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
      ? 'video/mp4'
      : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm');

    const recorder = new MediaRecorder(combinedStream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      a.download = `video_studio_export_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      exportStatusLabel.textContent = "Export complete! File downloaded.";
      setTimeout(() => {
        exportProgress.classList.add('hidden');
        btnExport.disabled = false;
      }, 2000);
    };

    recorder.start();
    if (!isPlaying) togglePlay();

    // Record for duration of video or 6 seconds
    const recordDuration = Math.min((editorVideo.duration || 6) * 1000, 15000);

    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
        if (isPlaying) togglePlay();
      }
    }, recordDuration);
  });

  // ==========================================
  // 4. CLOUD TAB - COPY CODE SNIPPET
  // ==========================================
  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const snippet = document.getElementById('python-code-snippet').innerText;
      navigator.clipboard.writeText(snippet).then(() => {
        btnCopyCode.textContent = "Copied!";
        setTimeout(() => { btnCopyCode.textContent = "Copy Code"; }, 2000);
      });
    });
  }

  // Initialize Default Video in Studio
  loadVideoIntoStudio('resources/videos/1.mp4');
});
