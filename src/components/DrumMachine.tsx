import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label"
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from "@/components/ui/slider";



const createDrumSound = (type: string, audioContext: any) => {

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'kick':
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            break;
        case 'snare':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            break;
        case 'hihat':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            break;
        default:
            break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
};

const DrumMachine = () => {
    const [playing, setPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [bpm, setBpm] = useState(120);
    const [audioContext, setAudioContext]: any = useState();
    const [pattern, setPattern]: any = useState({
        kick: new Array(16).fill(false),
        snare: new Array(16).fill(false),
        hihat: new Array(16).fill(false),
    });

    useEffect(() => {
        // @ts-ignore
        const ac: any = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ac);
    }, []);

    const timerRef: any = useRef(null);

    const playStep = useCallback(() => {
        Object.entries(pattern).forEach(([drum, steps]) => {
            // @ts-ignore
            if (steps[currentStep]) {
                createDrumSound(drum, audioContext);
            }
        });
        setCurrentStep((prevStep) => (prevStep + 1) % 16);
    }, [currentStep, pattern, audioContext]);

    useEffect(() => {
        if (playing) {
            timerRef.current = setInterval(playStep, (60 * 1000) / bpm / 4);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [playing, bpm, playStep]);

    const toggleStep = (drum: string, step: any) => {
        setPattern((prevPattern: any) => ({
            ...prevPattern,
            [drum]: prevPattern[drum].map((value: any, index: any) =>
                index === step ? !value : value
            ),
        }));
    };

    const togglePlay = () => {
        if (!playing && audioContext) {
            audioContext.resume();
        }
        setPlaying(!playing);
    };

    const getStepColor = (isActive: any, isCurrentStep: boolean) => {
        if (isCurrentStep) return 'bg-red-500 hover:bg-red-600';
        if (isActive) return 'bg-blue-500 hover:bg-blue-600';
        return 'bg-gray-300 hover:bg-gray-400';
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardContent>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="pt-6 pb-8 mb-4">
                        <Label className="w-16 m-3 font-bold">{bpm} BPM</Label>
                        <Slider
                            className='p-6'
                            min={60}
                            max={180}
                            step={1}
                            value={[bpm]}
                            onValueChange={(value) => setBpm(value[0])}
                        />
                    </div>
                    <div className="pt-6 pb-8 mb-4">
                        {Object.keys(pattern).map((drum) => (
                            <div key={drum} className="flex items-center mb-2">
                                {/* <span className="w-16 font-bold">{drum}</span> */}
                                <Label className="w-16 m-3 font-bold">{drum}</Label>
                                {pattern[drum].map((on: any, step: React.Key | null | undefined) => (
                                    <button
                                        key={step}
                                        className={`w-8 h-8 m-1 rounded ${getStepColor(on, currentStep === step)}`}
                                        onClick={() => toggleStep(drum, step)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <Button variant="secondary" onClick={togglePlay}>
                        {playing ? <Square size={20} /> : <Play size={20} />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DrumMachine;