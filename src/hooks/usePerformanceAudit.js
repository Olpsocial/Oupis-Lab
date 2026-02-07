
import { useState, useEffect, useRef } from 'react';

const usePerformanceAudit = () => {
    const [tier, setTier] = useState('AUDITING'); // AUDITING | ULTRA | BALANCED | LOW_POWER
    const [auditStatus, setAuditStatus] = useState('INIT'); // INIT | RUNNING | COMPLETE
    const [fps, setFps] = useState(0);

    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const samples = useRef([]);
    const auditTimer = useRef(null);

    useEffect(() => {
        setAuditStatus('RUNNING');
        let animationFrameId;

        const measure = () => {
            const now = performance.now();
            frameCount.current++;

            if (now - lastTime.current >= 1000) {
                const currentFps = frameCount.current;
                samples.current.push(currentFps);
                setFps(currentFps);

                // Reset for next second
                frameCount.current = 0;
                lastTime.current = now;
            }

            animationFrameId = requestAnimationFrame(measure);
        };

        measure();

        // Run Audit for 10 Seconds
        auditTimer.current = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);

            // Calculate Average
            const total = samples.current.reduce((a, b) => a + b, 0);
            const avg = total / (samples.current.length || 1);

            let finalTier = 'BALANCED';
            if (avg > 55) finalTier = 'ULTRA';
            else if (avg < 30) finalTier = 'LOW_POWER';
            else finalTier = 'BALANCED';

            setTier(finalTier);
            setAuditStatus('COMPLETE');

            // Apply to Body
            document.body.setAttribute('data-perf', finalTier);

        }, 10000);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(auditTimer.current);
        };
    }, []);

    return { tier, fps, auditStatus };
};

export default usePerformanceAudit;
