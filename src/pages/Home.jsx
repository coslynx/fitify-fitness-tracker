import React from 'react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-4 text-gray-700">
        Welcome to Fitness Tracker!
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Track your fitness goals, monitor your progress, and share your achievements with friends.
      </p>
    </div>
  );
};

export default Home;

if (import.meta.vitest) {
    const { describe, it, expect, screen } = import.meta.vitest;
    const { render } = import('@testing-library/react');

    describe('Home Component', () => {
        it('should render the welcome message correctly', () => {
            render(<Home />);
            expect(screen.getByText('Welcome to Fitness Tracker!')).toBeInTheDocument();
        });
    });
}