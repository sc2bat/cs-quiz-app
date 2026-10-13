import type { Track } from '../types';

interface Props {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  onSelect: (track: Track) => void;
}

export default function TrackSelect({ tracks, loading, error, onSelect }: Props) {
  if (loading) return <div className="loading">트랙 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (tracks.length === 0) return <div>등록된 트랙이 없습니다.</div>;

  return (
    <div className="track-select">
      <h1 className="track-select__title">학습 트랙 선택</h1>
      <p className="track-select__subtitle">
        CS 면접, 정보처리기사 등 공부할 트랙을 고르세요.
      </p>
      <ul className="track-list">
        {tracks.map((track) => (
          <li key={track.trackId}>
            <button
              type="button"
              className="track-card"
              onClick={() => onSelect(track)}
            >
              <span className="track-card__name">{track.name}</span>
              {track.description && (
                <span className="track-card__desc">{track.description}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
