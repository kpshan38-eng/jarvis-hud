import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            setError("This email is already registered. Please sign in instead.");
          } else {
            setError(error.message);
          }
        } else {
          setSuccess("Account created! You can now sign in.");
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />

      <div className="jarvis-panel w-full max-w-md p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-2xl text-primary jarvis-glow tracking-wider">
            J.A.R.V.I.S.
          </h1>
          <p className="text-xs text-muted-foreground mt-2 tracking-wider">
            SECURE ACCESS TERMINAL
          </p>
        </div>

        {/* Toggle */}
        <div className="flex mb-6 border border-border rounded overflow-hidden">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-orbitron uppercase tracking-wider transition-all ${
              isLogin 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-orbitron uppercase tracking-wider transition-all ${
              !isLogin 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="mb-4 p-3 border border-destructive/50 rounded bg-destructive/10 text-destructive text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 border border-green-500/50 rounded bg-green-500/10 text-green-500 text-xs">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-background/50 border border-border rounded py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-background/50 border border-border rounded py-3 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary/20 border border-primary/50 rounded text-primary font-orbitron text-xs uppercase tracking-wider hover:bg-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? "Access Terminal" : "Create Identity"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest access */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Continue as guest (limited features)
          </button>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60" />
      </div>
    </div>
  );
};

export default AuthPage;
