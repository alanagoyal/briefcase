"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchIcon } from "lucide-react";
import { useCompletion } from "ai/react";
import ProspectList from "./prospect-list";

interface Prospect {
  name: string;
  industry: string;
  size: string;
  confidence: string;
}

export default function Generator() {
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingProspects, setIsGeneratingProspects] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const { complete: completeDescription } = useCompletion({
    api: "/generate-description",
  });

  const { complete: completeProspects } = useCompletion({
    api: "/generate-prospects",
  });

  const generateDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const result = await completeDescription("", {
        body: {
          website,
        },
      });

      console.log("Result:", result);

      if (result) {
        setDescription(result);
      }
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateProspects = async () => {
    setIsGeneratingProspects(true);
    try {
      const result = await completeProspects("", {
        body: {
          description,
        },
      });

      console.log("Prospects Result:", result);

      if (result) {
        // Parse the result into an array of Prospect objects
        const parsedProspects = JSON.parse(result) as Prospect[];
        setProspects(parsedProspects);
      }
    } catch (error) {
      console.error("Error generating prospects:", error);
    } finally {
      setIsGeneratingProspects(false);
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
            disabled={isGeneratingDescription || !website}
          >
            <SearchIcon className="mr-2 h-4 w-4" />
            {isGeneratingDescription ? "Generating..." : "Generate Description"}
          </Button>
          {description && (
            <>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Generated company description"
                rows={5}
              />
              <Button
                className="w-full"
                onClick={generateProspects}
                disabled={isGeneratingProspects}
              >
                {isGeneratingProspects ? "Generating Prospects..." : "Generate Prospects"}
              </Button>
              {prospects.length > 0 && <ProspectList prospects={prospects} />}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}