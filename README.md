# Shanmugasundaram × Srimathi — Wedding Invitation Website

**திருமண வரவேற்பு விழா | Wedding Reception**  
Monday, 16 November 2026 · Kongu Mahal, Chengapalli Road, Kunnathur

---

## Project Structure

```
d:/webpage/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main stylesheet (Temple Heritage theme)
│   └── print.css           # Print styles
├── js/
│   ├── main.js             # Interactive features and Supabase wishes
│   └── config.js           # Public Supabase project settings
├── supabase-schema.sql     # Guest wishes table and row-level security
├── assets/
│   ├── invitation.pdf      ← ADD YOUR PDF HERE
│   └── og-preview.jpg      ← ADD SOCIAL SHARE IMAGE (1200×630px)
└── README.md
```

---

## ⚠️ Required Assets — Add Before Deploying

### 1. Wedding Invitation PDF
- Add the original PDF at `assets/invitation.pdf`. The website will then show it in the
  embedded viewer and enable the view/download links.

### 2. Social Share Preview Image
- Create `assets/og-preview.jpg` — 1200×630px
- Use an elegant design with the couple's names and wedding date

### 3. Guest wishes database (required for shared, persistent wishes)
GitHub Pages serves static files and cannot store guest submissions itself. The
website uses Supabase so wishes can be saved and read across visitors and devices.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase-schema.sql`. This creates
   `public.guest_wishes`, enables row-level security, and allows visitors to read and
   submit wishes. Anonymous users cannot edit or delete saved wishes.
3. Copy the project URL and its public anon/publishable key from **Project Settings →
   API** into `js/config.js`:
   ```js
   window.WEDDING_CONFIG = {
     supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
     supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY'
   };
   ```
   The anon key is intended for browser use; never put a Supabase `service_role` key
   in this file.
4. Publish the site with GitHub Pages.

Submitted wishes are public and displayed on the website. Supabase stores them in the
project database until removed from the project. Keep the project active and use
Supabase's backup options if you need a separate backup.

---

## 🌐 Local Testing

### Option A — Python (no install needed)
```bash
# In d:/webpage directory
python -m http.server 8000
# Open http://localhost:8000
```

### Option B — Node.js
```bash
npx serve .
# Or
npx live-server .
```

### Option C — VS Code
Install the **Live Server** extension, right-click `index.html` → "Open with Live Server"

> **Note:** Open via a local server (not by double-clicking `index.html`) so that  
> relative asset paths (PDF, images) load correctly.

---

## 🚀 GitHub Pages Deployment

1. Create a new GitHub repository (e.g., `srimathi-shanmugam-wedding`)
2. Push all files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Wedding invitation website — initial release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/srimathi-shanmugam-wedding.git
   git push -u origin main
   ```
3. Go to **Settings → Pages → Source: Deploy from branch → main / root**
4. Your site will be live at: `https://YOUR_USERNAME.github.io/srimathi-shanmugam-wedding/`

---

## ✏️ Customisation Reference

### Changing Event Details
Edit `index.html`:
- **Date/time:** Search for `16 November 2026` and `11:00 AM to 3:00 PM`
- **Venue:** Search for `Kongu Mahal` and update the address and Maps link
- **Couple names:** Search for `Shanmugasundaram` and `Srimathi`

### Changing the Countdown Target
Edit `js/main.js`, line with `TARGET_ISO`:
```js
const TARGET_ISO = '2026-11-16T11:00:00+05:30';
//                   YYYY-MM-DDTHH:MM:SS+05:30 (IST = UTC+5:30)
```

### Changing Colours
Edit `css/styles.css` — `:root` design tokens at the top:
```css
--ivory:    #F8F0DF;   /* Background — dominant colour */
--burgundy: #701E32;   /* Headings, buttons */
--gold:     #B79555;   /* Accents, dividers */
--vermilion:#C74B32;   /* Highlights */
--text-dark:#493626;   /* Body text */
```

### Adding/Changing Contact Numbers
Edit `index.html` — search for `tel:+917598429215` and update:
```html
<a href="tel:+91XXXXXXXXXX" class="contact-phone">+91 XXXXX XXXXX</a>
```

### Changing Google Maps Links
In `index.html`, find `href="https://www.google.com/maps/search/Kongu+Mahal..."`  
Replace with the precise Google Maps share link for the venue.

### Family Names in Tamil
All Tamil family names are in `index.html` inside `data-ta` attributes.  
Search for the English name to find its Tamil counterpart.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ✨ Tamil Wedding Motifs | Kolam-inspired arch, floral details, and gentle motion |
| ⏱ Countdown Timer | Live IST countdown to reception (11:00 AM, 16 Nov 2026) |
| ↕️ Vertical Scrolling | No site header or navigation bar |
| 📄 Invitation PDF | Embedded viewer and direct PDF download |
| 🌐 Language Toggle | English ↔ Tamil (persisted in localStorage) |
| 📅 Add to Calendar | Downloads `.ics` file for all major calendar apps |
| 💌 Guest Wishes | Name and message stored in Supabase and displayed to visitors |
| 📤 WhatsApp Share | One-tap WhatsApp sharing button |
| 📍 Maps Link | Google Maps directions to Kongu Mahal, Kunnathur |
| 📱 Mobile-First | Fully responsive, touch-friendly layout |
| ♿ Accessible | Keyboard navigation, ARIA labels, reduced-motion support |
| 🖨 Print-Friendly | Clean print stylesheet |

---

## 📋 Wedding Details (for reference)

| Field | Value |
|-------|-------|
| **Groom** | N. Shanmugasundaram DECE. |
| **Bride** | R. Srimathi B.Sc. |
| **Event** | Wedding Reception (திருமண வரவேற்பு விழா) |
| **Date** | Monday, 16 November 2026 |
| **Time** | 11:00 AM – 3:00 PM |
| **Venue** | Kongu Mahal, Chengapalli Road, Kunnathur |
| **District** | Tiruppur, Tamil Nadu |
| **Groom's Parents** | Mr. K.S. Nagarajan – Mrs. N. Saraswathi, Ganapathipalayam, Kunnathur |
| **Bride's Parents** | Mr. P.S. Ragupathi – Mrs. R. Santhi, Power House, Kunnathur |
| **Contact (Bride)** | +91 75984 29215 / +91 94439 29215 |
| **Contact (Groom)** | +91 96888 13018 |

---

*Made with ♥ for a beautiful celebration*
