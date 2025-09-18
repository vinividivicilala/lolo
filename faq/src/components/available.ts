// Halaman ini akan otomatis jadi route: /available
export async function get() {
  return {
    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Available For Work</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #0f172a;
            color: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.3rem;
            max-width: 600px;
            text-align: center;
            line-height: 1.6;
          }
          a {
            margin-top: 2rem;
            padding: 12px 20px;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            color: #3b82f6;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          a:hover {
            background: #3b82f6;
            color: #fff;
          }
        </style>
      </head>
      <body>
        <h1>AVAILABLE FOR WORK</h1>
        <p>
          Saya terbuka untuk peluang kerja baru 🚀.<br/>
          Jika tertarik untuk bekerjasama, silakan hubungi saya melalui kontak yang tersedia.
        </p>
        <a href="/">⬅ Back to Home</a>
      </body>
      </html>
    `,
  };
}
