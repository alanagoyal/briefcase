"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Clock, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

// Define the interface for the API response
interface FeeCalculationResponse {
  hours: number;
  rationale: string;
}

export default function FeeCalculator({ summary, content }: { summary: string; content: string }) {
  const [lawyerQuestion, setLawyerQuestion] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [rationale, setRationale] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleCalculateFee() {
    if (lawyerQuestion && content) {
      setIsLoading(true);
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
          throw new Error(`Failed to calculate fees: ${response.status} ${errorText}`);
        }

        const result: FeeCalculationResponse = await response.json();

        if (result && typeof result === 'object' && 'hours' in result) {
          const { hours, rationale } = result;
          setEstimatedTime(hours);
          setEstimatedFee(hours * 500);
          setRationale(rationale || "No rationale provided");
          setIsDialogOpen(true);
        } else {
          console.error("Invalid API response:", result);
          setIsDialogOpen(true);
        }
      } catch (error) {
        console.error("Error calculating fee:", error);
        setIsDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("Cannot calculate fee: missing question or content");
      setIsDialogOpen(true);
    }
  }

  async function handleSendToLawyer() {
    await handleCalculateFee();
    // Add logic to send to lawyer here
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Consult a Lawyer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Ask a specific question about the summarized document
          </p>
          <Textarea
            value={lawyerQuestion}
            onChange={(e) => {
              console.log("Lawyer question updated:", e.target.value);
              setLawyerQuestion(e.target.value);
            }}
            placeholder="Type your specific question for the lawyer here..."
            className="mb-4"
          />
          <div className="mb-4">
            <label
              htmlFor="time-estimate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estimated consultation time: {estimatedTime.toFixed(2)} hours
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
            <Button
              onClick={handleSendToLawyer}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={!summary || !lawyerQuestion || isLoading}
            >
              {isLoading ? "Calculating..." : "Send to Lawyer"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fee Estimation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Estimated consultation time: {estimatedTime.toFixed(2)} hours</p>
            <p>Estimated fee: ${estimatedFee.toFixed(2)}</p>
            <div>
              <h4 className="font-semibold">Rationale:</h4>
              <p>{rationale}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}