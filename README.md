# GoAnywhere iPhone app starter

This is an installable **Progressive Web App (PWA)** starter. Once deployed to an HTTPS address, open it in Safari on iPhone and choose **Share → Add to Home Screen**. It then launches from an icon in its own app-like window.

## What works in this starter
- GoAnywhere-style trip search screen for origin, destination, date and modes.
- Explicitly saved trips only: searches are not stored automatically; tap “Save this trip” to keep one on the device, and remove it whenever you want.
- Results panel inside the app (no itinerary text needs to be sent into a chat).
- Installable PWA manifest and service worker.
- Server endpoint designed for live travel-provider integrations.

## Important: live AI travel data is not connected yet
This starter does **not** claim to retrieve live fares. Reliable live results require provider data access for flights, rail and buses, plus ferry data where a practical service exists. AI should explain and compare provider-supplied results; it must not invent schedules, availability or prices.

The backend currently returns a clear setup message until real providers are connected. Provider credentials belong on the server, never in the iPhone app.

## Run locally
1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and add provider credentials after choosing providers.
4. Run `npm start`.
5. Open `http://localhost:3000` in a browser.

Local HTTP is for development only; iPhone home-screen installation requires a publicly reachable HTTPS deployment.

## Deploy and install on iPhone
Deploy this Node app to a hosting service that supports HTTPS and Node.js. Then:
1. Open the deployed HTTPS address in **Safari** on the iPhone.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Name it GoAnywhere and tap **Add**.

This creates a home-screen web app, not an App Store native app. App Store distribution would require a separate native iOS build and Apple developer account.

## Live provider integration contract
Implement `POST /api/search` in `server.js`. Return JSON shaped like:

```json
{
  "routes": [
    {
      "id": "route-1",
      "mode": "Plane",
      "title": "Nonstop flight",
      "legs": [
        {
          "from": "Tampa International (TPA)",
          "to": "New York (JFK)",
          "departure": "2027-01-15T08:00:00-05:00",
          "arrival": "2027-01-15T10:45:00-05:00",
          "operator": "Airline"
        }
      ],
      "durationMinutes": 165,
      "durationLabel": "2 hr 45 min",
      "totalPrice": 189,
      "currency": "$",
      "fareType": "live",
      "source": "Provider name",
      "checkedAt": "2026-11-20T19:40:00-05:00",
      "bookingUrl": "https://provider.example/checkout",
      "notes": "Fare conditions and connection notes"
    }
  ]
}
```

Use `fareType: "live"` only when the provider confirms a current fare/availability for the exact requested itinerary. Use `"estimate"` for indicative or inferred pricing. Include provider/source and checked timestamp for each result. Do not silently combine different dates, currencies or fare classes.


## Saved-trip privacy
Search inputs are not automatically written to local storage. Only routes you explicitly save are stored in the browser's local storage on that device. Clearing Safari website data may erase those saved trips. This starter does not sync trips to a cloud account.
