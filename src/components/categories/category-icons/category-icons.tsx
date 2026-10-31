import { useEffect, useMemo } from 'react';
import { BiSearch, BiSolidHeart } from 'react-icons/bi/index';

import styles from './category-icons.module.css';

import { sounds } from '@/data/sounds';
import { OPEN_CATEGORY, OPEN_SOUND_SEARCH } from '@/constants/events';
import { dispatch } from '@/lib/event';
import { useSoundStore } from '@/stores/sound';

export default function CategoryIcons() {
  const soundState = useSoundStore(state => state.sounds);

  // Each Astro island has its own copy of the store, so this one rehydrates it from storage too
  useEffect(() => {
    useSoundStore.persist.rehydrate();
  }, []);

  const tiles = useMemo(() => {
    const categories = sounds.categories.map(category => ({
      icon: category.icon,
      id: category.id,
      ids: category.sounds.map(sound => sound.id),
      title: category.title,
    }));

    const favorites = Object.keys(soundState).filter(
      id => soundState[id].isFavorite,
    );

    if (!favorites.length) return categories;

    return [
      {
        icon: <BiSolidHeart />,
        id: 'favorites',
        ids: favorites,
        title: 'Favorites',
      },
      ...categories,
    ];
  }, [soundState]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Browse sounds</h2>
        <button
          className={styles.searchButton}
          type="button"
          onClick={() => dispatch(OPEN_SOUND_SEARCH)}
        >
          <BiSearch aria-hidden="true" />
          Search
        </button>
      </div>

      <nav aria-label="Sound categories" className={styles.categories}>
        {tiles.map(tile => {
          // Favorites duplicate other categories, so they don't show a count
          const selected =
            tile.id === 'favorites'
              ? 0
              : tile.ids.filter(id => soundState[id]?.isSelected).length;

          return (
            <button
              aria-haspopup="dialog"
              className={styles.category}
              key={tile.id}
              type="button"
              onClick={() => dispatch(OPEN_CATEGORY, tile.id)}
            >
              <span aria-hidden="true" className={styles.icon}>
                {tile.icon}
              </span>
              <span className={styles.label}>{tile.title}</span>
              {selected > 0 && (
                <span className={styles.count}>
                  {selected}
                  <span className={styles.srOnly}> selected</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
