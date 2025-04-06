'use client'
import { useRouter } from 'next/navigation'
import "./globals.css"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 " >
      {/* Title */}
      <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-10">
        AI Gym Coach
      </h1>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-5">
        <button 
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 active:scale-95"
          type="button" 
          onClick={() => {
            router.push('/webcam');
            //console.log("User Enter page 1");
          }}
        >
          Start Webcam Workout
        </button>

        <button 
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 active:scale-95"
          type="button" 
          onClick={() => {
            router.push('/recommendation');
            //console.log("User Enter page 2");
          }}
        >
          Get Recommendations
        </button>

        <button 
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 active:scale-95"
          type="button" 
          onClick={() => {
            router.refresh();
            console.log("User Enter page 3");
          }}
        >
          Refresh
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-400 text-xs mt-10">
        Powered by AI Technology
      </p>
    </div>
  );
}