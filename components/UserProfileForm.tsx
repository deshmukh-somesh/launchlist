"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UserProfileInputs = {
  name: string | null;
  username: string;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  avatarUrl: string | null;
};

export default function UserProfileForm({ 
  initialData = {
    name: '',
    username: '',
    bio: null,
    website: null,
    twitter: null,
    github: null,
    avatarUrl: null
  }, 
  onComplete 
}: { 
  initialData?: Partial<UserProfileInputs>, 
  onComplete?: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UserProfileInputs>({
    defaultValues: initialData
  });

  const utils = trpc.useContext();
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Profile updated successfully!',
        variant: 'default',
      });
      await utils.user.getProfile.invalidate();
      onComplete?.();
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: UserProfileInputs) => {
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        name: data.name || '',
        username: data.username,
        bio: data.bio || null,
        website: data.website || null,
        twitter: data.twitter || null,
        github: data.github || null,
        avatarUrl: data.avatarUrl || null
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Profile Information</h2>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <Edit2 className="h-4 w-4" />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Display Name
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            className={cn(
              "w-full p-3 bg-[#151725] border border-[#2A2B3C] rounded-lg",
              !isEditing && "opacity-75 cursor-not-allowed"
            )}
            placeholder="Your display name"
            disabled={!isEditing}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Username
          </label>
          <input
            {...register("username", { required: "Username is required" })}
            className={cn(
              "w-full p-3 bg-[#151725] border border-[#2A2B3C] rounded-lg",
              !isEditing && "opacity-75 cursor-not-allowed"
            )}
            placeholder="@username"
            disabled={!isEditing}
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Bio
          </label>
          <textarea
            {...register("bio")}
            className="w-full p-3 bg-[#151725] border border-[#2A2B3C] rounded-lg min-h-[100px]"
            placeholder="Tell us about yourself"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-200">Social Links</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Website
            </label>
            <input
              {...register("website")}
              type="url"
              className="w-full p-3 bg-[#151725] border border-[#2A2B3C] rounded-lg"
              placeholder="https://your-website.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Twitter
            </label>
            <input
              {...register("twitter")}
              className="w-full p-3 bg-[#151725] border border-[#2A2B3C] rounded-lg"
              placeholder="@twitter_handle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              GitHub
            </label>
            <input
              {...register("github")}
              className="w-full p-3 bg-[#151725] border border-[#2A2B3C] rounded-lg"
              placeholder="github_username"
            />
          </div>
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={cn(
              "w-full p-4 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
              "text-white hover:opacity-90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        )}
      </form>
    </div>
  );
} 