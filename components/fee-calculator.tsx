"use client";

import { useI18n } from "@quetzallabs/i18n";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { CircleDollarSign, Clock, Loader2 } from "lucide-react";
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
  const { t } = useI18n();
  const [lawyerQuestion, setLawyerQuestion] = useState(initialQuestion);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState("");
  const [rationale, setRationale] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  async function handleCalculateFee() {
    if (lawyerQuestion && content) {
      setIsLoading(true);
      setShowResults(false);
      try {
        const response = await fetch("/api/calculate-fees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context: content,
            question: lawyerQuestion,
          }),
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
          setEstimatedFee(`$${(hours * 500).toFixed(2)}`);
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
      {!showResults && (
        <>
          <Textarea
            value={lawyerQuestion}
            onChange={(e) => {
              setLawyerQuestion(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t(
              "Type your specific question for the lawyer here..."
            )}
            className="mb-4 text-base"
          />
          <Button
            onClick={handleCalculateFee}
            className="w-full mb-4 bg-[#3675F1] hover:bg-[#2556E4] text-white"
            disabled={!summary || !lawyerQuestion || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              t("Get Quote")
            )}
          </Button>
        </>
      )}
      {showResults && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-1 bg-muted/80 rounded-md p-2 hover:bg-muted transition-colors duration-200 cursor-arrow">
              <Clock className="w-4 h-4 text-[#3675F1]" />
              <span className="text-sm">
                {t(`Estimated Time: {dynamic1} hours`, {
                  dynamic1: estimatedTime.toFixed(2),
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-muted/80 rounded-md p-2 hover:bg-muted transition-colors duration-200 cursor-arrow">
              <CircleDollarSign className="w-4 h-4 text-[#3675F1]" />
              <span className="text-sm">
                {t(`Estimated Cost: {dynamic1}`, {
                  dynamic1: estimatedFee,
                })}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm">{rationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}
