Message Gachapon — Frontend prototype

Files:
- index.html — Sender page (form to create capsules). Open this page to compose messages and click Preview to open the receiver.
- receiver.html — Receiver page (gachapon machine). Press the knob to dispense random capsules and reveal messages.
- style.css — Shared styles for both pages. Contains responsive layout and small animations.
- script.js — Modular JavaScript that initialises sender or receiver behavior based on the page.
- assets/ — contains designer references: `sender_wireframe.png` and `Gachapon machine.pdf`.

Notes:
- This prototype is frontend-only. Messages are temporarily stored in `localStorage` when you click Preview on the sender page.
- If no messages are stored, the receiver will fall back to a set of hardcoded sample messages.

How to try:
1. Open `index.html` in your browser, create messages, then click "Preview on machine" (it will open `receiver.html`).
2. In the receiver, click the knob to reveal capsules one-by-one.

