import React, { useState, useRef } from 'react';
import { Bell, BellRing, Trophy, X } from 'lucide-react';
import { socket } from '../lib/api';
import { useEffect } from 'react';

// Using mock data as we don't have a backend initialized in this session yet
const MOCK_BRACKET_DATA = {
  rounds: [
    {
      roundNumber: 1,
      roundName: "Round 1",
      matches: [
        {
          matchId: "T1M1",
          position: 1,
          playerA: { uid: '1', name: 'Ahmad', flag: '🇧🇷', avatar: '' },
          playerB: { uid: '2', name: 'Rahul', flag: '🇦🇷', avatar: '' },
          scoreA: 2,
          scoreB: 1,
          winner: 'A',
          status: "completed"
        },
        {
          matchId: "T1M2",
          position: 2,
          playerA: { uid: '3', name: 'Karim', flag: '🇫🇷', avatar: '' },
          playerB: { uid: '4', name: 'Sakib', flag: '🇵🇹', avatar: '' },
          scoreA: null,
          scoreB: null,
          winner: null,
          status: "pending"
        }
      ]
    },
    {
      roundNumber: 2,
      roundName: "Semi Final",
      matches: [
        {
          matchId: "T1M3",
          position: 1,
          playerA: { uid: '1', name: 'Ahmad', flag: '🇧🇷', avatar: '' },
          playerB: null,
          scoreA: null,
          scoreB: null,
          winner: null,
          status: "pending"
        }
      ]
    },
    {
      roundNumber: 3,
      roundName: "Final",
      matches: [
        {
          matchId: "T1M4",
          position: 1,
          playerA: null,
          playerB: null,
          scoreA: null,
          scoreB: null,
          winner: null,
          status: "pending"
        }
      ]
    }
  ],
  champion: null
};

export default function Bracket() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [notifiedMatches, setNotifiedMatches] = useState<Record<string, boolean>>({});

  const toggleNotification = (matchId: string) => {
    setNotifiedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const bracketData = MOCK_BRACKET_DATA; // Replace with Firebase data listener later

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current) {
      setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const renderSlot = (player: any, score: any, state: string) => {
    if (!player) {
      return (
        <div className={`bracket-slot pending`}>
          <span className="slot-flag">⏳</span>
          <span className="slot-name">TBD</span>
          <span className="slot-score">?</span>
        </div>
      );
    }
    
    return (
      <div className={`bracket-slot ${state}`}>
        <div className="slot-avatar" style={{ background: '#333' }}></div>
        <span className="slot-flag">{player.flag || '🏴'}</span>
        <span className="slot-name">{player.name}</span>
        <span className="slot-score">{score !== null ? score : '-'}</span>
      </div>
    );
  };

  return (
    <div className="bracket-container">
      <div 
        className="bracket-scroll-wrapper" 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="bracket-tree">
          
          {bracketData.rounds.map((round, roundIndex) => (
            <div key={round.roundNumber} className="bracket-round" data-round={round.roundNumber}>
              <div className="round-label">{round.roundName}</div>
              <div className="round-matches">
                
                {round.matches.map((match) => (
                  <div key={match.matchId} className="bracket-match-group">
                    <div className="bracket-match" onClick={() => setSelectedMatch(match)}>
                      {renderSlot(match.playerA, match.scoreA, match.winner === 'A' ? 'winner' : match.winner === 'B' ? 'loser' : match.playerA ? 'active' : 'pending')}
                      {renderSlot(match.playerB, match.scoreB, match.winner === 'B' ? 'winner' : match.winner === 'A' ? 'loser' : match.playerB ? 'active' : 'pending')}
                    </div>
                    
                    {roundIndex < bracketData.rounds.length - 1 && (
                      <div className={`bracket-connector ${match.winner ? 'connector-active' : ''}`}>
                        <div className="connector-top"></div>
                        <div className="connector-vertical"></div>
                        <div className="connector-bottom"></div>
                        <div className="connector-right"></div>
                      </div>
                    )}
                  </div>
                ))}
                
              </div>
            </div>
          ))}

          <div className="bracket-champion">
            <div className={`champion-box ${bracketData.champion ? 'crowned' : ''}`}>
              <span className="champion-trophy"><Trophy size={16} color="#ffd700" /></span>
              <div className="champion-label">CHAMPION</div>
              <div className="champion-name">
                {bracketData.champion ? (bracketData.champion as any).name : 'TBD'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {selectedMatch && (
        <div className="match-tooltip">
          <div className="tooltip-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>MATCH {selectedMatch.matchId}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => toggleNotification(selectedMatch.matchId)}
                style={{ background: 'transparent', border: 'none', color: notifiedMatches[selectedMatch.matchId] ? '#00e5ff' : '#CBD5E1', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                title={notifiedMatches[selectedMatch.matchId] ? "Notifications On" : "Turn On Notifications"}
              >
                {notifiedMatches[selectedMatch.matchId] ? <BellRing size={16} /> : <Bell size={16} />}
              </button>
              <button onClick={() => setSelectedMatch(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
          </div>
          <div className="tooltip-vs">
            <span>{selectedMatch.playerA?.name || 'TBD'}</span>
            <span className="vs-text">VS</span>
            <span>{selectedMatch.playerB?.name || 'TBD'}</span>
          </div>
          {selectedMatch.winner ? (
            <div className="tooltip-score">
              {selectedMatch.scoreA} — {selectedMatch.scoreB}
            </div>
          ) : (
            <div className="tooltip-pending">Match Pending</div>
          )}
          <div className="tooltip-code">
            Code: {selectedMatch.matchId}
          </div>
        </div>
      )}
    </div>
  );
}
