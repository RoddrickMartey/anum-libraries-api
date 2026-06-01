export const health_html = String.raw`<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="Anum Libraries API — Health Status">
    <title>Anum Libraries — Server Health</title>
    <style>
      /* Fallback/Custom Styles without needing Tailwind CDN */
      :root {
        --gold: #D4AF37;
        --cocoa: #3B2F2F;
      }
      body {
        background: linear-gradient(135deg, #111827, var(--cocoa), #000000);
        color: #F3F4F6;
        font-family: ui-sans-serif, system-ui, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
      }
      .card {
        max-width: 48rem;
        width: 100%;
        margin: auto;
        text-align: center;
        padding: 2rem;
        border-radius: 1.5rem;
        backdrop-filter: blur(12px);
        background: linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
        border: 1px solid #374151;
        box-shadow: 0 0 30px rgba(212,175,55,0.14), 0 0 60px rgba(59,47,47,0.08) inset;
      }
      .text-gold { color: var(--gold); }
      .bg-gold-gradient { background: linear-gradient(to top right, var(--gold), #FBBF24); }
      .glow { box-shadow: 0 0 30px rgba(212,175,55,0.14); }
      
      @keyframes heartbeat {
        0% { transform: scale(1); }
        25% { transform: scale(1.06); }
        40% { transform: scale(0.98); }
        60% { transform: scale(1.03); }
        100% { transform: scale(1); }
      }
      .heartbeat { animation: heartbeat 2s ease-in-out infinite; }
      
      /* Simple grid setup */
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 2rem; }
      .grid-item { padding: 1rem; border-radius: 0.75rem; background: linear-gradient(to bottom right, rgba(255,255,255,0.03), rgba(0,0,0,0.1)); border: 1px solid #374151; }
      .flex-center { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2rem; }
      .badge { padding: 0.75rem 1.25rem; border-radius: 9999px; font-weight: 500; }
    </style>
  </head>
  <body class="antialiased">
    <main style="padding: 1.5rem; width: 100%;">
      <section class="card">
        <div style="display: flex; justify-content: center;">
          <div class="bg-gold-gradient" style="border-radius: 9999px; padding: 0.75rem; transition: all 0.5s;">
            <svg class="heartbeat" style="width: 4rem; height: 4rem;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21s-6.716-4.35-9.5-7.39C-1.21 9.658 3.06 4 8.5 6.5 11 7.98 12 11 12 11s1-3.02 3.5-4.5C20.94 4 26.21 9.658 21.5 13.61 18.716 16.65 12 21 12 21z" fill="white" opacity="0.95"/>
            </svg>
          </div>
        </div>

        <h1 style="margin-top: 1.5rem; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em;" class="text-gold">Healthy — All Systems Nominal</h1>
        <p style="margin-top: 0.75rem; color: #D1D5DB;">Anum Libraries API is up and serving requests. Uptime and diagnostics below.</p>

        <div class="grid">
          <div class="grid-item">
            <div style="font-size: 0.875rem; color: #D1D5DB;">Uptime</div>
            <div style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: 600;">5 years, 3 months</div>
          </div>
          <div class="grid-item">
            <div style="font-size: 0.875rem; color: #D1D5DB;">Requests Today</div>
            <div style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: 600;">12,482</div>
          </div>
          <div class="grid-item">
            <div style="font-size: 0.875rem; color: #D1D5DB;">Healthy Checks</div>
            <div style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: 600; color: #34D399;">All OK</div>
          </div>
        </div>

        <div class="flex-center">
          <div class="badge" style="background-color: rgba(212,175,55,0.1); color: var(--gold);">API v1</div>
          <div class="badge" style="background-color: rgba(31,41,55,0.5); color: #E5E7EB;">DB Connected</div>
          <div class="badge" style="background-color: rgba(31,41,55,0.4); color: #E5E7EB;">Realtime OK</div>
        </div>

        <footer style="margin-top: 2rem; font-size: 0.75rem; color: #6B7280;">
          <div>Built with care • <strong>Anum Libraries API</strong></div>
        </footer>
      </section>
    </main>
  </body>
</html>`;
