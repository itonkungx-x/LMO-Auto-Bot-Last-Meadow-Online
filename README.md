# 🐉 LMO Auto-Bot — Last Meadow Online

An automation bot for **Last Meadow Online** on Discord.  
It handles everything automatically — no clicking required!

> 🇹🇭 [ภาษาไทย / Thai version → README-TH.md](./README-TH.md)

---

## ✨ Features

- ⚡ **Auto Adventure** — Spams the Adventure button
- 🔨 **Auto Craft** — Clicks Craft and reads/presses arrow keys automatically
- ⚔️ **Auto Battle** — Handles targets, shields, and 3x3 grid
- 🐲 **Auto Dragon** — Spam clicks the Grass Toucher boss
- 🖥️ **GUI Overlay** — Toggle each feature on/off, view real-time stats
- 🌐 **Language Switch** — Toggle between Thai 🇹🇭 and English 🇬🇧 in the GUI
- 🖱️ **Draggable GUI** — Move the window anywhere on screen

---

## 🚀 How to Use

> ⚠️ Only works on **Discord in a browser** (Chrome, Firefox, Edge)  
> Does NOT work on the Discord desktop app

1. Open **Last Meadow Online** in Discord via your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Type `allow pasting` and press Enter
5. Copy all code from `lmo_bot.js` and paste it into the Console, then press Enter
6. The GUI will appear in the top-right corner — click **▶ Start** and let the bot run

**To stop the bot:** Click **■ Stop** or type `window._tlmBot.stop()` in the console

---

## 📋 Requirements

- Discord on a **browser** (not the desktop app)
- No additional installation required

---

## ⚙️ Configuration

Edit the `config` object at the top of the file:

```js
const config = {
    loopSpeed: 10,         // Main loop speed (ms) — lower = faster
    adventureInterval: 10, // Adventure button spam speed (ms)
    autoCraft: true,       // Enable/disable Auto Craft
    autoBattle: true,      // Enable/disable Auto Battle
    autoAdventure: true,   // Enable/disable Auto Adventure
    clickDragon: true,     // Enable/disable Auto Dragon
};
```

---

## ⚠️ Disclaimer

- The game is available until **April 7, 2026** only
- This bot simulates normal mouse clicks and keypresses — it does not send fake requests or access any personal data
- Use at your own risk
