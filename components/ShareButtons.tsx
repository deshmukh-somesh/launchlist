import { useState } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Mail, 
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

interface ShareButtonsProps {
  title: string;
  description: string;
  imageUrl?: string;
  className?: string;
}

type SharePlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'email' | 'copy';

export function ShareButtons({ title, description, imageUrl, className = '' }: ShareButtonsProps) {
  const [recentlyCopied, setRecentlyCopied] = useState<boolean>(false);

  const handleShare = async (platform: SharePlatform) => {
    const url = window.location.href;
    const text = `${title} - ${description}`;
    const emailBody = `Check out ${title}\n\n${description}\n\n${url}`;
    
    try {
      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
          
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
          
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
          
        case 'instagram':
          if (imageUrl) {
            window.open(
              `instagram://story-camera`,
              '_blank'
            );
          }
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link copied!",
            description: "Share this link on Instagram",
          });
          break;
          
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(emailBody)}`;
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(url);
          setRecentlyCopied(true);
          setTimeout(() => setRecentlyCopied(false), 2000);
          toast({
            title: "Link copied!",
            description: "URL copied to clipboard",
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "Please try another sharing method",
        variant: "destructive",
      });
    }
  };

  // Use the theme's primary and secondary colors for social buttons
  const shareButtons = [
    { 
      platform: 'twitter', 
      icon: Twitter, 
      label: 'Share on Twitter',
      className: 'hover:bg-primary/10 hover:text-primary transition-colors'
    },
    { 
      platform: 'linkedin', 
      icon: Linkedin, 
      label: 'Share on LinkedIn',
      className: 'hover:bg-secondary/10 hover:text-secondary transition-colors'
    },
    { 
      platform: 'facebook', 
      icon: Facebook, 
      label: 'Share on Facebook',
      className: 'hover:bg-primary/10 hover:text-primary transition-colors'
    },
    { 
      platform: 'instagram', 
      icon: Instagram, 
      label: 'Share on Instagram',
      className: 'hover:bg-secondary/10 hover:text-secondary transition-colors'
    },
    { 
      platform: 'email', 
      icon: Mail, 
      label: 'Share via Email',
      className: 'hover:bg-primary/10 hover:text-primary transition-colors'
    },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground"></span>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {shareButtons.map(({ platform, icon: Icon, label, className }) => (
            <Tooltip key={platform}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(platform as SharePlatform)}
                  className={`${className} rounded-full p-2 h-8 w-8`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('copy')}
                className="hover:bg-accent/10 hover:text-accent transition-colors rounded-full p-2 h-8 w-8"
              >
                {recentlyCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{recentlyCopied ? 'Copied!' : 'Copy link'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}