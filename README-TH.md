# 🐉 LMO Auto-Bot — Last Meadow Online

บอทอัตโนมัติสำหรับเกม **Last Meadow Online** บน Discord  
กดทุกอย่างให้เองหมดเลย ไม่ต้องนั่งกดเอง!

> 🇬🇧 [English version → README.md](./README.md)

---

## ✨ ฟีเจอร์

- ⚡ **ผจญภัยอัตโนมัติ** — กดปุ่มผจญภัยรัวๆ
- 🔨 **สร้างอัตโนมัติ** — กดปุ่มสร้างและอ่านลูกศรกดตามเองเลย
- ⚔️ **การต่อสู้อัตโนมัติ** — จัดการ targets, shield, และ 3x3 grid
- 🐲 **กดมังกรอัตโนมัติ** — spam คลิกมังกร Grass Toucher
- 🖥️ **GUI Overlay** — เปิด/ปิดฟีเจอร์แต่ละอันได้ ดูสถิติ realtime
- 🌐 **สลับภาษา** — สลับระหว่างไทย 🇹🇭 และอังกฤษ 🇬🇧 ได้ในตัว GUI
- 🖱️ **ลาก GUI ได้** — ย้ายหน้าต่างไปวางตรงไหนก็ได้

---

## 🚀 วิธีใช้

> ⚠️ ใช้ได้เฉพาะ **Discord บน browser** เท่านั้น (Chrome, Firefox, Edge)  
> ไม่รองรับ Discord desktop app

1. เปิดเกม **Last Meadow Online** ใน Discord บน browser
2. กด **F12** เพื่อเปิด Developer Tools
3. คลิกแท็บ **Console**
4. พิมพ์ `allow pasting` แล้วกด Enter
5. Copy code ทั้งหมดจากไฟล์ `lmo_bot.js` แล้ว Paste ลงใน Console กด Enter
6. GUI จะโผล่มุมขวาบน กด **▶ เริ่ม** แล้วปล่อยให้บอททำงานเอง

**หยุดบอท:** กด **■ หยุด** หรือพิมพ์ `window._tlmBot.stop()` ใน console

---

## 📋 ความต้องการ

- Discord บน **browser** (ไม่ใช่ desktop app)
- ไม่ต้องติดตั้งอะไรเพิ่ม

---

## ⚙️ ปรับแต่ง

แก้ค่าใน `config` ที่ต้นไฟล์ได้เลย:

```js
const config = {
    loopSpeed: 10,         // ความเร็ว main loop (ms) — ยิ่งน้อยยิ่งเร็ว
    adventureInterval: 10, // ความเร็วกดผจญภัย (ms)
    autoCraft: true,       // เปิด/ปิด สร้าง
    autoBattle: true,      // เปิด/ปิด ต่อสู้
    autoAdventure: true,   // เปิด/ปิด ผจญภัย
    clickDragon: true,     // เปิด/ปิด กดมังกร
};
```

---

## ⚠️ หมายเหตุ

- เกมนี้มีถึง **7 เมษายน 2026** เท่านั้น
- บอทนี้จำลองการคลิกเหมือนคนเล่นปกติ ไม่ได้ส่ง request ปลอมหรือดึงข้อมูลส่วนตัวใดๆ
- ใช้ความเสี่ยงของตัวเองนะ
