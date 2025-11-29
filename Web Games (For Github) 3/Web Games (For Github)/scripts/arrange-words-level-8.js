const correctPairs = {
    'item1Bottom': 'item1Top',
    'item2Bottom': 'item2Top',
    'item3Bottom': 'item3Top'
}

let draggedElement = null
let draggedElementOriginalParent = null
let draggedElementOriginalPosition = null
let currentDropZone = null

const texts = [
    document.querySelector('.item1Bottom'),
    document.querySelector('.item2Bottom'),
    document.querySelector('.item3Bottom')
]

const images = [
    document.querySelector('.item1Top'),
    document.querySelector('.item2Top'),
    document.querySelector('.item3Top')
]

function initDragAndDrop() {
    texts.forEach(textEl => {
        if (!textEl) return
        
        textEl.setAttribute('draggable', 'true')
        textEl.classList.add('draggable')
        
        textEl.addEventListener('dragstart', handleDragStart)
        textEl.addEventListener('dragend', handleDragEnd)
        textEl.addEventListener('touchstart', handleTouchStart, { passive: false })
    })

    images.forEach(imageEl => {
        if (!imageEl) return
        
        imageEl.classList.add('drop-zone')
        imageEl.addEventListener('dragover', handleDragOver)
        imageEl.addEventListener('drop', handleDrop)
        imageEl.addEventListener('dragleave', handleDragLeave)
        imageEl.addEventListener('dragenter', handleDragEnter)
        imageEl.addEventListener('touchend', handleTouchEnd, { passive: false })
    })
}

function handleDragStart(e) {
    draggedElement = this
    draggedElementOriginalParent = this.parentElement
    draggedElementOriginalPosition = {
        left: this.style.left,
        top: this.style.top,
        position: this.style.position
    }
    
    this.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', this.innerHTML)
    
    setTimeout(() => {
        this.style.opacity = '0.5'
    }, 0)
}

function handleDragEnd(e) {
    if (!draggedElement) return
    
    draggedElement.classList.remove('dragging')
    draggedElement.style.opacity = '1'
    
    if (!draggedElement.dataset.stuckTo) {
        if (draggedElementOriginalPosition.position) {
            draggedElement.style.left = draggedElementOriginalPosition.left
            draggedElement.style.top = draggedElementOriginalPosition.top
            draggedElement.style.position = draggedElementOriginalPosition.position
        } else {
            draggedElement.style.position = 'static'
            draggedElement.style.left = ''
            draggedElement.style.top = ''
        }
    }
    
    images.forEach(img => {
        img.classList.remove('drag-over')
    })
    
    draggedElement = null
    currentDropZone = null
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault()
    }
    e.dataTransfer.dropEffect = 'move'
    return false
}

function handleDragEnter(e) {
    if (draggedElement) {
        this.classList.add('drag-over')
        currentDropZone = this
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over')
    if (currentDropZone === this) {
        currentDropZone = null
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation()
    }
    
    if (!draggedElement) return false
    
    this.classList.remove('drag-over')
    
    const imgRect = this.getBoundingClientRect()
    const textRect = draggedElement.getBoundingClientRect()
    
    const baseClass = this.classList[0]
    
    draggedElement.style.position = 'absolute'
    draggedElement.style.left = (imgRect.left + window.scrollX + imgRect.width / 2 - textRect.width / 2) + 'px'
    draggedElement.style.top = (imgRect.bottom + window.scrollY + 20) + 'px'
    draggedElement.style.zIndex = '1001'
    draggedElement.dataset.stuckTo = baseClass
    
    const previousMatch = Array.from(texts).find(t => 
        t !== draggedElement && t.dataset.stuckTo === baseClass
    )
    if (previousMatch) {
        previousMatch.dataset.stuckTo = ''
        previousMatch.style.position = 'static'
        previousMatch.style.left = ''
        previousMatch.style.top = ''
    }
    
    draggedElement.classList.remove('dragging')
    draggedElement.style.opacity = '1'
    
    return false
}

let touchStartX = 0
let touchStartY = 0
let touchElement = null
let touchOffsetX = 0
let touchOffsetY = 0

function handleTouchStart(e) {
    touchElement = this
    const touch = e.touches[0]
    const rect = this.getBoundingClientRect()
    
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    touchOffsetX = touch.clientX - rect.left
    touchOffsetY = touch.clientY - rect.top
    
    this.classList.add('dragging')
    this.style.position = 'absolute'
    this.style.left = (rect.left + window.scrollX) + 'px'
    this.style.top = (rect.top + window.scrollY) + 'px'
    this.style.zIndex = '1000'
    this.style.opacity = '0.8'
    
    document.body.appendChild(this)
    
    e.preventDefault()
}

document.addEventListener('touchmove', function(e) {
    if (!touchElement) return
    
    const touch = e.touches[0]
    touchElement.style.left = (touch.clientX - touchOffsetX + window.scrollX) + 'px'
    touchElement.style.top = (touch.clientY - touchOffsetY + window.scrollY) + 'px'
    
    images.forEach(img => {
        const imgRect = img.getBoundingClientRect()
        const textRect = touchElement.getBoundingClientRect()
        const textCenter = {
            x: textRect.left + textRect.width / 2,
            y: textRect.top + textRect.height / 2
        }
        const imgCenter = {
            x: imgRect.left + imgRect.width / 2,
            y: imgRect.top + imgRect.height / 2
        }
        const dist = Math.sqrt(
            Math.pow(textCenter.x - imgCenter.x, 2) +
            Math.pow(textCenter.y - imgCenter.y, 2)
        )
        
        if (dist < 120) {
            img.classList.add('drag-over')
        } else {
            img.classList.remove('drag-over')
        }
    })
    
    e.preventDefault()
}, { passive: false })

function handleTouchEnd(e) {
    if (!touchElement) return
    
    let dropped = false
    
    images.forEach(img => {
        const imgRect = img.getBoundingClientRect()
        const textRect = touchElement.getBoundingClientRect()
        const textCenter = {
            x: textRect.left + textRect.width / 2,
            y: textRect.top + textRect.height / 2
        }
        const imgCenter = {
            x: imgRect.left + imgRect.width / 2,
            y: imgRect.top + imgRect.height / 2
        }
        const dist = Math.sqrt(
            Math.pow(textCenter.x - imgCenter.x, 2) +
            Math.pow(textCenter.y - imgCenter.y, 2)
        )
        
        if (dist < 120) {
            const baseClass = img.classList[0]
            touchElement.style.position = 'absolute'
            touchElement.style.left = (imgRect.left + window.scrollX + imgRect.width / 2 - textRect.width / 2) + 'px'
            touchElement.style.top = (imgRect.bottom + window.scrollY + 20) + 'px'
            touchElement.style.zIndex = '1001'
            touchElement.dataset.stuckTo = baseClass
            
            const previousMatch = Array.from(texts).find(t => 
                t !== touchElement && t.dataset.stuckTo === baseClass
            )
            if (previousMatch) {
                previousMatch.dataset.stuckTo = ''
                previousMatch.style.position = 'static'
                previousMatch.style.left = ''
                previousMatch.style.top = ''
            }
            
            dropped = true
            img.classList.remove('drag-over')
        } else {
            img.classList.remove('drag-over')
        }
    })
    
    if (!dropped && !touchElement.dataset.stuckTo) {
        touchElement.style.position = 'static'
        touchElement.style.left = ''
        touchElement.style.top = ''
    }
    
    touchElement.classList.remove('dragging')
    touchElement.style.opacity = '1'
    touchElement = null
}

document.getElementById('checkBtn').addEventListener('click', function() {
    let allCorrect = true
    const wrongMatches = []
    
    Object.keys(correctPairs).forEach(textClass => {
        const textEl = document.querySelector('.' + textClass)
        const correctImageClass = correctPairs[textClass]
        
        if (!textEl) {
            allCorrect = false
            return
        }
        
        if (textEl.dataset.stuckTo !== correctImageClass) {
            allCorrect = false
            if (textEl.dataset.stuckTo) {
                wrongMatches.push(textEl)
            }
        }
    })
    
    if (allCorrect) {
        document.body.style.backgroundColor = '#bfff66'
        const audio = new Audio('../assets/audio/success.mp3')
        audio.play().catch(() => {})
        
        texts.forEach(textEl => {
            if (textEl) {
                textEl.style.border = '3px solid #4caf50'
                textEl.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)'
            }
        })
        
        setTimeout(() => {
            document.body.style.backgroundColor = ''
            texts.forEach(textEl => {
                if (textEl) {
                    textEl.style.border = ''
                    textEl.style.boxShadow = ''
                }
            })
        }, 3000)
    } else {
        document.body.style.backgroundColor = '#ff5050'
        const audio = new Audio('../assets/audio/failed.mp3')
        audio.play().catch(() => {})
        
        texts.forEach(textEl => {
            if (textEl) {
                const correctImageClass = correctPairs[textEl.className]
                if (textEl.dataset.stuckTo === correctImageClass) {
                    textEl.style.border = '3px solid #4caf50'
                } else if (textEl.dataset.stuckTo) {
                    textEl.style.border = '3px solid #ff5050'
                    textEl.style.animation = 'shake 0.5s'
                } else {
                    textEl.style.border = '3px solid #ffaa00'
                }
            }
        })
        
        setTimeout(() => {
            document.body.style.backgroundColor = ''
            texts.forEach(textEl => {
                if (textEl) {
                    textEl.style.border = ''
                    textEl.style.animation = ''
                }
            })
        }, 3000)
    }
})

document.getElementById('next').addEventListener('click', function() {
    window.location.href = 'arrange-words-level-9.html'
})

initDragAndDrop()
