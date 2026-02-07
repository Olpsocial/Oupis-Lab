'use client';
import { useState, useEffect } from 'react';

const AudioUnlock = () => {
    const [audioContext, setAudioContext] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            setAudioContext(ctx);
            // Check if already running (some browsers allow auto-play)
            if (ctx.state === 'running') setIsUnlocked(true);
        } else {
            setIsUnlocked(true); // No audio support, just unlock
        }
    }, []);

    const unlockAudio = () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                setIsUnlocked(true);
            });
        } else {
            setIsUnlocked(true);
        }
    };

    if (isUnlocked) return null;

    return (
        <div
            onClick={unlockAudio}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm text-yellow-400 cursor-pointer font-term"
        >
            <div className="text-center animate-pulse border border-yellow-500/50 p-8 rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-black/90">
                <p className="text-2xl font-bold mb-2 tracking-widest">[ SYSTEMLOCK ]</p>
                <p className="text-sm font-mono text-yellow-200/70">CLICK_TO_INITIALIZE_AUDIO_core</p>
            </div>
        </div>
    );
};

export default AudioUnlock;
