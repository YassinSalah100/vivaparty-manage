import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Show success toast
    toast({
      title: "Email Verified! 🎉",
      description: "Your account has been successfully verified. Welcome to EventX Studio!",
      duration: 5000,
    });

    // Automatically redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-green-600 mb-2">
              Email Verified Successfully! 🎉
            </h3>
            <p className="text-muted-foreground mb-6">
              Thank you for verifying your email. Your account is now active and ready to use.
            </p>
            <Button
              className="gradient-primary text-white border-0 w-full"
              onClick={() => navigate("/auth")}
            >
              Continue to Login
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              You will be automatically redirected to the login page in 5 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationSuccess;
