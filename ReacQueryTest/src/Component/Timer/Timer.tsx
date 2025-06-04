import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface RandomNumber {
  key: string;
  value: number;
}

const Timer = () => {
  const queryClient = useQueryClient();

  // Fetch random numbers query
  const { isPending, error, data } = useQuery<RandomNumber[]>({
    queryKey: ["randomNumbers"], // Fixed spelling from randomNumbres to randomNumbers
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/random-numbers");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  // Generate new random number mutation
  const generateNewRandom = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "http://localhost:3000/api/generate-random",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate a new random number");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ["randomNumbers"] });
    },
  });

  // Delete random number mutation
  const deleteRandom = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(
        `http://localhost:3000/api/random-numbers/${key}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete random number");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ["randomNumbers"] });
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (data) {
    return (
      <>
        <div>
          <p>Timer Component</p>
          <div className="button-group">
            <Link to="/new">
              <button className="generate-button">
                Navigate to New Random Page
              </button>
            </Link>

            <button
              className="generate-button"
              onClick={() => generateNewRandom.mutate()}
              disabled={generateNewRandom.isPending}
            >
              {generateNewRandom.isPending
                ? "Generating..."
                : "Generate New Random Number"}
            </button>
          </div>

          <ul className="random-list">
            {data.map((item: RandomNumber, index: number) => (
              <li key={index} className="random-item">
                Key: {item.key}, Value: {item.value}
                <button
                  className="delete-button"
                  onClick={() => deleteRandom.mutate(item.key)}
                  disabled={deleteRandom.isPending}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }
  return null;
};

export default Timer;
