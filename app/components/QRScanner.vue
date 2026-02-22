<template>
  <div class="qr-scanner">
    <div v-if="!isScanning" class="text-center space-y-4">
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button type="button" @click="startScanning" class="btn btn-primary btn-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Escanear QR Code
        </button>
        <button type="button" @click="scanManually" class="btn btn-secondary btn-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Digitar Código
        </button>
      </div>
      <p class="text-sm text-base-content/60">
        Escaneie um QR Code ou digite o código manualmente
      </p>
    </div>

    <div v-else class="space-y-4">
      <div class="relative">
        <video
          ref="videoElement"
          class="w-full rounded-lg"
          autoplay
          muted
          playsinline
        ></video>
        <canvas ref="canvasElement" class="hidden"></canvas>
        
        <!-- Scanner Overlay -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="h-full w-full flex items-center justify-center">
            <div class="w-64 h-64 border-4 border-primary rounded-lg relative">
              <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
              <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
              <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 justify-center">
        <button type="button" @click="stopScanning" class="btn btn-error">
          Parar Scanner
        </button>
        <button type="button" @click="scanManually" class="btn btn-ghost">
          Digitar Código
        </button>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Manual Input Modal -->
    <Modal
      id="manual-input-modal"
      title="Digitar Código Manualmente"
      v-model="showManualInput"
    >
      <div class="space-y-4">
        <FormInput
          v-model="manualCode"
          label="Código do Equipamento ou Bag"
          placeholder="Digite o código (ex: MIX-001 ou BAG-MIC-01)"
        />
        <div class="flex justify-end gap-2">
          <button @click="showManualInput = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button @click="submitManualCode" class="btn btn-primary">
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'

const emit = defineEmits<{
  scan: [code: string]
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const isScanning = ref(false)
const error = ref('')
const showManualInput = ref(false)
const manualCode = ref('')
let stream: MediaStream | null = null
let animationFrame: number | null = null

const isStarting = ref(false)

const startScanning = async () => {
  try {
    error.value = ''

    if (!process.client) {
      error.value = 'Scanner disponível apenas no navegador.'
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'Seu navegador não suporta acesso à câmera (getUserMedia).'
      return
    }

    // Important: <video> and <canvas> only exist when isScanning=true.
    // So we must flip the state first, wait for DOM mount, then attach the stream.
    stopScanning()
    isStarting.value = true
    isScanning.value = true
    await nextTick()
    
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })

    if (!videoElement.value || !canvasElement.value) {
      throw new Error('Elemento de vídeo não encontrado.')
    }

    videoElement.value.srcObject = stream
    // Some browsers require an explicit play() call even with autoplay.
    await videoElement.value.play().catch(() => {})

    tick()
  } catch (err: any) {
    const message = err?.message || String(err)
    // Common cases: insecure origin, blocked permissions, no camera.
    error.value = 'Erro ao acessar câmera: ' + message
    console.error(err)
    isScanning.value = false
  } finally {
    isStarting.value = false
  }
}

const stopScanning = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  
  isScanning.value = false
}

const tick = () => {
  if (!isScanning.value || !videoElement.value || !canvasElement.value) {
    return
  }

  const video = videoElement.value
  const canvas = canvasElement.value
  
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        emit('scan', code.data)
        stopScanning()
        return
      }
    }
  }

  animationFrame = requestAnimationFrame(tick)
}

const scanManually = () => {
  console.log('[QRScanner] Opening manual input modal')
  showManualInput.value = true
}

const submitManualCode = () => {
  console.log('[QRScanner] Submit manual code:', manualCode.value)
  if (manualCode.value) {
    console.log('[QRScanner] Emitting scan event with code:', manualCode.value)
    emit('scan', manualCode.value)
    manualCode.value = ''
    showManualInput.value = false
    stopScanning()
  }
}

onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
video {
  max-width: 100%;
  height: auto;
}
</style>
