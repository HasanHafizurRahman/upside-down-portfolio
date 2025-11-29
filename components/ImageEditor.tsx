import React, { useState } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { Upload, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await editImageWithGemini(selectedImage, prompt);
      setGeneratedImage(result);
    } catch (err: any) {
      setError("Failed to process image. Ensure API key is set and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black/60 backdrop-blur-md border border-ud-red/30 rounded-lg shadow-[0_0_15px_rgba(255,0,51,0.2)]">
      <div className="flex items-center gap-2 mb-6 border-b border-ud-red/30 pb-4">
        <Sparkles className="text-ud-red w-6 h-6" />
        <h3 className="text-2xl font-serif text-white">Gemini Image Transmuter</h3>
      </div>
      
      <p className="text-gray-300 mb-6 text-sm">
        Upload an image and describe how you want to alter reality using the <span className="text-ud-red font-bold">Upside Down</span> technology.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="relative group">
            <label className="block text-ud-red text-sm font-bold mb-2 uppercase tracking-wider">Source Material</label>
            <div className="relative border-2 border-dashed border-gray-600 rounded-lg hover:border-ud-red transition-colors p-8 text-center cursor-pointer">
               <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <Upload className="mx-auto text-gray-400 mb-2" />
               <span className="text-gray-400 text-sm">Click to upload image</span>
            </div>
            {selectedImage && (
              <div className="mt-4 relative h-48 w-full overflow-hidden rounded border border-gray-700">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-ud-red text-sm font-bold mb-2 uppercase tracking-wider">Incantation (Prompt)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a retro glitch filter' or 'Make it look like the Upside Down'"
              className="w-full bg-black/50 border border-gray-600 text-white p-3 rounded focus:border-ud-red focus:ring-1 focus:ring-ud-red outline-none min-h-[100px]"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedImage || !prompt}
            className={`w-full py-3 px-6 rounded font-bold uppercase tracking-widest transition-all duration-300
              ${isGenerating || !selectedImage || !prompt 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-ud-dark-red text-white hover:bg-ud-red hover:shadow-[0_0_20px_rgba(255,0,51,0.6)]'
              }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Transmuting...
              </span>
            ) : "Generate"}
          </button>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500 text-red-200 text-sm rounded flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col">
           <label className="block text-ud-red text-sm font-bold mb-2 uppercase tracking-wider">Result</label>
           <div className="flex-1 bg-black/40 border border-gray-700 rounded-lg flex items-center justify-center min-h-[300px] overflow-hidden relative">
             {generatedImage ? (
                <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
             ) : (
                <div className="text-gray-600 text-center p-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-ud-red border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="animate-pulse">Consulting the hive mind...</p>
                    </div>
                  ) : (
                    <p>The result will materialize here.</p>
                  )}
                </div>
             )}
           </div>
           {generatedImage && (
             <a 
               href={generatedImage} 
               download="upside-down-edit.png"
               className="mt-4 text-center text-ud-red hover:text-white text-sm underline"
             >
               Download Artifact
             </a>
           )}
        </div>
      </div>
    </div>
  );
};