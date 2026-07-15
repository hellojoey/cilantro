import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { gardens } from '../data/questions';
import GardenContentCard from './GardenContentCard';

export default function GardenDetail() {
  const navigate = useNavigate();
  const { gardenId } = useParams();
  const { handleGardenAnswer, handleGardenContinue, isGardenUnlocked } = useCilantro();

  const garden = gardens.find(g => g.id === gardenId);
  const [itemIndex, setItemIndex] = useState(0);
  const [localTransitioning, setLocalTransitioning] = useState(false);

  // Guard: if garden not found or not unlocked, redirect
  if (!garden || !isGardenUnlocked(gardenId)) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6">
        <p className="text-sub mb-4">Garden not available</p>
        <button
          onClick={() => navigate('/gardens')}
          className="text-sm text-ink hover:text-deep underline font-rounded font-semibold"
        >
          back to gardens
        </button>
      </div>
    );
  }

  const progress = ((itemIndex + 1) / garden.items.length) * 100;
  const currentItem = garden.items[itemIndex];

  const onAnswer = (answer) => {
    setLocalTransitioning(true);
    const completed = handleGardenAnswer(garden, itemIndex, answer);

    setTimeout(() => {
      if (completed) {
        navigate('/gardens');
      } else {
        setItemIndex(prev => prev + 1);
      }
      setLocalTransitioning(false);
    }, 400);
  };

  const onContinue = () => {
    setLocalTransitioning(true);
    const completed = handleGardenContinue(garden, itemIndex);

    setTimeout(() => {
      if (completed) {
        navigate('/gardens');
      } else {
        setItemIndex(prev => prev + 1);
      }
      setLocalTransitioning(false);
    }, 400);
  };

  const onSkip = () => {
    setLocalTransitioning(true);
    setTimeout(() => {
      if (itemIndex >= garden.items.length - 1) {
        navigate('/gardens');
      } else {
        setItemIndex(prev => prev + 1);
      }
      setLocalTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/gardens')}
              className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
              aria-label="Exit garden"
            >
              ← exit garden
            </button>
            <span className="text-xs text-sub" aria-label={`Item ${itemIndex + 1} of ${garden.items.length}`}>
              {itemIndex + 1} / {garden.items.length}
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="h-1 bg-soft rounded-full overflow-hidden retint"
            role="progressbar"
            aria-valuenow={itemIndex + 1}
            aria-valuemin={0}
            aria-valuemax={garden.items.length}
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
          <GardenContentCard
            item={currentItem}
            gardenColor={garden.color}
            gardenLabel={`${garden.icon} ${garden.name}`}
            isTransitioning={localTransitioning}
            onYes={() => onAnswer('yes')}
            onNo={() => onAnswer('no')}
            onContinue={onContinue}
            onSkip={onSkip}
          />
        </div>
      </main>
    </div>
  );
}
