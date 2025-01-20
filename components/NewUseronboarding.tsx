import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from 'lucide-react';

export default function NewUserOnboarding({ kindeUser }: { kindeUser: any }) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center pb-6 border-b">
            <h2 className="font-semibold">Welcome to LaunchList! 👋</h2>
            <p className="text-gray-600 mt-1">
              Let&apos;s set up your maker profile to get started
            </p>
          </div>

          {/* Profile Form */}
          <form className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <input
                    type="file"
                    id="avatar"
                    className="hidden"
                    accept="image/*"
                  />
                  <label 
                    htmlFor="avatar"
                    className="cursor-pointer p-4"
                  >
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  defaultValue={kindeUser.given_name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  required
                />
                <span className="text-sm text-gray-500 mt-1">
                  This will be your unique identifier
                </span>
              </div>
            </div>

            {/* Optional Social Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Social Links (Optional)</h3>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input id="twitter" />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}