import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/auth.context.jsx";
import { ChatProvider } from "./context/chat.context.jsx";
import { VoiceProvider } from "./context/voice.context.jsx";
import CallUI from "./components/CallUI.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <ChatProvider>
            <VoiceProvider>
                <App />
                <CallUI />
            </VoiceProvider>
        </ChatProvider>
    </AuthProvider>
);