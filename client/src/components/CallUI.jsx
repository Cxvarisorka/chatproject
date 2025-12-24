import { useContext } from 'react';
import { VoiceContext } from '../context/voice.context';

const CallUI = () => {
    const { incomingCall, callStatus, callerInfo, acceptCall, rejectCall, endCall } = useContext(VoiceContext);

    // Incoming call popup
    if (callStatus === 'ringing' && incomingCall) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg text-center shadow-xl">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <p className="text-white text-lg mb-2">Incoming Call</p>
                    <p className="text-gray-400 mb-6">{callerInfo?.name || 'Unknown'}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={acceptCall}
                            className="bg-green-600 hover:bg-green-700 p-4 rounded-full text-white transition-colors"
                            title="Accept"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                        <button
                            onClick={rejectCall}
                            className="bg-red-600 hover:bg-red-700 p-4 rounded-full text-white transition-colors"
                            title="Reject"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calling UI (waiting for answer)
    if (callStatus === 'calling') {
        return (
            <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white text-sm">Calling...</p>
                        <p className="text-gray-400 text-xs">{callerInfo?.name || 'Unknown'}</p>
                    </div>
                    <button
                        onClick={() => endCall()}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-full text-white ml-2 transition-colors"
                        title="Cancel"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Active call UI
    if (callStatus === 'connected') {
        return (
            <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white text-sm">Connected</p>
                        <p className="text-gray-400 text-xs">{callerInfo?.name || 'In call'}</p>
                    </div>
                    <button
                        onClick={() => endCall()}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-full text-white ml-2 transition-colors"
                        title="End Call"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default CallUI;
