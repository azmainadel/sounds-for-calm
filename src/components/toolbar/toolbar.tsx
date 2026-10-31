import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { StarterMixes } from '@/components/starter-mixes/starter-mixes';
import { BreathingExerciseModal } from '@/components/modals/breathing';
import { PresetsModal } from '@/components/modals/presets';
import { OPEN_PRESETS } from '@/constants/events';
import { useCloseListener } from '@/hooks/use-close-listener';
import { subscribe } from '@/lib/event';
import { closeModals } from '@/lib/modal';

import styles from './toolbar.module.css';

type ModalName = 'presets' | 'breathing';

export function Toolbar() {
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);
  const close = useCallback(() => setActiveModal(null), []);
  const open = useCallback((name: ModalName) => {
    closeModals();
    setActiveModal(name);
  }, []);

  useCloseListener(close);
  useHotkeys('shift+alt+p', () => open('presets'));
  useEffect(() => subscribe(OPEN_PRESETS, () => open('presets')), [open]);

  return (
    <>
      <nav aria-label="Mixes and relaxation" className={styles.wrapper}>
        <button
          className={styles.link}
          type="button"
          onClick={() => open('presets')}
        >
          Your mixes
        </button>
        <span aria-hidden="true" className={styles.separator}>
          ·
        </span>
        <StarterMixes triggerClassName={styles.link} />
        <span aria-hidden="true" className={styles.separator}>
          ·
        </span>
        <button
          className={styles.link}
          type="button"
          onClick={() => open('breathing')}
        >
          Breathing exercise
        </button>
      </nav>

      <PresetsModal show={activeModal === 'presets'} onClose={close} />
      <BreathingExerciseModal
        show={activeModal === 'breathing'}
        onClose={close}
      />
    </>
  );
}
