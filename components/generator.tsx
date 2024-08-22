import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SearchIcon, RefreshCwIcon } from "lucide-react"

export default function Component() {


  return (

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prospect Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your company website or description to generate potential customers
          </p>
          <div className="space-y-4">
            <Input placeholder="Enter company website (e.g., www.example.com)" />
            <Textarea placeholder="Or enter a brief description of your company and target audience" />
            <Button className="w-full">
              <SearchIcon className="mr-2 h-4 w-4" /> Generate Prospects
            </Button>
          </div>
        </CardContent>
      </Card>
  )
}