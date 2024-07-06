import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const AmbientSynth = () => {
  const [audioContext, setAudioContext]: any = useState(null);
  const [oscillators, setOscillators]: any = useState([]);
  const [gainNode, setGainNode]: any = useState(null);
  const [reverbNode, setReverbNode]: any = useState(null);
  const [delayNode, setDelayNode]: any = useState(null);
  const [isInitialized, setIsInitialized]: any = useState(false);
  const [pointerPosition, setPointerPosition]: any = useState({ x: 0, y: 0 });
  const [waveform, setWaveform]: any = useState('sine');
  const [reverbAmount, setReverbAmount]: any = useState(0.3);
  const [delayTime, setDelayTime]: any = useState(0.3);
  const touchpadRef: any = useRef(null);

  const chords = [
    [1, 1.25, 1.5],    // Major chord
    [1, 1.2, 1.4],     // Minor chord
    [1, 1.26, 1.41],   // Augmented chord
    [1, 1.189, 1.498], // Diminished chord
    [1, 1.15, 1.34]    // Sus2 chord
  ];

  const initializeAudio = () => {
    const context: any = new (window.AudioContext || window.AudioContext)();
    setAudioContext(context);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);

    const reverb = context.createConvolver();
    const delay = context.createDelay(5.0);
    delay.delayTime.setValueAtTime(delayTime, context.currentTime);

    // Create impulse response for reverb
    const impulseLength = 0.5;
    const impulse = context.createBuffer(2, context.sampleRate * impulseLength, context.sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    for (let i = 0; i < impulse.length; i++) {
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulse.length, 2);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulse.length, 2);
    }
    reverb.buffer = impulse;

    gain.connect(delay);
    delay.connect(reverb);
    reverb.connect(context.destination);

    setGainNode(gain);
    setReverbNode(reverb);
    setDelayNode(delay);

    const newOscillators: any = chords[0].map(ratio => {
      const osc: any = context.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(440 * ratio, context.currentTime);
      osc.connect(gain);
      osc.start();
      return osc;
    });

    setOscillators(newOscillators);
    setIsInitialized(true);
  };

  useEffect(() => {
    return () => {
      if (oscillators.length > 0) {
        oscillators.forEach((osc: { stop: () => any; }) => osc.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [oscillators, audioContext]);

  useEffect(() => {
    if (isInitialized) {
      oscillators.forEach((osc: { type: string; }) => {
        osc.type = waveform;
      });
    }
  }, [waveform, isInitialized, oscillators]);

  useEffect(() => {
    if (isInitialized && reverbNode && audioContext) {
      const wetGain = audioContext.createGain();
      wetGain.gain.setValueAtTime(reverbAmount, audioContext.currentTime);
      reverbNode.connect(wetGain);
      wetGain.connect(audioContext.destination);
    }
  }, [reverbAmount, isInitialized, reverbNode, audioContext]);

  useEffect(() => {
    if (isInitialized && delayNode) {
      delayNode.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
    }
  }, [delayTime, isInitialized, delayNode, audioContext]);

  const handleInteraction = (e: any) => {
    e.preventDefault();
    if (!isInitialized) {
      initializeAudio();
    }
    updateSound(e);
  };

  const handleTouchEnd = () => {
    if (gainNode) {
      gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
    }
  };

  const updateSound = (e: { type: string; touches: any[]; clientX: number; clientY: number; }) => {
    if (!isInitialized || !touchpadRef.current) return;

    const touchpad = touchpadRef.current;
    const rect = touchpad.getBoundingClientRect();
    let x, y;

    if (e.type.startsWith('touch')) {
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) / rect.width;
      y = 1 - (touch.clientY - rect.top) / rect.height;
    } else {
      x = (e.clientX - rect.left) / rect.width;
      y = 1 - (e.clientY - rect.top) / rect.height;
    }

    setPointerPosition({ x: x * rect.width, y: (1 - y) * rect.height });

    const baseFrequency = 100 + x * 1000;
    const volume = 0.5;
    const chordIndex = Math.floor(y * chords.length);
    const currentChord = chords[chordIndex];

    oscillators.forEach((osc: { frequency: { setTargetAtTime: (arg0: number, arg1: any, arg2: number) => void; }; }, index: number) => {
      const frequency = baseFrequency * currentChord[index];
      osc.frequency.setTargetAtTime(frequency, audioContext.currentTime, 0.1);
    });

    gainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
  };

  const getPointerColor = () => {
    if (!touchpadRef.current) return 'hsl(0, 100%, 50%)';
    const hue = Math.floor(pointerPosition.x / touchpadRef.current.offsetWidth * 360);
    const lightness = Math.floor(pointerPosition.y / touchpadRef.current.offsetHeight * 50) + 25;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className='pb-6'>アンビエントシンセサイザー</CardTitle>
        <CardDescription>タッチパッドをクリックまたはタッチして音を生成</CardDescription>
        <CardDescription>左右：音の高さ / 上下：和音の種類</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="secondary" onClick={initializeAudio}>
          シンセサイザーを起動
        </Button>
        <div className="pt-6 pb-8 mb-4">
          <Label>波形</Label>
          <Separator />
          <Select onValueChange={setWaveform} value={waveform}>
            <SelectTrigger>
              <SelectValue placeholder="波形を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sine">サイン波</SelectItem>
              <SelectItem value="square">矩形波</SelectItem>
              <SelectItem value="sawtooth">のこぎり波</SelectItem>
              <SelectItem value="triangle">三角波</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="pt-6 pb-8 mb-4 transition-colors duration-200">
          <Label>
            リバーブ量: {reverbAmount.toFixed(2)}
          </Label>
          <Slider
            className='pt-6'
            min={0}
            max={1}
            step={0.01}
            value={[reverbAmount]}
            onValueChange={(value) => setReverbAmount(value[0])}
          />
        </div>
        <div className="pt-6 pb-8 mb-4 transition-colors duration-200">
          <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
            ディレイ時間: {delayTime.toFixed(2)}秒
          </label>
          <Slider
            className='pt-6'
            min={0}
            max={1}
            step={0.01}
            value={[delayTime]}
            onValueChange={(value) => setDelayTime(value[0])}
          />
        </div>
        <div
          ref={touchpadRef}
          className="w-full h-64 bg-white dark:bg-slate-950 border border-gray-700 rounded-lg cursor-none relative overflow-hidden"
          onMouseDown={handleInteraction}
          onMouseMove={handleInteraction}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleInteraction}
          onTouchMove={handleInteraction}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-6 h-6 rounded-full absolute"
            style={{
              left: `${pointerPosition.x}px`,
              top: `${pointerPosition.y}px`,
              backgroundColor: getPointerColor(),
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AmbientSynth;