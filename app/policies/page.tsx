import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsAndPolicies() {
  return (
    <div className="min-h-screen p-8">
      <Link href="/" className="inline-block mb-8">
        <Button variant="ghost-no-hover" className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-12 text-center">Terms & policies</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl mb-4">Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">No Legal Advice Disclaimer</h3>
            <p className="text-muted-foreground">
              Disclaimer: Briefcase is an AI-powered chatbot designed for entertainment and educational purposes only. The information provided by Briefcase is not intended to constitute legal advice or to be relied upon as legal advice. The use of Briefcase does not create an attorney-client relationship between you and Briefcase, its developers, or any affiliated parties.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Terms of Service (ToS)</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Acceptance of Terms: By using Briefcase, you agree to be bound by these Terms of Service.</li>
              <li>Use for Entertainment and Educational Purposes: Briefcase is provided for entertainment and educational purposes only.</li>
              <li>Limitation of Liability: Briefcase and its developers shall not be held liable for any damages arising from your use of the information provided.</li>
              <li>User Responsibilities: You are responsible for verifying any information provided by Briefcase before acting on it.</li>
              <li>No Warranties: Briefcase is provided "as is" without any warranties of any kind.</li>
              <li>Modification of Terms: We reserve the right to modify these Terms of Service at any time.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mb-4">Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Privacy Policy</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Information Collection: Briefcase may collect non-personally identifiable information.</li>
              <li>Use of Information: Any information collected is used solely to improve the functionality of Briefcase.</li>
              <li>Data Security: We take reasonable measures to protect any data collected by Briefcase.</li>
              <li>User Rights: You have the right to request access to, correction of, or deletion of any personal data you may have provided.</li>
              <li>Changes to the Privacy Policy: We may update this Privacy Policy from time to time.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legal Compliance</h3>
            <p className="text-muted-foreground">
              Briefcase operates in compliance with applicable laws and regulations. However, users are responsible for ensuring their use of the service complies with local laws, including those regarding the unauthorized practice of law and data privacy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}