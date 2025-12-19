'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/storage/project';
import { validateProjectName } from '@/lib/validation/projectValidation';

export default function Setup() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = projectName.trim();

    // Validate project name
    const validation = validateProjectName(trimmedName);
    if (!validation.valid && trimmedName.length > 0) {
      setError(validation.error || '');
      return;
    }

    // Create project with name or default
    const finalName = trimmedName || '';
    createProject(finalName);

    // Redirect to main application
    router.push('/');
  };

  const handleSkip = () => {
    // Create project with default name
    createProject('');
    router.push('/');
  };

  const handleInputChange = (value: string) => {
    setProjectName(value);
    // Clear error on input
    if (error) {
      setError('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center px-5">
      <div className="bg-white/95 backdrop-blur-[10px] rounded-[20px] p-[60px_40px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[500px] w-full text-center animate-fadeInUp">
        <div className="text-5xl mb-5">📋</div>

        <h1 className="text-[#2d3748] text-[32px] mb-3 font-bold">
          Welcome!
        </h1>

        <p className="text-[#718096] text-base mb-10 leading-6">
          Let's get started by giving your project a name. You can always change it later.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-8 text-left">
            <label
              htmlFor="projectName"
              className="block text-[#4a5568] font-semibold mb-2 text-sm"
            >
              Project Name
            </label>

            <input
              type="text"
              id="projectName"
              name="projectName"
              value={projectName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your project name"
              maxLength={100}
              autoFocus
              className="w-full px-4 py-[14px] border-2 border-[#e2e8f0] rounded-xl text-base transition-all duration-300 bg-white focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
            />

            {error && (
              <div className="text-[#e53e3e] text-sm mt-2">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 px-6 py-[14px] border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)] active:translate-y-0"
            >
              Continue
            </button>
          </div>
        </form>

        <button
          onClick={handleSkip}
          className="block mt-5 text-[#718096] text-sm no-underline transition-colors duration-300 bg-transparent border-none cursor-pointer hover:text-[#667eea] hover:underline"
        >
          Skip for now (will use "Untitled Project")
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease;
        }

        @media (max-width: 600px) {
          .setup-container {
            padding: 40px 24px;
          }

          h1 {
            font-size: 26px;
          }

          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
