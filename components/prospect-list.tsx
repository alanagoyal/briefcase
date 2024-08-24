"use client"

import { RefreshCwIcon, LinkedinIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";

interface Prospect {
  name: string;
  industry: string;
  size: string;
  confidence: string;
}

interface ProspectListProps {
  prospects: Prospect[];
}

export default function ProspectList({ prospects }: ProspectListProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleRequestConnection = async (name: string) => {
        setIsLoading(name);
        try {
            const response = await fetch('/linkedin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to: name }),
            });
            const data = await response.json();
            if (data.success) {
                // Handle success (e.g., show a toast notification)
                console.log('Connection request sent successfully');
            } else {
                // Handle error
                console.error('Failed to send connection request');
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <Card>
        <CardHeader>
          <CardTitle>Generated Prospects</CardTitle>
          <p className="text-sm text-muted-foreground">Potential customers based on your input</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Industry</th>
                  <th className="text-left p-2">Size</th>
                  <th className="text-left p-2">Match</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="p-2 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                      {prospect.name}
                    </td>
                    <td className="p-2">{prospect.industry}</td>
                    <td className="p-2">{prospect.size}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        prospect.confidence.startsWith('9') ? 'bg-green-100 text-green-800' :
                        prospect.confidence.startsWith('8') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prospect.confidence}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestConnection(prospect.name)}
                        disabled={isLoading === prospect.name}
                      >
                        <LinkedinIcon className="mr-2 h-4 w-4" />
                        {isLoading === prospect.name ? 'Sending...' : 'Request Connection'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline">
              <RefreshCwIcon className="mr-2 h-4 w-4" /> Regenerate List
            </Button>
            <Button>Export Prospects</Button>
          </div>
        </CardContent>
      </Card>
    )
}