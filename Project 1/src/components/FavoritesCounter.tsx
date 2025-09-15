import React from 'react';
import {useFavorites} from '../hooks/useFavorites';

interface FavoritesCounterProps {
  onClick?: () => void;
}

const FavoritesCounter: React.FC<FavoritesCounterProps> = ({onClick}) => {
  const {count} = useFavorites();
  return (
    <button
      type="button"
      className="favorites-counter"
      aria-label={`Favorites count: ${count}`}
      onClick={onClick}
      title="Show favorites"
    >
      ♡ {count}
    </button>
  );
};

export default FavoritesCounter;

