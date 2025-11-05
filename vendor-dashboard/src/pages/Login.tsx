import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Copy, Check } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [setup2FA, setSetup2FA] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Check if user has 2FA enabled
  useEffect(() => {
    const has2FA = localStorage.getItem("vendor2FAEnabled");
    if (has2FA === "true") {
      setShow2FA(true);
    }
  }, []);

  // Generate 2FA secret on setup
  const generate2FASecret = () => {
    // Generate a random secret (in production, use proper crypto library)
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setSecretKey(secret);
    
    // Generate QR code URL (TOTP format)
    const email = localStorage.getItem("vendorEmail") || "vendor@example.com";
    const issuer = "The Bazaar";
    const qrUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    setQrCodeUrl(qrUrl);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handle2FASetup = () => {
    localStorage.setItem("vendor2FASecret", secretKey);
    localStorage.setItem("vendor2FAEnabled", "true");
    setSetup2FA(false);
    setShow2FA(true);
    alert("2FA enabled successfully! Please scan the QR code with your authenticator app.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      const has2FA = localStorage.getItem("vendor2FAEnabled");
      
      if (has2FA === "true" && !twoFactorCode) {
        // User needs to enter 2FA code
        setIsLoading(false);
        return;
      }

      // Verify 2FA code (simplified - in production, verify against TOTP)
      if (has2FA === "true" && twoFactorCode) {
        // Basic validation (in production, use proper TOTP verification)
        if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
          alert("Invalid 2FA code. Please enter a 6-digit code.");
          setIsLoading(false);
          return;
        }
      }

      // Store auth state
      localStorage.setItem("vendorAuth", "true");
      localStorage.setItem("vendorEmail", email);
      setIsLoading(false);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <div className="text-4xl font-bold text-white">
              <span className="text-netflix-red">The</span> Bazaar
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your vendor account
          </h2>
          <p className="mt-2 text-center text-sm text-netflix-light-gray">
            Or{" "}
            <Link to="/signup" className="font-medium text-netflix-red hover:text-[#c11119] transition-colors">
              create a new vendor account
            </Link>
          </p>
        </div>

        {!setup2FA ? (
          <form className="mt-8 space-y-6 bg-netflix-dark-gray p-8 rounded-lg border border-netflix-medium-gray shadow-lg" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                  placeholder="your-email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                  placeholder="Enter your password"
                />
              </div>

              {show2FA && (
                <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <Label htmlFor="twoFactorCode" className="text-white">Two-Factor Authentication</Label>
                  </div>
                  <Input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-blue-500"
                    placeholder="Enter 6-digit code"
                    required
                  />
                  <p className="text-xs text-blue-300 mt-2">
                    Enter the code from your authenticator app
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-netflix-red focus:ring-netflix-red border-netflix-medium-gray rounded bg-netflix-dark-gray"
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Remember me
                </Label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-netflix-red hover:text-[#c11119] transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-netflix-red hover:bg-[#c11119] text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-netflix-medium-gray" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-netflix-dark-gray text-netflix-light-gray">New to The Bazaar?</span>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/signup">
                  <Button type="button" variant="outline" className="w-full border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                    Create your vendor account
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2FA Setup Link */}
            <div className="pt-4 border-t border-netflix-medium-gray">
              <button
                type="button"
                onClick={() => {
                  generate2FASecret();
                  setSetup2FA(true);
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-netflix-light-gray hover:text-netflix-red transition-colors"
              >
                <Shield className="h-4 w-4" />
                Set up Two-Factor Authentication
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 bg-netflix-dark-gray p-8 rounded-lg border border-netflix-medium-gray shadow-lg">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-netflix-red mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Set Up Two-Factor Authentication</h3>
              <p className="text-sm text-netflix-light-gray">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-lg mb-4">
                {qrCodeUrl && <QRCodeSVG value={qrCodeUrl} size={200} />}
              </div>
              
              <div className="w-full">
                <Label className="text-white text-sm mb-2 block">Secret Key (Backup)</Label>
                <div className="flex gap-2">
                  <Input
                    value={secretKey}
                    readOnly
                    className="bg-netflix-medium-gray border-netflix-medium-gray text-white font-mono text-sm"
                  />
                  <Button
                    type="button"
                    onClick={copySecret}
                    variant="outline"
                    className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-netflix-light-gray mt-2">
                  Save this key in a secure location. You'll need it if you lose access to your authenticator app.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSetup2FA(false);
                  setSecretKey("");
                  setQrCodeUrl("");
                }}
                className="flex-1 border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handle2FASetup}
                className="flex-1 bg-netflix-red hover:bg-[#c11119] text-white font-semibold"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
