import { Modal, ModalHeader, ModalTitle } from '@/components/modal';
import { Sounds } from '@/components/sounds';

import styles from './category-dialog.module.css';

import type { Categories } from '@/data/types';

interface CategoryDialogProps {
  activeId: string | null;
  categories: Categories;
  onClose: () => void;
}

/**
 * Shows one category's sounds in a dialog.
 *
 * Every category stays mounted (`persist`) because each sound card owns its audio:
 * unmounting a category would stop whatever is playing from it.
 */
export function CategoryDialog({
  activeId,
  categories,
  onClose,
}: CategoryDialogProps) {
  const active = categories.find(category => category.id === activeId);

  return (
    <Modal persist show={!!active} wide onClose={onClose}>
      {categories.map(category => (
        <section
          aria-label={category.title}
          hidden={category.id !== active?.id}
          key={category.id}
        >
          <ModalHeader className={styles.header}>
            <ModalTitle className={styles.title}>
              <span aria-hidden="true" className={styles.icon}>
                {category.icon}
              </span>
              {category.title}
            </ModalTitle>
          </ModalHeader>

          <Sounds
            functional={category.id !== 'favorites'}
            id={category.id}
            sounds={category.sounds}
          />
        </section>
      ))}
    </Modal>
  );
}
