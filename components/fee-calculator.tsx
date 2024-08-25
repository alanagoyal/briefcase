"use client";

import { useCompletion } from "ai/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Clock, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function FeeCalculator({ summary, content }: { summary: string; content: string }) {
  const [lawyerQuestion, setLawyerQuestion] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const { complete, isLoading } = useCompletion({
    api: "/calculate-fees",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  async function handleCalculateFee() {
    console.log("Calculating fee...");
    console.log("Lawyer question:", lawyerQuestion);
    console.log("Content length:", content.length);

    if (lawyerQuestion && content) {
      try {
        const result = await complete("", {
          body: { context: content, question: lawyerQuestion },
        });
        console.log("API response:", result);

        if (result) {
          setResponseMessage(result);
          setIsDialogOpen(true);
        } else {
          console.warn("API returned empty result");
        }
      } catch (error) {
        console.error("Error calculating fee:", error);
      }
    } else {
      console.warn("Cannot calculate fee: missing question or content");
    }
  }

  async function handleSendToLawyer() {
    console.log("Sending to lawyer...");
    await handleCalculateFee();
    console.log("Fee calculation complete");
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
          <p className="whitespace-pre-wrap">{responseMessage}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}