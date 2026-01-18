import React, { useState, useEffect } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { Bell, Shield, Palette, Globe, Clock, ToggleLeft, ToggleRight, Save, RotateCcw } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface SettingsState {
    emailNotifications: boolean;
    smsNotifications: boolean;
    autoCloseSession: boolean;
    sessionDuration: number;
    lateThreshold: number;
    absentThreshold: number;
    recognitionThreshold: number;
    timezone: string;
    language: string;
}

const defaultSettings: SettingsState = {
    emailNotifications: true,
    smsNotifications: false,
    autoCloseSession: true,
    sessionDuration: 120,
    lateThreshold: 15,
    absentThreshold: 30,
    recognitionThreshold: 0.75,
    timezone: "Africa/Accra",
    language: "en",
};

const STORAGE_KEY = "facecheck_settings";

const Settings: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState<SettingsState>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch { /* ignore */ }
        }
    }, []);

    // Track changes
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const current = JSON.stringify(settings);
        setHasChanges(saved !== current);
    }, [settings]);

    const handleToggle = (key: keyof SettingsState) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setHasChanges(false);
        toast.success("Settings saved successfully!");
    };

    const handleReset = () => {
        setSettings(defaultSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
        setHasChanges(false);
        setTheme("dark"); // Default to dark
        toast.success("Settings reset to defaults");
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4"><Header /></div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8 w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                                <p className="text-slate-500 dark:text-slate-400">Configure system preferences</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                                    <RotateCcw size={18} /> Reset
                                </button>
                                <button onClick={handleSave} disabled={!hasChanges}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors ${hasChanges ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"}`}>
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </div>

                        {hasChanges && (
                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl">
                                <p className="text-amber-600 dark:text-amber-400 text-sm">You have unsaved changes</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Notifications */}
                            <Section icon={Bell} title="Notifications" color="blue">
                                <ToggleItem label="Email Notifications" desc="Receive email alerts for important events" enabled={settings.emailNotifications} onToggle={() => handleToggle("emailNotifications")} />
                                <ToggleItem label="SMS Notifications" desc="Receive SMS alerts for critical events" enabled={settings.smsNotifications} onToggle={() => handleToggle("smsNotifications")} />
                            </Section>

                            {/* Session Defaults */}
                            <Section icon={Clock} title="Session Defaults" color="purple">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <InputField label="Default Duration (min)" value={settings.sessionDuration} onChange={(v) => setSettings({ ...settings, sessionDuration: parseInt(v) || 0 })} type="number" />
                                    <InputField label="Late Threshold (min)" value={settings.lateThreshold} onChange={(v) => setSettings({ ...settings, lateThreshold: parseInt(v) || 0 })} type="number" />
                                    <InputField label="Absent Threshold (min)" value={settings.absentThreshold} onChange={(v) => setSettings({ ...settings, absentThreshold: parseInt(v) || 0 })} type="number" />
                                </div>
                                <ToggleItem label="Auto-close Sessions" desc="Automatically close at end time" enabled={settings.autoCloseSession} onToggle={() => handleToggle("autoCloseSession")} />
                            </Section>

                            {/* Face Recognition */}
                            <Section icon={Shield} title="Face Recognition" color="emerald">
                                <div>
                                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Recognition Confidence Threshold</label>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="0.5" max="1" step="0.05" value={settings.recognitionThreshold}
                                            onChange={(e) => setSettings({ ...settings, recognitionThreshold: parseFloat(e.target.value) })}
                                            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                        <span className="text-slate-900 dark:text-white font-mono w-16 text-right">{(settings.recognitionThreshold * 100).toFixed(0)}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Higher values require more accurate face matches</p>
                                </div>
                            </Section>

                            {/* Localization */}
                            <Section icon={Globe} title="Localization" color="amber">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Timezone</label>
                                        <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                            <option value="Africa/Accra">Africa/Accra (GMT)</option>
                                            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                                            <option value="Europe/London">Europe/London (GMT/BST)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Language</label>
                                        <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                            <option value="en">English</option>
                                            <option value="fr">French</option>
                                            <option value="es">Spanish</option>
                                        </select>
                                    </div>
                                </div>
                            </Section>

                            {/* Appearance */}
                            <Section icon={Palette} title="Appearance" color="pink">
                                <ToggleItem
                                    label="Dark Mode"
                                    desc="Use dark theme throughout the application"
                                    enabled={theme === "dark"}
                                    onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
                                />
                            </Section>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default Settings;

const Section = ({ icon: Icon, title, color, children }: { icon: React.ElementType; title: string; color: string; children: React.ReactNode }) => {
    const c: Record<string, string> = { blue: "text-blue-500 dark:text-blue-400", purple: "text-purple-500 dark:text-purple-400", emerald: "text-emerald-500 dark:text-emerald-400", amber: "text-amber-500 dark:text-amber-400", pink: "text-pink-500 dark:text-pink-400" };
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-4">
                <Icon size={20} className={c[color]} />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            </div>
            {children}
        </div>
    );
};

const ToggleItem = ({ label, desc, enabled, onToggle }: { label: string; desc: string; enabled: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <div>
            <p className="text-slate-900 dark:text-white font-medium">{label}</p>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
        <button onClick={onToggle} className={enabled ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"}>
            {enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
    </div>
);

const InputField = ({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (v: string) => void; type?: string }) => (
    <div>
        <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</label>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
    </div>
);
