import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BiSolidHeart } from 'react-icons/bi/index';
import { Howler } from 'howler';

import { useSoundStore } from '@/stores/sound';

import { StoreConsumer } from '@/components/store-consumer';
import { Buttons } from '@/components/buttons';
import { CategoryDialog } from '@/components/categories/category-dialog';
import { SoundSearch } from '@/components/sound-search/sound-search';
import { Toolbar } from '@/components/toolbar';
import { SnackbarProvider } from '@/contexts/snackbar';
import { MediaControls } from '@/components/media-controls';
import { OPEN_CATEGORY } from '@/constants/events';
import { useCloseListener } from '@/hooks/use-close-listener';
import { subscribe } from '@/lib/event';
import { closeModals } from '@/lib/modal';

import { sounds } from '@/data/sounds';

import styles from './app.module.css';

import type { Sound } from '@/data/types';

export function App() {
  const categories = useMemo(() => sounds.categories, []);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const favorites = useSoundStore(useShallow(state => state.getFavorites()));

  const favoriteSounds = useMemo(() => {
    const favoriteSounds = categories
      .map(category => category.sounds)
      .flat()
      .filter(sound => favorites.includes(sound.id));

    /**
     * Reorder based on the order of favorites
     */
    return favorites.map(favorite =>
      favoriteSounds.find(sound => sound.id === favorite),
    );
  }, [favorites, categories]);

  useEffect(() => {
    const onChange = () => {
      const { ctx } = Howler;

      if (ctx && !document.hidden) {
        setTimeout(() => {
          ctx.resume();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', onChange, false);

    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  // Category tiles open their sounds in a dialog; opening one closes any other modal
  useEffect(
    () =>
      subscribe<string>(OPEN_CATEGORY, id => {
        closeModals();
        setOpenCategory(id);
      }),
    [],
  );

  useCloseListener(useCallback(() => setOpenCategory(null), []));

  const allCategories = useMemo(() => {
    const favorites = [];

    if (favoriteSounds.length) {
      favorites.push({
        icon: <BiSolidHeart />,
        id: 'favorites',
        sounds: favoriteSounds as Array<Sound>,
        title: 'Favorites',
      });
    }

    return [...favorites, ...categories];
  }, [favoriteSounds, categories]);

  return (
    <SnackbarProvider>
      <StoreConsumer>
        <MediaControls />

        <div className={styles.stage}>
          <Buttons />
        </div>

        <CategoryDialog
          activeId={openCategory}
          categories={allCategories}
          onClose={() => setOpenCategory(null)}
        />

        <Toolbar />
        <SoundSearch />
      </StoreConsumer>
    </SnackbarProvider>
  );
}
