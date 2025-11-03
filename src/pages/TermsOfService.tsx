import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using ChugZone, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Age Restriction</h2>
              <p className="text-muted-foreground">
                You must be of legal drinking age in your jurisdiction to use this service. ChugZone is intended for adults 
                who are of legal drinking age. By using this service, you confirm that you meet this requirement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Responsible Use</h2>
              <p className="text-muted-foreground mb-4">
                ChugZone is designed for entertainment purposes. We strongly encourage responsible drinking and never 
                condone excessive alcohol consumption. Users should:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Know their limits and drink responsibly</li>
                <li>Never drink and drive</li>
                <li>Be aware of the risks associated with alcohol consumption</li>
                <li>Respect all participants and ensure everyone is comfortable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground">
                Users agree not to use ChugZone for any unlawful purpose or in any way that could damage, disable, 
                overburden, or impair the service. Harassment, hate speech, or any form of abusive behavior is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Liability</h2>
              <p className="text-muted-foreground">
                ChugZone and its operators are not liable for any damages, injuries, or consequences resulting from the use 
                of our platform. Users participate in drinking games at their own risk and are solely responsible for their 
                actions and well-being.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Modifications to Service</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue the service at any time without notice. We are not liable 
                to you or any third party for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of ChugZone are owned by us and are protected by international 
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to update these terms at any time. Continued use of the service after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please join our{" "}
                <a 
                  href="https://discord.gg/CmHurTx49j" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--neon-purple))] hover:underline"
                >
                  Discord community
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
