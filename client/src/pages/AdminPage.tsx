import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { useAuth, getTokenRole } from '../auth/AuthContext';
import type { Category, Question, Track } from '../types';

export default function AdminPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isAdmin = getTokenRole() === 'ADMIN';

  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackId, setTrackId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [trackForm, setTrackForm] = useState({
    slug: '',
    name: '',
    description: '',
  });
  const [categoryName, setCategoryName] = useState('');
  const [questionForm, setQuestionForm] = useState({
    questionType: 'MULTIPLE',
    questionText: '',
    explanation: '',
    subjectiveAnswer: '',
    choicesText: '보기1|false\n보기2|true\n보기3|false\n보기4|false',
  });

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.listTracks();
        if (cancelled) return;
        setTracks(data);
        setTrackId((prev) => prev || data[0]?.trackId || '');
      } catch (e: unknown) {
        if (!cancelled) setError(adminApi.errMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    if (!trackId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.listCategories(Number(trackId));
        if (cancelled) return;
        setCategories(data);
        setCategoryId(data[0]?.categoryId ?? '');
      } catch (e: unknown) {
        if (!cancelled) setError(adminApi.errMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.listQuestions(Number(categoryId));
        if (cancelled) return;
        setQuestions(data);
      } catch (e: unknown) {
        if (!cancelled) setError(adminApi.errMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const visibleQuestions = categoryId ? questions : [];

  if (!isLoggedIn) {
    return (
      <div className="error-panel">
        <div>로그인이 필요합니다.</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="error-panel">
        <div className="error">ADMIN 권한이 필요합니다. (docs/ADMIN.md 참고)</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <button type="button" className="link-btn" onClick={() => navigate('/')}>
        ← 홈
      </button>
      <h1>Admin</h1>
      {message && <p className="admin-msg">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="admin-section">
        <h2>Tracks</h2>
        <div className="admin-form">
          <input
            placeholder="slug"
            value={trackForm.slug}
            onChange={(e) => setTrackForm({ ...trackForm, slug: e.target.value })}
          />
          <input
            placeholder="name"
            value={trackForm.name}
            onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
          />
          <input
            placeholder="description"
            value={trackForm.description}
            onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
          />
          <button
            type="button"
            className="next-btn"
            onClick={async () => {
              try {
                setError('');
                await adminApi.createTrack(trackForm);
                setMessage('트랙 생성 완료');
                setTrackForm({ slug: '', name: '', description: '' });
                const data = await adminApi.listTracks();
                setTracks(data);
              } catch (e: unknown) {
                setError(adminApi.errMessage(e));
              }
            }}
          >
            트랙 추가
          </button>
        </div>
        <ul>
          {tracks.map((t) => (
            <li key={t.trackId}>
              #{t.trackId} {t.slug} — {t.name}{' '}
              <button
                type="button"
                className="ghost-btn"
                onClick={async () => {
                  if (!confirm('삭제할까요? (하위 카테고리/문제 FK 주의)')) return;
                  try {
                    await adminApi.deleteTrack(t.trackId);
                    const data = await adminApi.listTracks();
                    setTracks(data);
                  } catch (e: unknown) {
                    setError(adminApi.errMessage(e));
                  }
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Categories</h2>
        <select
          value={trackId}
          onChange={(e) => setTrackId(e.target.value ? Number(e.target.value) : '')}
        >
          {tracks.map((t) => (
            <option key={t.trackId} value={t.trackId}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="admin-form">
          <input
            placeholder="category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button
            type="button"
            className="next-btn"
            onClick={async () => {
              if (!trackId || !categoryName) return;
              try {
                await adminApi.createCategory({ trackId: Number(trackId), name: categoryName });
                setCategoryName('');
                const data = await adminApi.listCategories(Number(trackId));
                setCategories(data);
                setMessage('카테고리 생성 완료');
              } catch (e: unknown) {
                setError(adminApi.errMessage(e));
              }
            }}
          >
            카테고리 추가
          </button>
        </div>
        <ul>
          {categories.map((c) => (
            <li key={c.categoryId}>
              #{c.categoryId} {c.name}{' '}
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setCategoryId(c.categoryId)}
              >
                선택
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={async () => {
                  if (!confirm('삭제할까요?')) return;
                  try {
                    await adminApi.deleteCategory(c.categoryId);
                    const data = await adminApi.listCategories(Number(trackId));
                    setCategories(data);
                  } catch (e: unknown) {
                    setError(adminApi.errMessage(e));
                  }
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Questions (category #{categoryId || '-'})</h2>
        <div className="admin-form admin-form--col">
          <select
            value={questionForm.questionType}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, questionType: e.target.value })
            }
          >
            <option value="MULTIPLE">MULTIPLE</option>
            <option value="SUBJECTIVE">SUBJECTIVE</option>
          </select>
          <textarea
            rows={3}
            placeholder="question text"
            value={questionForm.questionText}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, questionText: e.target.value })
            }
          />
          <textarea
            rows={2}
            placeholder="explanation"
            value={questionForm.explanation}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, explanation: e.target.value })
            }
          />
          {questionForm.questionType === 'SUBJECTIVE' ? (
            <input
              placeholder="subjective answer"
              value={questionForm.subjectiveAnswer}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, subjectiveAnswer: e.target.value })
              }
            />
          ) : (
            <textarea
              rows={4}
              placeholder={'choiceText|isCorrect (한 줄에 하나)\n예: TCP|true'}
              value={questionForm.choicesText}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, choicesText: e.target.value })
              }
            />
          )}
          <button
            type="button"
            className="next-btn"
            disabled={!categoryId}
            onClick={async () => {
              if (!categoryId) return;
              try {
                const choices =
                  questionForm.questionType === 'MULTIPLE'
                    ? questionForm.choicesText
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [choiceText, flag] = line.split('|');
                          return {
                            choiceText: (choiceText || '').trim(),
                            isCorrect: String(flag).trim().toLowerCase() === 'true',
                          };
                        })
                    : [];
                await adminApi.createQuestion({
                  categoryId: Number(categoryId),
                  questionType: questionForm.questionType,
                  questionText: questionForm.questionText,
                  explanation: questionForm.explanation,
                  subjectiveAnswer:
                    questionForm.questionType === 'SUBJECTIVE'
                      ? questionForm.subjectiveAnswer
                      : null,
                  choices,
                });
                setMessage('문제 생성 완료');
                setQuestions(await adminApi.listQuestions(Number(categoryId)));
              } catch (e: unknown) {
                setError(adminApi.errMessage(e));
              }
            }}
          >
            문제 추가
          </button>
        </div>
        <ul>
          {visibleQuestions.map((q) => (
            <li key={q.questionId}>
              #{q.questionId} [{q.type}] {q.question.slice(0, 60)}
              ...
              <button
                type="button"
                className="ghost-btn"
                onClick={async () => {
                  if (!confirm('삭제할까요?')) return;
                  try {
                    await adminApi.deleteQuestion(q.questionId);
                    setQuestions(await adminApi.listQuestions(Number(categoryId)));
                  } catch (e: unknown) {
                    setError(adminApi.errMessage(e));
                  }
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
