"use client";

import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Clock, DollarSign } from "lucide-react";
import { Button } from "./ui/button";

// Define the interface for the API response
interface FeeCalculationResponse {
  hours: number;
  rationale: string;
}

interface FeeCalculatorProps {
  summary: string;
  content: string;
  initialQuestion: string;
}

export default function FeeCalculator({
  summary,
  content,
  initialQuestion,
}: FeeCalculatorProps) {
  const [lawyerQuestion, setLawyerQuestion] = useState(initialQuestion);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [rationale, setRationale] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  async function handleCalculateFee() {
    if (lawyerQuestion && content) {
      setIsLoading(true);
      setShowResults(false);
      try {
        const response = await fetch("/calculate-fees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ context: content, question: lawyerQuestion }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(
            `Failed to calculate fees: ${response.status} ${errorText}`
          );
        }

        const result: FeeCalculationResponse = await response.json();

        if (result && typeof result === "object" && "hours" in result) {
          const { hours, rationale } = result;
          setEstimatedTime(hours);
          setEstimatedFee(hours * 500);
          setRationale(rationale || "No rationale provided");
          setShowResults(true);
        } else {
          console.error("Invalid API response:", result);
        }
      } catch (error) {
        console.error("Error calculating fee:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("Cannot calculate fee: missing question or content");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCalculateFee();
    }
  };

  return (
    <div>
      <Textarea
        value={initialQuestion || lawyerQuestion}
        onChange={(e) => {
          setLawyerQuestion(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type your specific question for the lawyer here..."
        className="mb-4"
      />
      <Button
        onClick={handleCalculateFee}
        className="w-full mb-4"
        disabled={!summary || !lawyerQuestion || isLoading}
      >
        {isLoading ? "Calculating..." : "Calculate Fee"}
      </Button>
      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Estimated Time: {estimatedTime.toFixed(2)} hours
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Estimated Cost: ${estimatedFee.toFixed(2)}
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Rationale:</h4>
            <p className="text-sm text-gray-600">{rationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}