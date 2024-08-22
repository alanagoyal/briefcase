import { RefreshCwIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const prospects = [
    { name: "Acme Corp", industry: "Technology", size: "Enterprise", match: "95% Match" },
    { name: "Global Innovations", industry: "Manufacturing", size: "Mid-size", match: "88% Match" },
    { name: "EcoSolutions", industry: "Green Energy", size: "Startup", match: "82% Match" },
    { name: "DataDrive Analytics", industry: "Data Science", size: "Small", match: "79% Match" },
    { name: "MegaRetail", industry: "E-commerce", size: "Enterprise", match: "75% Match" },
  ]

export default function ProspectList() {
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
                        prospect.match.startsWith('9') ? 'bg-green-100 text-green-800' :
                        prospect.match.startsWith('8') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prospect.match}
                      </span>
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