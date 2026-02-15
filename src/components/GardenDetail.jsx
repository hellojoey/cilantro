import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { gardens } from '../data/questions';
import QuestionCard from './QuestionCard';

export default function GardenDetail() {
  const navigate = useNavigate();
  const { gardenId } = useParams();
  const { handleGardenAnswer, isGardenUnlocked, isTransitioning } = useCilantro();

  const garden = gardens.find(g => g.id === gardenId);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [localTransitioning, setLocalTransitioning] = useState(false);

  // Guard: if garden not found or not unlocked, redirect
  if (!garden || !isGardenUnlocked(gardenId)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col items-center justify-center px-6">
        <p className="text-stone-400 dark:text-stone-500 font-light mb-4">Garden not available</p>
        <button
          onClick={() => navigate('/gardens')}
          className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 underline"
        >
          back to gardens
        </button>
      </div>
    );
  }

  const progress = ((questionIndex + 1) / garden.questions.length) * 100;
  const currentQ = garden.questions[questionIndex];

  const onAnswer = (answer) => {
    setLocalTransitioning(true);
    const completed = handleGardenAnswer(garden, questionIndex, answer);

    setTimeout(() => {
      if (completed) {
        navigate('/gardens');
      } else {
        setQuestionIndex(prev => prev + 1);
      }
      setLocalTransitioning(false);
    }, 400);
  };

  const onSkip = () => {
    setLocalTransitioning(true);
    setTimeout(() => {
      if (questionIndex >= garden.questions.length - 1) {
        navigate('/gardens');
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
              onClick={() => navigate('/gardens')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm"
              aria-label="Exit garden"
            >
              ← exit garden
            </button>
            <span className="text-xs text-stone-400 dark:text-stone-500" aria-label={`Question ${questionIndex + 1} of ${garden.questions.length}`}>
              {questionIndex + 1} / {garden.questions.length}
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="h-1 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={questionIndex + 1}
            aria-valuemin={0}
            aria-valuemax={garden.questions.length}
            aria-label={`${garden.name} progress`}
          >
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%`, backgroundColor: garden.color }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="max-w-sm w-full">
          <QuestionCard
            question={currentQ.text}
            color={garden.color}
            label={`${garden.icon} ${garden.name}`}
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
