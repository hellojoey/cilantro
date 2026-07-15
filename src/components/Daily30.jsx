import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import QuestionCard from './QuestionCard';

export default function Daily30() {
  const navigate = useNavigate();
  const { dailyQuestions, dailyAnswered, dailyStreak, handleDaily30Answer } = useCilantro();

  const [questionIndex, setQuestionIndex] = useState(dailyAnswered.count);
  const [localTransitioning, setLocalTransitioning] = useState(false);

  // Already completed
  if (dailyAnswered.count >= 30) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 retint">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-rounded font-semibold text-deep mb-2 retint">Daily 30 Complete!</h2>
          <p className="text-sub mb-2">
            You've answered all 30 questions today.
          </p>
          {dailyStreak.count > 0 && (
            <p className="mb-8">
              <span className="inline-block bg-soft text-deep font-bold rounded-full px-3 py-1 text-xs retint">
                🔥 {dailyStreak.count} day streak
              </span>
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="py-4 px-11 bg-deep text-canvas font-rounded font-semibold rounded-[18px] shadow-ledge transition-all hover:translate-y-[2px] hover:shadow-ledge-sm active:scale-[0.98] retint"
          >
            back to home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = dailyQuestions[questionIndex];
  const progress = ((questionIndex + 1) / 30) * 100;

  if (!currentQ) {
    navigate('/');
    return null;
  }

  const onAnswer = (answer) => {
    setLocalTransitioning(true);
    const completed = handleDaily30Answer(questionIndex, answer);

    setTimeout(() => {
      if (completed) {
        // Let state update, then component will re-render to completion screen
        setQuestionIndex(30);
      } else {
        setQuestionIndex(prev => prev + 1);
      }
      setLocalTransitioning(false);
    }, 400);
  };

  const onSkip = () => {
    setLocalTransitioning(true);
    setTimeout(() => {
      if (questionIndex >= 29) {
        navigate('/');
      } else {
        setQuestionIndex(prev => prev + 1);
      }
      setLocalTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col retint">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-sub hover:text-ink transition-colors text-sm retint"
              aria-label="Exit Daily 30"
            >
              ← exit
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink retint">Daily 30</span>
              {dailyStreak.count > 0 && (
                <span className="text-[11px] bg-soft text-deep font-bold px-2.5 py-0.5 rounded-full retint">
                  🔥 {dailyStreak.count}
                </span>
              )}
            </div>
            <span className="text-xs text-sub retint" aria-label={`Question ${questionIndex + 1} of 30`}>
              {questionIndex + 1}/30
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="h-1 bg-soft rounded-full overflow-hidden retint"
            role="progressbar"
            aria-valuenow={questionIndex + 1}
            aria-valuemin={0}
            aria-valuemax={30}
            aria-label="Daily 30 progress"
          >
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full retint"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="max-w-sm w-full">
          <QuestionCard
            question={currentQ.text}
            vibe={currentQ.vibe}
            isTransitioning={localTransitioning}
            onYes={() => onAnswer('yes')}
            onNo={() => onAnswer('no')}
            onSkip={onSkip}
          />
        </div>
      </main>
    </div>
  );
}
