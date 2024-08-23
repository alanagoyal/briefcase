"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchIcon } from "lucide-react";
import { useCompletion } from "ai/react";

export default function Generator() {
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { complete } = useCompletion({
    api: "/generate-description",
  });

  const generateDescription = async () => {
    setIsLoading(true);
    try {
      const result = await complete("", {
        body: {
          website,
        },
      });

      console.log("Result:", result);

      if (result) {
        setDescription(result);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Prospect Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your company website to generate a description and potential
          customers
        </p>
        <div className="space-y-4">
          <Input
            placeholder="Enter company website (e.g., www.example.com)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={generateDescription}
            disabled={isLoading || !website}
          >
            <SearchIcon className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Generate Description"}
          </Button>
          {description && (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Generated company description"
              rows={5}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
