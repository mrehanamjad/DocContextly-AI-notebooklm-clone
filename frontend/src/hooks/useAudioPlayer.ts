import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface AudioPlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  error: string | null;
  isBuffering: boolean;
}

export interface AudioPlayerControls {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  seekRelative: (amount: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  cyclePlaybackRate: () => void;
  reset: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onWaiting: () => void;
  onPlaying: () => void;
  onError: () => void;
}

export function useAudioPlayer(
  audioUrl: string | undefined | null,
): [AudioPlayerState, AudioPlayerControls] {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1.0);
  const [muted, setMutedState] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Handle URL changes - reset state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsBuffering(false);
  }, [audioUrl]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    setError(null);

    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } catch (err) {
      console.error("Audio playback failed:", err);
      const msg = "Playback failed. The browser may have blocked it or the audio URL is invalid.";
      setError(msg);
      toast.error(msg);
      setPlaying(false);
    }
  }, []);

  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current) return;
      const validTime = Math.max(0, Math.min(time, audioRef.current.duration || duration));
      audioRef.current.currentTime = validTime;
      setCurrentTime(validTime);
    },
    [duration],
  );

  const seekRelative = useCallback(
    (amount: number) => {
      if (!audioRef.current) return;
      const newTime = audioRef.current.currentTime + amount;
      seek(newTime);
    },
    [seek],
  );

  const setVolume = useCallback((val: number) => {
    const validVolume = Math.max(0, Math.min(val, 1));
    setVolumeState(validVolume);
    setMutedState(validVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = validVolume;
      audioRef.current.muted = validVolume === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = nextMuted;
      }
      return nextMuted;
    });
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRateState((prev) => {
      const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
      const currentIndex = rates.indexOf(prev);
      const nextRate = rates[(currentIndex + 1) % rates.length];

      if (audioRef.current) {
        audioRef.current.playbackRate = nextRate;
      }
      return nextRate;
    });
  }, []);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
    setCurrentTime(0);
    setError(null);
    setIsBuffering(false);
  }, []);

  const onPlay = useCallback(() => setPlaying(true), []);
  const onPause = useCallback(() => setPlaying(false), []);
  const onEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, []);
  const onTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);
  const onLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);
  const onWaiting = useCallback(() => setIsBuffering(true), []);
  const onPlaying = useCallback(() => setIsBuffering(false), []);
  const onError = useCallback(() => {
    console.error("Audio element error");
    const msg = "Failed to load audio.";
    setError(msg);
    toast.error(msg);
    setPlaying(false);
    setIsBuffering(false);
  }, []);

  const state: AudioPlayerState = {
    playing,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    error,
    isBuffering,
  };

  const controls: AudioPlayerControls = {
    audioRef,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    cyclePlaybackRate,
    reset,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onWaiting,
    onPlaying,
    onError,
  };

  return [state, controls];
}
