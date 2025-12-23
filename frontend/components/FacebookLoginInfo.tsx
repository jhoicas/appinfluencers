'use client';

export default function FacebookLoginInfo() {
  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-900 mb-2">
            Facebook Login requiere HTTPS
          </h4>
          <p className="text-sm text-yellow-800 mb-3">
            Facebook ya no permite login desde páginas HTTP (localhost). Para usar Facebook Login:
          </p>
          <div className="space-y-2 text-sm text-yellow-800">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <div>
                <strong>Opción Fácil - Ngrok:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Descarga Ngrok: <a href="https://ngrok.com/download" target="_blank" className="underline text-blue-600 hover:text-blue-800">ngrok.com/download</a></li>
                  <li>Ejecuta: <code className="bg-yellow-100 px-2 py-0.5 rounded">ngrok http 3000</code></li>
                  <li>Usa la URL HTTPS que te da Ngrok</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <div>
                <strong>O usa login tradicional:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Email: <code className="bg-yellow-100 px-2 py-0.5 rounded">gaby@gmail.com</code></li>
                  <li>Password: <code className="bg-yellow-100 px-2 py-0.5 rounded">gaby123</code></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xs text-yellow-700 mt-3">
            📖 Ver guía completa en: <code className="bg-yellow-100 px-2 py-0.5 rounded">HTTPS_SETUP.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
