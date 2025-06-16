import React, { useRef, useState, useEffect } from 'react';
import './SyncedYouTubePlayers.css';
import YouTube from 'react-youtube';

const videoGroups = [
  {
    label: 'Foo Fighter - Walking after You',
    videoId1: 'iwcL46pc7JE',
    videoId2: '91GAY4vdHzw',
    start1: 0,
    start2: 1,
  },
  {
    label: 'Rolling Stones - Wild Horses',
    videoId1: 'I_2NjhPae2Q',
    videoId2: 'L2lC5LrmLWY',
    start1: 0,
    start2: 1,
  },
];

const SyncedYouTubePlayers = () => {
  const player1Ref = useRef(null);
  const player2Ref = useRef(null);
  const syncIntervalRef = useRef(null);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [ready, setReady] = useState({ player1: false, player2: false });
  const [isPlaying, setIsPlaying] = useState(false);

  const currentGroup = videoGroups[currentGroupIndex];

  useEffect(() => {
    // Reset when switching groups
    setReady({ player1: false, player2: false });
    setIsPlaying(false);
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, [currentGroupIndex]);

  const onReady = (playerNum) => (event) => {
    const player = event.target;
    if (playerNum === 1) {
      player1Ref.current = player;
      setReady((prev) => ({ ...prev, player1: true }));
    } else {
      player2Ref.current = player;
      setReady((prev) => ({ ...prev, player2: true }));
    }
  };

  const syncAndPlay = () => {
    if (!ready.player1 || !ready.player2) {
      alert("Please wait, videos not ready.");
      return;
    }

    // Seek to new start points if not already playing
    if (!isPlaying) {
      player1Ref.current.seekTo(currentGroup.start1);
      player2Ref.current.seekTo(currentGroup.start2);
    }

    player1Ref.current.playVideo();
    player2Ref.current.playVideo();
    setIsPlaying(true);

    syncIntervalRef.current = setInterval(() => {
      const t1 = player1Ref.current.getCurrentTime();
      const t2 = player2Ref.current.getCurrentTime();
      if (Math.abs(t1 - t2) > 0.2) {
        const target = Math.max(t1, t2);
        player1Ref.current.seekTo(target, true);
        player2Ref.current.seekTo(target, true);
      }
    }, 1000);
  };

  const stopBoth = () => {
    if (!ready.player1 || !ready.player2) return;

    player1Ref.current.pauseVideo();
    player2Ref.current.pauseVideo();
    setIsPlaying(false);

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  const switchGroup = () => {
    setCurrentGroupIndex((prev) => (prev + 1) % videoGroups.length);
  };

  const opts = {
    height: '410',
    width: '720',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
    },
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2 style={{ textAlign: 'center', margin: '6rem' }}>{videoGroups[currentGroupIndex].label}</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <YouTube 
          key={currentGroup.videoId1} 
          videoId={currentGroup.videoId1} 
          opts={opts} onReady={onReady(1)}        
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} 
        />
        <YouTube 
          key={currentGroup.videoId2} 
          videoId={currentGroup.videoId2} 
          opts={opts} onReady={onReady(2)}   
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} 
        />
      </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={syncAndPlay} className="button">
            ▶️ Play Both
          </button>
          <button onClick={stopBoth} className="button">
            ⏹️ Stop Both
          </button>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={switchGroup} className="button button-small">
            🔁 Switch Group
          </button>
        </div>
    </div>
  );
};

export default SyncedYouTubePlayers;
