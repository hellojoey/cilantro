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
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-light text-stone-600 dark:text-stone-200 mb-2">Daily 30 Complete!</h2>
          <p className="text-stone-400 dark:text-stone-500 font-light mb-2">
            You've answered all 30 questions today.
          </p>
          {dailyStreak.count > 0 && (
            <p className="text-amber-500 font-medium mb-8">
              🔥 {dailyStreak.count} day streak
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="py-3 px-8 bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded-2xl font-light transition-all active:scale-[0.98]"
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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm"
              aria-label="Exit Daily 30"
            >
              ← exit
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Daily 30</span>
              {dailyStreak.count > 0 && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  🔥 {dailyStreak.count}
                </span>
              )}
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500" aria-label={`Question ${questionIndex + 1} of 30`}>
              {questionIndex + 1}/30
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="h-1 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={questionIndex + 1}
            aria-valuemin={0}
            aria-valuemax={30}
            aria-label="Daily 30 progress"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full"
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
