import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Scan, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

/**
 * ForgotPassword Page
 * Note: The backend currently requires JWT authentication for password reset.
 * This page provides instructions to users on how to reset their password.
 * For full password reset without login, the backend would need a public endpoint.
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // For now, just show instructions since backend requires login for reset
    setSubmitted(true);
    toast.success("Please check your instructions below");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors duration-300">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-400 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Scan size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FaceCheck</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Reset Your<br />Password
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Don't worry, it happens to the best of us. We'll help you get back into your account.
          </p>
        </div>
        <p className="text-blue-200 text-sm relative z-10">© 2026 FaceCheck. All rights reserved.</p>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Scan size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">FaceCheck</span>
          </div>

          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Forgot Password
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Enter your email to get password reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@comas.edu.gh"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                >
                  Get Instructions
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <KeyRound size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Password Reset Instructions
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  To reset your password, please contact your system administrator or follow these steps:
                </p>
              </div>

              <div className="text-left space-y-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Students:</strong> Contact your class representative or visit the student services office.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Lecturers/Staff:</strong> Contact the IT department or system administrator.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Provide your email address: <strong className="text-blue-600 dark:text-blue-400">{email}</strong>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> Once logged in, you can change your password from your profile settings using SMS verification.
                </p>
              </div>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
