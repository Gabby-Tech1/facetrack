// Demo authentication credentials
export interface DemoCredential {
    email: string;
    password: string;
    role: "student" | "lecturer" | "system_admin";
    displayName: string;
}

export const demoCredentials: DemoCredential[] = [
    {
        email: "student@demo.com",
        password: "demo123",
        role: "student",
        displayName: "Student (Kwame Asante)",
    },
    {
        email: "lecturer@demo.com",
        password: "demo123",
        role: "lecturer",
        displayName: "Lecturer (Dr. Emmanuel Addo)",
    },
    {
        email: "admin@demo.com",
        password: "demo123",
        role: "system_admin",
        displayName: "System Admin (Samuel Osei)",
    },
];

// Validate demo login
export const validateLogin = (email: string, password: string): DemoCredential | null => {
    const credential = demoCredentials.find(
        (cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
    );
    return credential || null;
};
