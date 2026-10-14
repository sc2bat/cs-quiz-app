import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { Category, Question, Track } from '../../types';

type ChoiceDraft = { choiceText: string; isCorrect: boolean };

const emptyChoices = (): ChoiceDraft[] => [
  { choiceText: '', isCorrect: true },
  { choiceText: '', isCorrect: false },
  { choiceText: '', isCorrect: false },
  { choiceText: '', isCorrect: false },
];

export default function AdminQuestionsPage() {
  const { trackId: trackIdParam, categoryId: categoryIdParam } = useParams();
  const trackId = Number(trackIdParam);
  const categoryId = Number(categoryIdParam);

  const [track, setTrack] = useState<Track | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questionType, setQuestionType] = useState<'MULTIPLE' | 'SUBJECTIVE'>('MULTIPLE');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [choices, setChoices] = useState<ChoiceDraft[]>(emptyChoices);

  const resetForm = () => {
    setQuestionType('MULTIPLE');
    setQuestionText('');
    setExplanation('');
    setSubjectiveAnswer('');
    setChoices(emptyChoices());
  };

  const reload = async () => {
    setQuestions(await adminApi.listQuestions(categoryId));
  };

  useEffect(() => {
    if (!trackId || !categoryId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const tracks = await adminApi.listTracks();
        const foundTrack = tracks.find((t) => t.trackId === trackId) ?? null;
        if (cancelled) return;
        setTrack(foundTrack);
        if (!foundTrack) return;
        const cats = await adminApi.listCategories(trackId);
        const foundCat = cats.find((c) => c.categoryId === categoryId) ?? null;
        if (cancelled) return;
        setCategory(foundCat);
        if (foundCat) {
          setQuestions(await adminApi.listQuestions(categoryId));
        }
      } catch (e: unknown) {
        if (!cancelled) setError(adminApi.errMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackId, categoryId]);

  if (!trackId || !categoryId || (!loading && (!track || !category))) {
    return (
      <div className="error-panel">
        <div className="error">트랙/카테고리를 찾을 수 없습니다.</div>
        <Link className="next-btn" to="/admin">
          트랙 목록
        </Link>
      </div>
    );
  }

  const setCorrectIndex = (index: number) => {
    setChoices((prev) => prev.map((c, i) => ({ ...c, isCorrect: i === index })));
  };

  const submitQuestion = async () => {
    if (!questionText.trim()) {
      setError('문제 내용을 입력하세요.');
      return;
    }
    if (questionType === 'MULTIPLE') {
      const filled = choices.filter((c) => c.choiceText.trim());
      if (filled.length < 2) {
        setError('객관식 보기는 2개 이상 필요합니다.');
        return;
      }
      if (!filled.some((c) => c.isCorrect)) {
        setError('정답 보기를 하나 선택하세요.');
        return;
      }
    } else if (!subjectiveAnswer.trim()) {
      setError('주관식 정답을 입력하세요.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await adminApi.createQuestion({
        categoryId,
        questionType,
        questionText: questionText.trim(),
        explanation: explanation.trim(),
        subjectiveAnswer: questionType === 'SUBJECTIVE' ? subjectiveAnswer.trim() : null,
        choices:
          questionType === 'MULTIPLE'
            ? choices
                .filter((c) => c.choiceText.trim())
                .map((c) => ({
                  choiceText: c.choiceText.trim(),
                  isCorrect: c.isCorrect,
                }))
            : [],
      });
      setMessage('문제 등록 완료');
      resetForm();
      setShowForm(false);
      await reload();
    } catch (e: unknown) {
      setError(adminApi.errMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <nav className="admin-breadcrumb" aria-label="breadcrumb">
        <Link to="/admin">트랙</Link>
        <span aria-hidden>/</span>
        <Link to={`/admin/tracks/${trackId}`}>{track?.name}</Link>
        <span aria-hidden>/</span>
        <span className="admin-breadcrumb__current">{category?.name}</span>
      </nav>

      <header className="admin-header">
        <div>
          <h1>문제</h1>
          <p className="admin-hint">
            지금 추가하는 위치:{' '}
            <strong>
              {track?.name} → {category?.name}
            </strong>
          </p>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            setShowForm((v) => !v);
            setError('');
          }}
        >
          {showForm ? '닫기' : '+ 문제 추가'}
        </button>
      </header>

      {message && <p className="admin-msg">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">불러오는 중…</p>}

      {showForm && (
        <section className="admin-section admin-question-form">
          <h2>새 문제 등록</h2>
          <p className="admin-context-chip">
            {track?.name} / {category?.name}
          </p>

          <label className="admin-label">
            유형
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as 'MULTIPLE' | 'SUBJECTIVE')}
            >
              <option value="MULTIPLE">객관식</option>
              <option value="SUBJECTIVE">주관식</option>
            </select>
          </label>

          <label className="admin-label">
            문제
            <textarea
              rows={4}
              value={questionText}
              placeholder="문제 본문"
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </label>

          <label className="admin-label">
            해설 (선택)
            <textarea
              rows={2}
              value={explanation}
              placeholder="채점 후 보여줄 해설"
              onChange={(e) => setExplanation(e.target.value)}
            />
          </label>

          {questionType === 'SUBJECTIVE' ? (
            <label className="admin-label">
              정답
              <input
                value={subjectiveAnswer}
                placeholder="주관식 정답"
                onChange={(e) => setSubjectiveAnswer(e.target.value)}
              />
            </label>
          ) : (
            <fieldset className="admin-choices">
              <legend>보기 (정답 하나만 선택)</legend>
              {choices.map((choice, index) => (
                <div key={index} className="admin-choice-row">
                  <label className="admin-choice-correct">
                    <input
                      type="radio"
                      name="correct-choice"
                      checked={choice.isCorrect}
                      onChange={() => setCorrectIndex(index)}
                      aria-label={`보기 ${index + 1} 정답`}
                    />
                    정답
                  </label>
                  <input
                    className="admin-choice-text"
                    value={choice.choiceText}
                    placeholder={`보기 ${index + 1}`}
                    onChange={(e) =>
                      setChoices((prev) =>
                        prev.map((c, i) =>
                          i === index ? { ...c, choiceText: e.target.value } : c
                        )
                      )
                    }
                  />
                  <button
                    type="button"
                    className="ghost-btn"
                    disabled={choices.length <= 2}
                    onClick={() => {
                      setChoices((prev) => {
                        const next = prev.filter((_, i) => i !== index);
                        if (!next.some((c) => c.isCorrect) && next[0]) {
                          next[0] = { ...next[0], isCorrect: true };
                        }
                        return next;
                      });
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ghost-btn"
                onClick={() =>
                  setChoices((prev) => [...prev, { choiceText: '', isCorrect: false }])
                }
              >
                + 보기 추가
              </button>
            </fieldset>
          )}

          <button
            type="button"
            className="next-btn"
            disabled={saving}
            onClick={() => void submitQuestion()}
          >
            {saving ? '저장 중…' : '이 카테고리에 문제 저장'}
          </button>
        </section>
      )}

      <h2 className="admin-list-title">등록된 문제 ({questions.length})</h2>
      <ul className="admin-question-list">
        {questions.map((q) => (
          <li key={q.questionId} className="admin-question-item">
            <div>
              <span className="admin-question-item__type">{q.type}</span>
              <strong>
                #{q.questionId} {q.question}
              </strong>
              {q.choices?.length > 0 && (
                <ul className="admin-question-item__choices">
                  {q.choices.map((c) => (
                    <li key={c.choiceId} className={c.isCorrect ? 'is-correct' : undefined}>
                      {c.isCorrect ? '✓ ' : ''}
                      {c.choiceText}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              className="ghost-btn"
              onClick={async () => {
                if (
                  !confirm(
                    '이 문제를 비활성화할까요?\n(풀이 이력은 남기고, 출제 목록에서만 제외됩니다)'
                  )
                ) {
                  return;
                }
                try {
                  await adminApi.deleteQuestion(q.questionId);
                  setMessage('문제를 비활성화했습니다');
                  await reload();
                } catch (e: unknown) {
                  setError(adminApi.errMessage(e));
                }
              }}
            >
              비활성화
            </button>
          </li>
        ))}
      </ul>
      {!loading && questions.length === 0 && (
        <p className="admin-empty">아직 문제가 없습니다. “+ 문제 추가”로 등록하세요.</p>
      )}
    </>
  );
}
