import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    show?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
}


const Modal: React.FC<ModalProps> = ({ show = false, onClose, children }) => {
    const [isMounted, setIsMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);



    const handleClose = useCallback(() => {
        if (onClose) {
            onClose();
        } else {
            console.error('Modal: onClose prop is not provided.');
        }
    }, [onClose]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleKeyDown);
        }


        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, handleClose]);


    if (!isMounted) {
        return null;
    }


    if (!show) {
        return null;
    }


    try {
        return ReactDOM.createPortal(
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center"
                 onClick={(e) => {
                   if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                        handleClose();
                    }
                 }}
                 >
                <div ref={modalRef} className="bg-white rounded shadow-lg p-6 z-60 relative max-w-2xl w-full m-4 overflow-auto">
                   <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="close"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                    {children}
                </div>
            </div>,
            document.body,
        );
    } catch (error) {
       console.error('Modal: Error rendering the modal:', error);
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded shadow-lg p-6">
                    <p className="text-error">Error rendering the modal.</p>
                </div>
            </div>
            );
    }
};


export default Modal;

if (import.meta.vitest) {
    const { describe, it, expect, vi } = import.meta.vitest;
    const { render, fireEvent, screen,  } = import('@testing-library/react');



    describe('Modal Component', () => {

        it('should render the modal when show is true', () => {
           render(
                 <Modal show={true}>
                    <div>Modal Content</div>
                </Modal>
            );

            expect(screen.getByText('Modal Content')).toBeInTheDocument();
            expect(screen.getByRole('dialog')).toBeInTheDocument();
           expect(screen.getByRole('button', {name: 'close'})).toBeInTheDocument()
            const modalOverlay = screen.getByRole('dialog').parentElement;
             expect(modalOverlay).toHaveClass('fixed');
             expect(modalOverlay).toHaveClass('bg-black');
             expect(modalOverlay).toHaveClass('bg-opacity-50');
              expect(modalOverlay).toHaveClass('z-50');
           expect(screen.getByRole('dialog')).toHaveClass('bg-white')
           expect(screen.getByRole('dialog')).toHaveClass('z-60')
        });


        it('should not render the modal when show is false', () => {
             const { container } = render(
                  <Modal show={false}>
                      <div>Modal Content</div>
                  </Modal>
             );
           expect(container).toBeEmptyDOMElement()
        });



        it('should call onClose when the overlay is clicked', () => {
            const onClose = vi.fn();
            render(
                <Modal show={true} onClose={onClose}>
                   <div>Modal Content</div>
               </Modal>
            );

            const modalOverlay = screen.getByRole('dialog').parentElement;
            fireEvent.click(modalOverlay);
             expect(onClose).toHaveBeenCalledTimes(1);

        });

        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
             render(
                <Modal show={true} onClose={onClose}>
                    <div>Modal Content</div>
                </Modal>
             );

            const closeButton = screen.getByRole('button', {name: 'close'});
            fireEvent.click(closeButton);
             expect(onClose).toHaveBeenCalledTimes(1);

        });




        it('should call onClose when the Escape key is pressed', async () => {
            const onClose = vi.fn();
            render(
                <Modal show={true} onClose={onClose}>
                    <div>Modal Content</div>
               </Modal>
           );

            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
             expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should handle missing onClose prop without crashing', () => {

             render(
                <Modal show={true}>
                    <div>Modal Content</div>
                </Modal>
            );
             const modalOverlay = screen.getByRole('dialog').parentElement;
             fireEvent.click(modalOverlay);


        });


       it('should render a default error message if there is an error rendering modal', () => {
            vi.spyOn(ReactDOM, 'createPortal').mockImplementation(() => {
                throw new Error('Portal rendering failed');
            });


           render(<Modal show={true}>
               <div>Modal Content</div>
           </Modal>);

            expect(screen.getByText('Error rendering the modal.')).toBeInTheDocument();
        });



        it('should render without children', () => {
          render(
              <Modal show={true} />
            );
           expect(screen.getByRole('dialog')).toBeInTheDocument();

        });

    });
}