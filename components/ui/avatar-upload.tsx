"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/src/utils/cloudinary-api";
import Image from "next/image";

interface AvatarUploadProps {
  currentImage: string | null;
  userName: string;
  onUploadComplete: (imageUrl: string) => void;
  className?: string;
}

export function AvatarUpload({
  currentImage,
  userName,
  onUploadComplete,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, {
        folder: "profile-images",
        resourceType: "image",
      });

      // Call parent callback with secure URL
      onUploadComplete(result.secure_url);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
      setPreviewUrl(currentImage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#00296B] to-[#003D82] flex items-center justify-center text-white text-2xl font-bold">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={userName}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials()
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openFileDialog}
        disabled={isUploading}
        className={cn(
          "absolute bottom-0 right-0 w-7 h-7 bg-[#00296B] rounded-full flex items-center justify-center text-white hover:bg-[#002561] transition-colors",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Camera className="w-4 h-4" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600 flex items-start gap-2">
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
