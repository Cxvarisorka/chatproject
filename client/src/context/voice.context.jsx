import { createContext, useState, useRef, useEffect, useContext, useCallback } from 'react';
import Peer from 'peerjs';
import { AuthContext } from './auth.context';
import { ChatContext } from './chat.context';

export const VoiceContext = createContext();

const PEER_SERVER_HOST = import.meta.env.VITE_SOCKET_URL
    ? new URL(import.meta.env.VITE_SOCKET_URL).hostname
    : 'localhost';
const PEER_SERVER_PORT = import.meta.env.VITE_SOCKET_URL
    ? (new URL(import.meta.env.VITE_SOCKET_URL).port || 443)
    : 3000;
const PEER_SERVER_SECURE = import.meta.env.VITE_SOCKET_URL?.startsWith('https');

export const VoiceProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(ChatContext);
    const [peer, setPeer] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callStatus, setCallStatus] = useState('idle');
    const [callerInfo, setCallerInfo] = useState(null);

    const localStream = useRef(null);
    const remoteAudio = useRef(null);
    const currentCall = useRef(null);
    const pendingCall = useRef(null);

    const cleanup = useCallback(() => {
        localStream.current?.getTracks().forEach(track => track.stop());
        localStream.current = null;
        currentCall.current?.close();
        currentCall.current = null;
        pendingCall.current = null;
        setCallStatus('idle');
        setIncomingCall(null);
        setCallerInfo(null);
    }, []);

    const setupCall = useCallback((call) => {
        currentCall.current = call;

        call.on('stream', (remoteStream) => {
            // Create a new audio element to ensure clean playback
            const audio = remoteAudio.current;
            if (audio) {
                audio.srcObject = remoteStream;
                audio.volume = 1.0;
                audio.muted = false;

                // Force play after user interaction (accept/call button)
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                        console.error('Audio play error:', err);
                        // Retry play on user interaction
                        document.addEventListener('click', () => {
                            audio.play();
                        }, { once: true });
                    });
                }
            }
        });

        call.on('close', () => cleanup());
        call.on('error', (err) => {
            console.error('Call error:', err);
            cleanup();
        });
    }, [cleanup]);

    useEffect(() => {
        if (!user || !socket) return;

        // Configure PeerJS with ICE servers for production
        const peerConfig = {
            host: PEER_SERVER_HOST,
            port: PEER_SERVER_PORT,
            path: '/peerjs',
            secure: PEER_SERVER_SECURE,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        };

        const newPeer = new Peer(peerConfig);

        newPeer.on('open', (peerId) => {
            setPeer(newPeer);
            socket.emit('register', { userId: user._id, peerId });
        });

        newPeer.on('call', (call) => {
            pendingCall.current = call;
        });

        newPeer.on('error', (err) => {
            console.error('PeerJS error:', err);
        });

        const onIncomingCall = ({ from, peerId, callerName }) => {
            setIncomingCall({ from, peerId });
            setCallerInfo({ id: from, name: callerName });
            setCallStatus('ringing');
        };

        const onCallEnded = () => cleanup();

        socket.on('incomingCall', onIncomingCall);
        socket.on('callEnded', onCallEnded);

        return () => {
            newPeer.destroy();
            socket.off('incomingCall', onIncomingCall);
            socket.off('callEnded', onCallEnded);
        };
    }, [user, socket, cleanup]);

    const callUser = useCallback(async (targetUserId, targetUserName) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream.current = stream;
            setCallStatus('calling');
            setCallerInfo({ id: targetUserId, name: targetUserName });

            socket.emit('callUser', {
                to: targetUserId,
                from: user._id,
                callerName: user.username
            });

            socket.once('callAccepted', ({ peerId }) => {
                const call = peer.call(peerId, stream);
                setupCall(call);
                setCallStatus('connected');
            });
        } catch {
            cleanup();
        }
    }, [socket, user, peer, setupCall, cleanup]);

    const acceptCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream.current = stream;

            socket.emit('acceptCall', { to: incomingCall.from, peerId: peer.id });

            // Answer pending PeerJS call after short delay
            setTimeout(() => {
                if (pendingCall.current) {
                    pendingCall.current.answer(stream);
                    setupCall(pendingCall.current);
                }
            }, 100);

            setCallStatus('connected');
            setIncomingCall(null);
        } catch {
            cleanup();
        }
    }, [socket, incomingCall, peer, setupCall, cleanup]);

    const rejectCall = useCallback(() => {
        socket.emit('endCall', { to: incomingCall.from });
        pendingCall.current = null;
        setIncomingCall(null);
        setCallStatus('idle');
    }, [socket, incomingCall]);

    const endCall = useCallback(() => {
        const targetId = incomingCall?.from || callerInfo?.id;
        if (targetId) {
            socket.emit('endCall', { to: targetId });
        }
        cleanup();
    }, [socket, incomingCall, callerInfo, cleanup]);

    return (
        <VoiceContext.Provider value={{
            callUser,
            acceptCall,
            rejectCall,
            endCall,
            incomingCall,
            callStatus,
            callerInfo,
        }}>
            {children}
            <audio ref={remoteAudio} autoPlay />
        </VoiceContext.Provider>
    );
};
