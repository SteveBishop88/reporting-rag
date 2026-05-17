# Local Reporting RAG — User Interface (UI)

This directory contains the decoupled front-end web interface for the Local Reporting RAG pipeline. The UI provides a high-contrast, light-mode recruiter console designed for low eye strain and seamless, asynchronous interaction with the local document intelligence server.

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **State Management:** Zustand (Store-driven client state)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React

## 🧠 Architecture Choice: Why Zustand?

Rather than relying on heavily boilerplate-driven tools like Redux Toolkit or forcing unnecessary re-renders with the native React Context API, this project utilizes Zustand for client-side state management.
* **Decoupled Logic:** The chat history and loading states are kept entirely out of the visual UI component tree.
* **Performance:** Zustand runs outside of the standard React render cycle, ensuring snappy input tracking even while the local GPU is under high inference load.
* **State Control:** Enables instant global flushing via a centralized clearChat action.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18.x or higher) and npm installed on your machine.

### 2. Install Web Dependencies
Navigate into the ui directory and install the required packages:
cd ui
npm install

This pulls down Next.js, React, Tailwind CSS, Zustand, and Lucide React icons.

### 3. Launch the Development Server
Run the local Node development script:
npm run dev

The application will compile the TypeScript files and boot up a local hot-reloading web server:
* **Local URL:** http://localhost:3000

## 🔌 API Integration & Circuit Flow

When a user submits a query via the input field, the application completes the following execution circuit:
1. Append User Input: The query is committed to the global Zustand store and immediately rendered on-screen.
2. Trigger UI Loader: isLoading is flipped to true, rendering a shimmering skeleton loader.
3. Cross-Port Fetch: An asynchronous network fetch request is dispatched to the FastAPI engine running locally on http://127.0.0.1:8000/api/query.
4. Commit AI Response: The server responds with a JSON package containing the synthesized answer and an array of metadata sources. These are pushed to the Zustand store.
5. Graceful Teardown: The loading state is flipped back to false and the viewport smoothly auto-scrolls to the fresh text block.