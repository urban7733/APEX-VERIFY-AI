# Backend Deployment auf Railway.app

## Dein Projekt: calm-rejoicing

### Backend URL
```
https://calm-rejoicing.up.railway.app
```

## Deployment Steps

### 1. Railway Projekt ist bereits erstellt ✅
- Projektname: **calm-rejoicing**

### 2. Backend deployen
1. Gehe zu [railway.app/project/calm-rejoicing](https://railway.app/project)
2. Railway wird automatisch das Backend aus dem `/backend` Ordner deployen
3. Nutzt automatisch:
   - ✅ `requirements.txt` für Python Dependencies
   - ✅ `Procfile` für Start Command
   - ✅ `railway.json` für Konfiguration

### 3. Domain generieren (Falls noch nicht gemacht)
1. In Railway → Settings → Networking
2. Klicke "Generate Domain"
3. Du bekommst: `https://calm-rejoicing.up.railway.app`

### 4. Vercel Environment Variable setzen

**WICHTIG:** Füge diese Variable in Vercel hinzu:

```bash
NEXT_PUBLIC_BACKEND_URL=https://calm-rejoicing.up.railway.app
```

**So machst du das:**
1. Öffne [vercel.com](https://vercel.com) → Dein Projekt
2. Settings → Environment Variables
3. Füge hinzu:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://calm-rejoicing.up.railway.app`
   - **Environments**: ✅ Production ✅ Preview ✅ Development
4. Save
5. Gehe zu "Deployments" → Neuestes Deployment → "Redeploy"

### 5. Testen

Nach Vercel Redeploy (2-3 Min):
```bash
# Test Backend
curl https://calm-rejoicing.up.railway.app/health

# Test deine Vercel App
# Upload ein Bild → sollte jetzt funktionieren!
```

## Erwartete Health Response

```json
{
  "status": "healthy",
  "yolo_loaded": true,
  "services": {
    "yolo": "operational",
    "ai_image_detection": "operational",
    "manipulation_detection": "operational",
    "heatmap_generation": "operational"
  }
}
```

## Wichtige Notes

### Erster Request
- Nach Deployment: Warte 2-3 Minuten (ML Models laden)
- Nach Sleep (15 Min Inaktivität): Erster Request dauert 10-20s (Cold Start)
- Danach: Schnell (<2s)

### Railway Free Tier
- **500 Stunden/Monat** (ca. 16h/Tag)
- Sleep nach 15 Min Inaktivität
- Automatisches Wake-up bei Request
- Perfect für Testing & Demo

### Logs anschauen
Railway Dashboard → calm-rejoicing → Deployments → View Logs

## Troubleshooting

❌ **"Load failed"** in Vercel App
→ Check: Ist `NEXT_PUBLIC_BACKEND_URL` in Vercel gesetzt?
→ Check: Backend Health Endpoint erreichbar?
→ Lösung: Vercel Redeploy nach Variable setzen!

❌ **Backend antwortet nicht**
→ Warte 2-3 Min nach Deployment
→ Check Railway Logs
→ Test Health Endpoint

❌ **Timeout nach Upload**
→ Erster Request nach Cold Start dauert länger
→ Versuche nochmal - sollte dann schnell sein

## Production Upgrade

Für echte Production (kein Sleep, mehr Power):
- Railway Pro: $5/Monat
- Mehr RAM verfügbar
- Kein Sleep nach Inaktivität

