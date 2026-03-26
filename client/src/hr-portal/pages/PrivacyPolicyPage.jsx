import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-black py-12 px-6 md:py-20 md:px-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <header className="border-b-2 border-gray-100 pb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 font-medium">Last Updated: January 2025</p>
                </header>

                {/* Content Section */}
                <section className="space-y-6 leading-relaxed text-lg">
                    <p>
                        At <span className="font-bold">Avani Enterprises</span>, we prioritize the privacy and security of our employees' data. This Privacy Policy outlines how we collect, use, and protect your information within the HR Portal.
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">1. Information We Collect</h2>
                        <p>We collect essential information to facilitate human resource management, including but not limited to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><span className="font-semibold">Personal Identification:</span> Name, Employee ID, Department, and Contact details.</li>
                            <li><span className="font-semibold">Professional Records:</span> Attendance logs, Leave history, and Performance metrics.</li>
                            <li><span className="font-semibold text-black">Live Location Tracking:</span> When you mark your attendance, we capture your geo-location data (Geo-fencing) to ensure accuracy and compliance with site-specific work requirements.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">2. How We Use Your Data</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To monitor and validate daily attendance through live geo-fencing.</li>
                            <li>To process leave applications and manage workforce availability.</li>
                            <li>To generate End-of-Day (EOD) reports and performance analytics.</li>
                            <li>To facilitate transparent communication between employees and the HR department.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">3. Data Security & Retention</h2>
                        <p>
                            Your data is stored in encrypted databases and is only accessible by authorized HR personnel. We implement strict security protocols to prevent unauthorized access or data leakage. Records are retained for the duration of your employment and as required by legal guidelines.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">4. Employee Consent</h2>
                        <p>
                            By using the Avani HR Portal and marking your attendance, you explicitly consent to the collection of your professional data and <span className="font-bold italic">real-time location verification</span> for administrative purposes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">5. Contact Information</h2>
                        <p>
                            If you have any questions regarding your data privacy, please reach out to the HR Department at:
                            <br />
                            <span className="text-black font-medium">kp@avanienterprises.in</span>
                        </p>
                    </div>
                </section>

                <footer className="pt-12 border-t border-gray-100 text-sm text-gray-400">
                    © 2025 Avani Enterprises. All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
