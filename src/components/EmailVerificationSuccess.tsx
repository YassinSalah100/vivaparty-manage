import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-4 text-center sm:mt-5">
              <h3 className="text-2xl font-semibold leading-6 text-green-600 mb-2">
                Email Verified Successfully! 🎉
              </h3>
              <p className="text-sm text-gray-500">
                Thank you for verifying your email. Your account is now active and ready to use.
              </p>
              <div className="mt-6">
                <Button
                  className="gradient-primary text-white border-0 w-full"
                  onClick={() => navigate("/auth")}
                >
                  Continue to Login
                </Button>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                You will be automatically redirected to the login page in 5 seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationSuccess;
