import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Scan } from "lucide-react";
import { toast } from "sonner";

const Signup: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Account created successfully!");
            navigate("/"); // Redirect to login
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors duration-300">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-400 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')] opacity-100 bg-cover bg-center mix-blend-overlay"></div>
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
                        Join the Future<br />of Attendance
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md">
                        Create an account to start tracking attendance with facial recognition technology.
                    </p>
                </div>
                <p className="text-blue-200 text-sm relative z-10">© 2026 FaceCheck. All rights reserved.</p>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Scan size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">FaceCheck</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Join FaceCheck to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("student")}
                                    className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${role === "student"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-500/50"
                                        }`}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("lecturer")}
                                    className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${role === "lecturer"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-500/50"
                                        }`}
                                >
                                    Lecturer
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                        >
                            {isLoading ? "Creating Account..." : <><UserPlus size={18} /> Sign Up</>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <button onClick={() => navigate("/")} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
