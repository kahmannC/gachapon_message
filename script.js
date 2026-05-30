/* Message Gacha - Vanilla JS (modular, beginner friendly)
	 - Handles sender page (index.html) and receiver page (receiver.html)
	 - Uses localStorage to pass messages between pages for this prototype
	 - Includes comments explaining major sections
*/

// Key used to persist gacha content locally
const STORAGE_KEY = 'gacha_messages_v1'

// Sample hardcoded messages used when none are provided
const sampleMessages = [
	'You are doing great — keep going ❤️',
	'A little surprise: treat yourself to a cookie today 🍪',
	'Tiny cheer: you made someone smile today ✨',
	'Remember to breathe — 3 deep breaths now 🌬️',
	'Fun fact: You are capable of wonderful things 🌈'
]

document.addEventListener('DOMContentLoaded', () => {
	const page = document.body.dataset.page
	if (page === 'sender') initSender()
	if (page === 'receiver') initReceiver()
})

/* ---------------- Sender page logic ---------------- */
function initSender(){
	const capsulesList = document.getElementById('capsulesList')
	const previewList = document.getElementById('previewList')
	const addBtn = document.getElementById('addCapsule')
	const previewBtn = document.getElementById('previewBtn')
	const titleInput = document.getElementById('gachaTitle')

	// create a capsule input element
	function makeCapsule(text=''){
		const id = 'c-' + Math.random().toString(36).slice(2,8)
		const wrap = document.createElement('div')
		wrap.className = 'capsule-input'

		const textarea = document.createElement('textarea')
		textarea.placeholder = 'Write a short message (emoji allowed)'
		textarea.maxLength = 320
		textarea.value = text

		const meta = document.createElement('div')
		meta.className = 'capsule-meta'

		const label = document.createElement('div')
		label.className = 'capsule-label'
		label.textContent = `Capsule ${capsulesList.children.length + 1}`

		const count = document.createElement('div')
		count.className = 'char-count'
		count.textContent = `${textarea.value.length}/320`

		const remove = document.createElement('button')
		remove.className = 'btn soft'
		remove.textContent = 'Remove'
		remove.addEventListener('click', () => {
			wrap.remove()
			refreshCapsuleLabels()
			updatePreview()
		})

		textarea.addEventListener('input', () => {
			count.textContent = `${textarea.value.length}/320`
			updatePreview()
		})

		meta.appendChild(label)
		meta.appendChild(count)
		meta.appendChild(remove)

		wrap.appendChild(textarea)
		wrap.appendChild(meta)
		wrap.dataset.id = id
		return wrap
	}

	function refreshCapsuleLabels(){
		capsulesList.querySelectorAll('.capsule-input').forEach((item, index) => {
			const label = item.querySelector('.capsule-label')
			if (label) label.textContent = `Capsule ${index + 1}`
		})
	}

	// populate with three starter inputs
	capsulesList.appendChild(makeCapsule('You got a secret message!'))
	capsulesList.appendChild(makeCapsule('Another capsule, another feeling.'))
	capsulesList.appendChild(makeCapsule('Lucky pull ✨'))

	// add handler to add new capsule
	addBtn.addEventListener('click', (e) =>{
		e.preventDefault()
		capsulesList.appendChild(makeCapsule(''))
		refreshCapsuleLabels()
		// scroll last into view
		capsulesList.lastChild.scrollIntoView({behavior:'smooth', block:'center'})
	})

	// gather messages and show preview list
	function updatePreview(){
		previewList.innerHTML = ''
		const items = Array.from(capsulesList.querySelectorAll('textarea'))
			.map(t => t.value.trim())
			.filter(Boolean)

		items.forEach((m,i)=>{
			const el = document.createElement('div')
			el.className = 'preview-item'
			el.textContent = `${i+1}. ${m}`
			previewList.appendChild(el)
		})
	}

	// save to localStorage and open receiver page
	previewBtn.addEventListener('click', ()=>{
		const title = titleInput.value.trim() || 'A tiny gachapon'
		const messages = Array.from(capsulesList.querySelectorAll('textarea'))
			.map(t => t.value.trim()).filter(Boolean)

		if (messages.length === 0){
			alert('Add at least one message to preview the machine.')
			return
		}

		const payload = {title, messages}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
		// open receiver in a new tab for previewing
		window.open('receiver.html','_blank')
	})

	// watch for changes to update preview
	capsulesList.addEventListener('input', updatePreview)
	updatePreview()
}

/* ---------------- Receiver page logic ---------------- */
function initReceiver(){
	const capsulesEl = document.getElementById('capsules')
	const knob = document.getElementById('knob')
	const remainingEl = document.getElementById('remaining').querySelector('span')
	const modal = document.getElementById('modal')
	const modalMsg = document.getElementById('modalMessage')
	const modalTitle = document.getElementById('modalTitle')
	const closeModal = document.getElementById('closeModal')
	const resetBtn = document.getElementById('resetBtn')

	// load messages from localStorage, otherwise fallback to samples
	const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
	const title = stored?.title || 'Surprise Gachapon'
	const messages = (stored?.messages && stored.messages.length>0) ? stored.messages.slice() : sampleMessages.slice()

	modalTitle.textContent = title

	// state
	let remaining = [] // indices of remaining messages
	let animating = false

	// initialize capsule visuals inside dome
	function buildCapsules(){
		capsulesEl.innerHTML = ''
		remaining = messages.map((m,i)=>i)

		// create a visual capsule for each message
		messages.forEach((m,i)=>{
			const el = document.createElement('div')
			el.className = 'capsule pulse'
			// random pastel color
			el.style.background = randomCapsuleColor(i)
			el.dataset.index = i
			el.title = 'Hidden message'
			setCapsulePosition(el, i)
			capsulesEl.appendChild(el)
		})

		updateRemaining()
	}

	function setCapsulePosition(el, index){
		const left = 10 + Math.random() * 72
		const bottom = 8 + Math.random() * 42
		const rotate = -30 + Math.random() * 60
		el.style.left = `${left}%`
		el.style.bottom = `${bottom}%`
		el.style.transform = `translate(-50%, 0) rotate(${rotate}deg)`
		el.style.zIndex = `${20 + index}`
	}

	function randomCapsuleColor(i){
		const palette = ['#ff9bb3','#ffd28b','#9be6ff','#c3a3ff','#a6f3c5']
		return palette[i % palette.length]
	}

	function updateRemaining(){
		remainingEl.textContent = String(remaining.length)
	}

	// pick a random remaining index and return it
	function pickRandom(){
		if (remaining.length === 0) return null
		const idx = Math.floor(Math.random()*remaining.length)
		return remaining.splice(idx,1)[0]
	}

	// animate dispensing: clone selected capsule and animate down, then show modal
	function dispense(index){
		const source = capsulesEl.querySelector(`.capsule[data-index='${index}']`)
		if (!source) return
		animating = true

		// clone for animation
		const clone = source.cloneNode(true)
		const rect = source.getBoundingClientRect()
		clone.style.position = 'fixed'
		clone.style.left = rect.left + 'px'
		clone.style.top = rect.top + 'px'
		clone.style.margin = '0'
		clone.style.zIndex = 50
		clone.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 300ms'
		document.body.appendChild(clone)

		// compute destination near slot
		const slot = document.querySelector('.slot')
		const slotRect = slot.getBoundingClientRect()
		const dx = slotRect.left + slotRect.width/2 - (rect.left + rect.width/2)
		const dy = slotRect.top + slotRect.height/2 - (rect.top + rect.height/2)

		// trigger animation
		requestAnimationFrame(()=>{
			clone.style.transform = `translate(${dx}px, ${dy+40}px) scale(1.1)`
			clone.style.opacity = '1'
		})

		// after animation ends, reveal message
		setTimeout(()=>{
			clone.remove()
			revealMessage(index)
			// mark original capsule as opened
			const orig = capsulesEl.querySelector(`.capsule[data-index='${index}']`)
			if (orig) orig.style.opacity = '0.18'
			animating = false
			updateRemaining()
		}, 760)
	}

	function revealMessage(index){
		modalMsg.textContent = messages[index]
		modal.classList.remove('hidden')
	}

	// knob click handler
	knob.addEventListener('click', ()=>{
		if (animating) return
		const next = pickRandom()
		if (next === null){
			// no more
			alert('No more capsules — reset to try again')
			return
		}
		// spin/press animation on knob
		knob.animate([{transform:'rotate(0deg)'},{transform:'rotate(-18deg)'},{transform:'rotate(0deg)'}],{duration:500,easing:'cubic-bezier(.2,.9,.2,1)'})
		dispense(next)
	})

	// modal close
	closeModal.addEventListener('click', ()=>{ modal.classList.add('hidden') })
	modal.addEventListener('click', (e)=>{ if (e.target === modal) modal.classList.add('hidden') })

	// reset to initial state
	resetBtn.addEventListener('click', ()=>{
		buildCapsules()
		modal.classList.add('hidden')
	})

	buildCapsules()
}

/* End of script.js */
