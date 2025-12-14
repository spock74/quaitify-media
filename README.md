# Quantizer

A high-performance visual wrapper for FFmpeg on macOS, now featuring a full-stack architecture for real-time processing.

<div align="center">
  <a href="#english">English</a> | <a href="#português-brasileiro">Português Brasileiro</a>
</div>

---

<a name="english"></a>
## 🇺🇸 English

**Quantizer** is a React-based web interface designed to act as a sleek, modern GUI wrapper for FFmpeg. Originally a command generator, it now includes a containerized Python backend to perform actual video conversions directly via the interface.

### Tech Stack
*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
*   **Backend**: Python, FastAPI
*   **Core**: FFmpeg

### Features
*   **3D Landing Page**: An interactive 3D particle visualization (Torus Knot or Sphere).
*   **Drag & Drop**: Intuitive file selection.
*   **Dual Mode**:
    *   **Generate Script**: Creates a sanitized FFmpeg command line for manual terminal execution (Client-side).
    *   **Process (API)**: Uploads and converts files using a server-side FFmpeg instance (Full-stack).
*   **Conversion Matrix**: Full control over containers, codecs (H.264, H.265, ProRes), CRF, and presets.
*   **Docker Ready**: Production-ready containerization with multi-stage builds and security hardening.

### Running via Docker (Recommended)
The application is fully containerized. To run it locally:

1. Build the image:
   ```bash
   docker build -t quantizer .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 quantizer
   ```
3. Open `http://localhost:8000` in your browser.

### Development
*   **Frontend**: `npm run dev` (Vite, proxies `/api` to localhost:8000)
*   **Backend**: Run the Python FastAPI server on port 8000.

### Usage
1.  Click "Quantify File" on the home screen.
2.  Drop a video or image file into the drop zone.
3.  Adjust settings in the "Conversion Matrix".
4.  **Option A (Manual)**: Click "Generate Script" to copy the command for your own terminal.
5.  **Option B (Automatic)**: Click "Process (API)" to upload and convert the file directly in the browser.

---

<a name="português-brasileiro"></a>
## 🇧🇷 Português Brasileiro

**Quantizer** é uma interface web baseada em React projetada para atuar como um wrapper GUI moderno e elegante para o FFmpeg. Originalmente um gerador de comandos, agora inclui um backend Python containerizado para realizar conversões de vídeo reais diretamente pela interface.

### Tech Stack
*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
*   **Backend**: Python, FastAPI
*   **Core**: FFmpeg
 
### Funcionalidades
*   **Landing Page 3D**: Uma visualização interativa de partículas 3D (Nó Toral ou Esfera).
*   **Arraste e Solte**: Seleção intuitiva de arquivos.
*   **Modo Duplo**:
    *   **Gerar Script**: Cria uma linha de comando FFmpeg sanitizada para execução manual no terminal (Client-side).
    *   **Processar (API)**: Faz upload e converte arquivos usando uma instância FFmpeg no servidor (Full-stack).
*   **Matriz de Conversão**: Controle total sobre contêineres, codecs (H.264, H.265, ProRes), CRF e presets.
*   **Pronto para Docker**: Containerização pronta para produção com builds multi-estágio e hardening de segurança.

### Rodando via Docker (Recomendado)
A aplicação é totalmente containerizada. Para rodar localmente:

1. Construa a imagem:
   ```bash
   docker build -t quantizer .
   ```
2. Rode o container:
   ```bash
   docker run -p 8000:8000 quantizer
   ```
3. Abra `http://localhost:8000` no seu navegador.

### Desenvolvimento
*   **Frontend**: `npm run dev` (Vite, faz proxy de `/api` para localhost:8000)
*   **Backend**: Execute o servidor Python FastAPI na porta 8000.

### Uso
1.  Clique em "Quantificar Arquivo" na tela inicial.
2.  Solte um arquivo de vídeo ou imagem na área de upload.
3.  Ajuste as configurações na "Matriz de Conversão".
4.  **Opção A (Manual)**: Clique em "Gerar Script" para copiar o comando para seu terminal.
5.  **Opção B (Automática)**: Clique em "Processar (API)" para enviar e converter o arquivo diretamente no navegador.