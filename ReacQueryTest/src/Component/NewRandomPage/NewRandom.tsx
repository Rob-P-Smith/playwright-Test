import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NewRandom = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const generateNewRandom = useMutation({
    mutationFn: async () => {
      const response = await fetch('http://localhost:3000/api/generate-random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate a new random number');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the randomNumbers query to refresh data
      queryClient.invalidateQueries({ queryKey: ['randomNumbers'] });
      // Redirect to home page
      navigate('/');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await generateNewRandom.mutateAsync();
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-random-container">
      <h2>Generate New Random Number</h2>
      <p>Click the button below to generate a new random number and return to the home page.</p>
      
      <button 
        onClick={handleGenerateClick} 
        disabled={isLoading}
        className="generate-button"
      >
        {isLoading ? 'Generating...' : 'Generate New Random Number'}
      </button>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default NewRandom;