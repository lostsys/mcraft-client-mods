//@ts-check
export default () => {
  globalThis.customEvents.on('gameLoaded', () => {
    const bot = globalThis.bot
    
    const blockChanged = (data) => {
      const { block } = data ?? {}
      removeExistingTooltip()
      
      if (!block || ['air', 'void'].includes(block.name)) {
        return
      }
      
      showTooltip(block.displayName, block.material?.replace('mineable/', '') ?? '', block)
    }
    
    const removeExistingTooltip = () => {
      const existingTooltip = document.getElementById('waila-tooltip')
      if (existingTooltip) {
        existingTooltip.style.opacity = '0'
        setTimeout(() => existingTooltip.remove(), 150)
      }
    }
    
    bot.on('highlightCursorBlock', blockChanged)
    blockChanged({ block: bot.mouse.cursorBlock })
    
    bot.on('blockBreakProgressStage', (block, stage) => {
      const tooltip = document.getElementById('waila-tooltip')
      if (tooltip && block?.position?.equals?.(bot.mouse.cursorBlock?.position)) {
        updateBreakProgress(tooltip, stage)
      }
    })
    
    bot.on('end', removeExistingTooltip)
  })
}

const updateBreakProgress = (tooltip, stage) => {
  let progressBar = tooltip.querySelector('.waila-progress-bar')
  if (!progressBar) {
    progressBar = document.createElement('div')
    progressBar.className = 'waila-progress-bar'
    progressBar.innerHTML = `
      <div class="waila-progress-bg">
        <div class="waila-progress-fill"></div>
      </div>
    `
    tooltip.appendChild(progressBar)
  }
  
  const progressFill = progressBar.querySelector('.waila-progress-fill')
  if (progressFill) {
    const progress = Math.min(100, (stage / 10) * 100)
    progressFill.style.width = `${progress}%`
    progressBar.style.display = stage > 0 ? 'block' : 'none'
  }
}

const showTooltip = (name, digTool, block) => {
  const isTouch = globalThis.miscUiState?.currentTouch
  const topOffset = isTouch ? 27 : 8
  
  // Remove existing tooltip
  const existingTooltip = document.getElementById('waila-tooltip')
  if (existingTooltip) existingTooltip.remove()
  
  const tooltip = document.createElement('div')
  tooltip.id = 'waila-tooltip'
  
  // Enhanced CSS with better styling and animations
  tooltip.style.cssText = `
    position: fixed;
    top: ${topOffset}px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(16, 16, 16, 0.95), rgba(32, 32, 32, 0.95));
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    color: #ffffff;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    min-width: 120px;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    scale: 0.9;
  `
  
  // Block name with improved styling
  const nameDiv = document.createElement('div')
  nameDiv.textContent = name
  nameDiv.style.cssText = `
    margin-bottom: 4px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    letter-spacing: 0.3px;
  `
  
  // Tool information with icon-like styling
  const toolDiv = document.createElement('div')
  if (digTool) {
    toolDiv.textContent = `⛏ ${digTool}`
    toolDiv.style.cssText = `
      color: #a0a0a0;
      font-size: 11px;
      margin-bottom: 2px;
      font-weight: 400;
    `
  }
  
  // Coordinates with better formatting
  const coordsDiv = document.createElement('div')
  coordsDiv.textContent = `${block.position.x}, ${block.position.y}, ${block.position.z}`
  coordsDiv.style.cssText = `
    color: #808080;
    font-size: 10px;
    margin-top: 4px;
    font-family: 'Courier New', monospace;
    opacity: 0.8;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 4px;
  `
  
  // Progress bar styles (initially hidden)
  const progressBarStyles = document.createElement('style')
  progressBarStyles.textContent = `
    .waila-progress-bar {
      margin-top: 6px;
      display: none;
    }
    
    .waila-progress-bg {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .waila-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #81C784);
      border-radius: 2px;
      transition: width 0.1s ease-out;
      width: 0%;
    }
  `
  
  if (!document.getElementById('waila-progress-styles')) {
    progressBarStyles.id = 'waila-progress-styles'
    document.head.appendChild(progressBarStyles)
  }
  
  // Assemble tooltip
  tooltip.appendChild(nameDiv)
  if (digTool) {
    tooltip.appendChild(toolDiv)
  }
  tooltip.appendChild(coordsDiv)
  
  // Add to DOM
  const hudContainer = document.getElementById('ui-root') || document.body
  hudContainer.appendChild(tooltip)
  
  // Trigger entrance animation
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1'
    tooltip.style.transform = 'translateX(-50%) translateY(0)'
  })
}
