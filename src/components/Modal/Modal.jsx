import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'; // Needed for createPortal
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa'; // Close icon
import styles from './Modal.module.css';

// Animation variants for Framer Motion
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title = null, // Optional title for the modal
  className = '', // Optional class for the modal content div
}) => {
  // Effect to handle Escape key press to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]); // Re-run effect if isOpen or onClose changes

  // Prevent rendering if not open
  if (!isOpen) {
    return null;
  }

  // Use createPortal to render the modal outside of the main component tree
  // This helps avoid z-index issues and keeps the DOM cleaner
  return ReactDOM.createPortal(
    <AnimatePresence mode="wait"> {/* mode="wait" ensures exit animation completes before entry */}
      {isOpen && ( // Conditionally render based on isOpen for AnimatePresence
        <motion.div
          className={styles.overlay}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // Close modal if overlay is clicked
        >
          <motion.div
            className={`${styles.modalContent} ${className}`}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            {/* Optional Header with Title and Close Button */}
            {(title || onClose) && ( // Show header if title exists or close function exists
              <div className={styles.modalHeader}>
                {title && <h3 className={styles.modalTitle}>{title}</h3>}
                {onClose && ( // Only show close button if onClose function is provided
                  <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal" // Accessibility
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            )}

            {/* Modal Body Content */}
            <div className={styles.modalBody}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // Render the portal directly into the document body
  );
};

export default Modal;